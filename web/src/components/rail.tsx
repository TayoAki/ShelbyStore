"use client"

import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { prefersReducedMotion } from "@/lib/motion"

/**
 * Eastside's rail (SITE_SPEC v8 E.5.7): a scroll-snap row of cards with the
 * page gutter as inline padding and a hidden scrollbar, plus 44px white
 * arrows at the vertical centre that show on hover or focus (M17), always on
 * touch. The previous arrow hides at the start and the next at the end; each
 * scrolls one viewport of cards.
 */
export function Rail({ children, label, className = "", itemClass = "", gap = 4, pad = true }: { children: ReactNode; label: string; className?: string; itemClass?: string; gap?: number; pad?: boolean }) {
  const ref = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 })
    read()
    el.addEventListener("scroll", read, { passive: true })
    window.addEventListener("resize", read)
    return () => {
      el.removeEventListener("scroll", read)
      window.removeEventListener("resize", read)
    }
  }, [])

  const go = (d: number) => {
    const el = ref.current
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.9, behavior: prefersReducedMotion() ? "auto" : "smooth" })
  }

  return (
    <div className={`rail-wrap relative ${className}`}>
      <ul ref={ref} aria-label={label} className={`rail ${itemClass} ${pad ? "px-[var(--gutter-page)] scroll-px-[var(--gutter-page)]" : ""}`} style={{ gap }}>
        {children}
      </ul>
      {!edges.start && (
        <button type="button" aria-label={`Previous: ${label}`} className="arrow-btn absolute top-1/2 left-4 z-[4] -translate-y-1/2" onClick={() => go(-1)}>
          <CaretLeft size={18} />
        </button>
      )}
      {!edges.end && (
        <button type="button" aria-label={`Next: ${label}`} className="arrow-btn absolute top-1/2 right-4 z-[4] -translate-y-1/2" onClick={() => go(1)}>
          <CaretRight size={18} />
        </button>
      )}
    </div>
  )
}
