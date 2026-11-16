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
 * Days, hours, minutes and seconds to a REAL release time from the release
 * module, each in its own fixed digit slot. Never an evergreen or resetting
 * timer. At zero it says the hole is going live, because a release only goes
 * live once it passes its go/no-go checks.
 */
export function Countdown({ iso, size = "small", tone = "dark" }: { iso: string; size?: "small" | "large"; tone?: "dark" | "light" }) {
  const now = useSyncExternalStore(secondClock.subscribe, secondClock.now, secondClock.server)
  const diff = now === null ? null : new Date(iso).getTime() - now
  if (diff !== null && diff <= 0) return <p className="label">Going live shortly</p>
  const total = diff === null ? null : Math.floor(diff / 1000)
  const parts: [string, string | null][] = [
    ["Days", total === null ? null : String(Math.floor(total / 86400)).padStart(3, "0")],
    ["Hrs", total === null ? null : pad(Math.floor((total % 86400) / 3600))],
    ["Min", total === null ? null : pad(Math.floor((total % 3600) / 60))],
    ["Sec", total === null ? null : pad(total % 60)],
  ]
  const digits = size === "large" ? "text-[2rem] sm:text-[2.75rem] md:text-[3.5rem]" : "text-[1.75rem]"
  return (
    <div className={`flex items-end gap-2 md:gap-3 ${tone === "light" ? "text-white" : ""}`} role="timer" aria-label="Time until this hole">
      {parts.map(([name, value]) => (
        <div key={name} className="flex flex-col items-center gap-1.5">
          <span className={`digits digits-cells ${digits}`} aria-hidden>
            {(value ?? (name === "Days" ? "---" : "--")).split("").map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </span>
          <span className="label !text-[11px]">{name}</span>
        </div>
      ))}
    </div>
  )
}
