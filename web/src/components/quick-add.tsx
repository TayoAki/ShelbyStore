"use client"

import { useState, useTransition } from "react"
import { addToCart } from "@/lib/actions/cart"
import { analyticsId, track } from "@/lib/analytics"
import { Button } from "./ui/button"

/**
 * One-tap add for a one-size hat in the bag's "Complete the look" (SITE_SPEC
 * §6.7). Adds the given in-stock variant; the server action refreshes the bag.
 */
export function QuickAdd({
  productId,
  variantId,
  label,
  price,
  currency,
}: {
  productId: string
  variantId: string
  label: string
  price: number | null
  currency: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        variant="secondary"
        loading={pending}
        data-track="cart_complete_look"
        onClick={() =>
          startTransition(async () => {
            setError(null)
            const result = await addToCart({ variantId, quantity: 1, analyticsId: analyticsId() })
            if (result.ok) {
              track("add_to_cart", { product_id: productId, variant_id: variantId, quantity: 1, price, currency, source: "complete_the_look" })
            } else {
              setError(result.error)
            }
          })
        }
      >
        {label}
      </Button>
      {error && (
        <p role="alert" className="text-[12px] text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
