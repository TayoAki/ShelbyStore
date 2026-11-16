"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { useInView } from "@/lib/motion"
import { colorway } from "@/lib/swatches"

/**
 * The rope rule (SITE_SPEC G.5.4): a 4px braided stripe in the selected
 * colourway's rope and crown colours. Draws in on reveal (M36) and crossfades
 * between colourways (M36a: the new layer fades in over the old one).
 */
export function RopeRule({ color, className = "" }: { color: string | null | undefined; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useInView(ref)
  const [layers, setLayers] = useState<{ key: number; color: string }[]>([{ key: 0, color: color ?? "" }])
  const n = useRef(0)
  useEffect(() => {
    if (!color) return
    setLayers((prev) => (prev[prev.length - 1]?.color === color ? prev : [...prev.slice(-1), { key: ++n.current, color }]))
  }, [color])

  return (
    <div ref={ref} role="presentation" className={`rope-rule-wrap relative h-1 w-full ${className}`}>
      {layers.map((l, i) => {
        const c = colorway(l.color)
        return (
          <div
            key={l.key}
            className="rope-rule absolute inset-0"
            data-layer={i === layers.length - 1 ? "top" : "under"}
            style={{ "--crown": c.crown, "--rope": c.rope } as CSSProperties}
          />
        )
      })}
    </div>
  )
}
