import { cacheLife } from "next/cache"
import { getStock } from "./stock"
import { getRegion, listCatalog, listReleases } from "./catalog"
import { isOffer } from "../product"
import { buildHoles, isEdition, ROPE_CAP, totalStock, withinDays, type Hole } from "../rope"
import type { Product, Region, StoreRelease, VariantStock } from "../types"

export type RopeCatalog = {
  region: Region | null
  core: Product | null
  /** Published (live) numbered editions. */
  editions: Product[]
  pair: Product | null
  foursome: Product | null
  releases: StoreRelease[]
  holes: Hole[]
}

/** The cached catalog for v6 pages: one cap, its live editions, two bundles, the holes. */
export async function ropeCatalog(): Promise<RopeCatalog> {
  const region = await getRegion()
  const [releases, catalog] = await Promise.all([listReleases(), region ? listCatalog(region.id) : Promise.resolve([] as Product[])])
  return {
    region,
    core: catalog.find((p) => p.handle === ROPE_CAP) ?? null,
    editions: catalog.filter((p) => !isOffer(p) && isEdition(p)),
    pair: catalog.find((p) => p.handle === "the-pair") ?? null,
    foursome: catalog.find((p) => p.handle === "the-foursome") ?? null,
    releases,
    holes: buildHoles(releases),
  }
}

/** Live stock for the core cap and live editions, plus holes rebuilt with units left. */
export async function liveStock(c: RopeCatalog): Promise<{ stock: VariantStock; holes: Hole[] }> {
  const ids = [c.core, ...c.editions].filter(Boolean).map((p) => p!.id)
  const stock = ids.length ? await getStock(ids) : {}
  const byHandle = Object.fromEntries(c.editions.map((p) => [p.handle, totalStock(p, stock)]))
  return { stock, holes: buildHoles(c.releases, byHandle) }
}

/**
 * `withinDays` evaluated in the cache (refreshed hourly), so a page that shows
 * "coming soon" copy can still prerender: reading the clock during a prerender
 * is not allowed.
 */
export async function isWithinDays(iso: string | null, days: number): Promise<boolean> {
  "use cache"
  cacheLife("hours")
  return withinDays(iso, days)
}
