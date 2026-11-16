"use client"

import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Children, useRef, type ReactNode } from "react"

/**
 * Card carousel with native scroll-snap and white 48px arrow circles at the
 * edges on desktop (SITE_SPEC §2.3, §6.4.16). `perView` sets the visible card
 * count: e.g. 4 on desktop, 2.2 on mobile.
 */
export function Carousel({
  children,
  gap = "gap-4 lg:gap-[28.432px]",
  item = "w-[calc((100%-16px)/2.2)] lg:w-[calc((100%-3*28.432px)/4)]",
  arrows = true,
  label,
}: {
  children: ReactNode
  gap?: string
  item?: string
  arrows?: boolean
  label?: string
}) {
  const track = useRef<HTMLDivElement>(null)
  const go = (dir: number) => {
    const el = track.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" })
  }
  return (
    <div className="relative" role="region" aria-label={label}>
      <div ref={track} className={`scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth ${gap}`}>
        {Children.map(children, (child) => (
          <div className={`shrink-0 snap-start ${item}`}>{child}</div>
        ))}
      </div>
      {arrows && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => go(-1)}
            className="absolute -left-6 top-[35%] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.1)] lg:flex"
          >
            <CaretLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => go(1)}
            className="absolute -right-6 top-[35%] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.1)] lg:flex"
          >
            <CaretRight size={20} />
          </button>
        </>
      )}
    </div>
  )
}
