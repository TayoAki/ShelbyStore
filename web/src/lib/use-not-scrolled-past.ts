"use client"

import { useEffect, useState, type RefObject } from "react"

/**
 * True until the element has scrolled up past the top of the viewport. Read
 * from its position on every scroll and resize (one frame at most), so a jump
 * back to the top (Home key, a hash link) restores it, which an
 * IntersectionObserver misses when no threshold is crossed.
 */
export function useNotScrolledPast(ref: RefObject<HTMLElement | null>, enabled = true) {
  const [on, setOn] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let frame = 0
    const read = () => {
      frame = 0
      setOn(el.getBoundingClientRect().bottom > 0)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [ref, enabled])
  return on
}
