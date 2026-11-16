import type { ReactNode } from "react"

type Tone = "core" | "live" | "low" | "past" | "muted"

/** Card and PDP status labels (SITE_SPEC §6.2). Accent fills always carry ink text. */
const tones: Record<Tone, string> = {
  core: "border border-ink text-ink bg-page",
  live: "bg-accent text-ink",
  low: "bg-paper text-low",
  past: "bg-surface-2 text-ink",
  muted: "bg-surface text-ink-muted",
}

export function Badge({ tone = "muted", children, dot = false }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`text-eyebrow inline-flex items-center gap-1.5 rounded-[2px] px-2 py-1 ${tones[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
