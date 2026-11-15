import { ATTRIBUTION_METADATA, ANALYTICS_EVENTS } from "./events"

type OrderRow = {
  id: string
  total?: unknown
  currency_code?: string | null
  email?: string | null
  customer_id?: string | null
  metadata?: Record<string, unknown> | null
  items?: {
    product_id?: string | null
    variant_id?: string | null
    variant_sku?: string | null
    title?: string | null
    quantity?: unknown
    unit_price?: unknown
  }[] | null
}

const num = (v: unknown) => {
  const n = typeof v === "number" ? v : Number((v as any)?.numeric ?? v)
  return Number.isFinite(n) ? n : 0
}
const str = (v: unknown) => (typeof v === "string" && v ? v : null)

/**
 * Builds the authoritative `order_completed` event from a Medusa order.
 * distinct_id prefers the client's analytics id (cart metadata `analytics_id`)
 * so the order joins the visitor's journey; then the customer, then the order.
 */
export function orderCompletedEvent(order: OrderRow) {
  const meta = order.metadata ?? {}
  const distinctId =
    str(meta[ATTRIBUTION_METADATA.analyticsId]) ??
    (order.customer_id ? `customer:${order.customer_id}` : `order:${order.id}`)

  return {
    event: ANALYTICS_EVENTS.orderCompleted,
    distinctId,
    insertId: `order_completed:${order.id}`,
    properties: {
      order_id: order.id,
      value: num(order.total),
      currency: (order.currency_code ?? "usd").toUpperCase(),
      asset: str(meta[ATTRIBUTION_METADATA.asset]),
      release_id: str(meta[ATTRIBUTION_METADATA.releaseId]),
      utm_source: str(meta[ATTRIBUTION_METADATA.utmSource]),
      utm_medium: str(meta[ATTRIBUTION_METADATA.utmMedium]),
      utm_campaign: str(meta[ATTRIBUTION_METADATA.utmCampaign]),
      items: (order.items ?? []).map((i) => ({
        product_id: i.product_id ?? null,
        variant_id: i.variant_id ?? null,
        sku: i.variant_sku ?? null,
        title: i.title ?? null,
        quantity: num(i.quantity),
        price: num(i.unit_price),
      })),
    },
  }
}
