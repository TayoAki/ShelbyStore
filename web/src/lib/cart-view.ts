import type { Line } from "@/components/line-item"
import { imageUrl } from "./product"
import type { Cart } from "./types"

/**
 * Bag lines. `thumbs` maps variant id → that colour's first photo (see
 * variantThumbs), so a navy cap shows navy; Medusa's line thumbnail is the
 * product's.
 */
export function cartLines(cart: Cart, thumbs: Record<string, string> = {}): Line[] {
  return (cart.items ?? [])
    .slice()
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    .map((i) => ({
      id: i.id,
      title: i.product_title ?? i.title,
      variant: i.variant_title ?? i.subtitle ?? null,
      handle: i.product_handle ?? i.product?.handle ?? null,
      thumbnail: (i.variant_id && thumbs[i.variant_id]) || imageUrl(i.thumbnail),
      quantity: i.quantity,
      unitPrice: Number(i.unit_price ?? 0),
      currency: cart.currency_code,
    }))
}
