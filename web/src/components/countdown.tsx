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
 * Live DD : HH : MM : SS to a REAL release time from the release module
 * (SITE_SPEC §6.1.4). Never an evergreen or resetting timer. At zero it says the
 * drop is going live, because a release only goes live once it passes its
 * go/no-go checks. Renders a placeholder on the server so hydration matches.
 */
export function Countdown({ iso, tone = "dark" }: { iso: string; tone?: "dark" | "light" }) {
  const now = useSyncExternalStore(secondClock.subscribe, secondClock.now, secondClock.server)
  const diff = now === null ? null : new Date(iso).getTime() - now

  const digit = tone === "dark" ? "text-accent" : "text-ink"
  const label = tone === "dark" ? "text-ink-inverse-muted" : "text-ink-muted"

  if (diff !== null && diff <= 0) {
    return <p className={`font-mono text-[15px] ${digit}`}>Going live shortly</p>
  }

  const total = diff === null ? null : Math.floor(diff / 1000)
  const parts: [string, number | null][] = [
    ["Days", total === null ? null : Math.floor(total / 86400)],
    ["Hrs", total === null ? null : Math.floor((total % 86400) / 3600)],
    ["Min", total === null ? null : Math.floor((total % 3600) / 60)],
    ["Sec", total === null ? null : total % 60],
  ]

  return (
    <div className="flex items-start gap-3 lg:gap-5" role="timer" aria-label="Time until this drop">
      {parts.map(([name, value], i) => (
        <div key={name} className="flex items-start gap-3 lg:gap-5">
          <div className="flex flex-col items-center gap-1">
            <span className={`tabular font-mono text-[34px] leading-none lg:text-[52px] ${digit}`} aria-hidden>
              {value === null ? "--" : pad(value)}
            </span>
            <span className={`text-eyebrow ${label}`}>{name}</span>
          </div>
          {i < parts.length - 1 && (
            <span className={`font-mono text-[34px] leading-none lg:text-[52px] ${label}`} aria-hidden>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
