import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { colorThumbs, imagesFor, price } from "@/lib/product"
import { CORE_COLORS, editionOf, pad2, type Hole } from "@/lib/rope"
import type { Product } from "@/lib/types"
import { shortDate } from "./hole-card"
import { Rail } from "./rail"

/**
 * "You may also like" (SITE_SPEC v8 E.6.3, Eastside's Rebuy recs): the other
 * core colours, the numbered editions (and upcoming holes with a photo), and
 * the Pair, as 4:5 cards in a rail. `pdp_also_like` on every card.
 */
export function AlsoLike({ core, editions, holes = [], pair = null, exclude, active }: { core: Product | null; editions: Product[]; holes?: Hole[]; pair?: Product | null; exclude: Product; active: string | null }) {
  const items: { key: string; href: string; image: string | null; name: string; meta: string }[] = []
  if (core)
    for (const col of CORE_COLORS)
      if (!(core.id === exclude.id && col === active))
        items.push({ key: `core-${col}`, href: `/products/${core.handle}?color=${encodeURIComponent(col)}`, image: imagesFor(core, col)[0] ?? null, name: `${col} Rope Cap`, meta: formatMoney(price(core).amount) })
  for (const e of editions) {
    if (e.id === exclude.id) continue
    const ed = editionOf(e)
    const thumb = colorThumbs(e)[0]
    items.push({ key: e.handle ?? e.id, href: `/products/${e.handle}`, image: thumb?.image ?? imagesFor(e)[0] ?? null, name: ed ? `No. ${pad2(ed.hole)} ${thumb?.color ?? e.title}` : e.title, meta: formatMoney(price(e).amount) })
  }
  for (const h of holes) {
    if (h.core || !h.image || !h.handle || h.status !== "upcoming") continue
    if (editions.some((e) => e.handle === h.productHandle) || h.productHandle === exclude.handle) continue
    const d = shortDate(h.date)
    items.push({ key: `hole-${h.hole}`, href: `/card/${h.handle}`, image: h.image, name: `No. ${pad2(h.hole)} ${h.name}`, meta: d ? `Opens ${d}` : "Date to come" })
  }
  if (pair && exclude.id !== pair.id) items.push({ key: "pair", href: "/offer/the-pair", image: imagesFor(core ?? pair, "Clubhouse Navy")[0] ?? null, name: "The Pair", meta: `${formatMoney(price(pair).amount)} · any two colors` })
  if (!items.length) return null
  return (
    <section aria-labelledby="also-like" className="pt-10 pb-12">
      <h2 id="also-like" className="heading-recs wrap">
        You may also like
      </h2>
      <Rail label="You may also like" className="mt-6" itemClass="[grid-auto-columns:164px] md:[grid-auto-columns:278px]">
        {items.map((it) => (
          <li key={it.key}>
            <Link href={it.href} data-track="pdp_also_like" className="card block">
              <span className="tile relative block aspect-[4/5]">{it.image && <Image src={it.image} alt="" fill sizes="(min-width: 750px) 278px, 164px" className="tile-photo object-contain" />}</span>
              <span className="mt-2 block px-2 text-[14px] font-medium">{it.name}</span>
              <span className="tabular block px-2 text-[14px] text-text">{it.meta}</span>
            </Link>
          </li>
        ))}
      </Rail>
    </section>
  )
}
