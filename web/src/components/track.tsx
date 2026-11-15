"use client"

import { useEffect } from "react"
import { track } from "@/lib/analytics"

/** Fires one analytics event when it mounts (e.g. product_viewed, drop_viewed). */
export function Track({ event, props }: { event: string; props: Record<string, unknown> }) {
  const key = JSON.stringify(props)
  useEffect(() => {
    track(event, JSON.parse(key))
  }, [event, key])
  return null
}
