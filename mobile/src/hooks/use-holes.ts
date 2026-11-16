import { useMemo } from "react"

import { CORE_COLOURWAYS, colourwaySlug } from "@/constants/theme"
import { HOLES, holeByRelease, parseHoleTitle, type HoleConfig } from "@/lib/holes"
import { POLICY } from "@/lib/policy"
import { colorCounts, editionOf, hatImage, imagesFor, productPrice, variantStock, type Product } from "@/lib/product"
import type { StoreRelease } from "@/lib/types"

import { useCatalog } from "./use-products"
import { useReleases } from "./use-releases"

export type HoleStatus = "live" | "upcoming" | "announced" | "sold_out" | "ended"

export type Hole = {
  number: number
  name: string
  config: HoleConfig | null
  release: StoreRelease | null
  product: Product | null
  status: HoleStatus
  /** A real release_at: the only thing a countdown may count to. */
  releaseAt: string | null
  /** release_at, else the announced date (no countdown). */
  dateIso: string | null
  editionSize: number | null
  left: number | null
  price: number | null
  image: string | null
  colourway: string | null
  promise: string | null
  /** Route handle for /card/[handle] (null for announced holes). */
  handle: string | null
}

const sum = (ns: (number | null)[]) =>
  ns.some((n) => n !== null) ? ns.reduce<number>((a, n) => a + (n ?? 0), 0) : null

/** Live sellable units across a product's variants (null when untracked). */
export function unitsLeft(product: Product | null): number | null {
  if (!product) return null
  return sum((product.variants ?? []).map((v) => variantStock(v).quantity))
}

/**
 * Holes 1–6 (APP_SPEC G.5 Card): releases give the phase and the real date,
 * published products give stock and price, `holes.ts` fills in the rest.
 */
export function useHoles() {
  const releases = useReleases()
  const catalog = useCatalog()

  const holes = useMemo<Hole[]>(() => {
    const all = releases.data?.all ?? []
    const products = catalog.data ?? []
    const out: Hole[] = HOLES.map((config) => {
      const release = config.releaseHandle ? all.find((r) => r.handle === config.releaseHandle) ?? null : null
      const productHandle = config.productHandle ?? release?.products[0]?.handle ?? null
      const product = productHandle ? products.find((p) => p.handle === productHandle) ?? null : null
      const edition = editionOf(product)
      const left = config.number === 1 ? null : unitsLeft(product)
      let status: HoleStatus = "announced"
      if (release) {
        if (release.phase === "live") status = left === 0 ? "sold_out" : "live"
        else if (release.phase === "upcoming") status = "upcoming"
        else status = "ended"
      } else if (config.number === 1 && product) status = "live"
      const releaseAt = release?.phase === "upcoming" ? release.release_at : null
      const image =
        config.number === 1
          ? hatImage("rope-cap-tour-white-1.jpg")
          : product
            ? imagesFor(product)[0] ?? null
            : config.colourway
              ? hatImage(`rope-cap-${colourwaySlug(config.colourway)}-1.jpg`)
              : release?.hero_image ?? null
      return {
        number: config.number,
        name: config.name,
        config,
        release,
        product,
        status,
        releaseAt,
        dateIso: release?.release_at ?? config.announcedAt,
        editionSize: edition?.size ?? config.editionSize,
        left,
        price: product ? productPrice(product)?.amount ?? null : null,
        image,
        colourway: config.colourway,
        promise: release?.product_promise ?? config.promise,
        handle: release?.handle ?? null,
      }
    })
    // Releases that aren't on the static card yet (a new hole added in the admin).
    for (const release of all) {
      if (holeByRelease(release.handle)) continue
      const parsed = parseHoleTitle(release.title)
      if (!parsed || out.some((h) => h.number === parsed.number)) continue
      const productHandle = release.products[0]?.handle
      const product = productHandle ? products.find((p) => p.handle === productHandle) ?? null : null
      out.push({
        number: parsed.number,
        name: parsed.name,
        config: null,
        release,
        product,
        status: release.phase === "live" ? "live" : release.phase === "upcoming" ? "upcoming" : "ended",
        releaseAt: release.phase === "upcoming" ? release.release_at : null,
        dateIso: release.release_at,
        editionSize: editionOf(product)?.size ?? null,
        left: unitsLeft(product),
        price: product ? productPrice(product)?.amount ?? null : null,
        image: release.hero_image ?? release.products[0]?.thumbnail ?? null,
        colourway: null,
        promise: release.product_promise,
        handle: release.handle,
      })
    }
    return out.sort((a, b) => a.number - b.number)
  }, [catalog.data, releases.data])

  const next = holes.find((h) => h.status === "upcoming" && h.releaseAt) ?? null
  const liveEditions = holes.filter((h) => h.number >= 2 && h.status === "live")
  return {
    holes,
    next,
    liveEditions,
    isLoading: releases.isLoading || catalog.isLoading,
    error: releases.error ?? catalog.error,
  }
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

/** Day, month and year in the store timezone (Pacific). */
function pacificParts(d: Date): { day: string; month: string; year: string; time: string } | null {
  try {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "numeric",
        day: "2-digit",
      })
        .formatToParts(d)
        .map((p) => [p.type, p.value])
    )
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" })
    return { day: parts.day, month: MONTHS[Number(parts.month) - 1], year: parts.year, time: time.toUpperCase() }
  } catch {
    return null
  }
}

/** "05 APR 2027 · 10:00 AM PT" (Pacific, the store timezone). */
export function holeDate(iso: string | null | undefined): string {
  if (!iso) return "DATE TO COME"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "DATE TO COME"
  const p = pacificParts(d)
  return p ? `${p.day} ${p.month} ${p.year} · ${p.time} PT` : d.toISOString().slice(0, 10)
}

/** "05 APR" for limited-swatch captions. */
export function holeDay(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const p = pacificParts(d)
  return p ? `${p.day} ${p.month}` : ""
}

export type TickerItem = { key: string; text: string; href: string | null }

/**
 * The leaderboard ticker (web G.5.3): real data only, in this order. Each
 * item is hidden when its source is empty.
 */
export function useTickerItems(): TickerItem[] {
  const { holes, next } = useHoles()
  const catalog = useCatalog()
  return useMemo(() => {
    const items: TickerItem[] = []
    if (next) {
      items.push({
        key: "next",
        text: `Hole ${next.number} · ${next.name} · ${holeDate(next.releaseAt)}`,
        href: next.handle ? `/card/${next.handle}` : null,
      })
    }
    for (const h of holes) {
      if (h.number < 2) continue
      if (h.status === "live" && h.left !== null && h.editionSize) {
        items.push({
          key: `live-${h.number}`,
          text: `${h.name} · ${h.left} of ${h.editionSize} left`,
          href: h.handle ? `/card/${h.handle}` : null,
        })
      } else if (h.status === "upcoming" && h.editionSize) {
        items.push({
          key: `up-${h.number}`,
          text: `${h.name} · Edition of ${h.editionSize}`,
          href: h.handle ? `/card/${h.handle}` : null,
        })
      }
    }
    const core = (catalog.data ?? []).find((p) => p.handle === "rope-cap")
    if (core) {
      const price = productPrice(core)?.amount
      const inStock = colorCounts(core).filter(
        (c) => (CORE_COLOURWAYS as readonly string[]).includes(c.color) && c.state !== "sold_out"
      ).length
      if (price !== undefined && inStock > 0) {
        items.push({
          key: "core",
          text: `The Rope Cap · $${price} · ${inStock} core colors in stock`,
          href: "/products/rope-cap",
        })
      }
    }
    items.push({ key: "ship", text: `Free shipping on $${POLICY.freeShippingThreshold}+`, href: null })
    items.push({ key: "returns", text: POLICY.returns, href: null })
    return items
  }, [catalog.data, holes, next])
}
