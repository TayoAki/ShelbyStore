/**
 * Shared types for the social-content playbook (Tuan Le, "The Art of Making
 * ANY Boring Business Look Premium on Social Media"): pick a stance the brand
 * can prove, express it in a format the audience already understands, and
 * repeat the format until viewers recognize and join in.
 */

export type SeriesStatus = "draft" | "piloting" | "continue" | "revise" | "paused"
export type SeriesDecision = "continue" | "revise" | "pause"
/** Where the response drops off, so where to revise. */
export type RevisionTarget = "opening" | "topic" | "booking_path"

export type SeriesLike = {
  stance?: string | null
  competitor_swap_passed?: boolean | null
  competitor_swap_notes?: string | null
  proof?: string | null
  audience_question?: string | null
  format?: string | null
  beat_sheet?: string[] | null
  participation_prompt?: string | null
  production_hours_budget?: number | null
  episode_target?: number | null
  baseline_avg_pct_viewed?: number | null
  baseline_participation_per_1k?: number | null
  baseline_orders_per_post?: number | null
}

export type EpisodeLike = {
  id: string
  title: string
  asset_key: string
  published_at?: Date | string | null
  /** When the manual metrics were read off the platform (for same-age comparison). */
  metrics_recorded_at?: Date | string | null
  // Manual, from platform analytics
  views?: number | null
  avg_pct_viewed?: number | null
  relevant_comments?: number | null
  submissions?: number | null
  production_hours?: number | null
  // Automatic
  landing_sessions?: number | null
  product_view_sessions?: number | null
  orders?: number | null
  net_sales?: number | null
}

/** "Recorded per 1,000 views where volume allows." */
export const PARTICIPATION_MIN_VIEWS = 1000
/** Episodes measured more than this many days apart aren't compared like for like. */
export const SAME_AGE_TOLERANCE_DAYS = 1
export const DEFAULT_EPISODE_TARGET = 4

export const toDate = (v: Date | string | null | undefined): Date | null => {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}
export const round = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp
const present = (s: string | null | undefined) => !!s && s.trim().length > 0
export { present }
