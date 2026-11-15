import {
  DEFAULT_EPISODE_TARGET,
  EpisodeLike,
  PARTICIPATION_MIN_VIEWS,
  RevisionTarget,
  SAME_AGE_TOLERANCE_DAYS,
  SeriesDecision,
  SeriesLike,
  present,
  round,
  toDate,
} from "./types"

const DAY = 24 * 60 * 60 * 1000

export type EpisodeRow = {
  id: string
  title: string
  asset_key: string
  published_at: string | null
  age_days: number | null
  views: number | null
  avg_pct_viewed: number | null
  participation: number
  participation_per_1k: number | null
  landing_sessions: number | null
  product_view_sessions: number | null
  orders: number
  net_sales: number
  production_hours: number | null
  over_budget: boolean | null
}

export type SeriesScorecard = {
  target_episodes: number
  published_episodes: number
  measured_episodes: number
  episodes: EpisodeRow[]
  attention: {
    avg_pct_viewed: number | null
    baseline: number | null
    delta: number | null
    first: number | null
    last: number | null
  }
  participation: {
    total: number
    per_1k_views: number | null
    volume_ok: boolean
    episodes_with_participation: number
    baseline_per_1k: number | null
  }
  business: {
    landing_sessions: number | null
    product_view_sessions: number | null
    orders: number
    net_sales: number
    orders_per_post: number | null
    baseline_orders_per_post: number | null
  }
  effort: {
    hours_per_episode: number | null
    budget: number | null
    within_budget: boolean | null
    over_budget_episodes: string[]
  }
  comparability: { same_age: boolean | null; ages_days: number[]; note: string | null }
  baseline_set: boolean
  recommendation: {
    decision: SeriesDecision | null
    revision_target: RevisionTarget | null
    reasons: string[]
    notes: string[]
  }
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
const sumNullable = (xs: (number | null | undefined)[]) =>
  xs.some((x) => typeof x === "number") ? xs.reduce<number>((a, b) => a + (b ?? 0), 0) : null

/**
 * The playbook's two-week pilot: four episodes, one stance, one format.
 * Signals: attention, participation (per 1,000 views where volume allows),
 * business response through the tracked link, and production effort.
 */
export function buildSeriesScorecard(input: {
  series: SeriesLike
  episodes: EpisodeLike[]
  now: Date
}): SeriesScorecard {
  const { series, now } = input
  const target = series.episode_target ?? DEFAULT_EPISODE_TARGET
  const budget = series.production_hours_budget ?? null

  const published = input.episodes
    .filter((e) => {
      const p = toDate(e.published_at)
      return p && p <= now
    })
    .sort((a, b) => toDate(a.published_at)!.getTime() - toDate(b.published_at)!.getTime())

  const rows: EpisodeRow[] = published.map((e) => {
    const pub = toDate(e.published_at)!
    const rec = toDate(e.metrics_recorded_at)
    const participation = (e.relevant_comments ?? 0) + (e.submissions ?? 0)
    const views = e.views ?? null
    return {
      id: e.id,
      title: e.title,
      asset_key: e.asset_key,
      published_at: pub.toISOString(),
      age_days: rec ? round((rec.getTime() - pub.getTime()) / DAY, 1) : null,
      views,
      avg_pct_viewed: e.avg_pct_viewed ?? null,
      participation,
      participation_per_1k:
        views !== null && views >= PARTICIPATION_MIN_VIEWS ? round((participation / views) * 1000) : null,
      landing_sessions: e.landing_sessions ?? null,
      product_view_sessions: e.product_view_sessions ?? null,
      orders: e.orders ?? 0,
      net_sales: round(e.net_sales ?? 0),
      production_hours: e.production_hours ?? null,
      over_budget:
        budget === null || e.production_hours === null || e.production_hours === undefined
          ? null
          : e.production_hours > budget,
    }
  })

  const measured = rows.filter((r) => r.views !== null || r.avg_pct_viewed !== null)

  // Attention
  const attentionValues = measured.map((r) => r.avg_pct_viewed).filter((v): v is number => v !== null)
  const avgAttention = mean(attentionValues)
  const baselineAttention = series.baseline_avg_pct_viewed ?? null

  // Participation (pooled so small posts don't swing the rate)
  const totalViews = measured.reduce((a, r) => a + (r.views ?? 0), 0)
  const totalParticipation = rows.reduce((a, r) => a + r.participation, 0)
  const volumeOk = totalViews >= PARTICIPATION_MIN_VIEWS

  // Business response through the tracked links
  const orders = rows.reduce((a, r) => a + r.orders, 0)
  const netSales = round(rows.reduce((a, r) => a + r.net_sales, 0))

  // Effort
  const hours = rows.map((r) => r.production_hours).filter((h): h is number => h !== null)
  const hoursPerEpisode = mean(hours)

  // Same-age comparison
  const ages = measured.map((r) => r.age_days).filter((a): a is number => a !== null)
  const sameAge =
    ages.length < 2 ? (ages.length ? true : null) : Math.max(...ages) - Math.min(...ages) <= SAME_AGE_TOLERANCE_DAYS
  const missingAge = measured.length - ages.length

  const baselineSet =
    series.baseline_avg_pct_viewed != null ||
    series.baseline_participation_per_1k != null ||
    series.baseline_orders_per_post != null

  const card: SeriesScorecard = {
    target_episodes: target,
    published_episodes: rows.length,
    measured_episodes: measured.length,
    episodes: rows,
    attention: {
      avg_pct_viewed: avgAttention === null ? null : round(avgAttention, 1),
      baseline: baselineAttention,
      delta: avgAttention !== null && baselineAttention !== null ? round(avgAttention - baselineAttention, 1) : null,
      first: attentionValues[0] ?? null,
      last: attentionValues.length ? attentionValues[attentionValues.length - 1] : null,
    },
    participation: {
      total: totalParticipation,
      per_1k_views: volumeOk ? round((totalParticipation / totalViews) * 1000) : null,
      volume_ok: volumeOk,
      episodes_with_participation: rows.filter((r) => r.participation > 0).length,
      baseline_per_1k: series.baseline_participation_per_1k ?? null,
    },
    business: {
      landing_sessions: sumNullable(rows.map((r) => r.landing_sessions)),
      product_view_sessions: sumNullable(rows.map((r) => r.product_view_sessions)),
      orders,
      net_sales: netSales,
      orders_per_post: rows.length ? round(orders / rows.length) : null,
      baseline_orders_per_post: series.baseline_orders_per_post ?? null,
    },
    effort: {
      hours_per_episode: hoursPerEpisode === null ? null : round(hoursPerEpisode, 1),
      budget,
      within_budget: budget === null || hoursPerEpisode === null ? null : hoursPerEpisode <= budget,
      over_budget_episodes: rows.filter((r) => r.over_budget).map((r) => r.title),
    },
    comparability: {
      same_age: sameAge,
      ages_days: ages,
      note:
        missingAge > 0
          ? `Record when metrics were read for ${missingAge} episode(s) so posts are compared at the same age.`
          : sameAge === false
            ? `Posts were measured at different ages (day ${Math.min(...ages)} to day ${Math.max(...ages)}). Re-read them at the same age before comparing.`
            : null,
    },
    baseline_set: baselineSet,
    recommendation: { decision: null, revision_target: null, reasons: [], notes: [] },
  }
  card.recommendation = recommend(series, card)
  return card
}

function recommend(series: SeriesLike, s: SeriesScorecard): SeriesScorecard["recommendation"] {
  const rec: SeriesScorecard["recommendation"] = {
    decision: null,
    revision_target: null,
    reasons: [],
    notes: [],
  }
  const n = s.published_episodes

  if (n < s.target_episodes) {
    rec.reasons.push(
      `Publish ${s.target_episodes - n} more episode(s) with the same stance and format before reviewing the batch.`
    )
    return rec
  }
  if (s.measured_episodes < n) {
    rec.reasons.push("Log platform metrics for every published episode before deciding.")
    return rec
  }

  // Pause: the stance can't be substantiated, or the team can't produce it in budget.
  const pause: string[] = []
  if (!series.competitor_swap_passed || !present(series.proof)) {
    pause.push(
      "The stance isn't substantiated: it fails the competitor-swap test or has no proof to show. Rework the stance before filming more."
    )
  }
  if (s.effort.within_budget === false) {
    pause.push(
      `Production took ${s.effort.hours_per_episode} h per episode against a ${s.effort.budget} h budget. The team can't sustain this series as specified.`
    )
  }

  // Where does the response drop off?
  const engaged = s.participation.episodes_with_participation >= Math.ceil(n / 2)
  const attentionDropped =
    s.attention.delta !== null
      ? s.attention.delta < 0
      : s.attention.first !== null && s.attention.last !== null && s.attention.last < s.attention.first * 0.8
  const businessLow =
    s.business.baseline_orders_per_post !== null && s.business.orders_per_post !== null
      ? s.business.orders_per_post < s.business.baseline_orders_per_post
      : s.business.orders === 0

  if (pause.length) {
    rec.decision = "pause"
    rec.reasons.push(...pause)
  } else if (attentionDropped) {
    rec.decision = "revise"
    rec.revision_target = "opening"
    rec.reasons.push(
      s.attention.delta !== null
        ? `Average % viewed is ${s.attention.avg_pct_viewed}% against a ${s.attention.baseline}% baseline: viewers leave early. Test a clearer opening and keep the stance.`
        : `Average % viewed fell from ${s.attention.first}% to ${s.attention.last}% across the batch: viewers leave early. Test a clearer opening and keep the stance.`
    )
  } else if (!engaged) {
    rec.decision = "revise"
    rec.revision_target = "topic"
    rec.reasons.push(
      `Only ${s.participation.episodes_with_participation} of ${n} episodes drew relevant comments or submissions. Change the job or problem featured, or sharpen the prompt.`
    )
  } else if (businessLow) {
    rec.decision = "revise"
    rec.revision_target = "booking_path"
    rec.reasons.push(
      s.business.landing_sessions === 0
        ? "Viewers watch and join in, but nobody arrived through the tracked links. Check the link placement and call to action."
        : "Viewers watch and join in, but few buy. Check the audience and the path from the link to checkout (landing page, product, offer)."
    )
  } else {
    rec.decision = "continue"
    rec.reasons.push(
      "Viewers repeatedly engage with the subject, the response holds through to orders, and the series fits the time budget."
    )
  }

  rec.notes.push(
    `${n} posts can inform the next batch. They're too few to judge whether the series has built a community.`
  )
  if (!s.baseline_set) {
    rec.notes.push("No baseline was recorded, so this batch sets it. Compare the next batch against these numbers.")
  }
  if (s.comparability.note) {
    rec.notes.push(s.comparability.note)
  }
  if (rec.decision === "revise") {
    rec.notes.push("Change one thing for the next batch. Keep the series question and structure consistent.")
  }
  if (!s.participation.volume_ok) {
    rec.notes.push(
      `Under ${PARTICIPATION_MIN_VIEWS.toLocaleString("en-US")} views in total, so participation is shown as a count, not per 1,000 views.`
    )
  }
  return rec
}
