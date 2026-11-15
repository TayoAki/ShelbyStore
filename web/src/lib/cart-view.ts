import type { Line } from "@/components/line-item"
import type { Cart } from "./types"

export function cartLines(cart: Cart): Line[] {
  return (cart.items ?? [])
    .slice()
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    .map((i) => ({
      id: i.id,
      title: i.product_title ?? i.title,
      variant: i.variant_title ?? i.subtitle ?? null,
      handle: i.product_handle ?? i.product?.handle ?? null,
      thumbnail: i.thumbnail ?? null,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price ?? 0),
      currency: cart.currency_code,
    }))
}
