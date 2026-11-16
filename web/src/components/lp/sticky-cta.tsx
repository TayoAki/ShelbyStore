"use client"

import { useEffect, useState } from "react"
import { buttonClass } from "../ui/button"

/**
 * Mobile bottom bar with the page's one action (SITE_SPEC §12.0). It appears
 * once the hero has scrolled away and hides while the buy block itself is on
 * screen, so the action is never shown twice.
 */
export function StickyCta({
  label,
  detail,
  href,
  track,
  afterId,
  hideWhileId,
}: {
  label: string
  detail?: string
  href: string
  track: string
  /** Show the bar after this element has scrolled above the viewport. */
  afterId: string
  /** Hide the bar while this element (the buy block) is visible. */
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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-page px-4 py-3 lg:hidden">
      <div className="flex items-center gap-3">
        {detail && <p className="min-w-0 flex-1 truncate text-[13px] text-ink-muted">{detail}</p>}
        <a href={href} className={buttonClass({ size: "sm", block: !detail })} data-track={track}>
          {label}
        </a>
      </div>
    </div>
  )
}
