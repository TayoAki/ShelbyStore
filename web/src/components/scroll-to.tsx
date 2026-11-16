"use client"

import { useEffect } from "react"

/** Scrolls an element into view on load (e.g. /offer/the-foursome → #foursome). */
export function ScrollTo({ id }: { id: string }) {
  useEffect(() => {
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 300)
    return () => clearTimeout(t)
  }, [id])
  return null
}
