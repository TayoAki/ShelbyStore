"use client"

import Script from "next/script"
import { useEffect } from "react"
import { startAnalytics, UMAMI_URL, UMAMI_WEBSITE_ID } from "@/lib/analytics"

/** Loads Umami (cookieless pageviews + events) and PostHog when configured. */
export function AnalyticsProvider() {
  useEffect(() => {
    startAnalytics()
  }, [])
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) return null
  // Keep the query string (no data-exclude-search): landing sessions per ?asset= depend on it.
  return <Script defer src={`${UMAMI_URL.replace(/\/$/, "")}/script.js`} data-website-id={UMAMI_WEBSITE_ID} strategy="afterInteractive" />
}
