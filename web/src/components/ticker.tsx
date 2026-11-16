"use client"

import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/lib/motion"

export type TickerItem = { text: string; href: string | null }

const PX_PER_SECOND = 40

/**
 * The ticker bar (G.5.3): 32px, black, the item list rendered twice and
 * translated -50% at 40px/s (M34), paused on hover / focus. Reduced motion:
 * no crawl, one item at a time with prev/next chevrons.
 */
export function Ticker({ items }: { items: TickerItem[] }) {
  const reduced = useReducedMotion()
  const bar = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLUListElement>(null)
  const [i, setI] = useState(0)

  useEffect(() => {
    document.documentElement.style.setProperty("--global-banner-height", "32px")
  }, [])
  useEffect(() => {
    const el = copy.current
    const track = el?.parentElement
    if (!el || !track) return
    const set = () => track.style.setProperty("--ticker-duration", `${Math.max(20, el.scrollWidth / PX_PER_SECOND)}s`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [items, reduced])

  const label = (t: TickerItem, k: string, hidden = false) => (
    <li key={k} className="flex items-center gap-8 pr-8 whitespace-nowrap">
      {t.href ? (
        <Link href={t.href} tabIndex={hidden ? -1 : undefined} data-track="ticker_item" className="hover:underline">
          {t.text}
        </Link>
      ) : (
        <span>{t.text}</span>
      )}
      <span aria-hidden className="size-1 rounded-full bg-white/60" />
    </li>
  )

  return (
    <div
      ref={bar}
      role="region"
      aria-label="Shelby leaderboard"
      className="sticky top-0 z-[85] flex h-8 items-center overflow-hidden bg-black font-mono text-[10px] leading-4 tracking-[.2em] text-white tabular-nums uppercase md:text-[11px]"
    >
      {reduced ? (
        <div className="relative flex w-full items-center justify-center px-8">
          {items.length > 1 && (
            <button type="button" aria-label="Previous" className="absolute left-1 size-6" onClick={() => setI((n) => (n - 1 + items.length) % items.length)}>
              <CaretLeft size={16} className="mx-auto" />
            </button>
          )}
          <ul className="flex">{items[i] && label(items[i], "one")}</ul>
          {items.length > 1 && (
            <button type="button" aria-label="Next" className="absolute right-1 size-6" onClick={() => setI((n) => (n + 1) % items.length)}>
              <CaretRight size={16} className="mx-auto" />
            </button>
          )}
        </div>
      ) : (
        <div className="animate-ticker flex w-max hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
          <ul ref={copy} className="flex">
            {items.map((t, k) => label(t, `a${k}`))}
          </ul>
          <ul className="flex" aria-hidden>
            {items.map((t, k) => label(t, `b${k}`, true))}
          </ul>
        </div>
      )}
    </div>
  )
}
