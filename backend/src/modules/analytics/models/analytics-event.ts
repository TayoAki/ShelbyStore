import { model } from "@medusajs/framework/utils"

/**
 * One analytics event (first-party, PostHog-style). Written by the storefront,
 * the app and the backend; read by funnels, trends and scorecards.
 *
 * `occurred_at` is the client time (skew-corrected at ingestion); `received_at`
 * is the server time. Properties hold everything event-specific, including
 * registered super-properties such as `$exp_<experiment>` variants.
 */
const AnalyticsEvent = model
  .define("analytics_event", {
    id: model.id({ prefix: "aev" }).primaryKey(),
    event: model.text(),
    distinct_id: model.text(),
    session_id: model.text().nullable(),
    occurred_at: model.dateTime(),
    received_at: model.dateTime(),
    path: model.text().nullable(),
    url: model.text().nullable(),
    referrer: model.text().nullable(),
    asset: model.text().nullable(),
    utm_source: model.text().nullable(),
    utm_medium: model.text().nullable(),
    utm_campaign: model.text().nullable(),
    // mobile | tablet | desktop | app | server
    device_type: model.text().nullable(),
    // web | app | server
    platform: model.text().default("web"),
    properties: model.json().nullable(),
  })
  .indexes([
    { on: ["event", "occurred_at"] },
    { on: ["distinct_id", "occurred_at"] },
    { on: ["session_id"] },
    { on: ["asset"] },
  ])

export default AnalyticsEvent
