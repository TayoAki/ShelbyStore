import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ANALYTICS_EVENTS, eventNamesQuery, FUNNEL_PRESETS, propertyKeysQuery } from "../../../../lib/analytics"
import { analytics } from "../helpers"

const BREAKDOWN_COLUMNS = ["asset", "utm_source", "utm_medium", "utm_campaign", "device_type", "platform", "path", "referrer"]

/** Event names, property keys and presets for the funnel / trends builders. */
export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const svc = analytics(req.scope)
  const [seen, keys] = await Promise.all([
    svc.runQuery<{ event: string; count: number }>(eventNamesQuery(since)),
    svc.runQuery<{ key: string }>(propertyKeysQuery(since)),
  ])
  const known = new Map(seen.map((e) => [e.event, Number(e.count)]))
  for (const name of Object.values(ANALYTICS_EVENTS)) if (!known.has(name)) known.set(name, 0)
  res.json({
    events: [...known.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    properties: keys.map((k) => k.key),
    breakdowns: [...BREAKDOWN_COLUMNS, ...keys.map((k) => k.key).filter((k) => k.startsWith("$exp_") || k === "release_id" || k === "variant")],
    presets: FUNNEL_PRESETS,
  })
}
