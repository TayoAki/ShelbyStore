"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useHoverIntent, useInView } from "@/lib/motion"

type Tile = { color: string; image: string; hover: string | null; bg: string }

/**
 * "Pick a color" (v5 §6.1.2 category row, G.6.2 item 2): one tile per core
 * colourway on sage / golf tint, the photo inside a white disc (never
 * multiplied), the pill morph on hover (M5) and a centred carousel on mobile.
 */
export function PickAColor({ tiles }: { tiles: Tile[] }) {
  const ref = useRef<HTMLElement>(null)
  useInView(ref, { rootMargin: "0px 0px 0px 0px" })
  const track = useRef<HTMLUListElement>(null)
  const [centre, setCentre] = useState(0)
  useEffect(() => {
    const el = track.current
    if (!el) return
    const onScroll = () => {
      const w = el.firstElementChild?.clientWidth ?? 1
      setCentre(Math.round(el.scrollLeft / (w + 10)))
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section ref={ref} id="colors" data-reveal="" className="relative overflow-hidden p-2.5" style={{ transitionDelay: ".8s" }}>
      <div className="mb-4 flex items-center justify-between px-2.5 md:px-5">
        <h2 className="tab-title" data-selected="">
          PICK A COLOR
        </h2>
        <Link href="/quiz" data-track="home_quiz" className="link text-xs leading-4">
          Not sure? Take the 30-second quiz
        </Link>
      </div>
      <ul ref={track} className="scrollbar-hidden flex snap-x snap-mandatory gap-2.5 overflow-x-auto max-md:px-[14%] md:overflow-visible">
        {tiles.map((t, i) => (
          <ColorTile key={t.color} tile={t} index={i} active={centre === i} />
        ))}
      </ul>
    </section>
  )
}

function ColorTile({ tile, index, active }: { tile: Tile; index: number; active: boolean }) {
  const ref = useRef<HTMLLIElement>(null)
  useHoverIntent(ref)
  return (
    <li
      ref={ref}
      data-active={active ? "true" : undefined}
      className="cat-tile relative aspect-[0.77] w-[72%] shrink-0 snap-center overflow-hidden md:w-auto md:flex-1 md:[&[data-active]]:rounded-[20px]"
      style={{ background: tile.bg }}
    >
      <div className="absolute top-[10%] left-[14%] aspect-square w-[72%] overflow-hidden rounded-full bg-white shadow-[0_.85rem_1rem_rgba(0,0,0,0.25)]">
        <Image src={tile.image} alt="" fill sizes="(min-width: 768px) 18vw, 50vw" className="object-contain p-[7%]" />
        {tile.hover && <Image src={tile.hover} alt="" fill sizes="(min-width: 768px) 18vw, 50vw" className="cat-hover-img object-contain p-[7%]" />}
      </div>
      <div className="cat-stack absolute inset-x-0 bottom-[8%] z-20 mx-auto flex w-fit flex-col items-center gap-2" data-reveal-child="" style={{ ["--i" as string]: index, ["--stagger" as string]: ".15s" }}>
        <h3 className="cat-title btn btn-outline-black pointer-events-none !border-black">{tile.color}</h3>
        <Link href={`/products/rope-cap?color=${encodeURIComponent(tile.color)}`} data-track="shop_by_color" className="cat-cta btn btn-outline-black w-full">
          SHOP {tile.color.toUpperCase()}
        </Link>
      </div>
    </li>
  )
}
