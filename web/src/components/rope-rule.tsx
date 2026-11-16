import { colorway } from "@/lib/swatches"

/**
 * The rope line: a braided cord drawn in the selected colourway's rope colour.
 * It runs the reading order (window, spec, add to bag) as the page's one
 * continuous line. Two offset dash runs make the twist; no gradient stripes.
 */
export function RopeRule({ color, className = "", vertical = false }: { color: string | null | undefined; className?: string; vertical?: boolean }) {
  const rope = colorway(color).rope
  if (vertical) {
    return (
      <svg role="presentation" className={`w-[6px] ${className}`} preserveAspectRatio="none" viewBox="0 0 6 100" aria-hidden>
        <line x1="3" y1="0" x2="3" y2="100" stroke={rope} strokeWidth="6" />
        <line x1="3" y1="0" x2="3" y2="100" stroke="#00000033" strokeWidth="6" strokeDasharray="2.5 3.5" vectorEffect="non-scaling-stroke" style={{ transition: "stroke .42s var(--ease-box)" }} />
      </svg>
    )
  }
  return (
    <svg role="presentation" className={`block h-[6px] w-full ${className}`} preserveAspectRatio="none" viewBox="0 0 100 6" aria-hidden>
      <line x1="0" y1="3" x2="100" y2="3" stroke={rope} strokeWidth="6" style={{ transition: "stroke .42s var(--ease-box)" }} />
      <line x1="0" y1="3" x2="100" y2="3" stroke="#0000002e" strokeWidth="6" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
