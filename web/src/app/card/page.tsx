import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Countdown } from "@/components/countdown"
import { HoleCard } from "@/components/hole-card"
import { StoryTeaser } from "@/components/story-teaser"
import { TeeSheetForm } from "@/components/tee-sheet-form"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { price } from "@/lib/product"
import { holeDate, nextHole, pad2, type Hole } from "@/lib/rope"
import { shortDate } from "@/components/hole-card"

export const metadata: Metadata = {
  title: "The Card",
  description: "Six numbered holes in 2027. Hole 1 is the core cap; each hole after it is one numbered color, released on its date.",
}

/**
 * The Card (SITE_SPEC v8 E.6.7): a collection-style header, the next hole as
 * an editorial split with its real countdown and tee sheet, all six holes in
 * Eastside's 3-column blog grid, and the story teaser. Sold-out and ended
 * holes stay in place.
 */
export default function CardPage() {
  return (
    <>
      <header className="wrap pt-4 text-center">
        <nav aria-label="Breadcrumb" className="crumbs-coll">
          <Link href="/">Home</Link> / <span aria-current="page">The Card</span>
        </nav>
        <h1 className="title-page mt-[13px]">The Card</h1>
        <p className="mx-auto mt-3 max-w-[560px] text-[14.4px]">Six numbered holes in 2027. Hole 1 is the core cap. Each hole after it is one numbered color, released on its date and never remade.</p>
      </header>
      <Suspense fallback={<div className="mt-10 h-80 bg-tile" aria-busy />}>
        <CardContent />
      </Suspense>
      <Suspense fallback={null}>
        <StoryTeaser />
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
      {next && <NextHole hole={next} />}
      <section aria-labelledby="holes-title" className="wrap py-12">
        <h2 id="holes-title" className="display-md">
          All six holes
        </h2>
        <ul className="mt-8 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {holes.map((h) => (
            <li key={h.hole}>
              <HoleCard hole={h} price={priceFor(c, h)} tile="4/3" />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

const priceFor = (c: RopeCatalog, h: Hole) => {
  const p = h.core ? c.core : c.editions.find((e) => e.handle === h.productHandle)
  return p ? price(p).amount : null
}

/** E.6.7 §2: the next hole as an editorial split. */
function NextHole({ hole }: { hole: Hole }) {
  const { time } = holeDate(hole.date)
  const d = shortDate(hole.date)
  return (
    <section aria-labelledby="next-title" className="mt-8 grid md:grid-cols-2">
      <div className="band-tile flex items-center justify-center px-4 py-12 md:p-12">
        <div className="flex w-full max-w-[420px] flex-col items-center text-center">
          <p className="eyebrow-sm">Next · Hole {pad2(hole.hole)}</p>
          <h2 id="next-title" className="display-xl mt-2">
            {hole.name}
          </h2>
          <p className="meta mt-3">
            {d ? `Opens ${d}${time ? `, ${time.replace(" PT", " Pacific")}` : ""}` : "Announced"}
            {hole.size ? ` · Edition of ${hole.size}` : ""}
          </p>
          <div className="mt-4">{hole.date && hole.status === "upcoming" ? <Countdown iso={hole.date} size="large" /> : <p className="font-heading text-[26px] font-bold">Announced</p>}</div>
          {hole.handle && (
            <div className="mt-6 w-full text-left">
              <TeeSheetForm releaseHandle={hole.handle} hole={hole.hole} name={hole.name} />
            </div>
          )}
        </div>
      </div>
      <div className="tile relative aspect-square">
        {hole.image ? (
          <Image src={hole.image} alt={`${hole.name}, Hole ${hole.hole}`} fill sizes="(min-width: 750px) 50vw, 100vw" className="tile-photo object-contain" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-display text-[96px] leading-none" aria-hidden>
            {pad2(hole.hole)}
          </span>
        )}
      </div>
    </section>
  )
}
