import "server-only"
import { sdk } from "../medusa"
import type { VariantStock } from "../types"

/**
 * Live sellable stock per variant, read at request time (never cached).
 * Showing real stock by size is the brand's proof for "the core is always in
 * stock", so it must not be stale.
 */
export async function getStock(productIds: string[]): Promise<VariantStock> {
  if (!productIds.length) return {}
  try {
    const { products } = await sdk.store.product.list({
      id: productIds,
      fields: "id,variants.id,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
      limit: productIds.length,
    })
    const stock: VariantStock = {}
    for (const p of products) {
      for (const v of p.variants ?? []) {
        const untracked = v.manage_inventory === false || v.allow_backorder === true
        stock[v.id] = untracked ? null : Math.max(0, v.inventory_quantity ?? 0)
      }
    }
    return stock
  } catch {
    return {}
  }
}
