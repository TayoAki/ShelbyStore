/**
 * Digit slots: a real number set in fixed, engineered cells, the way a ball box
 * prints its model number. `cells` draws a keyline around each digit.
 */
export function Digits({ value, cells = false, className = "", label }: { value: string | number; cells?: boolean; className?: string; label?: string }) {
  const text = String(value)
  return (
    <span className={`digits ${cells ? "digits-cells" : ""} ${className}`} aria-label={label ?? text} role="text">
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden className={/[0-9]/.test(ch) ? undefined : "sep"}>
          {ch}
        </span>
      ))}
    </span>
  )
}
