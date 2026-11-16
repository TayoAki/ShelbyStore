"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { chooseShipping, placeOrder, saveDetails, type CheckoutState } from "@/lib/actions/checkout"
import { track } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { StripePayment, stripeEnabled } from "./stripe-payment"
import { Button } from "./ui/button"

type Address = {
  email: string
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
} | null

type Option = { id: string; name: string; amount: number; description: string | null }

/**
 * Contact, Delivery and Payment on one page (SITE_SPEC v8 E.6.5). Guest by
 * default; ~9 fields; autocomplete everywhere. Shipping options are radio
 * cards; "Continue to payment" is charcoal, "Place order" green.
 */
export function CheckoutForm({
  cartId,
  total,
  currency,
  address,
  options,
  selectedOption,
}: {
  cartId: string
  total: number
  currency: string
  address: Address
  options: Option[]
  selectedOption: string | null
}) {
  const [editing, setEditing] = useState(!address)
  const [state, save, saving] = useActionState<CheckoutState, FormData>(async (prev, form) => {
    const result = await saveDetails(prev, form)
    if (!result) setEditing(false) // saved: move on to delivery
    return result
  }, null)
  const [shippingPending, startShipping] = useTransition()
  const [placing, startPlacing] = useTransition()
  const [error, setError] = useState<string | null>(null)
  // Show the tapped option immediately; the server confirms it on refresh.
  const [chosen, setChosen] = useState<string | null>(selectedOption)
  const current = chosen ?? selectedOption

  useEffect(() => {
    track("checkout_started", { cart_id: cartId, value: total, currency })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId])

  const step = editing || !address ? 1 : selectedOption ? 3 : 2
  const fe = state?.fieldErrors ?? {}

  return (
    <div className="flex flex-col gap-8">
      {step === 1 ? (
        <form action={save} noValidate className="flex flex-col gap-8">
          <Section title="Contact">
            <div className="grid grid-cols-2 gap-3">
              <Field className="col-span-2" name="email" label="Email" type="email" autoComplete="email" defaultValue={address?.email} error={fe.email} />
            </div>
          </Section>
          <Section title="Delivery">
            <div className="grid grid-cols-2 gap-3">
              <Field name="first_name" label="First name" autoComplete="given-name" defaultValue={address?.first_name} error={fe.first_name} />
              <Field name="last_name" label="Last name" autoComplete="family-name" defaultValue={address?.last_name} error={fe.last_name} />
              <Field className="col-span-2" name="address_1" label="Address" autoComplete="address-line1" defaultValue={address?.address_1} error={fe.address_1} />
              <Field className="col-span-2" name="address_2" label="Apt, suite (optional)" autoComplete="address-line2" defaultValue={address?.address_2} />
              <Field className="col-span-2" name="city" label="City" autoComplete="address-level2" defaultValue={address?.city} error={fe.city} />
              <Field name="province" label="State" autoComplete="address-level1" defaultValue={address?.province} error={fe.province} maxLength={2} placeholder="CA" />
              <Field name="postal_code" label="ZIP" autoComplete="postal-code" inputMode="numeric" defaultValue={address?.postal_code} error={fe.postal_code} />
            </div>
            {state?.error && (
              <p className="field-error" role="alert">
                {state.error}
              </p>
            )}
          </Section>
          <Button variant="secondary" block loading={saving} track="checkout_details">
            Continue to payment
          </Button>
        </form>
      ) : (
        <>
          <Section title="Contact" onEdit={() => setEditing(true)}>
            <p className="text-[14.4px]">{address?.email}</p>
          </Section>
          <Section title="Delivery" onEdit={() => setEditing(true)}>
            <p className="meta mb-3">
              {address?.first_name} {address?.last_name}, {address?.address_1}
              {address?.address_2 ? `, ${address.address_2}` : ""}, {address?.city} {address?.province} {address?.postal_code}
            </p>
            <fieldset className="flex flex-col gap-2" disabled={shippingPending}>
              <legend className="mb-2 text-[12.6px] font-medium">Shipping method</legend>
              {options.length === 0 && <p className="meta">No delivery options for this address.</p>}
              {options.map((o) => (
                <label key={o.id} className="radio-card">
                  <input
                    type="radio"
                    name="shipping"
                    className="size-4 accent-[#207212]"
                    checked={current === o.id}
                    onChange={() => {
                      setChosen(o.id)
                      startShipping(async () => {
                        const r = await chooseShipping(o.id)
                        if (!r.ok) {
                          setChosen(selectedOption)
                          setError(r.error)
                        }
                      })
                    }}
                  />
                  <span className="flex-1">
                    <span className="block text-[14.4px] font-medium">{o.name}</span>
                    {o.description && <span className="meta block">{o.description}</span>}
                  </span>
                  <span className="tabular text-[14.4px]">{o.amount === 0 ? "Free" : formatMoney(o.amount, currency)}</span>
                </label>
              ))}
            </fieldset>
          </Section>
          <Section title="Payment">
            {step < 3 ? (
              <p className="meta">Choose a shipping method to pay.</p>
            ) : stripeEnabled ? (
              <StripePayment total={total} currency={currency} cartKey={`${cartId}:${total}:${current ?? ""}`} />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="band-tile p-4 text-[14.4px]">
                  <p className="font-medium">Test payment</p>
                  <p className="meta">No card provider is configured, so the order is recorded and nothing is charged.</p>
                </div>
                {error && (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                )}
                <Button
                  track="place_order"
                  size="atc"
                  block
                  loading={placing}
                  onClick={() =>
                    startPlacing(async () => {
                      setError(null)
                      const r = await placeOrder()
                      if (r && !r.ok) setError(r.error)
                    })
                  }
                >
                  Place order · {formatMoney(total, currency)}
                </Button>
              </div>
            )}
            {error && stripeEnabled && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
          </Section>
        </>
      )}
    </div>
  )
}

/** A checkout section: a Montserrat 19.2px heading, an optional Edit link, then the fields. */
function Section({ title, onEdit, children }: { title: string; onEdit?: () => void; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="title-card">{title}</h2>
        {onEdit && (
          <button type="button" onClick={onEdit} className="link min-h-11 text-[12.6px]">
            Edit
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

/** E.5.9 field: 12.6px/500 label 6px above, 44px box, error linked by aria-describedby. */
function Field({ label, error, className = "", ...input }: React.ComponentProps<"input"> & { label: string; error?: string; name: string }) {
  const id = `f-${input.name}`
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-1.5 text-[12.6px] font-medium">
        {label}
      </label>
      <input id={id} {...input} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-err` : undefined} className="field" />
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
