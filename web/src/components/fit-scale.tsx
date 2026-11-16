const CROWN = ["Low", "Mid", "Tall"]
const STRUCTURE = ["Unstructured", "Semi-structured", "Structured"]
const SHORT: Record<string, string> = { "Semi-structured": "Semi" }

/**
 * Fit scales (v5 §6.4.3 item 11, G.6.3 item 8): three 7px segments, the active
 * one golf green (G.2.2). `crownNote` adds the measured target, e.g. "about
 * 11–11.5 cm".
 */
export function FitScale({ title, steps, value, note, large = false, tone = "dark" }: { title: string; steps: string[]; value: string; note?: string | null; large?: boolean; tone?: "dark" | "light" }) {
  const i = steps.indexOf(value)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-xs leading-4 tracking-[.05em] uppercase">{title}</span>
        <span className="text-xs leading-4 font-medium">
          {value}
          {note ? ` · ${note}` : ""}
        </span>
      </div>
      <div className="flex gap-1" role="img" aria-label={`${title}: ${value} on a scale of ${steps.join(", ")}`}>
        {steps.map((s, k) => (
          <span
            key={s}
            className={`flex-1 rounded-[4px] ${large ? "h-3" : "h-[7px]"} ${k === i ? (tone === "light" ? "bg-white" : "bg-golf-green") : tone === "light" ? "bg-white/25" : "bg-natural-white"}`}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {steps.map((s) => (
          <span key={s} className={`text-[10px] leading-3 ${tone === "light" ? "text-golf-tint" : "text-light-charcoal"}`}>
            {(SHORT[s] ?? s).toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  )
}

export function FitScales({ crown, structure, crownNote }: { crown: string; structure: string; crownNote?: string | null }) {
  return (
    <div className="grid gap-5">
      <FitScale title="Crown height" steps={CROWN} value={crown} note={crownNote} />
      <FitScale title="Structure" steps={STRUCTURE} value={structure} />
    </div>
  )
}

export { CROWN, STRUCTURE }
