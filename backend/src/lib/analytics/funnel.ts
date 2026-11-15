import type { FunnelStep } from "./sql"

export type FunnelRow = Record<string, unknown> & { breakdown: string | null }

export type FunnelStepResult = {
  index: number
  event: string
  label: string
  count: number
  /** Share of step 1 that reached this step. */
  conversion_from_start: number | null
  /** Share of the previous step that reached this step. */
  conversion_from_previous: number | null
  /** Median seconds from step 1 to this step (null for step 1 / no conversions). */
  median_seconds_from_start: number | null
}

export type FunnelResult = {
  steps: FunnelStepResult[]
  overall_conversion: number | null
  breakdown: { value: string | null; steps: number[]; conversion: number | null }[]
}

const ratio = (a: number, b: number) => (b > 0 ? a / b : null)
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v))

export function stepLabel(step: FunnelStep) {
  if (step.label) return step.label
  const f = (step.filters ?? []).map((x) => (x.op === "is_set" ? `${x.key} set` : `${x.key}=${x.value ?? ""}`))
  return f.length ? `${step.event} (${f.join(", ")})` : step.event
}

/**
 * Shapes the SQL rows (one per breakdown value) into a funnel. Counts add up
 * across breakdown rows because each person has exactly one step-1 value.
 * Medians are only reported without a breakdown (they don't add).
 */
export function shapeFunnel(steps: FunnelStep[], rows: FunnelRow[], maxBreakdownRows = 20): FunnelResult {
  const n = steps.length
  const totals = Array.from({ length: n }, (_, i) => rows.reduce((s, r) => s + Number(r[`step_${i + 1}`] ?? 0), 0))
  const single = rows.length === 1 ? rows[0] : null
  const result: FunnelStepResult[] = steps.map((step, i) => ({
    index: i + 1,
    event: step.event,
    label: stepLabel(step),
    count: totals[i],
    conversion_from_start: i === 0 ? (totals[0] > 0 ? 1 : null) : ratio(totals[i], totals[0]),
    conversion_from_previous: i === 0 ? null : ratio(totals[i], totals[i - 1]),
    median_seconds_from_start: i === 0 || !single ? null : num(single[`median_${i + 1}`]),
  }))
  return {
    steps: result,
    overall_conversion: ratio(totals[n - 1], totals[0]),
    breakdown: rows
      .map((r) => {
        const counts = Array.from({ length: n }, (_, i) => Number(r[`step_${i + 1}`] ?? 0))
        return { value: (r.breakdown as string | null) ?? null, steps: counts, conversion: ratio(counts[n - 1], counts[0]) }
      })
      .slice(0, maxBreakdownRows),
  }
}

/** Funnel presets shown in the admin (docs/analytics.md). */
export const FUNNEL_PRESETS: { key: string; name: string; steps: FunnelStep[] }[] = [
  {
    key: "purchase",
    name: "Purchase",
    steps: [{ event: "product_viewed" }, { event: "add_to_cart" }, { event: "checkout_started" }, { event: "order_completed" }],
  },
  {
    key: "social",
    name: "Social to purchase",
    steps: [
      { event: "$pageview", filters: [{ key: "asset", op: "is_set" }], label: "Tagged landing (?asset=)" },
      { event: "product_viewed" },
      { event: "add_to_cart" },
      { event: "order_completed" },
    ],
  },
  {
    key: "drop",
    name: "Drop",
    steps: [{ event: "drop_viewed" }, { event: "product_viewed" }, { event: "add_to_cart" }, { event: "order_completed" }],
  },
]
