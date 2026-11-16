"use client"

import { CircleNotch } from "@phosphor-icons/react"
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
  if (!error)
    return (
      <p className="flex flex-col items-center gap-3 text-[14.4px]" role="status">
        <CircleNotch size={28} className="spin text-green" aria-hidden />
        Confirming your order…
      </p>
    )
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="field-error" role="alert">
        {error}
      </p>
      <ButtonLink href="/checkout" variant="secondary">
        Back to checkout
      </ButtonLink>
    </div>
  )
}
