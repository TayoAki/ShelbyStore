"use client"

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react"
import { Children, useRef, type ReactNode } from "react"

/** Allbirds' carousel header + track (v5 §6.4.8): tab title, arrows, scroll-snap cards. */
export function CardCarousel({ title, children }: { title: string; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null)
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * (track.current.clientWidth / 2), behavior: "smooth" })
  return (
    <section aria-label={title} className="my-10 animate-[fade-in_.5s_ease_both]">
      <div className="mb-4 flex items-center justify-between px-5">
        <h2 className="tab-title" data-selected="">
          {title}
        </h2>
        <div className="hidden gap-2 md:flex">
          <button type="button" className="btn btn-icon-black size-10" aria-label="Previous" onClick={() => scroll(-1)}>
            <ArrowLeft size={16} />
          </button>
          <button type="button" className="btn btn-icon-black size-10" aria-label="Next" onClick={() => scroll(1)}>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <ul ref={track} className="scrollbar-hidden flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-2.5">
        {Children.map(children, (c) => (
          <li className="w-[calc(100%/1.6)] shrink-0 snap-start md:w-[calc(100%/3.2)] lg:w-[calc(100%/4.2)]">{c}</li>
        ))}
      </ul>
    </section>
  )
}
