"use client"

import { useEffect, useRef, useState } from "react"
import { placeOrder } from "@/lib/actions/checkout"
import { ButtonLink } from "./ui/button"

/** Completes the cart once, after Stripe redirects back with a confirmed payment. */
export function CompleteAfterRedirect() {
  const started = useRef(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const status = new URLSearchParams(window.location.search).get("redirect_status")
    if (status && status !== "succeeded") {
      queueMicrotask(() => setError("Your payment didn't go through."))
      return
    }
    placeOrder({ provider: "stripe" }).then((r) => {
      if (r && !r.ok) setError(r.error)
    })
  }, [])
  if (!error) return <p className="text-ink-muted">Confirming your payment with Stripe.</p>
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-danger" role="alert">{error}</p>
      <ButtonLink href="/checkout">Back to checkout</ButtonLink>
    </div>
  )
}
