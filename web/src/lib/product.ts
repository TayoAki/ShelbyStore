import type { Product, Variant, VariantStock } from "./types"

export const LOW_STOCK = 5
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"]

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

export const meta = (product: Product, key: "promise" | "fit_notes") => {
  const value = (product.metadata as Record<string, unknown> | null)?.[key]
  return typeof value === "string" && value.trim() ? value : null
}
