"use client"

import { useState, useTransition } from "react"
import { addToCart } from "@/lib/actions/cart"
import { analyticsId, track } from "@/lib/analytics"
import { useCartDrawer } from "./drawer-context"

export type AddInput = {
  productId: string
  variantId: string
  price: number | null
  currency: string
  releaseId?: string
  /** Where the add happened (pdp, quick_add, offer, quiz, listicle…), sent with add_to_cart. */
  source?: string
  quantity?: number
  extra?: Record<string, unknown>
}

/**
 * Adds a variant to the bag, records `add_to_cart`, then opens the slider cart
 * (every add path opens it, SITE_SPEC §6.7). The server action refreshes the
 * drawer's server-rendered contents before the transition settles.
 */
export function useAddToBag({ openDrawer = true }: { openDrawer?: boolean } = {}) {
  const { open } = useCartDrawer()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const add = (input: AddInput, onDone?: () => void) => {
    setError(null)
    startTransition(async () => {
      const quantity = input.quantity ?? 1
      const result = await addToCart({ variantId: input.variantId, quantity, releaseId: input.releaseId, analyticsId: analyticsId() })
      if (!result.ok) {
        setError(result.error)
        return
      }
      track("add_to_cart", {
        product_id: input.productId,
        variant_id: input.variantId,
        quantity,
        price: input.price,
        currency: input.currency,
        release_id: input.releaseId,
        source: input.source,
        ...input.extra,
      })
      onDone?.()
      if (openDrawer) open()
    })
  }

  return { add, pending, error }
}
