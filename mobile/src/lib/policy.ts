/**
 * Customer-facing policy lines (the same facts as web/src/lib/policy.ts, G.7.3).
 *
 * CONFIRM BEFORE LAUNCH: these must match what the business offers. The $85
 * threshold mirrors the Medusa shipping-price rule; the charged price is
 * always Medusa's (APP_SPEC G.6 item 5).
 */
export const POLICY = {
  announcement: "Free shipping on $85+ · 30-day returns",
  shipping: "Free shipping on $85+ · Standard $6 · Express $15",
  returns: "30-day returns",
  dispatch: "Ships in 1–2 business days",
  limitedRun: "Numbered edition. We don't remake numbered colors.",
  oneSize: "fits 21.5–23.75 in (55–60 cm)",
  freeShippingThreshold: 85,
  trustLine: "Free shipping on $85+ · 30-day returns · secure checkout",
}
