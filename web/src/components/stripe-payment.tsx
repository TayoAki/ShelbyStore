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

/** Payment Element appearance in the box's inks: navy ink on white board, 4px printed corners, 2px keylines. */
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#14213D",
    colorText: "#14213D",
    colorTextSecondary: "#3F4A64",
    colorDanger: "#A3341F",
    colorBackground: "#ffffff",
    // Stripe's iframe can't use next/font; Sofia Sans is loaded through `fonts` below, the system stack after it.
    fontFamily: "'Sofia Sans', ui-sans-serif, system-ui, sans-serif",
    fontSizeBase: "16px",
    borderRadius: "4px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "2px solid #14213D", boxShadow: "none" },
    ".Input:focus": { border: "2px solid #14213D", boxShadow: "0 0 0 3px #14213D33" },
    ".Label": { fontWeight: "600" },
  },
}
const fonts = [{ cssSrc: "https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@400;600;700&display=swap" }]

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

  if (error) return <p className="text-[0.875rem] leading-5 text-red" role="alert">{error}</p>
  if (!clientSecret || !stripePromise) {
    return <div className="h-40 rounded-[4px] border-2 border-dashed border-ink/30" aria-label="Loading payment form" />
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
        <p className="text-[0.875rem] leading-5 text-red" role="alert">
          {error}
        </p>
      )}
      <Button block size="atc" onClick={pay} loading={pending} disabled={!stripe || !ready} track="place_order">
        Place order · {formatMoney(total, currency)}
      </Button>
      <p className="text-center text-[0.875rem] leading-5 text-light-charcoal">Payments are processed securely by Stripe</p>
    </div>
  )
}
