"use client"

import Image from "next/image"
import { useRef, useState } from "react"

/**
 * Mobile: full-width 4:5 swipe gallery with dots (11/11 studied sites).
 * Desktop: two-column image grid. Optional try-on video in slot 2
 * (+14.5% apparel sales in a field experiment; SITE_SPEC §6.4.1).
 */
export function Gallery({ images, title, videoUrl }: { images: string[]; title: string; videoUrl?: string | null }) {
  const slides: { kind: "image" | "video"; src: string }[] = images.map((src) => ({ kind: "image", src }))
  if (videoUrl) slides.splice(Math.min(1, slides.length), 0, { kind: "video", src: videoUrl })
  const [index, setIndex] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  if (!slides.length) {
    return <div className="aspect-[4/5] w-full bg-surface" />
  }

  const media = (s: (typeof slides)[number], i: number, sizes: string) =>
    s.kind === "video" ? (
      <video src={s.src} muted loop playsInline autoPlay className="h-full w-full object-cover" aria-label={`${title} try-on video`} />
    ) : (
      <Image src={s.src} alt={`${title}, image ${i + 1} of ${slides.length}`} fill sizes={sizes} preload={i === 0} className="object-cover" />
    )

  return (
    <>
      {/* Mobile swipe gallery */}
      <div className="relative -mx-4 md:-mx-6 lg:hidden">
        <div
          ref={scroller}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget
            setIndex(Math.round(el.scrollLeft / el.clientWidth))
          }}
        >
          {slides.map((s, i) => (
            <div key={`${s.src}-${i}`} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-surface">
              {media(s, i, "100vw")}
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5" aria-hidden>
            {slides.map((s, i) => (
              <span
                key={`${s.src}-dot-${i}`}
                className={`h-1.5 rounded-full transition-all duration-150 ${i === index ? "w-5 bg-ink" : "w-1.5 bg-ink/25"}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* Desktop grid */}
      <div className="hidden grid-cols-2 gap-2 lg:grid">
        {slides.map((s, i) => (
          <div key={`${s.src}-${i}`} className={`relative aspect-[4/5] bg-surface ${slides.length % 2 === 1 && i === 0 ? "col-span-2" : ""}`}>
            {media(s, i, "(min-width: 1024px) 30vw, 100vw")}
          </div>
        ))}
      </div>
    </>
  )
}
