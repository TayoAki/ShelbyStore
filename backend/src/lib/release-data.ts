import { RemoteQueryFunction } from "@medusajs/framework/types"
import {
  getTotalVariantAvailability,
  getVariantAvailability,
} from "@medusajs/framework/utils"
import { ScorecardLine, VariantStock } from "./playbook"

type Query = Omit<RemoteQueryFunction, symbol>

export const CORE_COLLECTION_HANDLE = "core"

type VariantRow = {
  id: string
  title: string | null
  manage_inventory?: boolean | null
  allow_backorder?: boolean | null
  metadata?: Record<string, unknown> | null
}
type ProductRow = {
  id: string
  title: string
  variants?: VariantRow[] | null
}

const VARIANT_FIELDS = [
  "id",
  "title",
  "variants.id",
  "variants.title",
  "variants.manage_inventory",
  "variants.allow_backorder",
  "variants.metadata",
]

async function defaultSalesChannelId(query: Query): Promise<string | null> {
  const { data } = await query.graph({
    entity: "store",
    fields: ["default_sales_channel_id"],
  })
  return (data?.[0] as any)?.default_sales_channel_id ?? null
}

/** Sellable stock per variant in the storefront's sales channel. */
export async function loadVariantStock(
  query: Query,
  products: ProductRow[]
): Promise<VariantStock[]> {
  const variants = products.flatMap((p) =>
    (p.variants ?? []).map((v) => ({ product: p, variant: v }))
  )
  if (!variants.length) {
    return []
  }
  const variant_ids = variants.map((v) => v.variant.id)
  const salesChannelId = await defaultSalesChannelId(query)
  const availability = salesChannelId
    ? await getVariantAvailability(query, { variant_ids, sales_channel_id: salesChannelId })
    : await getTotalVariantAvailability(query, { variant_ids })

  return variants.map(({ product, variant }) => {
    const untracked = variant.manage_inventory === false || variant.allow_backorder === true
    return {
      variant_id: variant.id,
      product_title: product.title,
      variant_title: variant.title ?? variant.id,
      available: untracked ? null : availability[variant.id]?.availability ?? 0,
    }
  })
}

/** Release with its linked products (and their variants). */
export async function loadReleaseWithProducts(query: Query, releaseId: string) {
  const { data } = await query.graph({
    entity: "release",
    fields: [
      "*",
      "products.id",
      "products.title",
      "products.handle",
      "products.status",
      "products.thumbnail",
      ...VARIANT_FIELDS.slice(2).map((f) => `products.${f}`),
    ],
    filters: { id: releaseId },
  })
  return (data?.[0] as any) ?? null
}

/** Stock for every variant in the core collection (the signature basics). */
export async function loadCoreStock(query: Query): Promise<VariantStock[]> {
  const { data } = await query.graph({
    entity: "product_collection",
    fields: VARIANT_FIELDS.map((f) => `products.${f}`),
    filters: { handle: CORE_COLLECTION_HANDLE },
  })
  const products = ((data?.[0] as any)?.products ?? []) as ProductRow[]
  return loadVariantStock(query, products)
}

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : Number((v as any)?.numeric ?? v)
  return Number.isFinite(n) ? n : 0
}

/** variant_id → metadata.unit_cost, used for release contribution. */
export function unitCostsFrom(products: ProductRow[]) {
  const costs: Record<string, number | null> = {}
  for (const p of products) {
    for (const v of p.variants ?? []) {
      const raw = v.metadata?.unit_cost
      const cost = raw === undefined || raw === null || raw === "" ? NaN : Number(raw)
      costs[v.id] = Number.isFinite(cost) ? cost : null
    }
  }
  return costs
}

/**
 * What the customer paid for a line, net of discounts and excluding tax.
 * Computed from raw fields because Query doesn't return computed item totals.
 */
export function lineNetAmount(item: {
  unit_price?: unknown
  quantity?: unknown
  is_tax_inclusive?: boolean | null
  adjustments?: { amount?: unknown }[] | null
  tax_lines?: { rate?: unknown }[] | null
}): number {
  const gross = num(item.unit_price) * num(item.quantity)
  const discounts = (item.adjustments ?? []).reduce((sum, a) => sum + num(a?.amount), 0)
  const net = gross - discounts
  if (!item.is_tax_inclusive) {
    return net
  }
  const rate = (item.tax_lines ?? []).reduce((sum, t) => sum + num(t?.rate), 0)
  return net / (1 + rate / 100)
}

/** Order lines for the release's products, placed since go-live. */
export async function loadScorecardLines(
  query: Query,
  productIds: string[],
  since: Date
): Promise<ScorecardLine[]> {
  if (!productIds.length) {
    return []
  }
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "status",
      "metadata",
      "items.id",
      "items.product_id",
      "items.variant_id",
      "items.quantity",
      "items.unit_price",
      "items.is_tax_inclusive",
      "items.adjustments.amount",
      "items.tax_lines.rate",
      "items.detail.return_received_quantity",
    ],
    filters: { created_at: { $gte: since } },
  })

  const productSet = new Set(productIds)
  const lines: ScorecardLine[] = []
  for (const order of orders as any[]) {
    if (order.status === "canceled" || order.status === "draft") {
      continue
    }
    const asset = typeof order.metadata?.asset === "string" ? order.metadata.asset : null
    for (const item of order.items ?? []) {
      if (!item?.product_id || !productSet.has(item.product_id)) {
        continue
      }
      lines.push({
        order_id: order.id,
        variant_id: item.variant_id ?? null,
        quantity: num(item.quantity),
        returned_quantity: num(item.detail?.return_received_quantity),
        net_amount: lineNetAmount(item),
        asset,
      })
    }
  }
  return lines
}
