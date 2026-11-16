/**
 * Customer-facing policy lines (the same facts as web/src/lib/policy.ts).
 *
 * CONFIRM BEFORE LAUNCH: these must match what the business actually offers.
 * Shipping prices mirror the seeded Medusa shipping options; the 30-day returns
 * window mirrors the release module's default returns_window_days.
 */
export const POLICY = {
  shippingShort: "Standard Shipping $6",
  returnsShort: "30-Day Returns",
  bagLine: "Standard Shipping $6 · 30-Day Returns",
  trustLine: "Standard shipping $6 - 30-day returns - secure checkout",
  dispatch: "Ships in 1–2 business days",
  returnsDetail: "Send it back within 30 days of delivery.",
  limitedRun: "Limited run. Restocked only if it sells through.",
  stockDetail: "The count you see is what we have on the shelf.",
  sizedRange: "Measure around your head just above the ears.",
}
