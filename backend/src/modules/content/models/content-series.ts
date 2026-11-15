import { model } from "@medusajs/framework/utils"
import ContentEpisode from "./content-episode"

/**
 * A repeatable social content series built on one provable stance
 * (see src/lib/content-playbook).
 */
const ContentSeries = model
  .define("content_series", {
    id: model.id({ prefix: "cser" }).primaryKey(),
    title: model.text().searchable(),
    handle: model.text().unique(),

    // SOP 1: find and approve the stance
    goal: model.text().nullable(),
    audience: model.text().nullable(),
    stance: model.text().nullable(),
    competitor_swap_passed: model.boolean().default(false),
    competitor_swap_notes: model.text().nullable(),
    proof: model.text().nullable(),
    audience_question: model.text().nullable(),

    // SOP 2: turn the stance into an episode
    format: model.text().nullable(),
    format_source: model.text().nullable(),
    beat_sheet: model.json().nullable(),
    participation_prompt: model.text().nullable(),

    // SOP 3 + pilot
    channel: model.text().default("tiktok"),
    owner: model.text().nullable(),
    production_hours_budget: model.float().nullable(),
    episode_target: model.number().default(4),
    baseline_avg_pct_viewed: model.float().nullable(),
    baseline_participation_per_1k: model.float().nullable(),
    baseline_orders_per_post: model.float().nullable(),

    status: model.enum(["draft", "piloting", "continue", "revise", "paused"]).default("draft"),
    decision: model.enum(["continue", "revise", "pause"]).nullable(),
    revision_target: model.enum(["opening", "topic", "booking_path"]).nullable(),
    decision_notes: model.text().nullable(),
    next_change: model.text().nullable(),
    decided_by: model.text().nullable(),
    decided_at: model.dateTime().nullable(),

    episodes: model.hasMany(() => ContentEpisode, { mappedBy: "series" }),
  })
  .cascades({ delete: ["episodes"] })

export default ContentSeries
