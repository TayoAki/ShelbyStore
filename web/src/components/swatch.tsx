import Link from "next/link"
import type { CSSProperties } from "react"
import { colorway } from "@/lib/swatches"

type Props = {
  name: string
  /** 32 on the PDP picker, 20 on cards, 12 in filters. */
  size?: 32 | 20 | 12
  selected?: boolean
  soldOut?: boolean
  className?: string
}

/**
 * Eastside's round colour dot (SITE_SPEC v8 E.5.4): the crown colour, with the
 * rope as a band across the lower third. Light crowns get a darker boundary
 * (#8C8C8C, 3:1). Selected: a 2px white gap and a 1px #212121 ring.
 */
export function SwatchFace({ name, size = 20, selected = false, soldOut = false, className = "" }: Props) {
  const c = colorway(name)
  return (
    <span
      aria-hidden
      className={`relative inline-block shrink-0 rounded-full ${className}`}
      style={
        {
          width: size,
          height: size,
          background: `linear-gradient(to bottom, ${c.crown} 0 62%, ${c.rope} 62% 76%, ${c.crown} 76%)`,
          border: `1px solid ${c.light ? "#8c8c8c" : "#e9e9e9"}`,
          boxShadow: selected ? "0 0 0 2px #fff, 0 0 0 3px #212121" : undefined,
        } as CSSProperties
      }
    >
      {soldOut && (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 10 10" aria-hidden>
          <line x1="1.5" y1="8.5" x2="8.5" y2="1.5" stroke="#212121" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </span>
  )
}

/** A dot that links to another product (numbered editions beside the core colours). */
export function SwatchLink({ name, href, caption, track, selected }: { name: string; href: string; caption?: string | null; track?: string; selected?: boolean }) {
  return (
    <Link href={href} data-track={track} className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1" aria-label={`${name}${caption ? `, ${caption}` : ""}`}>
      <SwatchFace name={name} size={32} selected={selected} />
      {caption && <span className="micro text-text-light">{caption}</span>}
    </Link>
  )
}
