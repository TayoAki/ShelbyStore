import { ANNOUNCED_HOLES } from "./holes"
import { colorway, COLORWAYS } from "./swatches"
import type { Product, StoreRelease, VariantStock } from "./types"

/** The one product (SITE_SPEC G.1). */
export const ROPE_CAP = "rope-cap"
export const CORE_COLORS = ["Tour White", "Clubhouse Navy", "Pine", "Fescue"] as const
export const ONE_SIZE_RANGE = "21.5–23.75 in (55–60 cm)"

const meta = (p: Product | null | undefined) => (p?.metadata ?? {}) as Record<string, unknown>

/** Numbered-edition facts from product metadata (G.8): hole, size, numbered_inside. */
export function editionOf(p: Product | null | undefined): { hole: number; size: number | null; numberedInside: boolean } | null {
  const e = meta(p).edition as { hole?: unknown; size?: unknown; numbered_inside?: unknown } | undefined
  if (!e || typeof e.hole !== "number") return null
  return { hole: e.hole, size: typeof e.size === "number" ? e.size : null, numberedInside: e.numbered_inside === true }
}

/** A limited edition (Hole 2+), as opposed to the core cap (Hole 1) or a bundle. */
export const isEdition = (p: Product) => (editionOf(p)?.hole ?? 1) > 1

/** Rope colour name for a colourway (metadata.rope, else the swatch table). */
export function ropeName(p: Product | null | undefined, color: string | null | undefined): string | null {
  if (!color) return null
  const rope = meta(p).rope as Record<string, string> | undefined
  return rope?.[color] ?? (COLORWAYS[color] ? colorway(color).ropeName : null)
}

export const crownCm = (p: Product | null | undefined) => (typeof meta(p).crown_cm === "string" ? (meta(p).crown_cm as string) : null)

/** Caps in a bundle (metadata.caps): 2 for The Pair, 4 for The Foursome. */
export const capsIn = (p: Product | null | undefined) => (typeof meta(p).caps === "number" ? (meta(p).caps as number) : 1)

/** Sum of live stock over a product's variants; null when none is tracked. */
export function totalStock(p: Product, stock: VariantStock | undefined): number | null {
  if (!stock) return null
  let total = 0
  let tracked = false
  for (const v of p.variants ?? []) {
    const n = stock[v.id]
    if (typeof n === "number") {
      total += n
      tracked = true
    }
  }
  return tracked ? total : null
}

export type HoleStatus = "live" | "upcoming" | "announced" | "sold_out" | "ended"

export type Hole = {
  hole: number
  name: string
  /** /card/[handle] (releases only). */
  handle: string | null
  /** The edition's PDP when it is on sale. */
  productHandle: string | null
  status: HoleStatus
  /** ISO date of the release (null while held / not set). */
  date: string | null
  size: number | null
  left: number | null
  image: string | null
  promise: string | null
  moment: string | null
  core: boolean
}

const nameFrom = (title: string) => title.replace(/^Hole \d+:\s*/, "").replace(/^The /, "")

/**
 * The 2027 card (G.6.7): Holes 1–4 from releases (hole number and size from
 * the products' public edition facts), Holes 5–6 announced from holes.ts.
 * `stockByHandle` gives live sellable stock for editions on sale.
 */
export function buildHoles(releases: StoreRelease[], stockByHandle: Record<string, number | null> = {}): Hole[] {
  const holes: Hole[] = []
  for (const r of releases) {
    const p = r.products.find((x) => x.edition?.hole)
    if (!p?.edition) continue
    const n = p.edition.hole
    const left = stockByHandle[p.handle] ?? null
    let status: HoleStatus = r.phase === "live" ? "live" : r.phase === "past" ? "ended" : "upcoming"
    if (status === "live" && n > 1 && left === 0) status = "sold_out"
    holes.push({
      hole: n,
      name: n === 1 ? "The Rope Cap" : nameFrom(r.title),
      handle: r.handle,
      productHandle: r.phase === "live" ? p.handle : null,
      status,
      date: r.release_at ?? r.published_at,
      size: p.edition.size,
      left: n > 1 && r.phase === "live" ? left : null,
      image: r.hero_image ?? p.thumbnail,
      promise: r.product_promise,
      moment: null,
      core: n === 1,
    })
  }
  for (const a of ANNOUNCED_HOLES) {
    if (holes.some((h) => h.hole === a.hole)) continue
    holes.push({
      hole: a.hole,
      name: a.name,
      handle: null,
      productHandle: null,
      status: "announced",
      date: a.date,
      size: null,
      left: null,
      image: null,
      promise: a.note,
      moment: a.moment,
      core: false,
    })
  }
  return holes.sort((a, b) => a.hole - b.hole)
}

/** The soonest upcoming hole with a real release date (countdowns, ticker item 1). */
export const nextHole = (holes: Hole[]) =>
  holes
    .filter((h) => h.status === "upcoming" && h.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())[0] ?? null

export const pad2 = (n: number) => String(n).padStart(2, "0")

/** True when `iso` is in the future and no more than `days` away. */
export function withinDays(iso: string | null, days: number) {
  if (!iso) return false
  const ms = Date.parse(iso) - Date.now()
  return ms > 0 && ms < days * 86400000
}

/** "05 APR 2027" and "10:00 AM PT" in the store's timezone. */
export function holeDate(iso: string | null, tz = "America/Los_Angeles") {
  if (!iso) return { day: null as string | null, time: null as string | null }
  const d = new Date(iso)
  const day = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: tz })
    .format(d)
    .toUpperCase()
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }).format(d) + " PT"
  return { day, time }
}
