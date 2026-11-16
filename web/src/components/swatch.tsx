import { swatchBackground } from "@/lib/swatches"

const LIGHT = new Set(["bone", "cream", "stone", "sand", "white", "bone / brown"])

/**
 * Melin's colour swatch (SITE_SPEC §6.4.7): a circle filled with the colour
 * (two-tone names split at 135°), 1px transparent border and 1px padding so
 * the selected black border leaves a white gap ring. Light fills get an inner
 * #e4e4e4 ring; sold-out colours get a diagonal strike.
 */
export function SwatchDot({
  name,
  size = 42,
  selected = false,
  soldOut = false,
}: {
  name: string
  size?: number
  selected?: boolean
  soldOut?: boolean
}) {
  const light = LIGHT.has(name.trim().toLowerCase())
  return (
    <span
      className={`relative inline-flex shrink-0 rounded-full border p-px ${selected ? "border-black" : "border-transparent"}`}
      style={{ width: size, height: size }}
    >
      <span
        className="block h-full w-full rounded-full"
        style={{ background: swatchBackground(name), boxShadow: light ? "inset 0 0 0 1px #e4e4e4" : undefined }}
      />
      {soldOut && (
        <span aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute left-1/2 top-1/2 h-px w-[142%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black" />
        </span>
      )}
    </span>
  )
}
