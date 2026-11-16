import Link from "next/link"
import type { CSSProperties } from "react"
import { colorway } from "@/lib/swatches"

type Props = {
  name: string
  /** 36px on the PDP and value tiles, 20px on cards (G.5.6). */
  size?: 36 | 20
  selected?: boolean
  soldOut?: boolean
  className?: string
}

/**
 * A Rope Cap swatch (SITE_SPEC G.5.6): the crown colour with a band of the rope
 * colour across the lower third. Light crowns keep an inset ring; the selected
 * ring is golf green (G.2.2); sold out adds the crossed line.
 */
export function SwatchFace({ name, size = 36, selected = false, soldOut = false, className = "" }: Props) {
  const c = colorway(name)
  return (
    <span
      aria-hidden
      data-selected={selected || undefined}
      className={`swatch-face relative inline-block shrink-0 rounded-full transition-all duration-200 ease-in-out ${className}`}
      style={
        {
          width: size,
          height: size,
          background: c.crown,
          boxShadow: [
            c.light ? "inset 0 0 0 1px #575757b3" : "",
            selected ? `0 0 0 ${size === 36 ? 3 : 2}px #fff, 0 0 0 ${size === 36 ? 4 : 3}px var(--color-golf-green)` : "",
          ]
            .filter(Boolean)
            .join(", ") || undefined,
        } as CSSProperties
      }
    >
      <span
        className="rope-band absolute rounded-full transition-transform duration-200 ease-in-out"
        style={{ top: "62%", left: "18%", right: "18%", height: size === 36 ? 3 : 2, background: c.rope, transform: `scaleX(${selected ? 1 : 0.6})` }}
      />
      {soldOut && <span className="crossed-bg absolute inset-0 rounded-full" />}
    </span>
  )
}

/** A swatch that links to another product (limited editions in the colour picker). */
export function SwatchLink({ name, href, caption, track, selected }: { name: string; href: string; caption?: string | null; track?: string; selected?: boolean }) {
  return (
    <Link href={href} data-track={track} className="flex flex-col items-center gap-1" aria-label={`${name}${caption ? `, ${caption}` : ""}`}>
      <SwatchFace name={name} selected={selected} />
      {caption && <span className="font-mono text-[10px] leading-3 tracking-[.05em] text-light-charcoal uppercase">{caption}</span>}
    </Link>
  )
}
