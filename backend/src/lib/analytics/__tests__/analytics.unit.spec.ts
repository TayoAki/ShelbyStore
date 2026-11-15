import {
  assignVariant,
  assetSessionsQuery,
  assetUrlPattern,
  deviceFromUserAgent,
  experimentResults,
  filterSql,
  funnelQuery,
  isBotUserAgent,
  normalCdf,
  normalizeEvent,
  shapeFunnel,
  trendsQuery,
  twoProportionTest,
} from "../index"

const holes = (sql: string) => (sql.match(/\?/g) ?? []).length

describe("SQL builders keep text and bindings aligned and never inline user input", () => {
  const from = new Date("2026-11-01T00:00:00Z")
  const to = new Date("2026-11-08T00:00:00Z")

  it("funnel: one CTE per step, bindings in order", () => {
    const q = funnelQuery({
      steps: [
        { event: "$pageview", filters: [{ key: "asset", op: "is_set" }] },
        { event: "product_viewed" },
        { event: "add_to_cart", filters: [{ key: "release_id", op: "eq", value: "rel_1' OR 1=1 --" }] },
      ],
      from,
      to,
      windowSeconds: 7 * 86400,
      breakdown: "$exp_hero",
    })
    expect(holes(q.sql)).toBe(q.params.length)
    expect(q.sql).toContain("s3 AS")
    expect(q.sql).not.toContain("OR 1=1")
    expect(q.params).toContain("rel_1' OR 1=1 --")
    // breakdown key is bound, not inlined
    expect(q.params[0]).toBe("$exp_hero")
    expect(q.sql).toContain("median_3")
  })

  it("rejects property keys that could escape the JSON path", () => {
    expect(() => filterSql([{ key: "x'); drop table analytics_event; --", op: "eq", value: "1" }])).toThrow()
  })

  it("trends + asset sessions align placeholders", () => {
    const t = trendsQuery({ events: ["$pageview", "add_to_cart"], from, to, timezone: "America/Los_Angeles", breakdown: "device_type" })
    expect(holes(t.sql)).toBe(t.params.length)
    const a = assetSessionsQuery("wash-test-1", from, to)
    expect(holes(a.sql)).toBe(a.params.length)
  })

  it("asset URL pattern matches whole keys only", () => {
    const re = new RegExp(assetUrlPattern("wash-test-1"))
    expect(re.test("https://shop/p?asset=wash-test-1")).toBe(true)
    expect(re.test("https://shop/p?x=1&asset=wash-test-1&y=2")).toBe(true)
    expect(re.test("https://shop/p?asset=wash-test-10")).toBe(false)
  })
})

describe("funnel shaping", () => {
  const steps = [{ event: "product_viewed" }, { event: "add_to_cart" }, { event: "order_completed" }]
  it("computes step and overall conversion", () => {
    const r = shapeFunnel(steps, [{ breakdown: null, step_1: 200, step_2: 50, step_3: 10, median_2: 30, median_3: 600 }])
    expect(r.steps.map((s) => s.count)).toEqual([200, 50, 10])
    expect(r.steps[1].conversion_from_previous).toBe(0.25)
    expect(r.steps[2].conversion_from_previous).toBe(0.2)
    expect(r.overall_conversion).toBe(0.05)
    expect(r.steps[2].median_seconds_from_start).toBe(600)
  })
  it("sums breakdown rows and drops medians", () => {
    const r = shapeFunnel(steps, [
      { breakdown: "tiktok-tryon", step_1: 100, step_2: 40, step_3: 8, median_2: 1, median_3: 2 },
      { breakdown: null, step_1: 100, step_2: 10, step_3: 2, median_2: 1, median_3: 2 },
    ])
    expect(r.steps.map((s) => s.count)).toEqual([200, 50, 10])
    expect(r.steps[1].median_seconds_from_start).toBeNull()
    expect(r.breakdown[0].conversion).toBe(0.08)
  })
})

describe("experiment statistics", () => {
  it("normal CDF is accurate", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6)
    expect(normalCdf(1.959964)).toBeCloseTo(0.975, 4)
  })
  it("two-proportion z-test", () => {
    const t = twoProportionTest({ n: 1000, x: 100 }, { n: 1000, x: 140 })!
    expect(t.z).toBeCloseTo(2.76, 1)
    expect(t.p_value).toBeLessThan(0.01)
  })
  it("never declares a winner below the minimum sample", () => {
    const r = experimentResults(["control", "b"], { control: [40, 2], b: [42, 12] }, { minimumSample: 100 })
    expect(r.verdict.status).toBe("inconclusive")
    expect(r.variants[1].uplift).toBeGreaterThan(0)
  })
  it("reports significance and direction above the sample", () => {
    const r = experimentResults(["control", "b"], { control: [1000, 30, 100], b: [1000, 40, 140] }, { minimumSample: 100 })
    expect(r.verdict.status).toBe("significant")
    if (r.verdict.status === "significant") expect(r.verdict.better).toEqual(["b"])
  })
  it("says no difference when p is large", () => {
    const r = experimentResults(["control", "b"], { control: [500, 50], b: [500, 52] }, { minimumSample: 100 })
    expect(r.verdict.status).toBe("no_difference")
  })
})

describe("assignment", () => {
  const variants = [
    { key: "control", weight: 50 },
    { key: "b", weight: 50 },
  ]
  it("is deterministic per person and experiment", () => {
    expect(assignVariant("hero", "u1", variants)).toBe(assignVariant("hero", "u1", variants))
  })
  it("splits roughly by weight", () => {
    const counts: Record<string, number> = {}
    for (let i = 0; i < 4000; i++) {
      const v = assignVariant("hero", `visitor-${i}`, variants)!
      counts[v] = (counts[v] ?? 0) + 1
    }
    expect(counts.control / 4000).toBeGreaterThan(0.45)
    expect(counts.control / 4000).toBeLessThan(0.55)
    const skew: Record<string, number> = {}
    for (let i = 0; i < 4000; i++) {
      const v = assignVariant("x", `v${i}`, [
        { key: "a", weight: 90 },
        { key: "b", weight: 10 },
      ])!
      skew[v] = (skew[v] ?? 0) + 1
    }
    expect(skew.b / 4000).toBeGreaterThan(0.07)
    expect(skew.b / 4000).toBeLessThan(0.13)
  })
})

describe("ingestion", () => {
  const receivedAt = new Date("2026-11-15T12:00:00Z")
  it("drops bad names and bots", () => {
    expect(normalizeEvent({ event: "Bad Name", distinct_id: "u" }, { receivedAt })).toBeNull()
    expect(normalizeEvent({ event: "x", distinct_id: "" }, { receivedAt })).toBeNull()
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true)
    expect(isBotUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(false)
  })
  it("corrects client clock skew and clamps silly timestamps", () => {
    const skewed = normalizeEvent(
      { event: "$pageview", distinct_id: "u", timestamp: "2026-11-15T11:00:00Z" },
      { receivedAt, sentAt: new Date("2026-11-15T11:00:05Z") }
    )!
    // client clock 1h behind: event moves to ~11:59:55
    expect(skewed.occurred_at.toISOString()).toBe("2026-11-15T11:59:55.000Z")
    const future = normalizeEvent({ event: "x", distinct_id: "u", timestamp: "2030-01-01T00:00:00Z" }, { receivedAt })!
    expect(future.occurred_at).toEqual(receivedAt)
  })
  it("lifts attribution, cleans props, refuses client-claimed server platform", () => {
    const row = normalizeEvent(
      {
        event: "product_viewed",
        distinct_id: "u",
        platform: "server",
        properties: { asset: "tiktok-tryon", "bad key!": 1, handle: "everyday-tee" },
      },
      { receivedAt, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile" }
    )!
    expect(row.asset).toBe("tiktok-tryon")
    expect(row.platform).toBe("web")
    expect(row.device_type).toBe("mobile")
    expect(row.properties).toEqual({ asset: "tiktok-tryon", handle: "everyday-tee" })
  })
  it("classifies devices", () => {
    expect(deviceFromUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet")
    expect(deviceFromUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("desktop")
  })
})

import { insertEventsQuery } from "../index"

describe("event insert", () => {
  it("binds every value and skips duplicate insert ids", () => {
    const row = {
      id: "aev_1", event: "$pageview", distinct_id: "u'); --", session_id: null, occurred_at: new Date(), received_at: new Date(),
      path: "/", url: null, referrer: null, asset: null, utm_source: null, utm_medium: null, utm_campaign: null,
      device_type: "mobile", platform: "web", properties: { $insert_id: "x" },
    }
    const q = insertEventsQuery([row, { ...row, id: "aev_2" }])
    expect((q.sql.match(/\?/g) ?? []).length).toBe(q.params.length)
    expect(q.sql).toContain("ON CONFLICT DO NOTHING")
    expect(q.sql).not.toContain("u');")
    expect(q.params).toContain(JSON.stringify({ $insert_id: "x" }))
  })
})
