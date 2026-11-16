import "server-only"
import { cacheLife, cacheTag } from "next/cache"
import { sdk } from "../medusa"
import { imageUrl } from "../product"
import type { Product, Region, StoreRelease } from "../types"

/**
 * Catalog reads are cached ("use cache") and shared by every visitor, so pages
 * render from a fast static shell. Stock is NOT read here: it changes with
 * every order and is fetched at request time (see ./stock.ts).
 *
 * Errors are caught so a backend hiccup degrades to an empty section instead of
 * failing the page; the short cache life means it recovers within a minute.
 */

const PRODUCT_FIELDS = "*variants.calculated_price,*variants.options,*variants.images,*options,*options.values,*images,+metadata,*collection,*categories"

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

/**
 * Every published product, offers included (e.g. the two-pack). Use for
 * variant lookups (bag, checkout and order thumbnails); browsing surfaces use
 * listProducts.
 */
export async function listCatalog(regionId: string): Promise<Product[]> {
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
    return releases.map(localImages)
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
    return localImages(release)
  } catch {
    return null
  }
}

/** Demo photos are stored as absolute URLs to this site; serve them as local paths. */
function localImages(r: StoreRelease): StoreRelease {
  return {
    ...r,
    hero_image: imageUrl(r.hero_image),
    products: r.products.map((p) => ({ ...p, thumbnail: imageUrl(p.thumbnail) })),
  }
}
