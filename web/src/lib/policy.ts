/**
 * Customer-facing store policy lines, shown in the announcement bar, under the
 * add-to-bag button and in the bag (SITE_SPEC.md §6.0, §6.4).
 *
 * CONFIRM BEFORE LAUNCH: these must match what the business actually offers.
 * Shipping prices mirror the seeded Medusa shipping options; the 30-day returns
 * window mirrors the release module's default returns_window_days.
 */
export const POLICY = {
  announcement: "Standard shipping $6 · 30-day returns",
  shipping: "Standard shipping $6 · Express $15",
  returns: "30-day returns",
  dispatch: "Ships in 1–2 business days",
  limitedRun: "Limited run. Restocked only if it sells through.",
  /** The adjustable range of the one-size hats (strap / snap). */
  oneSize: "fits 21.5–23.75 in (55–60 cm)",
  sized: "Sized styles come in S/M and L/XL",
}

/** Drop times are announced in the store's timezone, not the server's. */
export const STORE_TIMEZONE = "America/Los_Angeles"
