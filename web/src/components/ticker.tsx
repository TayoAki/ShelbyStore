"use client"

import { CaretLeft, CaretRight, Pause, Play } from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useReducedMotion } from "@/lib/motion"

export type TickerItem = { text: string; href: string | null }

const INTERVAL = 5000

/**
 * The announcement slider (M7): the messages cross-fade every 5000ms (.5s),
 * pausing on hover and focus. A 24px pause/play button sits at the right edge
 * (WCAG 2.2.2). Under reduced motion autoplay is off and 24px previous/next
 * buttons show instead. One message shows no controls.
 */
export function Ticker({ items }: { items: TickerItem[] }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hold, setHold] = useState(false)
  const many = items.length > 1
  const playing = many && !reduced && !paused && !hold

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), INTERVAL)
    return () => clearInterval(id)
  }, [playing, items.length])

  const step = (d: number) => setIndex((i) => (i + d + items.length) % items.length)
  const current = index % items.length

  return (
    <div
      className="on-ink relative bg-ink text-on-ink"
      role="region"
      aria-roledescription="carousel"
      aria-label="Announcements"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHold(false)}
    >
      <div className="relative mx-auto flex h-9 max-w-[1440px] items-center px-10">
        {many && reduced && (
          <button type="button" aria-label="Previous announcement" className="absolute left-2 flex size-6 items-center justify-center" onClick={() => step(-1)}>
            <CaretLeft size={14} />
          </button>
        )}
        <ul className="relative h-full w-full">
          {items.map((it, i) => {
            const on = i === current
            return (
              <li
                key={it.text}
                aria-hidden={!on}
                className={`absolute inset-0 flex items-center justify-center transition-[opacity,visibility] duration-500 ease-[ease] ${on ? "opacity-100" : "pointer-events-none invisible opacity-0"}`}
              >
                {it.href ? (
                  <Link href={it.href} data-track="ticker_item" tabIndex={on ? 0 : -1} className="truncate text-[12.6px] uppercase hover:!text-on-ink-hover md:text-[14.4px]">
                    {it.text}
                  </Link>
                ) : (
                  <span className="truncate text-[12.6px] uppercase md:text-[14.4px]">{it.text}</span>
                )}
              </li>
            )
          })}
        </ul>
        {many && reduced && (
          <button type="button" aria-label="Next announcement" className="absolute right-3 flex size-6 items-center justify-center" onClick={() => step(1)}>
            <CaretRight size={14} />
          </button>
        )}
        {many && !reduced && (
          <button
            type="button"
            aria-label={paused ? "Play announcements" : "Pause announcements"}
            aria-pressed={paused}
            className="absolute right-3 flex size-6 items-center justify-center"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play size={14} weight="fill" /> : <Pause size={14} weight="fill" />}
          </button>
        )}
      </div>
    </div>
  )
}
