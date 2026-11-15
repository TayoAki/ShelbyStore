import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { captureServerEvent, orderCompletedEvent } from "../lib/analytics"

/** Records the authoritative `order_completed` event in first-party analytics. */
export default async function analyticsOrderPlaced({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
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
    await captureServerEvent(container, orderCompletedEvent(orders[0] as any))
  } catch (e) {
    logger.warn(`[analytics] order_completed for ${data.id} failed: ${(e as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
