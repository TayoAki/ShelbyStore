"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

/**
 * Melin's sticky buy bar for landing pages (SITE_SPEC §12.0): fixed at the top
 * under the condensed header on mobile (80px): thumbnail, price and the page's
 * one action. It appears once `afterId` scrolls away and hides while the buy
 * block is on screen, so the action is never shown twice.
 */
export function StickyCta({
  label,
  price,
  thumb,
  href,
  track,
  afterId,
  hideWhileId,
}: {
  label: string
  price?: string
  thumb?: string | null
  href: string
  track: string
  afterId: string
  hideWhileId?: string
}) {
  const [past, setPast] = useState(false)
  const [buyVisible, setBuyVisible] = useState(false)
  useEffect(() => {
    const after = document.getElementById(afterId)
    const buy = hideWhileId ? document.getElementById(hideWhileId) : null
    const observers: IntersectionObserver[] = []
    if (after) {
      const io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0))
      io.observe(after)
      observers.push(io)
    }
    if (buy) {
      const io = new IntersectionObserver(([e]) => setBuyVisible(e.isIntersecting))
      io.observe(buy)
      observers.push(io)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [afterId, hideWhileId])

  if (!past || buyVisible) return null
  return (
    <div className="fixed inset-x-0 top-[61px] z-30 h-20 bg-white shadow-sticky [html[data-hdr=expanded]_&]:top-[121px] lg:hidden">
      <div className="flex h-full items-center gap-3 px-4">
        {thumb && (
          <span className="relative h-14 w-14 shrink-0">
            <Image src={thumb} alt="" fill sizes="56px" className="object-contain" />
          </span>
        )}
        {price && <span className="font-body text-[16px]">{price}</span>}
        <a href={href} className="btn btn--primary ml-auto shrink-0" data-track={track}>
          <span>{label}</span>
        </a>
      </div>
    </div>
  )
}
