import type { Product, Variant, VariantStock } from "./types"

export const LOW_STOCK = 5
const SIZE_ORDER = ["ONE SIZE", "XXS", "XS", "S", "S/M", "M", "L", "L/XL", "XL", "XXL", "3XL"]

export type StockState = "in_stock" | "low" | "sold_out" | "untracked"

export function stockState(available: number | null | undefined): StockState {
  if (available === null) return "untracked"
  if (available === undefined || available <= 0) return "sold_out"
  return available <= LOW_STOCK ? "low" : "in_stock"
}

export type OptionGroup = { id: string; title: string; values: string[] }

/** Product options with values in a sensible order (sizes S→XXL). */
export function optionGroups(product: Product): OptionGroup[] {
  return (product.options ?? []).map((o) => {
    const values = [...new Set((o.values ?? []).map((v) => v.value))]
    if (/size/i.test(o.title)) {
      values.sort((a, b) => rank(a) - rank(b))
    }
    return { id: o.id, title: o.title, values }
  })
}
const rank = (v: string) => {
  const i = SIZE_ORDER.indexOf(v.toUpperCase())
  return i === -1 ? 99 : i
}

export function variantOptions(v: Variant): Record<string, string> {
  const out: Record<string, string> = {}
  for (const o of v.options ?? []) {
    const title = (o as { option?: { title?: string } }).option?.title
    if (title) out[title] = o.value
  }
  return out
}

export function findVariant(product: Product, selection: Record<string, string>): Variant | undefined {
  return (product.variants ?? []).find((v) => {
    const opts = variantOptions(v)
    return Object.entries(selection).every(([k, val]) => opts[k] === val)
  })
}

export function price(product: Product, variant?: Variant) {
  const v = variant ?? product.variants?.[0]
  const cp = v?.calculated_price
  return {
    amount: cp?.calculated_amount ?? null,
    original: cp?.original_amount ?? null,
    currency: cp?.currency_code ?? "usd",
  }
}

/** Availability for each value of `optionTitle`, given the other selected options. */
export function valueAvailability(
  product: Product,
  stock: VariantStock,
  optionTitle: string,
  selection: Record<string, string>
): Record<string, StockState> {
  const out: Record<string, StockState> = {}
  for (const v of product.variants ?? []) {
    const opts = variantOptions(v)
    const matchesOthers = Object.entries(selection).every(([k, val]) => k === optionTitle || opts[k] === val)
    if (!matchesOthers || !opts[optionTitle]) continue
    const state = stockState(v.id in stock ? stock[v.id] : undefined)
    const prev = out[opts[optionTitle]]
    // Best availability wins when several variants share the value.
    const order: StockState[] = ["sold_out", "low", "in_stock", "untracked"]
    if (!prev || order.indexOf(state) > order.indexOf(prev)) out[opts[optionTitle]] = state
  }
  return out
}

/**
 * Demo photos are stored as absolute URLs to the storefront's own /hats folder
 * (see backend seed). Serve those as local paths so next/image doesn't fetch
 * them over the network, whatever domain the seed recorded.
 */
export function imageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    return u.pathname.startsWith("/hats/") ? u.pathname : url
  } catch {
    return url
  }
}

type WithImages = { images?: { id: string; url: string; rank?: number | null }[] | null }

/**
 * Gallery for one colour: the images linked to that colour's variants (Medusa
 * variant images), then the product images not linked to any variant. With no
 * colour, or a colour without its own images, every product image.
 */
export function imagesFor(product: Product, color?: string | null): string[] {
  const all = [...(product.images ?? [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  const linked = new Set<string>()
  const mine = new Set<string>()
  for (const v of product.variants ?? []) {
    const ids = ((v as WithImages).images ?? []).map((i) => i.id)
    ids.forEach((id) => linked.add(id))
    if (color && variantOptions(v)[colorOption(product) ?? ""] === color) ids.forEach((id) => mine.add(id))
  }
  const urls = (list: typeof all) => list.map((i) => imageUrl(i.url)).filter((u): u is string => !!u)
  if (!color || !mine.size) return urls(all)
  return [...urls(all.filter((i) => mine.has(i.id))), ...urls(all.filter((i) => !linked.has(i.id)))]
}

/** The colour option's title ("Color" / "Colour"), if the product has one. */
export function colorOption(product: Product): string | null {
  return (product.options ?? []).find((o) => /colou?r/i.test(o.title))?.title ?? null
}

/** First image of each colour, for swatches and card colour previews. */
export function colorThumbs(product: Product): { color: string; image: string | null }[] {
  const title = colorOption(product)
  if (!title) return []
  const group = optionGroups(product).find((g) => g.title === title)
  return (group?.values ?? []).map((color) => ({ color, image: imagesFor(product, color)[0] ?? null }))
}

/** Spec lines from product metadata.details, e.g. { Crown: "...", Brim: "..." }. */
export function detailsOf(product: Product): [string, string][] {
  const v = (product.metadata as Record<string, unknown> | null)?.details
  if (!v || typeof v !== "object" || Array.isArray(v)) return []
  return Object.entries(v as Record<string, unknown>).filter(
    (e): e is [string, string] => typeof e[1] === "string" && !!e[1].trim()
  )
}

export const meta = (product: Product, key: "promise" | "fit_notes") => {
  const value = (product.metadata as Record<string, unknown> | null)?.[key]
  return typeof value === "string" && value.trim() ? value : null
}

export type SizeChart = { unit?: string; columns: string[]; rows: Record<string, string | number>[] }

export function sizeChartOf(product: Product): SizeChart | null {
  const v = (product.metadata as Record<string, unknown> | null)?.size_chart
  return !!v && typeof v === "object" && Array.isArray((v as SizeChart).columns) && Array.isArray((v as SizeChart).rows)
    ? (v as SizeChart)
    : null
}

export function modelInfoOf(product: Product): string | null {
  const v = (product.metadata as Record<string, unknown> | null)?.model_info
  return typeof v === "string" && v.trim() ? v : null
}
