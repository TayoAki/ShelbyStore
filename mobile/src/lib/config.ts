export const MEDUSA_BACKEND_URL = (
  process.env.EXPO_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
).replace(/\/$/, "")

export const MEDUSA_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

if (!MEDUSA_PUBLISHABLE_KEY && __DEV__) {
  console.warn(
    "[shelby] EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set. Store API calls will be rejected. Copy .env.example to .env."
  )
}

/** Where shoppers' carts and orders are attributed for the playbook's channel-response measure. */
export const ATTRIBUTION_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** Matches the backend's low-stock threshold shown on size pickers. */
export const LOW_STOCK_THRESHOLD = 5

/** Fields requested for every product so prices, stock and copy come back in one call. */
export const PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+metadata"
