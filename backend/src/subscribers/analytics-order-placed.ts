import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { captureServerEvent, isPostHogConfigured, orderCompletedEvent } from "../lib/analytics"

/** Sends the authoritative `order_completed` event to PostHog (no-op without POSTHOG_API_KEY). */
export default async function analyticsOrderPlaced({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!isPostHogConfigured()) {
    return
  }
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "total",
        "currency_code",
        "customer_id",
        "metadata",
        "items.product_id",
        "items.variant_id",
        "items.variant_sku",
        "items.title",
        "items.quantity",
        "items.unit_price",
      ],
      filters: { id: data.id },
    })
    if (!orders[0]) {
      return
    }
    await captureServerEvent(orderCompletedEvent(orders[0] as any))
  } catch (e) {
    logger.warn(`[analytics] order_completed for ${data.id} failed: ${(e as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
