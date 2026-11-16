import type { FitProfile } from "@/lib/product"

const CROWN = ["Low", "Mid", "Tall"] as const
const STRUCTURE = ["Unstructured", "Semi-structured", "Structured"] as const
const SHORT: Record<string, string> = { "Semi-structured": "Semi" }

/**
 * Melin's fit-guide scales (SITE_SPEC §6.4.14): a 6px #ededed track with a
 * black third at the active step, and the step names underneath.
 */
export function FitScales({ profile }: { profile: FitProfile }) {
  return (
    <div className="flex flex-col gap-5">
      <Scale title="Crown Height" steps={CROWN} value={profile.crown} />
      <Scale title="Structure" steps={STRUCTURE} value={profile.structure} />
    </div>
  )
}

export function Scale({ title, steps, value }: { title: string; steps: readonly string[]; value: string }) {
  const i = Math.max(0, steps.indexOf(value))
  return (
    <div role="img" aria-label={`${title}: ${value}`}>
      <p className="mb-2 font-body text-[13px] uppercase tracking-[0.65px]">{title}</p>
      <div className="relative h-[6px] rounded-full bg-mega" aria-hidden>
        <span className="absolute inset-y-0 w-1/3 rounded-full bg-black" style={{ left: `${(i * 100) / 3}%` }} />
      </div>
      <div className="mt-1 flex justify-between font-system text-[14px] uppercase leading-5 text-gray-500" aria-hidden>
        {steps.map((s) => (
          <span key={s} className={s === value ? "text-black" : ""}>
            {SHORT[s] ?? s}
          </span>
        ))}
      </div>
    </div>
  )
}
