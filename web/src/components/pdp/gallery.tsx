"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useSelection } from "./selection"

/**
 * PDP gallery (v5 §6.4.2): desktop 2-column grid of 7:4 white tiles with the
 * first image spanning both columns; mobile a scroll-snap slider with a thin
 * progress thumb. Follows the selected colour (fades in, back to photo 1).
 */
export function Gallery({ imagesByColor, fallback, title, badge }: { imagesByColor: Record<string, string[]>; fallback: string[]; title: string; badge: React.ReactNode }) {
  const { color } = useSelection()
  const images = (color && imagesByColor[color]?.length ? imagesByColor[color] : fallback) ?? []
  const track = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [shown, setShown] = useState(color)
  if (shown !== color) {
    setShown(color)
    setProgress(0)
  }
  useEffect(() => {
    track.current?.scrollTo({ left: 0 })
  }, [color])

  return (
    <div key={color ?? "none"} className="relative animate-[fade-in_.2s_var(--ease-sine-out)_both]">
      <div className="pointer-events-none absolute top-5 left-5 z-10">{badge}</div>
      <div className="hidden grid-cols-1 gap-2 md:grid lg:grid-cols-2">
        {images.map((src, i) => (
          <div key={src} className={`relative aspect-[7/4] w-full overflow-hidden rounded-lg bg-white ${i === 0 ? "lg:col-span-2" : ""}`}>
            <Image src={src} alt={`${title}${color ? ` in ${color}` : ""}, photo ${i + 1} of ${images.length}`} fill preload={i === 0} sizes="(min-width: 1024px) 30vw, 60vw" className="rounded-lg object-contain object-center" />
          </div>
        ))}
      </div>
      <div className="md:hidden">
        <div
          ref={track}
          className="scrollbar-hidden flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-2.5"
          onScroll={(e) => {
            const el = e.currentTarget
            setProgress(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth))
          }}
        >
          {images.map((src, i) => (
            <div key={src} className="relative aspect-square w-[calc(100%-20px)] shrink-0 snap-center overflow-hidden rounded-2xl bg-white">
              <Image src={src} alt={`${title}, photo ${i + 1} of ${images.length}`} fill preload={i === 0} sizes="100vw" className="object-contain" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="relative mx-auto mt-3 h-0.5 w-1/2 rounded bg-natural-white" aria-hidden>
            <span className="absolute top-0 h-full rounded bg-black" style={{ width: `${100 / images.length}%`, left: `${progress * (100 - 100 / images.length)}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}
