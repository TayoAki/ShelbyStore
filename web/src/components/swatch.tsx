import Link from "next/link"
import type { CSSProperties } from "react"
import { colorway } from "@/lib/swatches"

type Props = {
  name: string
  /** 36 on the buy panel, 20 on cards. */
  size?: 36 | 20
  selected?: boolean
  soldOut?: boolean
  className?: string
}

/**
 * An ink chip: a printed square of the crown colour with the rope colour
 * across it, the way a ball box prints its colour range. Selected chips carry
 * a heavy keyline; sold out is struck through.
 */
export function SwatchFace({ name, size = 36, selected = false, soldOut = false, className = "" }: Props) {
  const c = colorway(name)
  return (
    <span
      aria-hidden
      data-selected={selected || undefined}
      className={`relative inline-block shrink-0 rounded-[2px] ${className}`}
      style={
        {
          width: size,
          height: size,
          background: c.crown,
          boxShadow: `${c.light ? "inset 0 0 0 1px #14213d59, " : ""}0 0 0 ${selected ? 2 : 0}px #fff, 0 0 0 ${selected ? 4 : 0}px currentColor`,
          transition: "box-shadow .18s var(--ease-box)",
        } as CSSProperties
      }
    >
      <span className="absolute inset-x-0" style={{ top: "60%", height: size === 36 ? 4 : 3, background: c.rope }} />
      {soldOut && (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden>
          <line x1="0" y1="10" x2="10" y2="0" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </span>
  )
}

/** A chip that links to another product (numbered editions in the colour range). */
export function SwatchLink({ name, href, caption, track, selected }: { name: string; href: string; caption?: string | null; track?: string; selected?: boolean }) {
  return (
    <Link href={href} data-track={track} className="flex flex-col items-center gap-1" aria-label={`${name}${caption ? `, ${caption}` : ""}`}>
      <SwatchFace name={name} selected={selected} />
      {caption && <span className="label !text-[11px] !tracking-[.06em] opacity-80">{caption}</span>}
    </Link>
  )
}
