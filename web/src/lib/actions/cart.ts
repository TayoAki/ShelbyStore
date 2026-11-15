"use server"

import { cookies } from "next/headers"
import { refresh } from "next/cache"
import { ATTRIBUTION_COOKIE, parseAttribution } from "../attribution"
import { getRegion } from "../data/catalog"
import { CART_COOKIE, CART_FIELDS, retrieveCart } from "../data/cart"
import { sdk } from "../medusa"
import type { Cart } from "../types"

export type ActionResult = { ok: true } | { ok: false; error: string }

const CART_MAX_AGE = 60 * 60 * 24 * 30

const message = (e: unknown) =>
  (e as { message?: string })?.message || "Something went wrong. Please try again."

/** Latest attribution touch, merged over what the cart already carries. */
async function attributionPatch(
  current: Record<string, unknown> | null | undefined,
  releaseId?: string,
  analyticsId?: string
) {
  const touch = parseAttribution((await cookies()).get(ATTRIBUTION_COOKIE)?.value)
  const next: Record<string, unknown> = { ...(current ?? {}), ...(touch ?? {}) }
  if (releaseId) next.release_id = releaseId
  if (analyticsId && /^[\w-]{1,100}$/.test(analyticsId)) next.analytics_id = analyticsId
  const changed = Object.keys(next).some((k) => next[k] !== current?.[k])
  return changed ? next : null
}

async function ensureCart(): Promise<Cart> {
  const existing = await retrieveCart()
  if (existing) return existing
  const region = await getRegion()
  if (!region) throw new Error("The store isn't available right now.")
  const metadata = (await attributionPatch({})) ?? undefined
  const { cart } = await sdk.store.cart.create({ region_id: region.id, metadata }, { fields: CART_FIELDS })
  ;(await cookies()).set(CART_COOKIE, cart.id, {
    maxAge: CART_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
  return cart
}

export async function addToCart(input: {
  variantId: string
  quantity: number
  releaseId?: string
  /** PostHog distinct id from the browser (see docs/analytics.md). */
  analyticsId?: string
}): Promise<ActionResult> {
  try {
    const cart = await ensureCart()
    await sdk.store.cart.createLineItem(cart.id, {
      variant_id: input.variantId,
      quantity: Math.max(1, Math.min(10, Math.round(input.quantity))),
      metadata: input.releaseId ? { release_id: input.releaseId } : undefined,
    })
    const patch = await attributionPatch(cart.metadata, input.releaseId, input.analyticsId)
    if (patch) await sdk.store.cart.update(cart.id, { metadata: patch })
    refresh()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: message(e) }
  }
}

export async function updateLineItem(lineId: string, quantity: number): Promise<ActionResult> {
  try {
    const cart = await retrieveCart()
    if (!cart) return { ok: false, error: "Your bag has expired." }
    if (quantity <= 0) await sdk.store.cart.deleteLineItem(cart.id, lineId)
    else await sdk.store.cart.updateLineItem(cart.id, lineId, { quantity: Math.min(10, quantity) })
    refresh()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: message(e) }
  }
}
