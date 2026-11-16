import { colorThumbs, imagesFor, imageUrl, price, productTypeOf, shapeOf } from "./product"
import type { Product } from "./types"

/**
 * The small product list the header's search and "Previously Viewed" render
 * from (SITE_SPEC §6.0.4, §6.0.5): browsable products only, no offers.
 */
export type CatalogItem = {
  handle: string
  title: string
  shape: string | null
  type: string
  colors: string[]
  image: string | null
  image2: string | null
  price: number | null
  currency: string
}

export function catalogItems(products: Product[]): CatalogItem[] {
  return products.map((p) => {
    const colors = colorThumbs(p).map((c) => c.color)
    const gallery = imagesFor(p, colors[0])
    const pr = price(p)
    return {
      handle: p.handle,
      title: p.title,
      shape: shapeOf(p)?.name ?? null,
      type: productTypeOf(p),
      colors,
      image: gallery[0] ?? imageUrl(p.thumbnail),
      image2: gallery[1] ?? null,
      price: pr.amount,
      currency: pr.currency,
    }
  })
}
