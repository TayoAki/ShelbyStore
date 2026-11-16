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

/** Payment Element appearance in Eastside's tokens (SITE_SPEC v8 E.6.5). */
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#207212",
    colorText: "#212121",
    colorTextSecondary: "#646464",
    colorDanger: "#721C24",
    colorBackground: "#ffffff",
    // Stripe's iframe can't use next/font; Roboto is loaded through `fonts` below.
    fontFamily: "Roboto, sans-serif",
    fontSizeBase: "16px",
    borderRadius: "3px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #8C8C8C", boxShadow: "none" },
    ".Input:focus": { border: "1px solid #212121", boxShadow: "0 0 0 2px #207212" },
    ".Label": { fontSize: "12.6px", fontWeight: "500" },
  },
}
const fonts = [{ cssSrc: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" }]

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

  if (error)
    return (
      <p className="field-error" role="alert">
        {error}
      </p>
    )
  if (!clientSecret || !stripePromise) {
    return <div className="h-40 animate-pulse bg-tile" aria-label="Loading payment form" />
  }
  return (
    <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance, fonts }}>
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
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <Button block size="atc" onClick={pay} loading={pending} disabled={!stripe || !ready} track="place_order">
        Place order · {formatMoney(total, currency)}
      </Button>
      <p className="meta text-center">Payments are processed securely by Stripe.</p>
    </div>
  )
}
