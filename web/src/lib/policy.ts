/**
 * Customer-facing store policy lines (SITE_SPEC G.7.3), shown in the ticker,
 * under the add-to-bag button, in the bag and on the help page.
 *
 * CONFIRM BEFORE LAUNCH (G.11): these must match what the business offers.
 * The $85 threshold must match the conditional $0 price on the Standard
 * shipping option (backend seed-rope-cap.ts, FREE_SHIPPING_THRESHOLD).
 */
export const POLICY = {
  announcement: "Free shipping on $85+ · 30-day returns",
  shipping: "Free shipping on $85+ · Standard $6 · Express $15",
  returns: "30-day returns",
  dispatch: "Ships in 1–2 business days",
  limitedRun: "Numbered edition. We don't remake numbered colors.",
  oneSize: "fits 21.5–23.75 in (55–60 cm)",
  freeShippingThreshold: 85,
}

/** Release times are announced in the store's timezone, not the server's. */
export const STORE_TIMEZONE = "America/Los_Angeles"
