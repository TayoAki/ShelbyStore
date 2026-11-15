"use client"

import { useSyncExternalStore } from "react"

/** A clock that ticks once a minute, shared by every RelativeTime on the page. */
const minuteClock = {
  subscribe(onTick: () => void) {
    const id = setInterval(onTick, 60_000)
    return () => clearInterval(id)
  },
  now: () => Math.floor(Date.now() / 60_000) * 60_000,
  server: () => null,
}

/**
 * Coarse relative time to a real release ("in 5 days", "in 3 hours"), updated
 * every minute. Release-time information, not a ticking pressure timer
 * (no studied site shows one; SITE_SPEC §6.1). Renders nothing on the server.
 */
export function RelativeTime({ iso }: { iso: string }) {
  const now = useSyncExternalStore(minuteClock.subscribe, minuteClock.now, minuteClock.server)
  if (now === null) return null
  const diff = new Date(iso).getTime() - now
  if (diff <= 0) return <span>going live now</span>
  const minutes = Math.round(diff / 60_000)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  const text = days >= 2 ? `in ${days} days` : hours >= 2 ? `in ${hours} hours` : `in ${Math.max(1, minutes)} min`
  return <span>{text}</span>
}
