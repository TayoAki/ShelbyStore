/**
 * Numbers. A price, a hole numeral or a count is set as tight tabular figures
 * in the model face. `cells` keeps the engineered digit slots, which are kept
 * for the countdown and measured counters only.
 */
export function Digits({ value, cells = false, className = "", label }: { value: string | number; cells?: boolean; className?: string; label?: string }) {
  const text = String(value)
  if (!cells)
    return (
      <span className={`figure ${className}`} aria-label={label}>
        {text}
      </span>
    )
  return (
    <span className={`digits digits-cells ${className}`} aria-label={label ?? text} role="img">
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden className={/[0-9]/.test(ch) ? undefined : "sep"}>
          {ch}
        </span>
      ))}
    </span>
  )
}
