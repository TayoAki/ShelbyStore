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

/**
 * The box's one rope: a braided cord laid full width across the fold between
 * the front and side panels and the back panel, in the rope colour of the
 * chosen cap. The twist is a repeating diagonal lay (one per page, so one id).
 */
export function BoxRope({ color }: { color: string | null | undefined }) {
  const rope = colorway(color).rope
  return (
    <div className="box-rope" aria-hidden>
      <svg className="block h-[14px] w-full" role="presentation">
        <defs>
          <pattern id="box-rope-lay" width="10" height="14" patternUnits="userSpaceOnUse">
            <path d="M-2 15 L9 -1" stroke="#00000047" strokeWidth="3.2" />
            <path d="M3 15 L14 -1" stroke="#ffffff38" strokeWidth="1.4" />
          </pattern>
        </defs>
        <rect width="100%" height="14" fill={rope} style={{ transition: "fill .42s var(--ease-box)" }} />
        <rect width="100%" height="14" fill="url(#box-rope-lay)" />
      </svg>
    </div>
  )
}
