import type { HttpTypes } from "@medusajs/types"

export type Product = HttpTypes.StoreProduct
export type Variant = HttpTypes.StoreProductVariant
export type Cart = HttpTypes.StoreCart
export type Region = HttpTypes.StoreRegion
export type Category = HttpTypes.StoreProductCategory

/** Shape returned by the backend's custom /store/releases routes. */
export type StoreRelease = {
  id: string
  handle: string
  title: string
  tier: "major" | "light"
  phase: "live" | "upcoming" | "past"
  release_at: string | null
  published_at: string | null
  story: string | null
  product_promise: string | null
  proof: string | null
  hero_image: string | null
  products: {
    id: string
    handle: string
    title: string
    thumbnail: string | null
    /** Public edition facts (hole number, edition size); present for rope-cap holes. */
    edition?: { hole: number; size: number | null } | null
  }[]
}

/** Live stock per variant, fetched at request time. null = not tracked (always available). */
export type VariantStock = Record<string, number | null>

/** Where a visit came from: `?asset=` deep links and UTM params (see src/proxy.ts). */
export type Attribution = {
  asset?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}
