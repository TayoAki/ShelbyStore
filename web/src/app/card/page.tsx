import type { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"
import { Banner } from "@/components/banner"
import { Countdown } from "@/components/countdown"
import { HoleCard } from "@/components/hole-card"
import { TeeSheetForm } from "@/components/tee-sheet-form"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { price } from "@/lib/product"
import { holeDate, nextHole, pad2, type Hole } from "@/lib/rope"

export const metadata: Metadata = {
  title: "The Card",
  description: "Six numbered holes in 2027. Hole 1 is the core cap; each hole after it is one numbered color, released on its date.",
}

/**
 * The Card (SITE_SPEC G.6.7): the drop calendar and archive. The next-hole band
 * (the page's golf-green band) with a real countdown and the tee sheet, then
 * one card per hole in hole order. Sold-out and ended holes stay in place.
 */
export default function CardPage() {
  return (
    <>
      <Banner
        image="/hats/rope-clubhouse.jpg"
        crumbs={[{ label: "Home", href: "/" }, { label: "The Card" }]}
        title="The Card"
        description="Six numbered holes in 2027. Hole 1 is the core cap. Each hole after it is one numbered color, released on its date and not remade."
      />
      <Suspense fallback={<div className="mx-2.5 my-10 h-80 animate-pulse rounded-3xl bg-white" />}>
        <CardContent />
      </Suspense>
    </>
  )
}

async function CardContent() {
  const c = await ropeCatalog()
  const { holes } = await liveStock(c)
  const next = nextHole(holes)
  return (
    <>
      {next && <NextBand hole={next} />}
      <section aria-label="Holes" className="mb-10">
        <div className="mx-2.5 mb-2.5 hidden grid-cols-5 rounded-xl bg-white px-4 py-3 md:grid">
          {["HOLE", "NAME", "DATE", "EDITION", "STATUS"].map((h) => (
            <span key={h} className="label-score">
              {h}
            </span>
          ))}
        </div>
        <div className="grid gap-2.5 px-2.5 md:grid-cols-3">
          {holes.map((h) => (
            <HoleCard key={h.hole} hole={h} price={priceFor(c, h)} />
          ))}
        </div>
      </section>
    </>
  )
}

const priceFor = (c: RopeCatalog, h: Hole) => {
  const p = h.core ? c.core : c.editions.find((e) => e.handle === h.productHandle)
  return p ? price(p).amount : null
}

function NextBand({ hole }: { hole: Hole }) {
  const { day, time } = holeDate(hole.date)
  return (
    <section aria-label="Next hole" className="band-golf mx-2.5 my-10 grid gap-8 rounded-3xl p-5 md:grid-cols-2 md:p-10">
      <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-full bg-white">
        {hole.image && <Image src={hole.image} alt={`${hole.name}, Hole ${hole.hole}`} fill sizes="420px" className="object-contain p-10" />}
      </div>
      <div className="flex flex-col justify-center gap-4">
        <p className="font-mono text-xs leading-5 tracking-[.1em] text-golf-tint">NEXT · HOLE {hole.hole}</p>
        <p className="flex items-baseline gap-3">
          <span className="font-display text-[32px] leading-10 tabular-nums md:text-[40px] md:leading-[48px]">{pad2(hole.hole)}</span>
          <span className="kicker">{hole.name}</span>
        </p>
        <p className="label-score !text-white">
          {day}
          {time ? ` · ${time.toUpperCase()}` : ""}
        </p>
        {hole.date && <Countdown iso={hole.date} tone="light" size="large" />}
        {hole.size && <span className="badge-edition edition w-fit">EDITION OF {hole.size}</span>}
        {hole.handle && <TeeSheetForm releaseHandle={hole.handle} hole={hole.hole} name={hole.name} />}
      </div>
    </section>
  )
}
