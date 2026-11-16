"use client"

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe, type Appearance } from "@stripe/stripe-js"
import { useEffect, useState, useTransition } from "react"
import { placeOrder, startCardPayment } from "@/lib/actions/checkout"
import { formatMoney } from "@/lib/format"
import { Button } from "./ui/button"

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null
export const stripeEnabled = !!PUBLISHABLE_KEY

/** Payment Element appearance with Melin's tokens (SITE_SPEC §6.8). */
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#000000",
    colorText: "#000000",
    colorTextSecondary: "#736b67",
    colorDanger: "#c70000",
    colorBackground: "#ffffff",
    // Stripe's iframe can't use next/font; Inter is requested by name with the system stack after it.
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "3px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #e4e4e4", boxShadow: "none" },
    ".Input:focus": { border: "1px solid #000000", boxShadow: "none" },
  },
}

/**
 * Card payment step: Stripe's Payment Element (cards plus Apple Pay / Google
 * Pay where available; express wallets measured +22% conversion in Stripe's
 * holdback test, ux-evidence §8). Confirms the PaymentIntent in the browser,
 * then completes the Medusa cart.
 */
export function StripePayment({ total, currency, cartKey }: { total: number; currency: string; cartKey: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Re-create the session whenever the cart total changes (e.g. new shipping method).
  useEffect(() => {
    let live = true
    startCardPayment().then((r) => {
      if (!live) return
      if ("clientSecret" in r) setClientSecret(r.clientSecret)
      else setError(r.error)
    })
    return () => {
      live = false
    }
  }, [cartKey])

  if (error) return <p className="font-body text-[12px] text-error" role="alert">{error}</p>
  if (!clientSecret || !stripePromise) {
    return <div className="h-40 animate-pulse rounded-button bg-tile" aria-label="Loading payment form" />
  }
  return (
    <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentForm total={total} currency={currency} />
    </Elements>
  )
}

function PaymentForm({ total, currency }: { total: number; currency: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [pending, startTransition] = useTransition()

  const pay = () =>
    startTransition(async () => {
      if (!stripe || !elements) return
      setError(null)
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message ?? "Check your payment details.")
        return
      }
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: { return_url: `${window.location.origin}/checkout/complete` },
      })
      if (confirmError) {
        setError(confirmError.message ?? "Your payment didn't go through.")
        return
      }
      if (paymentIntent && !["requires_capture", "succeeded", "processing"].includes(paymentIntent.status)) {
        setError("Your payment didn't go through. Try another card.")
        return
      }
      const result = await placeOrder({ provider: "stripe" })
      if (result && !result.ok) setError(result.error)
    })

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement onReady={() => setReady(true)} options={{ layout: "tabs" }} />
      {error && (
        <p className="font-body text-[12px] text-error" role="alert">
          {error}
        </p>
      )}
      <Button block size="checkout" onClick={pay} loading={pending} disabled={!stripe || !ready} track="place_order">
        Place order · {formatMoney(total, currency)}
      </Button>
      <p className="text-center font-heading text-[10px] uppercase leading-[15px] tracking-[1px]">Payments are processed securely by Stripe</p>
    </div>
  )
}
