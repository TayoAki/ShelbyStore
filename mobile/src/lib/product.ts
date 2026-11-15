import type { HttpTypes } from "@medusajs/types"

import { LOW_STOCK_THRESHOLD } from "./config"

export type Product = HttpTypes.StoreProduct
export type Variant = HttpTypes.StoreProductVariant

export type StockState = "in_stock" | "low" | "sold_out"

/**
 * Variants that don't track inventory (or allow backorder) are always purchasable.
 * Medusa only returns `inventory_quantity` for managed variants.
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

/** Lowest variant price, so cards can say "$32" (or "From $32" when prices differ). */
export function productPrice(product: Product): { amount: number; currency: string; varies: boolean } | null {
  const prices = (product.variants ?? []).map(variantPrice).filter((p): p is NonNullable<typeof p> => !!p)
  if (!prices.length) return null
  const min = prices.reduce((a, b) => (b.amount < a.amount ? b : a))
  return { ...min, varies: prices.some((p) => p.amount !== min.amount) }
}

export function productMeta(product: Product): { promise: string | null; fitNotes: string | null } {
  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null)
  return { promise: str(meta.promise), fitNotes: str(meta.fit_notes) }
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL"]

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

/** Options in display order: non-size attributes (Color) first, then Size. */
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
  return options.sort((a, b) => Number(a.isSize) - Number(b.isSize))
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

/**
 * Stock for one option value given the rest of the selection, e.g. "is M available in Black?".
 * Values that no variant offers come back as sold out.
 */
export function valueStock(
  product: Product,
  optionId: string,
  value: string,
  selected: Record<string, string>
): StockState {
  const candidates = (product.variants ?? []).filter((variant) => {
    const map = variantOptionMap(variant)
    if (map[optionId] !== value) return false
    return Object.entries(selected).every(([id, val]) => id === optionId || !val || map[id] === val)
  })
  if (!candidates.length) return "sold_out"
  const states = candidates.map((v) => variantStock(v).state)
  if (states.includes("in_stock")) return "in_stock"
  if (states.includes("low")) return "low"
  return "sold_out"
}

/** Size-level availability across all colors, for the core "always in stock" strip. */
export function sizeAvailability(product: Product): { size: string; state: StockState }[] {
  const sizeOption = productOptions(product).find((o) => o.isSize)
  if (!sizeOption) return []
  return sizeOption.values.map((size) => ({
    size,
    state: valueStock(product, sizeOption.id, size, {}),
  }))
}

/** Pre-select the first in-stock combination so the add button is usable immediately. */
export function defaultSelection(product: Product): Record<string, string> {
  const variants = product.variants ?? []
  const firstAvailable = variants.find((v) => variantStock(v).state !== "sold_out") ?? variants[0]
  if (!firstAvailable) return {}
  const map = variantOptionMap(firstAvailable)
  // Leave size unselected so shoppers consciously pick it, unless it's one-size.
  for (const option of productOptions(product)) {
    if (option.isSize && option.values.length > 1) delete map[option.id]
  }
  return map
}

export function productImages(product: Product): string[] {
  const urls = (product.images ?? []).map((i) => i.url).filter(Boolean) as string[]
  if (!urls.length && product.thumbnail) urls.push(product.thumbnail)
  return urls
}
