"use client"

import { Play, X } from "@phosphor-icons/react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Badge } from "../ui/badge"
import { useSelection } from "./selection"

/**
 * Melin's PDP gallery (SITE_SPEC §6.4.2), driven by the selected colour.
 * Desktop: a 2-column grid of 362px squares (contain on white). Mobile: a
 * full-width swipe of squares with 21×4 dashes 12px below. A badge sits on
 * image 1; a video plays under the grid (desktop) or from a PLAY pill (mobile).
 */
export function Gallery({
  images,
  imagesByColor,
  title,
  videoUrl,
  badge,
}: {
  images: string[]
  imagesByColor?: Record<string, string[]>
  title: string
  videoUrl?: string | null
  badge?: string | null
}) {
  const { color } = useSelection()
  const shown = color && imagesByColor?.[color]?.length ? imagesByColor[color] : images
  // The dash index belongs to the colour it was measured on; a new colour starts at photo 1.
  const [pos, setPos] = useState<{ color: string | null; index: number }>({ color, index: 0 })
  const index = pos.color === color ? pos.index : 0
  const setIndex = (i: number) => setPos({ color, index: i })
  const [video, setVideo] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scroller.current?.scrollTo({ left: 0 })
  }, [color])

  if (!shown.length) return <div className="aspect-square w-full bg-tile" />

  const badgeEl = badge ? (
    <span className="absolute left-[14.08px] top-[14.08px] z-10">
      <Badge>{badge}</Badge>
    </span>
  ) : null

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        <div className="relative">
          <div
            ref={scroller}
            className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
            onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          >
            {shown.map((src, i) => (
              <div key={`${src}-${i}`} className="relative aspect-square w-full shrink-0 snap-center bg-white">
                <Image src={src} alt={`${title}, image ${i + 1} of ${shown.length}`} fill sizes="100vw" preload={i === 0} className="object-contain" />
              </div>
            ))}
          </div>
          {badgeEl}
          {videoUrl && (
            <button
              type="button"
              onClick={() => setVideo(true)}
              className="absolute bottom-3 right-3 rounded-full bg-white/90 px-[10px] py-1 font-heading text-[11px] uppercase tracking-[1.3px]"
            >
              Play <Play size={10} weight="fill" className="inline" aria-hidden />
            </button>
          )}
        </div>
        {shown.length > 1 && (
          <div className="mt-3 flex justify-center gap-2" aria-hidden>
            {shown.map((src, i) => (
              <span key={`${src}-d${i}`} className={`h-1 w-[21px] transition-colors duration-200 ${i === index ? "bg-black" : "bg-tertiary"}`} />
            ))}
          </div>
        )}
      </div>
      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-4">
          {shown.map((src, i) => (
            <div key={`${src}-${i}`} className="relative aspect-square bg-white">
              {i === 0 && badgeEl}
              <Image src={src} alt={`${title}, image ${i + 1} of ${shown.length}`} fill sizes="362px" preload={i === 0} className="object-contain" />
            </div>
          ))}
        </div>
        {videoUrl && <video src={videoUrl} muted loop playsInline autoPlay controls className="mt-4 aspect-video w-full bg-black object-cover" aria-label={`${title} video`} />}
      </div>
      {video && videoUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black lg:hidden" role="dialog" aria-label={`${title} video`}>
          <button type="button" aria-label="Close video" onClick={() => setVideo(false)} className="absolute right-4 top-4 text-white">
            <X size={24} />
          </button>
          <video src={videoUrl} autoPlay playsInline controls className="w-full" />
        </div>
      )}
    </>
  )
}
