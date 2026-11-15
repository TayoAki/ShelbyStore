import { z } from "@medusajs/framework/zod"

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")
const text = z.string().nullable()
const hours = z.number().min(0).nullable()

const seriesFields = {
  title: z.string().min(1),
  handle: slug,
  goal: text,
  audience: text,
  stance: text,
  competitor_swap_passed: z.boolean(),
  competitor_swap_notes: text,
  proof: text,
  audience_question: text,
  format: text,
  format_source: text,
  beat_sheet: z.array(z.string()).max(12),
  participation_prompt: text,
  channel: z.string().min(1),
  owner: text,
  production_hours_budget: hours,
  episode_target: z.number().int().min(1).max(20),
  baseline_avg_pct_viewed: z.number().min(0).max(100).nullable(),
  baseline_participation_per_1k: z.number().min(0).nullable(),
  baseline_orders_per_post: z.number().min(0).nullable(),
  // Manual statuses. continue / revise / paused come from a recorded decision.
  status: z.enum(["draft", "piloting"]),
}

export const AdminCreateSeries = z.object(seriesFields).partial().required({ title: true })
export type AdminCreateSeriesType = z.infer<typeof AdminCreateSeries>

export const AdminUpdateSeries = z.object(seriesFields).partial()
export type AdminUpdateSeriesType = z.infer<typeof AdminUpdateSeries>

const episodeFields = {
  title: z.string().min(1),
  subject: text,
  asset_key: slug,
  landing_path: z.string().regex(/^\//, "Start with /"),
  post_url: z.url().nullable(),
  published_at: z.iso.datetime({ offset: true }).nullable(),
  metrics_recorded_at: z.iso.datetime({ offset: true }).nullable(),
  views: z.number().int().min(0).nullable(),
  avg_pct_viewed: z.number().min(0).max(100).nullable(),
  relevant_comments: z.number().int().min(0).nullable(),
  submissions: z.number().int().min(0).nullable(),
  production_hours: hours,
  audience_language: text,
}

export const AdminCreateEpisode = z.object(episodeFields).partial().required({ title: true })
export type AdminCreateEpisodeType = z.infer<typeof AdminCreateEpisode>

export const AdminUpdateEpisode = z.object(episodeFields).partial()
export type AdminUpdateEpisodeType = z.infer<typeof AdminUpdateEpisode>

export const AdminSeriesDecision = z.object({
  decision: z.enum(["continue", "revise", "pause"]),
  revision_target: z.enum(["opening", "topic", "booking_path"]).nullish(),
  next_change: z.string().nullish(),
  notes: z.string().nullish(),
})
export type AdminSeriesDecisionType = z.infer<typeof AdminSeriesDecision>
