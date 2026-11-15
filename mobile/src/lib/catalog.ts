import type { HttpTypes } from "@medusajs/types"

import { PRODUCT_FIELDS } from "./config"
import { sdk } from "./medusa"
import type { Product } from "./product"

export type Region = HttpTypes.StoreRegion

/** The seed creates a single US region; prefer one that ships to the US if there are several. */
export async function fetchDefaultRegion(): Promise<Region> {
  const { regions } = await sdk.store.region.list({ limit: 50 })
  if (!regions.length) throw new Error("The store has no regions configured yet.")
  return regions.find((r) => r.countries?.some((c) => c.iso_2 === "us")) ?? regions[0]
}

export async function fetchCoreProducts(regionId: string): Promise<Product[]> {
  const { collections } = await sdk.store.collection.list({ handle: "core", limit: 1 })
  const core = collections[0]
  if (!core) return []
  const { products } = await sdk.store.product.list({
    collection_id: [core.id],
    region_id: regionId,
    fields: PRODUCT_FIELDS,
    limit: 50,
  })
  return products
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
