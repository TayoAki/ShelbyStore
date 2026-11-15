"use server"

import { cookies } from "next/headers"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { ATTRIBUTION_COOKIE } from "../attribution"
import { CART_COOKIE, retrieveCart } from "../data/cart"
import { sdk } from "../medusa"
import type { ActionResult } from "./cart"

export type CheckoutState = { error?: string; fieldErrors?: Record<string, string> } | null

const TEST_PROVIDER = "pp_system_default"
const required = ["email", "first_name", "last_name", "address_1", "city", "province", "postal_code"] as const

/** Step 1: contact + US shipping address. */
export async function saveDetails(_prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const cart = await retrieveCart()
  if (!cart) return { error: "Your bag has expired. Add something to start again." }

  const value = (k: string) => String(form.get(k) ?? "").trim()
  const fieldErrors: Record<string, string> = {}
  for (const key of required) if (!value(key)) fieldErrors[key] = "Required"
  if (value("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) fieldErrors.email = "Enter a valid email"
  if (value("postal_code") && !/^\d{5}(-\d{4})?$/.test(value("postal_code"))) fieldErrors.postal_code = "Enter a 5-digit ZIP"
  if (Object.keys(fieldErrors).length) return { fieldErrors }

  try {
    await sdk.store.cart.update(cart.id, {
      email: value("email"),
      shipping_address: {
        first_name: value("first_name"),
        last_name: value("last_name"),
        address_1: value("address_1"),
        address_2: value("address_2") || undefined,
        city: value("city"),
        province: value("province").toUpperCase(),
        postal_code: value("postal_code"),
        country_code: "us",
        phone: value("phone") || undefined,
      },
    })
    refresh()
    return null
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function listShippingOptions() {
  const cart = await retrieveCart()
  if (!cart) return []
  try {
    const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id })
    return shipping_options.map((o) => ({
      id: o.id,
      name: o.name,
      amount: o.amount ?? 0,
      description: (o as { type?: { description?: string } }).type?.description ?? null,
    }))
  } catch {
    return []
  }
}

/** Step 2: delivery method. */
export async function chooseShipping(optionId: string): Promise<ActionResult> {
  const cart = await retrieveCart()
  if (!cart) return { ok: false, error: "Your bag has expired." }
  try {
    await sdk.store.cart.addShippingMethod(cart.id, { option_id: optionId })
    refresh()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** Step 3: pay and place the order. Uses Medusa's test provider until Stripe is wired. */
export async function placeOrder(): Promise<ActionResult> {
  const cart = await retrieveCart()
  if (!cart) return { ok: false, error: "Your bag has expired." }
  let orderId: string
  try {
    await sdk.store.payment.initiatePaymentSession(cart, { provider_id: TEST_PROVIDER })
    const result = await sdk.store.cart.complete(cart.id)
    if (result.type !== "order") {
      return { ok: false, error: result.error?.message ?? "We couldn't place your order." }
    }
    orderId = result.order.id
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
  // Attribution is cleared once it has been recorded on an order (docs/analytics.md).
  const jar = await cookies()
  jar.delete(CART_COOKIE)
  jar.delete(ATTRIBUTION_COOKIE)
  redirect(`/order/${orderId}`)
}
