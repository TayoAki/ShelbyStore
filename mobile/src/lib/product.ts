import type { HttpTypes } from "@medusajs/types"

import { colourways as COLOURWAYS } from "@/constants/theme"

import { LOW_STOCK_THRESHOLD, STOREFRONT_URL } from "./config"

export type Product = HttpTypes.StoreProduct
export type Variant = HttpTypes.StoreProductVariant

export type StockState = "in_stock" | "low" | "sold_out"

type Meta = Record<string, unknown>
const metaOf = (product: Product | null | undefined): Meta => (product?.metadata ?? {}) as Meta
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null)

// --- Images -----------------------------------------------------------------------

/**
 * Demo photos are stored as absolute URLs to the web storefront's /hats folder,
 * recorded with whatever domain the backend seed saw. Resolve the path against
 * this build's storefront so devices load them from the right host.
 */
export function imageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const match = /^https?:\/\/[^/]+(\/hats\/.*)$/.exec(url)
  if (match) return `${STOREFRONT_URL}${match[1]}`
  if (url.startsWith("/hats/")) return `${STOREFRONT_URL}${url}`
  return url
}

/** A storefront image path (e.g. "lifestyle-hero-mobile.jpg") as a full URL. */
export const hatImage = (file: string) => `${STOREFRONT_URL}/hats/${file}`

type ImageRow = { id: string; url: string; rank?: number | null }
type VariantWithImages = Variant & { images?: ImageRow[] | null }

// --- Options ----------------------------------------------------------------------

const SIZE_ORDER = ["ONE SIZE", "XXS", "XS", "S", "S/M", "M", "L", "L/XL", "XL", "XXL", "2XL", "XXXL", "3XL"]

export function isSizeOption(option: { title?: string | null }): boolean {
  return /size/i.test(option.title ?? "")
}

export function sortOptionValues(values: string[], isSize: boolean): string[] {
  const unique = Array.from(new Set(values))
  if (!isSize) return unique
  return unique.sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase())
    const ib = SIZE_ORDER.indexOf(b.toUpperCase())
    if (ia === -1 && ib === -1) return a.localeCompare(b, undefined, { numeric: true })
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

export type ProductOptionModel = { id: string; title: string; isSize: boolean; values: string[] }

/** Options in display order: colours (or "First cap" / "Second cap") first, then Size. */
export function productOptions(product: Product): ProductOptionModel[] {
  const options = (product.options ?? []).map((option) => {
    const isSize = isSizeOption(option)
    const fromOption = (option.values ?? []).map((v) => v.value)
    const fromVariants = (product.variants ?? []).flatMap((variant) =>
      (variant.options ?? []).filter((o) => o.option_id === option.id).map((o) => o.value)
    )
    return {
      id: option.id,
      title: option.title ?? "Option",
      isSize,
      values: sortOptionValues(fromOption.length ? fromOption : fromVariants, isSize),
    }
  })
  // Colours (or the two-pack's "First cap" then "Second cap") before Size.
  const order = (o: ProductOptionModel) => (o.isSize ? 3 : /^second/i.test(o.title) ? 2 : /^first/i.test(o.title) ? 1 : 0)
  return options.sort((a, b) => order(a) - order(b))
}

export function sizeOptionOf(product: Product): ProductOptionModel | undefined {
  return productOptions(product).find((o) => o.isSize)
}

/** The single colour option ("Color"), if the product has one. */
export function colorOptionOf(product: Product): ProductOptionModel | undefined {
  return productOptions(product).find((o) => /colou?r/i.test(o.title))
}

export function variantOptionMap(variant: Variant): Record<string, string> {
  const map: Record<string, string> = {}
  for (const o of variant.options ?? []) {
    if (o.option_id) map[o.option_id] = o.value
  }
  return map
}

/** The variant matching every selected option, if the selection is complete. */
export function findVariant(product: Product, selected: Record<string, string>): Variant | undefined {
  const optionIds = (product.options ?? []).map((o) => o.id)
  if (optionIds.some((id) => !selected[id])) return undefined
  return (product.variants ?? []).find((variant) => {
    const map = variantOptionMap(variant)
    return optionIds.every((id) => map[id] === selected[id])
  })
}

/** One-size hats have no size choice to make (APP_SPEC §6.2). */
export function isOneSize(product: Product): boolean {
  const size = sizeOptionOf(product)
  return !size || size.values.length <= 1
}

// --- Stock and price ----------------------------------------------------------------

/**
 * Variants that don't track inventory (or allow backorder) are always purchasable.
 * Medusa only returns `inventory_quantity` for managed variants; for the two-pack
 * (an inventory kit) it already reflects the core caps' stock.
 */
export function variantStock(variant: Variant): { state: StockState; quantity: number | null } {
  const v = variant as Variant & { manage_inventory?: boolean | null; allow_backorder?: boolean | null }
  if (v.manage_inventory === false || v.allow_backorder) return { state: "in_stock", quantity: null }
  const qty = typeof v.inventory_quantity === "number" ? v.inventory_quantity : null
  if (qty === null) return { state: "in_stock", quantity: null }
  if (qty <= 0) return { state: "sold_out", quantity: 0 }
  if (qty <= LOW_STOCK_THRESHOLD) return { state: "low", quantity: qty }
  return { state: "in_stock", quantity: qty }
}

export function variantPrice(variant: Variant): { amount: number; currency: string } | null {
  const price = variant.calculated_price
  if (!price || price.calculated_amount === null || price.calculated_amount === undefined) return null
  return { amount: Number(price.calculated_amount), currency: price.currency_code ?? "usd" }
}

/** Lowest variant price, so cards can say "$38" (or "From $38" when prices differ). */
export function productPrice(product: Product): { amount: number; currency: string; varies: boolean } | null {
  const prices = (product.variants ?? []).map(variantPrice).filter((p): p is NonNullable<typeof p> => !!p)
  if (!prices.length) return null
  const min = prices.reduce((a, b) => (b.amount < a.amount ? b : a))
  return { ...min, varies: prices.some((p) => p.amount !== min.amount) }
}

/**
 * Stock for one option value given the rest of the selection, e.g. "is L/XL available in Stone?".
 * Values that no variant offers come back as sold out.
 */
export function valueStock(
  product: Product,
  optionId: string,
  value: string,
  selected: Record<string, string>
): { state: StockState; quantity: number | null } {
  const candidates = (product.variants ?? []).filter((variant) => {
    const map = variantOptionMap(variant)
    if (map[optionId] !== value) return false
    return Object.entries(selected).every(([id, val]) => id === optionId || !val || map[id] === val)
  })
  if (!candidates.length) return { state: "sold_out", quantity: 0 }
  const stocks = candidates.map(variantStock)
  const best =
    stocks.find((s) => s.state === "in_stock") ?? stocks.find((s) => s.state === "low") ?? stocks[0]
  return best
}

/** Total sellable count per colour (for "In Stock Today"); null when untracked. */
export function colorCounts(product: Product): { color: string; quantity: number | null; state: StockState }[] {
  const color = colorOptionOf(product)
  if (!color) return []
  return color.values.map((value) => {
    const variants = (product.variants ?? []).filter((v) => variantOptionMap(v)[color.id] === value)
    const stocks = variants.map(variantStock)
    const tracked = stocks.filter((s) => s.quantity !== null)
    const quantity = tracked.length ? tracked.reduce((n, s) => n + (s.quantity ?? 0), 0) : null
    const state: StockState =
      quantity === null ? "in_stock" : quantity <= 0 ? "sold_out" : quantity <= LOW_STOCK_THRESHOLD ? "low" : "in_stock"
    return { color: value, quantity, state }
  })
}

/** Card badge for stock: every variant still in stock has 5 or fewer left (an honest count). */
export function isLowStock(product: Product): boolean {
  const counts = (product.variants ?? [])
    .map((v) => variantStock(v).quantity)
    .filter((n): n is number => typeof n === "number" && n > 0)
  return counts.length > 0 && counts.every((n) => n <= LOW_STOCK_THRESHOLD)
}

/** Pre-select the first in-stock colour; sizes stay unpicked unless the hat is one-size. */
export function defaultSelection(product: Product, preferColor?: string | null): Record<string, string> {
  const variants = product.variants ?? []
  const color = colorOptionOf(product)
  const pool =
    preferColor && color ? variants.filter((v) => variantOptionMap(v)[color.id] === preferColor) : variants
  const firstAvailable =
    pool.find((v) => variantStock(v).state !== "sold_out") ?? pool[0] ?? variants.find((v) => variantStock(v).state !== "sold_out") ?? variants[0]
  if (!firstAvailable) return {}
  const map = variantOptionMap(firstAvailable)
  for (const option of productOptions(product)) {
    if (option.isSize && option.values.length > 1) delete map[option.id]
  }
  return map
}

// --- Per-colour photos --------------------------------------------------------------

/**
 * Gallery for one colour: the images linked to that colour's variants (Medusa
 * variant images), then the product images not linked to any variant. With no
 * colour, or a colour without its own images, every product image.
 */
export function imagesFor(product: Product, color?: string | null): string[] {
  const all = [...((product.images ?? []) as ImageRow[])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  const colorId = colorOptionOf(product)?.id
  const linked = new Set<string>()
  const mine = new Set<string>()
  for (const v of (product.variants ?? []) as VariantWithImages[]) {
    const ids = (v.images ?? []).map((i) => i.id)
    ids.forEach((id) => linked.add(id))
    if (color && colorId && variantOptionMap(v)[colorId] === color) ids.forEach((id) => mine.add(id))
  }
  const urls = (list: ImageRow[]) => list.map((i) => imageUrl(i.url)).filter((u): u is string => !!u)
  const out = !color || !mine.size ? urls(all) : [...urls(all.filter((i) => mine.has(i.id))), ...urls(all.filter((i) => !linked.has(i.id)))]
  if (!out.length) {
    const thumb = imageUrl(product.thumbnail)
    if (thumb) out.push(thumb)
  }
  return Array.from(new Set(out))
}

/** First image of each colour, for swatches and colour tiles. */
export function colorThumbs(product: Product): { color: string; image: string | null }[] {
  const color = colorOptionOf(product)
  if (!color) return []
  return color.values.map((value) => ({ color: value, image: imagesFor(product, value)[0] ?? null }))
}

/** The first colour's photos lead on cards. */
export function cardImages(product: Product): string[] {
  const first = colorOptionOf(product)?.values[0]
  return imagesFor(product, first).slice(0, 6)
}

/** The lead photo of a colour (two-pack: each pick's single-cap photo). */
export function leadImageFor(product: Product, color: string): string | null {
  return imagesFor(product, color)[0] ?? null
}

// --- Copy and facts -------------------------------------------------------------------

export function productMeta(product: Product): { promise: string | null; fitNotes: string | null } {
  const meta = metaOf(product)
  return { promise: str(meta.promise), fitNotes: str(meta.fit_notes) }
}

/** Spec lines from product metadata.details, in a fixed order (JSON keeps no key order). */
export function detailsOf(product: Product): [string, string][] {
  const v = metaOf(product).details
  if (!v || typeof v !== "object" || Array.isArray(v)) return []
  const ORDER = ["Crown", "Panels", "Rope", "Brim", "Closure", "Fabric", "Sweatband", "Origin", "Care"]
  const at = (k: string) => (ORDER.indexOf(k) === -1 ? ORDER.length : ORDER.indexOf(k))
  return Object.entries(v as Meta)
    .filter((e): e is [string, string] => typeof e[1] === "string" && !!e[1].trim())
    .sort((a, b) => at(a[0]) - at(b[0]))
}

export type FitProfile = {
  crown: "Low" | "Mid" | "Tall"
  structure: "Unstructured" | "Semi-structured" | "Structured"
}

export function fitProfileOf(product: Product): FitProfile | null {
  const v = metaOf(product).fit_profile as Partial<FitProfile> | undefined
  if (!v || typeof v !== "object") return null
  const crowns = ["Low", "Mid", "Tall"]
  const structures = ["Unstructured", "Semi-structured", "Structured"]
  return crowns.includes(v.crown ?? "") && structures.includes(v.structure ?? "") ? (v as FitProfile) : null
}

export type SizeChart = { unit?: string; columns: string[]; rows: Record<string, string | number>[] }

export function sizeChartOf(product: Product): SizeChart | null {
  const v = metaOf(product).size_chart
  return !!v && typeof v === "object" && Array.isArray((v as SizeChart).columns) && Array.isArray((v as SizeChart).rows)
    ? (v as SizeChart)
    : null
}

const DEFAULT_RANGE = "21.5–23.75 in (55–60 cm)"
const CM_PER_IN = 2.54

/** The adjustable range for a one-size hat, from fit_notes when it states one. */
export function oneSizeRange(product: Product): string {
  const notes = productMeta(product).fitNotes ?? ""
  const m = /(\d+(?:\.\d+)?)\s*(?:to|–|-)\s*(\d+(?:\.\d+)?)\s*inch/i.exec(notes)
  if (!m) return DEFAULT_RANGE
  const [a, b] = [Number(m[1]), Number(m[2])]
  return `${m[1]}–${m[2]} in (${Math.round(a * CM_PER_IN)}–${Math.round(b * CM_PER_IN)} cm)`
}

// --- Editions, rope and colourways (v6) --------------------------------------------

export type Edition = { hole: number; size: number | null; numberedInside: boolean }

/** metadata.edition: { hole, size, numbered_inside } (web G.8). Hole 1 is the core cap. */
export function editionOf(product: Product | null | undefined): Edition | null {
  const v = metaOf(product).edition as { hole?: unknown; size?: unknown; numbered_inside?: unknown } | undefined
  if (!v || typeof v !== "object" || typeof v.hole !== "number") return null
  return { hole: v.hole, size: typeof v.size === "number" ? v.size : null, numberedInside: v.numbered_inside === true }
}

/** A numbered limited edition (Hole 2 and later). */
export function isEdition(product: Product | null | undefined): boolean {
  const e = editionOf(product)
  return !!e && e.hole >= 2
}

/** "11–11.5" from metadata.crown_cm. */
export function crownCmOf(product: Product): string | null {
  return str(metaOf(product).crown_cm)
}

/** Rope colour name for a colourway: metadata.rope, else the design table. */
export function ropeNameFor(product: Product | null | undefined, colourway: string | null | undefined): string | null {
  if (!colourway) return null
  const rope = metaOf(product).rope as Record<string, unknown> | undefined
  const own = rope && typeof rope === "object" ? str(rope[colourway]) : null
  return own ?? COLOURWAYS[colourway]?.ropeName ?? null
}

/** The colourway of an edition (its single colour value), or the selected colour. */
export function colourOfVariant(product: Product, variant: Variant | undefined): string | null {
  const id = colorOptionOf(product)?.id
  if (!variant || !id) return null
  return variantOptionMap(variant)[id] ?? null
}

/** "Tour White" → "White", "Clubhouse Navy" → "Navy" for compact line meta ("Navy + Pine"). */
export function shortColour(name: string): string {
  const map: Record<string, string> = { "Tour White": "White", "Clubhouse Navy": "Navy" }
  return map[name] ?? name
}

// --- Bundles: The Pair and The Foursome ----------------------------------------------

export function isOffer(product: Product | null | undefined): boolean {
  return metaOf(product).offer === true
}

export function offerSingleHandle(product: Product): string | null {
  return str(metaOf(product).single_handle)
}

/** Caps in a bundle: the-pair 2, the-foursome 4 (metadata.caps when present). */
export function capsIn(product: Product): number {
  const caps = metaOf(product).caps
  if (typeof caps === "number" && caps > 0) return caps
  return /foursome|four/i.test(product.handle ?? "") ? 4 : 2
}

/** Bundles built on `handle` (the Rope Cap → The Pair, The Foursome). */
export function offersFor(products: Product[], handle: string | null | undefined): Product[] {
  if (!handle) return []
  return products.filter((p) => isOffer(p) && offerSingleHandle(p) === handle).sort((a, b) => capsIn(a) - capsIn(b))
}

export function offerFor(products: Product[], handle: string | null | undefined): Product | null {
  return offersFor(products, handle)[0] ?? null
}

/**
 * Live anchor for a bundle: caps × the single's price. Hidden when there's no
 * saving (web G.6.5).
 */
export function offerSaving(
  offer: Product,
  single: Product | null
): { anchor: number; saving: number; price: number; perCap: number; caps: number } | null {
  const price = productPrice(offer)?.amount
  const singlePrice = single ? productPrice(single)?.amount : undefined
  if (price === undefined || singlePrice === undefined) return null
  const caps = capsIn(offer)
  const anchor = singlePrice * caps
  const saving = anchor - price
  return saving > 0 ? { anchor, saving, price, perCap: Math.round((price / caps) * 100) / 100, caps } : null
}

/**
 * Line meta for the bag and order (web G.6.8): Pair "Navy + Pine", Foursome
 * "4 × Pine" or "One of each", singles "Pine / One Size".
 */
export function lineMeta(product: Product | undefined, line: { variant_title?: string | null; variant_id?: string | null }): string {
  const variant = product?.variants?.find((v) => v.id === line.variant_id)
  if (product && variant && isOffer(product)) {
    const values = (variant.options ?? []).map((o) => o.value).filter(Boolean)
    if (capsIn(product) === 4) {
      const v = values[0] ?? line.variant_title ?? ""
      return /each/i.test(v) ? "One of each" : v.replace(/x/i, "×")
    }
    return values.map(shortColour).join(" + ")
  }
  return line.variant_title ?? ""
}

/**
 * The photo for a cart or order line: the line's variant's own image (its
 * colour; for the two-pack, the first pick), else the line thumbnail. Medusa
 * fills line thumbnails from the product, which is always the first colour.
 */
export function lineImage(
  products: Product[] | undefined,
  line: { product_id?: string | null; variant_id?: string | null; thumbnail?: string | null }
): string | null {
  const product = products?.find((p) => p.id === line.product_id)
  const variant = product?.variants?.find((v) => v.id === line.variant_id) as VariantWithImages | undefined
  if (product && variant) {
    const own = [...(variant.images ?? [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))[0]
    if (own) return imageUrl(own.url)
    const colorId = colorOptionOf(product)?.id
    const color = colorId ? variantOptionMap(variant)[colorId] : null
    if (color) return imagesFor(product, color)[0] ?? imageUrl(line.thumbnail)
  }
  return imageUrl(line.thumbnail)
}
