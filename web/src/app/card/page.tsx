import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Countdown } from "@/components/countdown"
import { Digits } from "@/components/digits"
import { HoleCard } from "@/components/hole-card"
import { TeeSheetForm } from "@/components/tee-sheet-form"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { price } from "@/lib/product"
import { colorway } from "@/lib/swatches"
import { holeDate, nextHole, pad2, type Hole } from "@/lib/rope"

export const metadata: Metadata = {
  title: "The Card",
  description: "Six numbered holes in 2027. Hole 1 is the core cap; each hole after it is one numbered color, released on its date.",
}

/**
 * The Card: the drop calendar and archive, printed as the box's back panel.
 * The next hole's panel is printed in that colourway's own ink with its real
 * countdown and tee sheet; then all six holes as numbered units on one plate.
 * Sold-out and ended holes stay in place.
 */
export default function CardPage() {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-6 md:gap-6 md:px-6 md:pt-10">
      <nav aria-label="Breadcrumb" className="label !text-[12px] text-ink-2">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / The Card
      </nav>
      <div className="flex flex-col gap-3">
        <h1 className="model">The Card</h1>
        <p className="max-w-[60ch] text-[1.125rem] leading-[1.6]">Six numbered holes in 2027. Hole 1 is the core cap. Each hole after it is one numbered color, released on its date and not remade.</p>
      </div>
      <Suspense fallback={<div className="h-80 animate-pulse bg-wash" />}>
        <CardContent />
      </Suspense>
    </div>
  )
}

async function CardContent() {
  const c = await ropeCatalog()
  const { holes } = await liveStock(c)
  const next = nextHole(holes)
  return (
    <>
      {next && <NextPanel hole={next} />}
      <section aria-labelledby="holes-title" className="flex flex-col gap-4">
        <h2 id="holes-title" className="panel-title">
          All six holes
        </h2>
        <div className="grid plate sm:grid-cols-2 lg:grid-cols-3">
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

function NextPanel({ hole }: { hole: Hole }) {
  const { day, time } = holeDate(hole.date)
  const ink = colorway(hole.name)
  return (
    <section
      aria-labelledby="next-title"
      className={`panel ${ink.light ? "" : "ink-dark"}`}
      style={{ "--panel-bg": ink.panel, "--panel-ink": ink.ink, "--panel-line": ink.edge, "--window-edge": ink.edge } as React.CSSProperties}
    >
      <span className="panel-inner" aria-hidden />
      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-8 p-[var(--panel-pad)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center">
        <div className="window aspect-square">
          {hole.image && <Image src={hole.image} alt={`${hole.name}, Hole ${hole.hole}`} fill sizes="(min-width: 768px) 40vw, 92vw" className="object-contain p-[8%]" />}
          <span className="window-shade" aria-hidden />
        </div>
        <div className="flex flex-col gap-5">
          <h2 id="next-title" className="flex items-end gap-4">
            <span className="text-[4.5rem] leading-[.8]" aria-hidden>
              <Digits value={pad2(hole.hole)} />
            </span>
            <span className="model !text-[clamp(3rem,2rem+4vw,5.5rem)]">{hole.name}</span>
          </h2>
          <p className="flex flex-wrap items-center gap-3">
            <span className="badge-edition">Next · Hole {hole.hole}</span>
            {hole.size && <span className="label">Edition of {hole.size}</span>}
          </p>
          <p className="spec-line">
            {day}
            {time ? ` · ${time}` : ""}
          </p>
          {hole.date && <Countdown iso={hole.date} size="large" />}
          {hole.handle && (
            <div className="max-w-[440px]">
              <TeeSheetForm releaseHandle={hole.handle} hole={hole.hole} name={hole.name} tone={ink.light ? "light" : "dark"} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
