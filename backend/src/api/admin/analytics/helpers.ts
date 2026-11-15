import { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import {
  experimentResults,
  FunnelRow,
  FunnelStep,
  funnelQuery,
  overviewQueries,
  shapeFunnel,
} from "../../../lib/analytics"
import { ANALYTICS_MODULE } from "../../../modules/analytics"
import type AnalyticsModuleService from "../../../modules/analytics/service"

export const STORE_TIMEZONE = process.env.STORE_TIMEZONE || "America/Los_Angeles"
const DAY = 24 * 60 * 60 * 1000

export const analytics = (container: MedusaContainer): AnalyticsModuleService => container.resolve(ANALYTICS_MODULE)

/** [from, to) from ISO strings, defaulting to the last `days` days. Max one year. */
export function parseRange(from?: string | null, to?: string | null, days = 7) {
  const end = to ? new Date(to) : new Date()
  const start = from ? new Date(from) : new Date(end.getTime() - days * DAY)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid date range")
  }
  if (end.getTime() - start.getTime() > 366 * DAY) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Date range can be at most one year")
  }
  return { from: start, to: end }
}

export async function runFunnel(
  container: MedusaContainer,
  input: { steps: FunnelStep[]; from: Date; to: Date; windowDays: number; breakdown?: string | null }
) {
  const rows = await analytics(container).runQuery<FunnelRow>(
    funnelQuery({
      steps: input.steps,
      from: input.from,
      to: input.to,
      windowSeconds: Math.round(input.windowDays * 86400),
      breakdown: input.breakdown,
    })
  )
  return shapeFunnel(input.steps, rows)
}

export async function getOverview(container: MedusaContainer, from: Date, to: Date) {
  const svc = analytics(container)
  const q = overviewQueries(from, to, STORE_TIMEZONE)
  const [totals, bounce, daily, paths, assets, referrers, devices] = await Promise.all([
    svc.runQuery<any>(q.totals),
    svc.runQuery<any>(q.bounce),
    svc.runQuery<any>(q.daily),
    svc.runQuery<any>(q.paths),
    svc.runQuery<any>(q.assets),
    svc.runQuery<any>(q.referrers),
    svc.runQuery<any>(q.devices),
  ])
  const t = totals[0] ?? {}
  const b = bounce[0] ?? {}
  const sessions = Number(t.sessions ?? 0)
  return {
    range: { from: from.toISOString(), to: to.toISOString(), timezone: STORE_TIMEZONE },
    totals: {
      pageviews: Number(t.pageviews ?? 0),
      visitors: Number(t.visitors ?? 0),
      sessions,
      orders: Number(t.orders ?? 0),
      revenue: Number(t.revenue ?? 0),
      /** Orders per session. Directional: app and web sessions are both counted. */
      conversion_rate: sessions ? Number(t.orders ?? 0) / sessions : null,
      bounce_rate: Number(b.sessions ?? 0) ? Number(b.bounced ?? 0) / Number(b.sessions) : null,
    },
    daily,
    top_paths: paths,
    top_assets: assets.map((a: any) => ({ ...a, conversion_rate: a.sessions ? a.orders / a.sessions : null })),
    referrers,
    devices,
  }
}

type ExperimentLike = {
  key: string
  variants: { key: string; weight: number }[]
  funnel_steps?: FunnelStep[] | null
  minimum_sample?: number | null
  started_at?: Date | string | null
  ended_at?: Date | string | null
  created_at?: Date | string | null
}

/**
 * Per-variant results: a funnel that starts at the visitor's exposure to the
 * experiment, broken down by the variant they saw, then the primary metric's
 * steps (default: order_completed) within 7 days of exposure.
 */
export async function getExperimentResults(container: MedusaContainer, exp: ExperimentLike) {
  const metric: FunnelStep[] = exp.funnel_steps?.length ? exp.funnel_steps : [{ event: "order_completed" }]
  const steps: FunnelStep[] = [
    { event: "$experiment_exposure", filters: [{ key: "experiment", op: "eq", value: exp.key }], label: "Exposed" },
    ...metric,
  ]
  const from = new Date(exp.started_at ?? exp.created_at ?? Date.now() - 30 * DAY)
  const to = exp.ended_at ? new Date(exp.ended_at) : new Date()
  if (from >= to) {
    return { steps: steps.map((s) => s.label ?? s.event), ...experimentResults(exp.variants.map((v) => v.key), {}, { minimumSample: exp.minimum_sample ?? 100 }) }
  }
  const funnel = await runFunnel(container, { steps, from, to, windowDays: 7, breakdown: "variant" })
  const counts: Record<string, number[]> = {}
  for (const row of funnel.breakdown) {
    if (row.value) counts[row.value] = row.steps
  }
  return {
    steps: funnel.steps.map((s) => s.label),
    range: { from: from.toISOString(), to: to.toISOString() },
    ...experimentResults(
      exp.variants.map((v) => v.key),
      counts,
      { minimumSample: exp.minimum_sample ?? 100 }
    ),
  }
}
