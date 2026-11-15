/**
 * Shared event taxonomy. docs/analytics.md is the source of truth; the web
 * storefront and the mobile app use the same names and properties.
 */
export const ANALYTICS_EVENTS = {
  pageview: "$pageview",
  pageleave: "$pageleave",
  screen: "$screen",
  experimentExposure: "$experiment_exposure",
  ctaClick: "cta_click",
  productViewed: "product_viewed",
  dropViewed: "drop_viewed",
  addToCart: "add_to_cart",
  checkoutStarted: "checkout_started",
  notifyMeSubmitted: "notify_me_submitted",
  /** Server-side only (Medusa), authoritative. */
  orderCompleted: "order_completed",
  /** Server-side only (Medusa). */
  releaseLive: "release_live",
} as const

/**
 * Cart/order metadata keys clients write so server-side events and
 * attribution line up with what happened in the app.
 */
export const ATTRIBUTION_METADATA = {
  asset: "asset",
  releaseId: "release_id",
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  /** The client's first-party analytics id (`_shelby_id`), so the server-side order event joins the visitor's journey. */
  analyticsId: "analytics_id",
} as const
