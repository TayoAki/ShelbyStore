import { model } from "@medusajs/framework/utils"

/**
 * An A/B test and its log entry. The landing-page process the team follows
 * asks to record the audience, the claim/hypothesis, what changed, the test
 * conditions and the result before reusing a pattern; those live here.
 *
 * variants: [{ key, weight }] — the FIRST variant is the control.
 * funnel_steps: the primary metric, as funnel steps after exposure.
 */
const AnalyticsExperiment = model.define("analytics_experiment", {
  id: model.id({ prefix: "aexp" }).primaryKey(),
  key: model.text().unique(),
  name: model.text(),
  hypothesis: model.text().nullable(),
  audience: model.text().nullable(),
  change_description: model.text().nullable(),
  status: model.enum(["draft", "running", "stopped"]).default("draft"),
  variants: model.json(),
  funnel_steps: model.json().nullable(),
  minimum_sample: model.number().default(100),
  started_at: model.dateTime().nullable(),
  ended_at: model.dateTime().nullable(),
  decision: model.enum(["ship", "keep_control", "iterate"]).nullable(),
  notes: model.text().nullable(),
})

export default AnalyticsExperiment
