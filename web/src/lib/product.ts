import type { Product, Variant } from "./types"

export const LOW_STOCK = 5
const SIZE_ORDER = ["ONE SIZE", "XXS", "XS", "S", "S/M", "M", "L", "L/XL", "XL", "XXL", "3XL"]

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

export const meta = (product: Product, key: "promise" | "fit_notes") => {
  const value = (product.metadata as Record<string, unknown> | null)?.[key]
  return typeof value === "string" && value.trim() ? value : null
}

export type FitProfile = {
  crown: "Low" | "Mid" | "Tall"
  structure: "Unstructured" | "Semi-structured" | "Structured"
}

/** metadata.fit_profile, for the crown-height and structure scales (SITE_SPEC §6.4.10). */
export function fitProfileOf(product: Product): FitProfile | null {
  const v = (product.metadata as Record<string, unknown> | null)?.fit_profile as Partial<FitProfile> | undefined
  if (!v || typeof v !== "object") return null
  const crowns = ["Low", "Mid", "Tall"]
  const structures = ["Unstructured", "Semi-structured", "Structured"]
  return crowns.includes(v.crown ?? "") && structures.includes(v.structure ?? "") ? (v as FitProfile) : null
}

/**
 * variant id → the first photo of that variant's colour, for bag and order
 * lines. A variant with its own images (e.g. a two-pack's first colour) uses those.
 */
export function variantThumbs(products: Product[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const product of products) {
    const title = colorOption(product)
    for (const v of product.variants ?? []) {
      const own = imageUrl((v as WithImages).images?.[0]?.url)
      const img = own ?? imagesFor(product, title ? variantOptions(v)[title] : null)[0]
      if (img) out[v.id] = img
    }
  }
  return out
}

// --- Offers (SITE_SPEC §12.1) -------------------------------------------------

export type OfferMeta = { path: string; singleHandle: string | null; compareAt: number | null }

/** An offer product (e.g. the two-pack): sold on its own landing page, not in the catalog. */
export function offerOf(product: Product): OfferMeta | null {
  const md = (product.metadata ?? {}) as Record<string, unknown>
  if (md.offer !== true) return null
  return {
    path: typeof md.offer_path === "string" ? md.offer_path : `/offer/${product.handle}`,
    singleHandle: typeof md.single_handle === "string" ? md.single_handle : null,
    compareAt: typeof md.compare_at === "number" ? md.compare_at : null,
  }
}

export const isOffer = (product: Product) => offerOf(product) !== null
