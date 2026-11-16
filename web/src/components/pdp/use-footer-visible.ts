"use client"

import { useEffect, useState } from "react"

/** True while the site footer is on screen: the sticky buy bar hides there (SITE_SPEC v8 E.6.3, M18). */
export function useFooterVisible() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const footer = document.querySelector("footer")
    if (!footer || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(footer)
    return () => io.disconnect()
  }, [])
  return visible
}
