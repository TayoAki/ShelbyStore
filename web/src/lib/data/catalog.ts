import "server-only"
import { cacheLife, cacheTag } from "next/cache"
import { sdk } from "../medusa"
import type { Product, Region, StoreRelease } from "../types"

/**
 * Catalog reads are cached ("use cache") and shared by every visitor, so pages
 * render from a fast static shell. Stock is NOT read here: it changes with
 * every order and is fetched at request time (see ./stock.ts).
 *
 * Errors are caught so a backend hiccup degrades to an empty section instead of
 * failing the page; the short cache life means it recovers within a minute.
 */

export const CORE_COLLECTION_HANDLE = "core"

const PRODUCT_FIELDS = "*variants.calculated_price,*variants.options,*variants.images,*options,*options.values,*images,+metadata,*collection"

export async function getRegion(): Promise<Region | null> {
  "use cache"
  cacheLife("hours")
  cacheTag("regions")
  try {
    const { regions } = await sdk.store.region.list({ limit: 1 })
    return regions[0] ?? null
  } catch {
    return null
  }
}

export async function listCoreProducts(regionId: string): Promise<Product[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")
  try {
    const { collections } = await sdk.store.collection.list({ handle: CORE_COLLECTION_HANDLE })
    const core = collections[0]
    if (!core) return []
    const { products } = await sdk.store.product.list({
      collection_id: [core.id],
      region_id: regionId,
      fields: PRODUCT_FIELDS,
      limit: 24,
    })
    return products
  } catch {
    return []
  }
}

export async function listProducts(regionId: string): Promise<Product[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")
  try {
    const { products } = await sdk.store.product.list({
      region_id: regionId,
      fields: PRODUCT_FIELDS,
      limit: 100,
    })
    return products
  } catch {
    return []
  }
}

export async function getProduct(handle: string, regionId: string): Promise<Product | null> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products", `product:${handle}`)
  try {
    const { products } = await sdk.store.product.list({
      handle,
      region_id: regionId,
      fields: PRODUCT_FIELDS,
      limit: 1,
    })
    return products[0] ?? null
  } catch {
    return null
  }
}

export async function listReleases(): Promise<StoreRelease[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("releases")
  try {
    const { releases } = await sdk.client.fetch<{ releases: StoreRelease[] }>("/store/releases")
    return releases
  } catch {
    return []
  }
}

export async function getRelease(handle: string): Promise<StoreRelease | null> {
  "use cache"
  cacheLife("minutes")
  cacheTag("releases", `release:${handle}`)
  try {
    const { release } = await sdk.client.fetch<{ release: StoreRelease }>(
      `/store/releases/${encodeURIComponent(handle)}`
    )
    return release
  } catch {
    return null
  }
}

/** product id → live release, for "From the drop" badges and cart attribution. */
export async function liveReleaseIndex(): Promise<Record<string, Pick<StoreRelease, "id" | "handle" | "title">>> {
  const releases = await listReleases()
  const index: Record<string, Pick<StoreRelease, "id" | "handle" | "title">> = {}
  for (const r of releases) {
    if (r.phase !== "live") continue
    for (const p of r.products) index[p.id] = { id: r.id, handle: r.handle, title: r.title }
  }
  return index
}
