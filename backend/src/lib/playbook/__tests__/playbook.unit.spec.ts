import { buildScorecard, evaluateGoLive, ReleaseLike, VariantStock } from "../index"

const DAY = 24 * 60 * 60 * 1000
const launch = new Date("2026-03-01T15:00:00Z")

const readyRelease = (over: Partial<ReleaseLike> = {}): ReleaseLike => ({
  tier: "light",
  status: "scheduled",
  release_at: launch,
  owner: "Merch lead",
  backup_approver: "Founder",
  product_promise: "The washed tee in a new colour, same fit.",
  assets: [
    { key: "pdp-photos", kind: "product_images", channel: "site", approved: true },
    { key: "tiktok-tryon", kind: "short_video", channel: "tiktok", approved: true },
  ],
  check_mobile_pdp: true,
  check_fulfillment: true,
  check_channel_links: true,
  check_tracking: true,
  ...over,
})

const stock = (available: number | null, title = "M"): VariantStock => ({
  variant_id: `var_${title}`,
  product_title: "Washed Tee",
  variant_title: title,
  available,
})

describe("evaluateGoLive", () => {
  it("is ready when every check passes", () => {
    const res = evaluateGoLive(readyRelease(), {
      product_count: 1,
      variants: [stock(10, "S"), stock(4, "M"), stock(null, "L")],
    })
    expect(res.ready).toBe(true)
    expect(res.failures).toEqual([])
  })

  it("holds the release when a size run is out of stock (stock-delay branch)", () => {
    const res = evaluateGoLive(readyRelease(), {
      product_count: 1,
      variants: [stock(10, "S"), stock(0, "XL")],
    })
    expect(res.ready).toBe(false)
    expect(res.failures.join()).toContain("Washed Tee / XL")
  })

  it("requires tier-specific creative", () => {
    const major = evaluateGoLive(readyRelease({ tier: "major" }), {
      product_count: 1,
      variants: [stock(5)],
    })
    expect(major.ready).toBe(false)
    expect(major.checks.find((c) => c.key === "creative")!.detail).toContain("editorial")
  })

  it("lets unapproved optional assets be skipped", () => {
    const release = readyRelease({
      assets: [
        ...(readyRelease().assets ?? []),
        { key: "ig-stories", kind: "stories", channel: "instagram", approved: false, optional: true },
      ],
    })
    const res = evaluateGoLive(release, { product_count: 1, variants: [stock(5)] })
    expect(res.ready).toBe(true)
    expect(res.checks.find((c) => c.key === "creative")!.detail).toContain("ig-stories")
  })

  it("lists missing brief fields and unconfirmed manual checks", () => {
    const res = evaluateGoLive(
      readyRelease({ owner: null, backup_approver: null, check_tracking: false }),
      { product_count: 0, variants: [] }
    )
    expect(res.ready).toBe(false)
    const text = res.failures.join(" | ")
    expect(text).toContain("owner")
    expect(text).toContain("backup approver")
    expect(text).toContain("Attach at least one product")
    expect(text).toContain("Tracking")
  })
})

describe("buildScorecard", () => {
  const base = {
    release: readyRelease({
      status: "live",
      published_at: launch,
      launch_spend: 100,
      fulfillment_cost_per_order: 5,
      selling_cost_rate: 0.03,
      contribution_floor: 200,
      capacity_hours: 20,
      actual_hours: 15,
      starting_units: 100,
      units_added: 0,
      returns_window_days: 30,
    }),
    unit_costs: { var_S: 8, var_M: 8 },
    core_variants: [stock(20, "Core M"), stock(12, "Core L")],
    lines: [
      { order_id: "o1", variant_id: "var_S", quantity: 2, returned_quantity: 0, net_amount: 80, asset: "tiktok-tryon" },
      { order_id: "o2", variant_id: "var_M", quantity: 3, returned_quantity: 1, net_amount: 120, asset: "tiktok-tryon" },
      { order_id: "o3", variant_id: "var_M", quantity: 5, returned_quantity: 0, net_amount: 200, asset: null },
    ],
  }

  it("withholds a decision before day 7", () => {
    const s = buildScorecard({ ...base, now: new Date(launch.getTime() + 3 * DAY) })
    expect(s.phase).toBe("collecting")
    expect(s.recommendation.decision).toBeNull()
    expect(s.recommendation.reasons[0]).toContain("day 7")
  })

  it("computes contribution, sell-through and channel response", () => {
    const s = buildScorecard({ ...base, now: new Date(launch.getTime() + 8 * DAY) })
    // net sales: 80 + (120/3)*2 + 200 = 360; units: 2 + 2 + 5 = 9
    expect(s.contribution.net_sales).toBe(360)
    expect(s.sell_through.net_units).toBe(9)
    expect(s.sell_through.rate).toBe(0.09)
    // cost 9*8=72, selling 10.8, fulfillment 3*5=15, spend 100 → 162.2
    expect(s.contribution.contribution).toBe(162.2)
    expect(s.contribution.meets_floor).toBe(false)
    expect(s.channel_response[0]).toEqual({ asset: "untagged", orders: 1, units: 5, net_sales: 200 })
    expect(s.channel_response[1]).toEqual({ asset: "tiktok-tryon", orders: 2, units: 4, net_sales: 160 })
  })

  it("recommends pause when contribution misses the floor", () => {
    const s = buildScorecard({ ...base, now: new Date(launch.getTime() + 8 * DAY) })
    expect(s.phase).toBe("day7_ready")
    expect(s.recommendation.decision).toBe("pause")
    expect(s.recommendation.returns_pending).toBe(true)
  })

  it("recommends simplify when hours exceed the cap but economics hold", () => {
    const s = buildScorecard({
      ...base,
      release: { ...base.release, contribution_floor: 100, actual_hours: 26 },
      now: new Date(launch.getTime() + 8 * DAY),
    })
    expect(s.recommendation.decision).toBe("simplify")
  })

  it("recommends pause when core sizes go out of stock", () => {
    const s = buildScorecard({
      ...base,
      release: { ...base.release, contribution_floor: 100 },
      core_variants: [stock(0, "Core M"), stock(12, "Core L")],
      now: new Date(launch.getTime() + 8 * DAY),
    })
    expect(s.core_availability.interrupted).toBe(true)
    expect(s.recommendation.decision).toBe("pause")
  })

  it("recommends repeat when everything holds, and marks numbers final after the returns window", () => {
    const s = buildScorecard({
      ...base,
      release: { ...base.release, contribution_floor: 100 },
      now: new Date(launch.getTime() + 31 * DAY),
    })
    expect(s.phase).toBe("returns_mature")
    expect(s.recommendation.decision).toBe("repeat")
    expect(s.recommendation.returns_pending).toBe(false)
  })

  it("asks for missing inputs instead of guessing", () => {
    const s = buildScorecard({
      ...base,
      release: { ...base.release, contribution_floor: null, actual_hours: null },
      unit_costs: {},
      now: new Date(launch.getTime() + 8 * DAY),
    })
    expect(s.recommendation.decision).toBeNull()
    expect(s.recommendation.missing_inputs).toHaveLength(3)
  })
})

import { lineNetAmount } from "../../release-data"

describe("lineNetAmount", () => {
  it("subtracts discounts from tax-exclusive prices", () => {
    expect(lineNetAmount({ unit_price: 68, quantity: 2, adjustments: [{ amount: 10 }] })).toBe(126)
  })
  it("backs tax out of tax-inclusive prices", () => {
    expect(
      lineNetAmount({ unit_price: 60, quantity: 2, is_tax_inclusive: true, tax_lines: [{ rate: 20 }] })
    ).toBeCloseTo(100)
  })
})
