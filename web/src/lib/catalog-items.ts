import { imagesFor, imageUrl, isOffer, offerOf, price } from "./product"
import { CORE_COLORS, editionOf, ROPE_CAP, ropeName } from "./rope"
import type { Product } from "./types"

/**
 * The search index and "Previously Viewed" list (SITE_SPEC G.6.1): one entry
 * per colourway of The Rope Cap, each live edition and both bundles.
 */
export type CatalogItem = {
  key: string
  handle: string
  href: string
  title: string
  /** Search terms and the meta line: colour, rope, "Hole 2", "Bundle". */
  meta: string
  terms: string
  image: string | null
  image2: string | null
  price: number | null
  currency: string
}

export function catalogItems(products: Product[]): CatalogItem[] {
  const items: CatalogItem[] = []
  for (const p of products) {
    const pr = price(p)
    if (p.handle === ROPE_CAP) {
      for (const color of CORE_COLORS) {
        const gallery = imagesFor(p, color)
        const rope = ropeName(p, color)
        items.push({
          key: `${p.handle}:${color}`,
          handle: p.handle,
          href: `/products/${p.handle}?color=${encodeURIComponent(color)}`,
          title: p.title,
          meta: `${color}${rope ? ` · ${rope} rope` : ""}`,
          terms: `${p.title} ${color} ${rope ?? ""} rope cap core`,
          image: gallery[0] ?? imageUrl(p.thumbnail),
          image2: gallery[2] ?? gallery[1] ?? null,
          price: pr.amount,
          currency: pr.currency,
        })
      }
      continue
    }
    const gallery = imagesFor(p)
    const ed = editionOf(p)
    const offer = isOffer(p) ? offerOf(p) : null
    items.push({
      key: p.handle,
      handle: p.handle,
      href: offer ? offer.path : `/products/${p.handle}`,
      title: p.title,
      meta: offer ? "Bundle" : ed && ed.hole > 1 ? `Hole ${ed.hole} · limited edition` : "",
      terms: `${p.title} ${offer ? "bundle pair foursome" : ""} ${ed ? `hole ${ed.hole} limited edition` : ""}`,
      image: gallery[0] ?? imageUrl(p.thumbnail),
      image2: gallery[2] ?? gallery[1] ?? null,
      price: pr.amount,
      currency: pr.currency,
    })
  }
  return items
}
