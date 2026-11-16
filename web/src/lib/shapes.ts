import { colorThumbs, imagesFor, imageUrl, price, shapeOf } from "./product"
import type { Category, Product } from "./types"

/** One shape (product category) with what the menu and tiles need (SITE_SPEC §6.0, §6.1.2). */
export type Shape = {
  name: string
  handle: string
  description: string | null
  count: number
  from: number | null
  currency: string
  image: string | null
}

/**
 * Shapes in category order, each with its product count, lowest price and the
 * lead product's first photo (core products lead). Shapes without published
 * products are left out.
 */
export function shapesFrom(categories: Category[], products: Product[]): Shape[] {
  return categories
    .map((c): Shape | null => {
      const items = products.filter((p) => shapeOf(p)?.handle === c.handle)
      if (!items.length) return null
      const lead = [...items].sort((a, b) => Number(b.collection?.handle === "core") - Number(a.collection?.handle === "core"))[0]
      const prices = items.map((p) => price(p)).filter((p) => p.amount !== null)
      const from = prices.length ? Math.min(...prices.map((p) => p.amount as number)) : null
      return {
        name: c.name,
        handle: c.handle,
        description: c.description || null,
        count: items.length,
        from,
        currency: prices[0]?.currency ?? "usd",
        image: imagesFor(lead, colorThumbs(lead)[0]?.color)[0] ?? imageUrl(lead.thumbnail),
      }
    })
    .filter((s): s is Shape => s !== null)
}

/** One line per shape for the shop header and the fit guide. */
export const SHAPE_COPY: Record<string, string> = {
  caps: "Six-panel caps, from our low, unstructured Everyday Cap to sized performance styles.",
  truckers: "Structured fronts and mesh backs that breathe, with a snap you can adjust.",
  beanies: "Rib-knit beanies in a soft merino blend. One size, wear them cuffed or slouched.",
  "bucket-hats": "Soft canvas bucket hats that pack flat and spring back.",
}
