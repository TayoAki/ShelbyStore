import "server-only"
import { cookies } from "next/headers"
import { sdk } from "../medusa"
import type { Cart } from "../types"

export const CART_COOKIE = "_shelby_cart"

export const CART_FIELDS =
  "*items,*items.variant,*items.variant.options,*items.product,*shipping_methods,*shipping_address,+metadata,*promotions"

export async function getCartId() {
  return (await cookies()).get(CART_COOKIE)?.value ?? null
}

/** The visitor's cart, read at request time. Completed or missing carts return null. */
export async function retrieveCart(): Promise<Cart | null> {
  const id = await getCartId()
  if (!id) return null
  try {
    const { cart } = await sdk.store.cart.retrieve(id, { fields: CART_FIELDS })
    if ((cart as Cart & { completed_at?: string | null }).completed_at) return null
    return cart
  } catch {
    return null
  }
}

export const itemCount = (cart: Cart | null) =>
  (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
