import Image from "next/image"
import type { CSSProperties } from "react"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { price } from "@/lib/product"
import { capsIn, holeDate, pad2, type Hole } from "@/lib/rope"
import type { Product } from "@/lib/types"
import { Countdown } from "../countdown"
import { Digits } from "../digits"
import { TeeSheetForm } from "../tee-sheet-form"
import { SLEEVE_INK } from "./inks"

const lead = (c: string) => `/hats/rope-cap-${c.toLowerCase().replace(/\s+/g, "-")}-1.jpg`

/**
 * The box's back panel, part one: the six holes as numbered units on one
 * keylined plate, with the next hole's real countdown and tee sheet printed in
 * the sleeve-red stripe beside it.
 */
export function HolesPlate({ holes, next }: { holes: Hole[]; next: Hole | null }) {
  const liveEdition = holes.find((h) => !h.core && h.status === "live") ?? null
  return (
    <section aria-labelledby="holes-title" className="panel">
      <div className="relative flex flex-col gap-8 p-[var(--panel-pad)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="flex flex-col gap-3">
            <h2 id="holes-title" className="panel-title">
              Six holes in 2027.
            </h2>
            <p className="max-w-[56ch] text-[1.125rem] leading-[1.6]">
              Hole 1 is the cap, always in stock. Each hole after it is one numbered color on a date of the golf season, and we don&apos;t remake it.
            </p>
          </div>
          <Link href="/card" className="btn btn-outline-black w-fit" data-track="home_scorecard">
            The Card
          </Link>
        </div>

        <ol className="grid grid-cols-2 plate md:grid-cols-3 lg:grid-cols-6">
          {holes.map((h) => {
            const href = h.productHandle ? `/products/${h.productHandle}` : h.handle ? `/card/${h.handle}` : null
            const inner = (
              <>
                <span className="text-[2.5rem] leading-none" aria-hidden>
                  <Digits value={pad2(h.hole)} />
                </span>
                <span className="text-[1.0625rem] font-semibold">{h.name}</span>
                <span className="label !text-[11px] text-ink-2">{h.core ? "Always in stock" : holeDate(h.date).day ?? "Date to come"}</span>
                {h.size && !h.core && <span className="text-[0.875rem]">Edition of {h.size}</span>}
              </>
            )
            return (
              <li key={h.hole} className={`flex min-h-[10rem] flex-col gap-1.5 p-4 ${h.status === "live" && !h.core ? "bg-[#fbe9e7]" : "bg-paper"}`}>
                <span className="sr-only">Hole {h.hole}.</span>
                {href ? (
                  <Link href={href} data-track="card_hole" className="flex flex-1 flex-col gap-1.5 hover:underline">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            )
          })}
        </ol>

        {liveEdition && liveEdition.productHandle && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t-2 border-ink pt-6">
            <span className="badge-edition">Hole {liveEdition.hole} · Live</span>
            <span className="text-[1.125rem] font-semibold">
              {liveEdition.name}
              {liveEdition.size && liveEdition.left !== null ? `, ${liveEdition.left} of ${liveEdition.size} left` : ""}
            </span>
            <Link href={`/products/${liveEdition.productHandle}`} className="btn btn-secondary md:ml-auto" data-track="hero_shop_drop">
              Shop {liveEdition.name}
            </Link>
          </div>
        )}

        {next?.date && next.handle && (
          <div className="grid gap-6 border-t-2 border-ink pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-3">
                <span className="badge-edition">Hole {next.hole}</span>
                <span className="text-[1.125rem] font-semibold">
                  {next.name}, {holeDate(next.date).day} at {holeDate(next.date).time}
                </span>
              </p>
              <Countdown iso={next.date} />
            </div>
            <div className="max-w-[420px]">
              <TeeSheetForm releaseHandle={next.handle} hole={next.hole} name={next.name} tone="light" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}


/**
 * The box's back panel, part two: The Pair and The Foursome as sleeves. Each
 * is one inked panel with a die-cut window per cap in a row, and the price and
 * the button printed at the sleeve's foot.
 */
export function Sleeves({ pair, foursome, tracks = { pair: "home_pair", foursome: "home_foursome" } }: { pair: Product | null; foursome: Product | null; tracks?: { pair: string; foursome: string } }) {
  const sleeves = [
    pair && { p: pair, key: "pair" as const, title: "The Pair", sub: "Any two colors. One for the bag, one for the car.", href: "/offer/the-pair", track: tracks.pair, colors: ["Clubhouse Navy", "Pine"] },
    foursome && { p: foursome, key: "four" as const, title: "The Foursome", sub: "Four caps for the group trip, the outing or Father's Day.", href: "/offer/the-pair#foursome", track: tracks.foursome, colors: ["Tour White", "Clubhouse Navy", "Pine", "Fescue"] },
  ].filter(Boolean) as { p: Product; key: "pair" | "four"; title: string; sub: string; href: string; track: string; colors: string[] }[]
  if (!sleeves.length) return null
  return (
    <>
      {sleeves.map((s) => {
        const total = price(s.p).amount
        const each = total !== null ? total / capsIn(s.p) : null
        return (
          <section key={s.key} aria-labelledby={`sleeve-${s.key}`} className="panel ink-dark" style={SLEEVE_INK[s.key] as CSSProperties}>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch lg:gap-10">
              <div className={`grid gap-2 lg:order-2 ${s.colors.length === 4 ? "grid-cols-4" : "grid-cols-2"}`}>
                {s.colors.map((c) => (
                  <div key={c} className="window aspect-square">
                    <Image src={lead(c)} alt={`The Rope Cap in ${c}`} fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-contain p-[8%]" />
                    <span className="window-shade" aria-hidden />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <h2 id={`sleeve-${s.key}`} className="model !text-[clamp(2.5rem,2rem+2.4vw,4rem)]">
                  {s.title}
                </h2>
                <p className="spec-line">
                  {capsIn(s.p)} caps · {formatMoney(each)} a cap · ships free
                </p>
                <p className="max-w-[44ch] text-[1.0625rem] leading-7">{s.sub}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 border-t-[1.5px] border-dashed border-[color:var(--inner-crease,var(--color-crease))] pt-4">
                  <span className="figure text-[2.75rem]">{formatMoney(total)}</span>
                  <Link href={s.href} className="btn btn-on-ink ml-auto" data-track={s.track}>
                    Choose colors
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

export { lead as leadImage }
