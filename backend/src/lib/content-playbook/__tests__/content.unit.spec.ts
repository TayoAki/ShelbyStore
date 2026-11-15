import {
  buildSeriesScorecard,
  canTransitionSeries,
  EpisodeLike,
  evaluateSeriesReadiness,
  SeriesLike,
} from "../index"

const DAY = 24 * 60 * 60 * 1000
const start = new Date("2026-05-01T17:00:00Z")

const series = (over: Partial<SeriesLike> = {}): SeriesLike => ({
  stance: "We wash every Everyday Tee 30 times before we sign off the fit.",
  competitor_swap_passed: true,
  proof: "The wash-test rack: tee #1 vs tee after 30 washes, collar and sleeve measured on camera.",
  audience_question: "Will this tee still fit after a summer of washing?",
  format: "Before/after reveal (borrowed from home-renovation videos)",
  beat_sheet: ["Hold up a 30-wash tee", "Measure collar and sleeve", "Reveal next to a new tee", "Ask the prompt"],
  participation_prompt: "Show us the oldest tee you still wear.",
  production_hours_budget: 4,
  ...over,
})

const ep = (i: number, over: Partial<EpisodeLike> = {}): EpisodeLike => ({
  id: `ep${i}`,
  title: `Episode ${i}`,
  asset_key: `fit-check-${i}`,
  published_at: new Date(start.getTime() + i * 3 * DAY),
  metrics_recorded_at: new Date(start.getTime() + i * 3 * DAY + 3 * DAY),
  views: 2500,
  avg_pct_viewed: 48,
  relevant_comments: 12,
  submissions: 3,
  production_hours: 3.5,
  landing_sessions: 40,
  product_view_sessions: 25,
  orders: 2,
  net_sales: 64,
  ...over,
})

const now = new Date(start.getTime() + 30 * DAY)
const four = (over: Partial<EpisodeLike> = {}) => [0, 1, 2, 3].map((i) => ep(i, over))

describe("evaluateSeriesReadiness", () => {
  it("passes a complete stance, proof, format and prompt", () => {
    expect(evaluateSeriesReadiness(series()).ready).toBe(true)
  })
  it("blocks filming without proof or a passed competitor-swap test", () => {
    const r = evaluateSeriesReadiness(series({ proof: " ", competitor_swap_passed: false }))
    expect(r.ready).toBe(false)
    expect(r.checks.filter((c) => !c.passed).map((c) => c.key)).toEqual(["competitor_swap", "proof"])
  })
  it("needs at least three beats", () => {
    expect(evaluateSeriesReadiness(series({ beat_sheet: ["a", "b"] })).ready).toBe(false)
  })
})

describe("canTransitionSeries", () => {
  it("starts a new batch after a decision but never jumps to a decision by hand", () => {
    expect(canTransitionSeries("draft", "piloting")).toBe(true)
    expect(canTransitionSeries("revise", "piloting")).toBe(true)
    expect(canTransitionSeries("piloting", "continue")).toBe(false)
  })
})

describe("buildSeriesScorecard", () => {
  it("waits for the full batch", () => {
    const s = buildSeriesScorecard({ series: series(), episodes: four().slice(0, 2), now })
    expect(s.recommendation.decision).toBeNull()
    expect(s.recommendation.reasons[0]).toContain("2 more episode")
  })

  it("ignores scheduled episodes that haven't been published yet", () => {
    const future = ep(9, { published_at: new Date(now.getTime() + DAY) })
    const s = buildSeriesScorecard({ series: series(), episodes: [...four(), future], now })
    expect(s.published_episodes).toBe(4)
  })

  it("continues when people engage, buy and the team stays in budget", () => {
    const s = buildSeriesScorecard({ series: series(), episodes: four(), now })
    expect(s.recommendation.decision).toBe("continue")
    expect(s.participation.per_1k_views).toBe(6) // 60 / 10,000 * 1000
    expect(s.business).toMatchObject({ orders: 8, landing_sessions: 160, orders_per_post: 2 })
    expect(s.recommendation.notes[0]).toContain("too few to judge whether the series has built a community")
    expect(s.recommendation.notes.join(" ")).toContain("this batch sets it")
  })

  it("pauses when production runs over the time budget", () => {
    const s = buildSeriesScorecard({ series: series(), episodes: four({ production_hours: 6 }), now })
    expect(s.recommendation.decision).toBe("pause")
    expect(s.effort.over_budget_episodes).toHaveLength(4)
  })

  it("pauses when the stance can't be substantiated", () => {
    const s = buildSeriesScorecard({ series: series({ proof: null }), episodes: four(), now })
    expect(s.recommendation.decision).toBe("pause")
  })

  it("revises the opening when viewers leave early versus the baseline", () => {
    const s = buildSeriesScorecard({
      series: series({ baseline_avg_pct_viewed: 55 }),
      episodes: four(),
      now,
    })
    expect(s.recommendation).toMatchObject({ decision: "revise", revision_target: "opening" })
  })

  it("revises the opening when attention falls across the batch with no baseline", () => {
    const eps = [60, 55, 45, 40].map((pct, i) => ep(i, { avg_pct_viewed: pct }))
    const s = buildSeriesScorecard({ series: series(), episodes: eps, now })
    expect(s.recommendation.revision_target).toBe("opening")
  })

  it("revises the topic when few episodes draw participation", () => {
    const eps = four({ relevant_comments: 0, submissions: 0 })
    eps[0] = ep(0)
    const s = buildSeriesScorecard({ series: series(), episodes: eps, now })
    expect(s.recommendation.revision_target).toBe("topic")
  })

  it("revises the booking path when people engage but don't buy", () => {
    const s = buildSeriesScorecard({ series: series(), episodes: four({ orders: 0, net_sales: 0 }), now })
    expect(s.recommendation).toMatchObject({ decision: "revise", revision_target: "booking_path" })
    expect(s.recommendation.reasons[0]).toContain("few buy")
  })

  it("flags posts measured at different ages", () => {
    const eps = four()
    eps[3] = ep(3, { metrics_recorded_at: new Date(new Date(eps[3].published_at!).getTime() + 9 * DAY) })
    const s = buildSeriesScorecard({ series: series(), episodes: eps, now })
    expect(s.comparability.same_age).toBe(false)
    expect(s.recommendation.notes.join(" ")).toContain("different ages")
  })

  it("only reports participation per 1,000 views where volume allows", () => {
    const s = buildSeriesScorecard({ series: series(), episodes: four({ views: 200 }), now })
    expect(s.participation.per_1k_views).toBeNull()
    expect(s.episodes[0].participation_per_1k).toBeNull()
    expect(s.recommendation.notes.join(" ")).toContain("as a count")
  })
})
