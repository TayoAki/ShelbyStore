"use client"

import { useEffect } from "react"
import { register, track } from "@/lib/analytics"

const seen = new Set<string>()

/**
 * Records that this visitor saw `variant` of `experiment`: registers the
 * `$exp_<experiment>` super-property (so every later event can be broken down
 * by variant) and sends one `$experiment_exposure` per page load.
 */
export function Exposure({ experiment, variant }: { experiment: string; variant: string | null }) {
  useEffect(() => {
    if (!variant) return
    register({ [`$exp_${experiment}`]: variant })
    const key = `${experiment}:${variant}:${location.pathname}`
    if (seen.has(key)) return
    seen.add(key)
    track("$experiment_exposure", { experiment, variant })
  }, [experiment, variant])
  return null
}
