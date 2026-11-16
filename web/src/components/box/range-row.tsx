import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { colorThumbs, imagesFor, price } from "@/lib/product"
import { CORE_COLORS, editionOf, holeDate, type Hole } from "@/lib/rope"
import type { Product } from "@/lib/types"

/**
 * The back panel's range row: the other core inks and the numbered editions,
 * each a die-cut window onto that cap with its name and price (or, before
 * release, its date) printed under it. One row of windows, not a grid of product cards.
 */
export function RangeRow({ core, editions, holes = [], exclude, active }: { core: Product | null; editions: Product[]; holes?: Hole[]; exclude: Product; active: string | null }) {
  const items: { key: string; href: string; image: string | null; name: string; meta: string; tag: string | null }[] = []
  if (core)
    for (const col of CORE_COLORS)
      if (!(core.id === exclude.id && col === active))
        items.push({ key: `core-${col}`, href: `/products/${core.handle}?color=${encodeURIComponent(col)}`, image: imagesFor(core, col)[0] ?? null, name: col, meta: formatMoney(price(core).amount), tag: null })
  for (const e of editions) {
    if (e.id === exclude.id) continue
    const ed = editionOf(e)
    const thumb = colorThumbs(e)[0]
    items.push({ key: e.handle ?? e.id, href: `/products/${e.handle}`, image: thumb?.image ?? imagesFor(e)[0] ?? null, name: thumb?.color ?? e.title, meta: formatMoney(price(e).amount), tag: ed ? `Hole ${ed.hole}` : "Numbered" })
  }
  // Numbered editions not yet on sale: their window links to the hole's page and prints its date.
  for (const h of holes) {
    if (h.core || !h.image || !h.handle || h.status !== "upcoming") continue
    if (editions.some((e) => e.handle === h.productHandle) || h.productHandle === exclude.handle) continue
    items.push({ key: `hole-${h.hole}`, href: `/card/${h.handle}`, image: h.image, name: h.name, meta: holeDate(h.date).day ?? "Date to come", tag: `Hole ${h.hole}` })
  }
  if (!items.length) return null
  return (
    <section aria-labelledby="range-title" className="panel">
      <div className="flex flex-col gap-6 p-[var(--panel-pad)]">
        <h2 id="range-title" className="panel-title">
          The rest of the range
        </h2>
        <ul className="grid grid-cols-3 gap-x-3 gap-y-6 md:grid-cols-6">
          {items.map((it) => (
            <li key={it.key}>
              <Link href={it.href} data-track="pdp_also_like" className="group flex flex-col gap-2">
                <span className="window block aspect-square">
                  {it.image && <Image src={it.image} alt={`The Rope Cap in ${it.name}`} fill sizes="(min-width: 768px) 14vw, 30vw" className="object-contain p-[8%]" />}
                  <span className="window-shade" aria-hidden />
                </span>
                <span className="font-model text-[1.25rem] leading-none font-[800] uppercase group-hover:underline">{it.name}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className={it.meta.startsWith("$") ? "figure text-[1.125rem]" : "label"}>{it.meta}</span>
                  {it.tag && <span className="badge-edition">{it.tag}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
