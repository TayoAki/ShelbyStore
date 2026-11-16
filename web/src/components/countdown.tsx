"use client"

import { useSyncExternalStore } from "react"

/** A one-second clock shared by every countdown on the page. */
const secondClock = {
  subscribe(onTick: () => void) {
    const id = setInterval(onTick, 1000)
    return () => clearInterval(id)
  },
  now: () => Math.floor(Date.now() / 1000) * 1000,
  server: () => null,
}

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * DD : HH : MM : SS to a REAL release time from the release module (SITE_SPEC
 * §6.6.1): heading digits, black, with small muted labels. Never an evergreen
 * or resetting timer. At zero it says the drop is going live, because a
 * release only goes live once it passes its go/no-go checks.
 */
export function Countdown({ iso, size = "small", tone = "dark" }: { iso: string; size?: "small" | "large"; tone?: "dark" | "light" }) {
  const now = useSyncExternalStore(secondClock.subscribe, secondClock.now, secondClock.server)
  const diff = now === null ? null : new Date(iso).getTime() - now
  const ink = tone === "dark" ? "text-black" : "text-white"
  if (diff !== null && diff <= 0) return <p className={`font-display text-sm ${ink}`}>Going live shortly</p>
  const total = diff === null ? null : Math.floor(diff / 1000)
  const parts: [string, number | null][] = [
    ["Days", total === null ? null : Math.floor(total / 86400)],
    ["Hrs", total === null ? null : Math.floor((total % 86400) / 3600)],
    ["Min", total === null ? null : Math.floor((total % 3600) / 60)],
    ["Sec", total === null ? null : total % 60],
  ]
  const digits = size === "large" ? "text-[40px]" : "text-[24px]"
  return (
    <div className="flex items-start gap-2" role="timer" aria-label="Time until this hole">
      {parts.map(([name, value], i) => (
        <div key={name} className="flex items-start gap-2">
          <div className="flex flex-col items-center gap-1">
            <span className={`font-display tabular-nums leading-none ${digits} ${ink}`} aria-hidden>
              {value === null ? "--" : pad(value)}
            </span>
            <span className={`font-mono text-[10px] uppercase tracking-[.1em] ${tone === "dark" ? "text-light-charcoal" : "text-white/70"}`}>{name}</span>
          </div>
          {i < parts.length - 1 && (
            <span className={`font-display leading-none ${digits} ${ink}`} aria-hidden>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
