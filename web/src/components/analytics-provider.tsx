"use client"

import Script from "next/script"
import { useEffect } from "react"
import { startAnalytics, UMAMI_URL, UMAMI_WEBSITE_ID } from "@/lib/analytics"

/**
 * Starts Shelby's first-party analytics, and loads the optional Umami tracker
 * (a separate cookieless traffic dashboard) when configured.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    startAnalytics()
  }, [])
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) return null
  return <Script defer src={`${UMAMI_URL.replace(/\/$/, "")}/script.js`} data-website-id={UMAMI_WEBSITE_ID} strategy="afterInteractive" />
}
