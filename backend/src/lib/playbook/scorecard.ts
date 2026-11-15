import {
  DAY_SEVEN_MS,
  ReleaseDecision,
  ReleaseLike,
  VariantStock,
  round2,
  toDate,
} from "./types"

/** One order line for a product in the release, sold since go-live. */
export type ScorecardLine = {
  order_id: string
  variant_id: string | null
  quantity: number
  /** Units received back as returns. */
  returned_quantity: number
  /** What the customer paid for the line, net of discounts, excluding tax. */
  net_amount: number
  /** Attribution tag copied from cart → order metadata (`?asset=` deep link). */
  asset: string | null
}

export type ScorecardInputs = {
  release: ReleaseLike
  now: Date
  lines: ScorecardLine[]
  /** variant_id → unit product cost (major units). Missing = unknown. */
  unit_costs: Record<string, number | null | undefined>
  /** Stock for every variant of the core collection. */
  core_variants: VariantStock[]
}

export type ScorecardPhase =
  | "pre_launch" // not live yet
  | "collecting" // live, before the day-7 review
  | "day7_ready" // day-7 review due, returns window still open
  | "returns_mature" // returns window closed, numbers are final

export type Scorecard = {
  phase: ScorecardPhase
  dates: {
    published_at: string | null
    day7_review_at: string | null
    returns_mature_at: string | null
  }
  contribution: {
    net_sales: number
    product_cost: number
    selling_cost: number
    fulfillment_cost: number
    launch_spend: number
    contribution: number
    floor: number | null
    meets_floor: boolean | null
    orders: number
    variants_missing_cost: string[]
  }
  sell_through: {
    net_units: number
    starting_units: number | null
    units_added: number
    rate: number | null
  }
  core_availability: {
    variants_tracked: number
    out_of_stock: { variant_id: string; label: string }[]
    interrupted: boolean
  }
  workload: {
    capacity_hours: number | null
    actual_hours: number | null
    within_cap: boolean | null
  }
  /** Directional only (pilot table): orders by tagged asset. */
  channel_response: { asset: string; orders: number; units: number; net_sales: number }[]
  recommendation: {
    decision: ReleaseDecision | null
    reasons: string[]
    missing_inputs: string[]
    returns_pending: boolean
    notes: string[]
  }
}

const iso = (d: Date | null) => (d ? d.toISOString() : null)
const money = (n: number) => n.toFixed(2)

/**
 * Builds the launch scorecard from the pilot section of the playbook and
 * recommends repeat / simplify / pause using its decision rule:
 *
 * - Repeat if contribution meets the agreed floor and the team stays within
 *   capacity without interrupting core availability.
 * - Simplify or space out releases if hours exceed the cap.
 * - Pause if stock or contribution misses the agreed minimum.
 */
export function buildScorecard(input: ScorecardInputs): Scorecard {
  const { release, now, lines, unit_costs, core_variants } = input

  const publishedAt = toDate(release.published_at)
  const returnsWindowDays = release.returns_window_days ?? 30
  const day7 = publishedAt ? new Date(publishedAt.getTime() + DAY_SEVEN_MS) : null
  const returnsMature = publishedAt
    ? new Date(publishedAt.getTime() + returnsWindowDays * 24 * 60 * 60 * 1000)
    : null

  let phase: ScorecardPhase
  if (!publishedAt) phase = "pre_launch"
  else if (now < day7!) phase = "collecting"
  else if (now < returnsMature!) phase = "day7_ready"
  else phase = "returns_mature"

  // --- Contribution & sell-through -------------------------------------------
  let netSales = 0
  let productCost = 0
  let netUnits = 0
  const orderIds = new Set<string>()
  const missingCost = new Set<string>()
  const byAsset = new Map<string, { orders: Set<string>; units: number; net_sales: number }>()

  for (const line of lines) {
    if (line.quantity <= 0) continue
    const keptUnits = Math.max(0, line.quantity - (line.returned_quantity || 0))
    const unitNet = line.net_amount / line.quantity
    const lineNet = unitNet * keptUnits

    orderIds.add(line.order_id)
    netSales += lineNet
    netUnits += keptUnits

    const cost = line.variant_id ? unit_costs[line.variant_id] : undefined
    if (typeof cost === "number") {
      productCost += cost * keptUnits
    } else if (line.variant_id) {
      missingCost.add(line.variant_id)
    }

    const tag = line.asset || "untagged"
    const bucket = byAsset.get(tag) ?? { orders: new Set(), units: 0, net_sales: 0 }
    bucket.orders.add(line.order_id)
    bucket.units += keptUnits
    bucket.net_sales += lineNet
    byAsset.set(tag, bucket)
  }

  const sellingCost = netSales * (release.selling_cost_rate ?? 0)
  const fulfillmentCost = orderIds.size * (release.fulfillment_cost_per_order ?? 0)
  const launchSpend = release.launch_spend ?? 0
  const contribution = netSales - productCost - sellingCost - fulfillmentCost - launchSpend
  const floor = release.contribution_floor ?? null

  const startingUnits = release.starting_units ?? null
  const unitsAdded = release.units_added ?? 0
  const denominator = (startingUnits ?? 0) + unitsAdded

  // --- Core availability ------------------------------------------------------
  const coreOut = core_variants
    .filter((v) => v.available !== null && v.available <= 0)
    .map((v) => ({ variant_id: v.variant_id, label: `${v.product_title} / ${v.variant_title}` }))

  // --- Workload ---------------------------------------------------------------
  const capacity = release.capacity_hours ?? null
  const actual = release.actual_hours ?? null
  const withinCap = capacity === null || actual === null ? null : actual <= capacity

  const scorecard: Scorecard = {
    phase,
    dates: {
      published_at: iso(publishedAt),
      day7_review_at: iso(day7),
      returns_mature_at: iso(returnsMature),
    },
    contribution: {
      net_sales: round2(netSales),
      product_cost: round2(productCost),
      selling_cost: round2(sellingCost),
      fulfillment_cost: round2(fulfillmentCost),
      launch_spend: round2(launchSpend),
      contribution: round2(contribution),
      floor,
      meets_floor: floor === null ? null : contribution >= floor,
      orders: orderIds.size,
      variants_missing_cost: [...missingCost],
    },
    sell_through: {
      net_units: netUnits,
      starting_units: startingUnits,
      units_added: unitsAdded,
      rate: denominator > 0 ? round2(netUnits / denominator) : null,
    },
    core_availability: {
      variants_tracked: core_variants.length,
      out_of_stock: coreOut,
      interrupted: coreOut.length > 0,
    },
    workload: { capacity_hours: capacity, actual_hours: actual, within_cap: withinCap },
    channel_response: [...byAsset.entries()]
      .map(([asset, b]) => ({
        asset,
        orders: b.orders.size,
        units: b.units,
        net_sales: round2(b.net_sales),
      }))
      .sort((a, b) => b.net_sales - a.net_sales),
    recommendation: {
      decision: null,
      reasons: [],
      missing_inputs: [],
      returns_pending: phase === "collecting" || phase === "day7_ready",
      notes: [],
    },
  }

  scorecard.recommendation = recommend(scorecard)
  return scorecard
}

function recommend(s: Scorecard): Scorecard["recommendation"] {
  const rec: Scorecard["recommendation"] = {
    decision: null,
    reasons: [],
    missing_inputs: [],
    returns_pending: s.phase === "collecting" || s.phase === "day7_ready",
    notes: [],
  }

  if (s.phase === "pre_launch") {
    rec.reasons.push("The release isn't live yet.")
    return rec
  }
  if (s.phase === "collecting") {
    rec.reasons.push(
      `Too early to decide. Review sales and workload on day 7 (${s.dates.day7_review_at?.slice(0, 10)}).`
    )
    return rec
  }

  if (s.contribution.floor === null) rec.missing_inputs.push("Agree a contribution floor")
  if (s.workload.capacity_hours === null) rec.missing_inputs.push("Agree a capacity cap in hours")
  if (s.workload.actual_hours === null) rec.missing_inputs.push("Log actual prep and launch hours")
  if (s.contribution.variants_missing_cost.length) {
    rec.missing_inputs.push(
      `Add unit cost for ${s.contribution.variants_missing_cost.length} variant(s) (variant metadata "unit_cost")`
    )
  }
  if (s.sell_through.starting_units === null) {
    rec.notes.push("Starting units weren't captured, so sell-through can't be calculated.")
  }

  if (rec.missing_inputs.length) {
    rec.reasons.push("Fill in the missing inputs before recording a decision.")
    return rec
  }

  const pause: string[] = []
  const simplify: string[] = []

  if (s.contribution.meets_floor === false) {
    pause.push(
      `Contribution ${money(s.contribution.contribution)} is below the agreed floor of ${money(s.contribution.floor!)}.`
    )
  }
  if (s.core_availability.interrupted) {
    pause.push(
      `Core sizes are out of stock (${s.core_availability.out_of_stock.map((v) => v.label).join(", ")}). Protect core replenishment before the next release.`
    )
  }
  if (s.workload.within_cap === false) {
    simplify.push(
      `The team logged ${s.workload.actual_hours} h against a ${s.workload.capacity_hours} h cap. Simplify the next release or space releases out.`
    )
  }

  if (pause.length) {
    rec.decision = "pause"
    rec.reasons.push(...pause, ...simplify)
  } else if (simplify.length) {
    rec.decision = "simplify"
    rec.reasons.push(...simplify)
  } else {
    rec.decision = "repeat"
    rec.reasons.push(
      "Contribution met the floor, the team stayed within capacity and core sizes stayed in stock."
    )
    rec.notes.push("If this was the first run, repeat with a comparable release before increasing cadence.")
  }

  if (rec.returns_pending) {
    rec.notes.push(
      `Returns window is open until ${s.dates.returns_mature_at?.slice(0, 10)}. Revisit contribution once returns mature.`
    )
  }
  return rec
}
