"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { prefersReducedMotion } from "@/lib/motion"
import { useSelection } from "./selection"

/**
 * Eastside's PDP media column (SITE_SPEC v8 E.6.3). Desktop: an 85px column
 * of 75×75 thumbs beside a 2:3 main image on #F6F6F6, with the next angles
 * stacked under it. Mobile: a swipe slider of 5:6 frames with 6px dots. The
 * photos follow the colour picked in the buy block; each fades in (M11).
 */
export function Gallery({
  title,
  imagesByColor,
  fallback,
  initialColor,
  badge,
  single = false,
}: {
  title: string
  imagesByColor: Record<string, string[]>
  fallback: string[]
  initialColor: string | null
  badge?: string | null
  /** One main image that the thumbs switch (landing pages), instead of the stacked angles. */
  single?: boolean
}) {
  const { color } = useSelection()
  const active = color ?? initialColor
  const images = ((active && imagesByColor[active]?.length ? imagesByColor[active] : fallback) ?? []).slice(0, 4)
  const [current, setCurrent] = useState(0)
  const stack = useRef<HTMLDivElement>(null)
  const set = images.join("|")
  const [shownSet, setShownSet] = useState(set)
  if (shownSet !== set) {
    setShownSet(set)
    setCurrent(0)
  }
  useEffect(() => {
    slider.current?.scrollTo({ left: 0 })
  }, [set])
  const slider = useRef<HTMLDivElement>(null)

  // Thumb highlight follows the stacked image in view.
  useEffect(() => {
    const root = stack.current
    if (!root || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: "-45% 0px -45% 0px" }
    )
    root.querySelectorAll("[data-i]").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [set])

  const go = (i: number) => {
    setCurrent(i)
    if (single) return
    stack.current?.querySelector(`[data-i="${i}"]`)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" })
  }
  const onSlide = () => {
    const el = slider.current
    if (el) setCurrent(Math.round(el.scrollLeft / el.clientWidth))
  }
  const alt = (i: number) => `${title}${active ? ` in ${active}` : ""}, photo ${i + 1} of ${images.length}`
  const tag = badge ? <span className="badge absolute top-[5px] left-[5px] z-[3]">{badge}</span> : null

  return (
    <div className="pdp-gallery min-w-0">
      {/* Desktop */}
      <div className="hidden gap-0 lg:flex">
        <ul className="sticky top-[80px] flex h-fit w-[85px] shrink-0 flex-col gap-2 pl-2.5" aria-label="Photos">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Show photo ${i + 1}`}
                aria-current={current === i}
                onClick={() => go(i)}
                className={`tile relative block size-[75px] outline-offset-0 ${current === i ? "outline outline-1 outline-text" : ""}`}
              >
                <Image src={src} alt="" fill sizes="75px" className="tile-photo object-contain" />
              </button>
            </li>
          ))}
        </ul>
        <div ref={stack} className="flex min-w-0 flex-1 flex-col gap-1 pl-5">
          {(single ? images.slice(current, current + 1) : images).map((src, j) => {
            const i = single ? current : j
            return (
            <div key={src} data-i={single ? undefined : i} className={`tile relative w-full max-w-[565px] ${single ? "aspect-[5/6]" : "aspect-[2/3]"}`}>
              <Image key={src} src={src} alt={alt(i)} fill preload={i === 0} sizes="565px" className="tile-photo animate-fade-in object-contain" />
              {i === 0 && tag}
            </div>
            )
          })}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div ref={slider} onScroll={onSlide} className="rail !gap-0 [grid-auto-columns:100%]" aria-label="Photos" role="region" tabIndex={0}>
          {images.map((src, i) => (
            <div key={src} className="tile relative aspect-[5/6]">
              <Image src={src} alt={alt(i)} fill preload={i === 0} sizes="100vw" className="tile-photo animate-fade-in object-contain" />
              {i === 0 && tag}
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="flex justify-center gap-0" aria-hidden>
            {images.map((src, i) => (
              <span key={src} className="flex size-6 items-center justify-center">
                <span className={`block size-1.5 rounded-full ${i === current ? "bg-text" : "bg-[#bdbdbd]"}`} />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
