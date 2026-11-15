import { model } from "@medusajs/framework/utils"
import ContentSeries from "./content-series"

/** One post in a series. `asset_key` is the tracked-link tag (?asset=<key>). */
const ContentEpisode = model.define("content_episode", {
  id: model.id({ prefix: "cep" }).primaryKey(),
  title: model.text(),
  subject: model.text().nullable(),
  asset_key: model.text().unique(),
  landing_path: model.text().default("/"),
  post_url: model.text().nullable(),
  published_at: model.dateTime().nullable(),

  // Manual metrics, read from the platform at the same age for every post.
  metrics_recorded_at: model.dateTime().nullable(),
  views: model.number().nullable(),
  avg_pct_viewed: model.float().nullable(),
  relevant_comments: model.number().nullable(),
  submissions: model.number().nullable(),
  production_hours: model.float().nullable(),
  audience_language: model.text().nullable(),

  series: model.belongsTo(() => ContentSeries, { mappedBy: "episodes" }),
})

export default ContentEpisode
