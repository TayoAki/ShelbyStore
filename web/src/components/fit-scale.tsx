import type { FitProfile } from "@/lib/product"

const CROWN = ["Low", "Mid", "Tall"] as const
const STRUCTURE = ["Unstructured", "Semi-structured", "Structured"] as const
const SHORT: Record<string, string> = { "Semi-structured": "Semi" }

/**
 * Crown-height and structure scales, three steps each (SITE_SPEC §6.4.10).
 * The active step is filled ink; the label row names every step.
 */
export function FitScales({ profile, compact = false }: { profile: FitProfile; compact?: boolean }) {
  return (
    <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2 sm:gap-6"}`}>
      <Scale title="Crown height" steps={CROWN} value={profile.crown} />
      <Scale title="Structure" steps={STRUCTURE} value={profile.structure} />
    </div>
  )
}

function Scale({ title, steps, value }: { title: string; steps: readonly string[]; value: string }) {
  return (
    <div className="flex flex-col gap-2" role="img" aria-label={`${title}: ${value}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-eyebrow text-ink-muted">{title}</span>
        <span className="text-[13px] font-medium">{value}</span>
      </div>
      <div className="grid grid-cols-3 gap-1" aria-hidden>
        {steps.map((s) => (
          <span key={s} className={`h-2 rounded-[1px] ${s === value ? "bg-ink" : "bg-surface-2"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted" aria-hidden>
        {steps.map((s, i) => (
          <span key={s} className={i === 1 ? "text-center" : i === 2 ? "text-right" : ""}>
            {SHORT[s] ?? s}
          </span>
        ))}
      </div>
    </div>
  )
}
