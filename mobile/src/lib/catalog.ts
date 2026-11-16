import type { HttpTypes } from "@medusajs/types"

import { PRODUCT_FIELDS } from "./config"
import { sdk } from "./medusa"
import { isOffer, type Product } from "./product"

export type Region = HttpTypes.StoreRegion
export type Category = { id: string; name: string; handle: string; description: string | null }

/** The seed creates a single US region; prefer one that ships to the US if there are several. */
export async function fetchDefaultRegion(): Promise<Region> {
  const { regions } = await sdk.store.region.list({ limit: 50 })
  if (!regions.length) throw new Error("The store has no regions configured yet.")
  return regions.find((r) => r.countries?.some((c) => c.iso_2 === "us")) ?? regions[0]
}

/** Every published product, offers included (screens filter them out of lists). */
export async function fetchCatalog(regionId: string): Promise<Product[]> {
  const { products } = await sdk.store.product.list({
    region_id: regionId,
    fields: PRODUCT_FIELDS,
    limit: 100,
  })
  return products
}

/** Products a shopper browses: offers stay out of lists (APP_SPEC §6.5). */
export function listable(products: Product[]): Product[] {
  return products.filter((p) => !isOffer(p))
}

export async function fetchCategories(): Promise<Category[]> {
  const { product_categories } = await sdk.store.category.list({
    fields: "id,name,handle,description",
    limit: 50,
  })
  return product_categories.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    description: c.description || null,
  }))
}

/** Only published products come back, so drop products appear once their release is live. */
export async function fetchProductsByIds(ids: string[], regionId: string): Promise<Product[]> {
  if (!ids.length) return []
  const { products } = await sdk.store.product.list({
    id: ids,
    region_id: regionId,
    fields: PRODUCT_FIELDS,
    limit: ids.length,
  })
  // Keep the merchandising order the release defined.
  const order = new Map(ids.map((id, i) => [id, i]))
  return [...products].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
}

export async function fetchProductByHandle(handle: string, regionId: string): Promise<Product | null> {
  const { products } = await sdk.store.product.list({
    handle,
    region_id: regionId,
    fields: PRODUCT_FIELDS,
    limit: 1,
  })
  return products[0] ?? null
}

export type ContentEpisode = {
  title: string
  asset_key: string
  subject: string | null
  post_url: string | null
  published_at: string | null
}

export type ContentSeries = {
  id: string
  title: string
  handle: string
  stance: string | null
  proof: string | null
  participation_prompt: string | null
  channel: string | null
  episodes: ContentEpisode[]
}

/** Active content series (GET /store/content-series). */
export async function fetchContentSeries(): Promise<ContentSeries[]> {
  const { series } = await sdk.client.fetch<{ series: ContentSeries[] }>("/store/content-series")
  return series ?? []
}
