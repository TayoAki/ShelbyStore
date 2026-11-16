"use client"

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { useInView } from "@/lib/motion"
import type { StoreSeries } from "@/lib/data/content"

const IMAGES = ["/hats/rope-brim.jpg", "/hats/rope-cap-tour-white-3.jpg", "/hats/rope-brim.jpg", "/hats/rope-cap-pine-3.jpg"]

/**
 * "From The Crown Test" (v5 §6.1.7 stories carousel, G.6.2 item 7): episode
 * cards on a scroll-snap track, captions rise in (M29), arrows on desktop.
 */
export function SeriesCarousel({ series, onStory = false, highlight = null }: { series: StoreSeries; onStory?: boolean; highlight?: string | null }) {
  const ref = useRef<HTMLElement>(null)
  useInView(ref)
  const track = useRef<HTMLUListElement>(null)
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * (track.current.clientWidth / 2), behavior: "smooth" })
  const episodes = onStory ? [...series.episodes].sort((a, b) => Date.parse(a.published_at) - Date.parse(b.published_at)) : series.episodes.slice(0, 6)
  if (!episodes.length) return null
  return (
    <section ref={ref} id={onStory ? "proof" : "series"} data-reveal="" className="my-10 scroll-mt-28">
      <div className="mb-5 flex items-center justify-between px-5 md:px-10">
        <h2 className="font-mono text-base leading-[26px] tracking-[.05em] uppercase">{onStory ? "THE PROOF" : `FROM ${series.title.toUpperCase()}`}</h2>
        <div className="hidden gap-2 md:flex">
          <button type="button" className="btn btn-icon-black size-8" aria-label="Previous" onClick={() => scroll(-1)}>
            <ArrowLeft size={16} />
          </button>
          <button type="button" className="btn btn-icon-black size-8" aria-label="Next" onClick={() => scroll(1)}>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <ul ref={track} className="scrollbar-hidden flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth pl-2.5">
        {episodes.map((e, i) => (
          <li key={e.asset_key} className="w-[calc(100%/1.3)] shrink-0 snap-start md:w-[calc(100%/2.6)] lg:w-[calc(100%/3.6)]">
            <Link
              href={onStory && e.post_url ? e.post_url : `/stories/${series.handle}`}
              {...(onStory && e.post_url ? { target: "_blank", rel: "noreferrer" } : {})}
              data-track="story_episode"
              aria-current={highlight === e.asset_key ? "true" : undefined}
              className={`block rounded-2xl ${highlight === e.asset_key ? "outline-2 outline-offset-4 outline-golf-green" : ""}`}
            >
              <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white">
                <Image src={IMAGES[i % IMAGES.length]} alt="" fill sizes="(min-width: 1024px) 28vw, 77vw" className={IMAGES[i % IMAGES.length].includes("rope-cap-") ? "object-contain" : "object-cover"} />
              </span>
              <span className="caption-rise mt-3 block">
                <span className="block font-mono text-xs leading-4 tracking-[.1em]">EPISODE {i + 1} · TIKTOK</span>
                <span className="mt-1 block text-sm leading-5 font-medium tracking-[.05em] uppercase">{e.title}</span>
                {e.subject && <span className="mt-1 line-clamp-3 block text-xs leading-4 text-neutral-800">{e.subject}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {!onStory && (
        <div className="mt-8 flex justify-center">
          <Link href={`/stories/${series.handle}`} className="btn btn-outline-black" data-track="series_story">
            SEE THE FULL TEST
          </Link>
        </div>
      )}
    </section>
  )
}
