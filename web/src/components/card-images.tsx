"use client"

import Image from "next/image"
import { useState } from "react"

/**
 * The card's image area (SITE_SPEC §6.2): 1:1 contain on white. Mobile swipes
 * through the first colour's photos (scroll-snap) with 21×4 dashes; desktop
 * crossfades image 2 in on hover.
 */
export function CardImages({ images, title, preload = false }: { images: string[]; title: string; preload?: boolean }) {
  const [index, setIndex] = useState(0)
  const list = images.slice(0, 6)
  if (!list.length) {
    return <span className="flex aspect-square items-center justify-center bg-tile p-4 text-center font-body text-[12px] text-muted">{title}</span>
  }
  return (
    <>
      {/* Mobile: swipe */}
      <span
        className="scrollbar-none flex aspect-square snap-x snap-mandatory overflow-x-auto lg:hidden"
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {list.map((src, i) => (
          <span key={src} className="relative block aspect-square w-full shrink-0 snap-center">
            <Image src={src} alt={i === 0 ? title : ""} fill sizes="50vw" preload={preload && i === 0} className="object-contain" />
          </span>
        ))}
      </span>
      {/* Desktop: hover swap */}
      <span className="relative hidden aspect-square lg:block">
        <Image src={list[0]} alt={title} fill sizes="200px" preload={preload} className="object-contain" />
        {list[1] && (
          <Image src={list[1]} alt="" fill sizes="200px" className="object-contain opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />
        )}
      </span>
      {list.length > 1 && (
        <span className="absolute inset-x-0 bottom-1 flex justify-center gap-2" aria-label={`Image ${index + 1} of ${list.length}`}>
          {list.map((src, i) => (
            <span key={src} className={`h-1 w-[21px] transition-colors duration-200 ${i === index ? "bg-black" : "bg-tertiary"}`} />
          ))}
        </span>
      )}
    </>
  )
}
