"use client"

import posthog from "posthog-js"
import { ATTRIBUTION_COOKIE, parseAttribution } from "./attribution"

/**
 * One `track()` for both analytics backends. Event names follow docs/analytics.md:
 * product_viewed, drop_viewed, add_to_cart, checkout_started, notify_me_submitted
 * (order_completed is captured server-side by Medusa). Every event carries the
 * visitor's `asset` / UTM attribution so sessions can be tied to the post that
 * drove them. Both backends are optional: no env vars, no tracking.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void }
  }
}

let started = false

export function startAnalytics() {
  if (started || typeof window === "undefined") return
  started = true
  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: "history_change",
      person_profiles: "identified_only",
    })
    const attribution = currentAttribution()
    if (attribution) posthog.register(attribution)
  }
}

export function currentAttribution() {
  if (typeof document === "undefined") return null
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`))
    ?.slice(ATTRIBUTION_COOKIE.length + 1)
  return parseAttribution(raw ? decodeURIComponent(raw) : undefined)
}

/** PostHog's distinct id, written to cart metadata as `analytics_id` so the
 *  server-side `order_completed` joins this visitor's journey. */
export function analyticsId(): string | undefined {
  if (!POSTHOG_KEY || typeof window === "undefined") return undefined
  try {
    return posthog.get_distinct_id()
  } catch {
    return undefined
  }
}

export const UMAMI_URL = process.env.NEXT_PUBLIC_UMAMI_URL
export const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

export function track(event: string, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  const data = { ...currentAttribution(), ...props }
  try {
    if (POSTHOG_KEY) posthog.capture(event, data)
    window.umami?.track(event, data)
  } catch {
    // Analytics must never break shopping.
  }
}
