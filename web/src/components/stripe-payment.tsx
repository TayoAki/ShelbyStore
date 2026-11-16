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

/** Payment Element styled with the Shelby tokens (SITE_SPEC §2). */
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#1c2023",
    colorText: "#1c2023",
    colorTextSecondary: "#545049",
    colorDanger: "#9e2219",
    colorBackground: "#efece6",
    // The Payment Element renders in Stripe's iframe, so it can't use our next/font; the system stack keeps it close.
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    borderRadius: "2px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #8c867c", boxShadow: "none" },
    ".Input:focus": { border: "1px solid #1c2023", boxShadow: "none" },
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

  if (error) return <p className="text-[14px] text-danger" role="alert">{error}</p>
  if (!clientSecret || !stripePromise) {
    return <div className="h-40 animate-pulse rounded-[2px] bg-surface" aria-label="Loading payment form" />
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
        <p className="text-[14px] text-danger" role="alert">
          {error}
        </p>
      )}
      <Button block onClick={pay} loading={pending} disabled={!stripe || !ready} data-track="place_order">
        Pay {formatMoney(total, currency)}
      </Button>
      <p className="text-center text-[12px] text-ink-muted">Payments are processed securely by Stripe.</p>
    </div>
  )
}
