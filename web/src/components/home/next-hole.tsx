"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { useInView, usePathMotion } from "@/lib/motion"
import { holeDate, pad2, type Hole } from "@/lib/rope"
import { Countdown } from "../countdown"
import { TeeSheetForm } from "../tee-sheet-form"

const PATH =
  "M 122.5 0.669 L 122.5 0.669 C 190.747 0.669 244.331 54.253 244.331 122.5 L 244.331 249.331 C 244.331 317.578 190.747 371.162 122.5 371.162 C 54.253 371.162 0.669 317.578 0.669 249.331 L 0.669 122.5 C 0.669 54.253 54.253 0.669 122.5 0.669"

/**
 * "The next hole" (v5 §6.1.3 brand pill, G.6.2 item 3): the home page's
 * golf-green band. The pill SVG with three dots on its path (M27a), the
 * edition photo in a white disc, a real countdown to its release_at, the tee
 * sheet, and a marquee of true facts (M27b).
 */
export function NextHole({ hole, price }: { hole: Hole; price: string | null }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const path = useRef<SVGPathElement>(null)
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const desktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  usePathMotion(path, dots, {
    start: inView,
    from: [0.53, 0.5, 0.47],
    to: desktop ? [0.1, 0.43, 0.76] : [0.53, 0.5, 0.47],
    duration: desktop ? 4 : 15,
    ease: desktop ? "power3.out" : "linear",
    repeat: !desktop,
    radius: 2.5,
  })
  const { day, time } = holeDate(hole.date)
  const live = hole.status === "live"
  const facts = [`HOLE ${hole.hole}`, hole.name.toUpperCase(), hole.size ? `EDITION OF ${hole.size}` : null, day, price, "LEATHER STRAP"].filter(Boolean) as string[]

  return (
    <section ref={ref} id="hole" data-reveal="" className="band-golf relative mx-2.5 my-10 flex aspect-[0.63] flex-col overflow-hidden rounded-xl text-center md:aspect-[2.56] md:rounded-3xl">
      <svg viewBox="-5 -5 255 382" className="absolute inset-x-0 top-6 m-auto h-fit w-full px-8 md:inset-0 md:w-[calc(25%+5.3rem)] md:rotate-90" aria-hidden>
        <path ref={path} d={PATH} fill="none" stroke="white" strokeWidth={0.662} />
        <rect x={12.669} y={12.669} width={219.663} height={346.663} rx={109.831} fill="none" stroke="white" strokeWidth={0.662} transform="rotate(-180 122.5 186)" />
        <rect x={24.669} y={24.669} width={195.663} height={322.663} rx={97.831} fill="#212121" fillOpacity={0.1} stroke="white" strokeWidth={0.662} transform="rotate(-180 122.5 186)" />
        {[198, 186, 174].map((y, i) => (
          <circle key={y} ref={(el) => void (dots.current[i] = el)} cx={1} cy={y} r={2.5} fill="white" />
        ))}
      </svg>
      <div className="pill-content relative z-10 m-auto flex flex-col items-center gap-3 max-md:px-14 max-md:pt-[18%] md:absolute md:inset-0 md:h-fit">
        <div className="relative size-[200px] overflow-hidden rounded-full bg-white shadow-[0_.85rem_1rem_rgba(0,0,0,0.25)] md:size-[240px]">
          {hole.image && <Image src={hole.image} alt={`${hole.name}, Hole ${hole.hole}`} fill sizes="240px" className="object-contain p-6" />}
        </div>
        <p className="font-mono text-xs leading-5 tracking-[.1em] text-golf-tint">
          {live ? `HOLE ${hole.hole} · LIVE NOW` : `HOLE ${hole.hole} · ${day ?? ""}${time ? ` · ${time.toUpperCase()}` : ""}`}
        </p>
        <p className="flex items-baseline gap-3">
          <span className="font-display text-[32px] leading-10 tabular-nums md:text-[40px] md:leading-[48px]">{pad2(hole.hole)}</span>
          <span className="kicker text-white">{hole.name}</span>
        </p>
        {hole.promise && <p className="max-w-[360px] text-sm leading-5">{hole.promise}</p>}
        {!live && hole.date && <Countdown iso={hole.date} tone="light" />}
        {live && hole.productHandle ? (
          <Link href={`/products/${hole.productHandle}`} className="btn btn-primary mx-auto my-2 w-fit" data-track="hero_shop_drop">
            SHOP {hole.name.toUpperCase()}
          </Link>
        ) : hole.handle ? (
          <div className="mx-auto w-full max-w-[384px] text-left">
            <TeeSheetForm releaseHandle={hole.handle} hole={hole.hole} name={hole.name} label={false} />
          </div>
        ) : null}
      </div>
      <div className="relative mt-auto mb-9 overflow-hidden" aria-hidden>
        <div className="animate-marquee flex w-max">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex">
              {facts.map((f) => (
                <li key={f} className="flex items-center gap-6 pr-6 font-mono text-xs leading-5 tracking-[.1em] whitespace-nowrap">
                  {f}
                  <span className="size-1.5 rounded-full bg-white" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
