"use client"

import { useSyncExternalStore } from "react"

/** A clock shared by every countdown on the page, read each second and rounded to the minute. */
const secondClock = {
  subscribe(onTick: () => void) {
    const id = setInterval(onTick, 1000)
    return () => clearInterval(id)
  },
  now: () => Math.floor(Date.now() / 60000) * 60000,
  server: () => null,
}

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Time to a REAL release from the release module (SITE_SPEC v8 E.5.12):
 * "140d 04h 31m" in Roboto 500 tabular, or Montserrat 700 26px at
 * `size="large"`. Never an evergreen or resetting timer; at zero it says the
 * hole is going live, because a release only goes live once it passes its
 * go/no-go checks.
 */
export function Countdown({ iso, size = "small", tone = "dark" }: { iso: string; size?: "small" | "large"; tone?: "dark" | "light" }) {
  const now = useSyncExternalStore(secondClock.subscribe, secondClock.now, secondClock.server)
  const diff = now === null ? null : new Date(iso).getTime() - now
  const color = tone === "light" ? "text-white" : ""
  if (diff !== null && diff <= 0) return <p className={`text-[14.4px] font-medium ${color}`}>Going live shortly</p>
  const total = diff === null ? null : Math.floor(diff / 1000)
  const parts: [string, string, string | null][] = [
    ["d", "days", total === null ? null : String(Math.floor(total / 86400))],
    ["h", "hours", total === null ? null : pad(Math.floor((total % 86400) / 3600))],
    ["m", "minutes", total === null ? null : pad(Math.floor((total % 3600) / 60))],
  ]
  const text = parts.map(([u, , v]) => `${v ?? "--"}${u}`).join(" ")
  const spoken = parts.map(([, name, v]) => `${v ?? "--"} ${name}`).join(", ")
  return (
    <p
      role="timer"
      aria-label={`Time until this hole: ${spoken}`}
      className={`tabular ${size === "large" ? "font-heading text-[26px] leading-[31.2px] font-bold" : "text-[14.4px] font-medium"} ${color}`}
    >
      <span aria-hidden>{text}</span>
    </p>
  )
}
