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
 * One page, three steps that unlock in order (SITE_SPEC §6.8). Guest by
 * default; ~9 fields against Baymard's 12–14 ideal; autocomplete everywhere.
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
    <div className="panel flex flex-col">
      <Step n={1} title="Contact & address" active={step === 1} done={step > 1} onEdit={() => setEditing(true)}
        summary={address ? `${address.email} · ${address.address_1}, ${address.city} ${address.province} ${address.postal_code}` : undefined}>
        <form action={save} className="grid grid-cols-2 gap-3" noValidate>
          <Field className="col-span-2" name="email" label="Email" type="email" autoComplete="email" defaultValue={address?.email} error={fe.email} />
          <Field name="first_name" label="First name" autoComplete="given-name" defaultValue={address?.first_name} error={fe.first_name} />
          <Field name="last_name" label="Last name" autoComplete="family-name" defaultValue={address?.last_name} error={fe.last_name} />
          <Field className="col-span-2" name="address_1" label="Address" autoComplete="address-line1" defaultValue={address?.address_1} error={fe.address_1} />
          <Field className="col-span-2" name="address_2" label="Apt, suite (optional)" autoComplete="address-line2" defaultValue={address?.address_2} />
          <Field className="col-span-2" name="city" label="City" autoComplete="address-level2" defaultValue={address?.city} error={fe.city} />
          <Field name="province" label="State" autoComplete="address-level1" defaultValue={address?.province} error={fe.province} maxLength={2} placeholder="CA" />
          <Field name="postal_code" label="ZIP" autoComplete="postal-code" inputMode="numeric" defaultValue={address?.postal_code} error={fe.postal_code} />
          {state?.error && <p className="col-span-2 text-[0.9375rem] leading-5 text-low" role="alert">{state.error}</p>}
          <div className="col-span-2 mt-2">
            <Button block size="atc" loading={saving} track="checkout_details">Continue to delivery</Button>
          </div>
        </form>
      </Step>

      <Step n={2} title="Delivery" active={step === 2} done={step > 2} onEdit={() => address && setEditing(false)}
        summary={options.find((o) => o.id === current)?.name}>
        <fieldset className="flex flex-col gap-2" disabled={shippingPending}>
          <legend className="sr-only">Shipping method</legend>
          {options.length === 0 && <p className="text-[0.9375rem] leading-5 text-ink-2">No delivery options for this address.</p>}
          {options.map((o) => (
            <label key={o.id} className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-[4px] border-2 bg-paper p-4 transition-colors duration-200 ${current === o.id ? "border-ink" : "border-ink/25 hover:border-ink/60"}`}>
              <input
                type="radio"
                name="shipping"
                className="size-5 accent-[#14213D]"
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
                <span className="block text-[1rem] leading-6 font-semibold">{o.name}</span>
                {o.description && <span className="block text-[0.9375rem] leading-5 text-ink-2">{o.description}</span>}
              </span>
              <span className="text-[1rem] leading-6 font-semibold tabular-nums">{o.amount === 0 ? "Free" : formatMoney(o.amount, currency)}</span>
            </label>
          ))}
        </fieldset>
      </Step>

      <Step n={3} title="Payment" active={step === 3} done={false}>
        {stripeEnabled ? (
          <StripePayment total={total} currency={currency} cartKey={`${cartId}:${total}:${current ?? ""}`} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-[4px] border-2 border-dashed border-ink/40 p-4 text-[1rem] leading-6">
              <p className="font-semibold">Test payment</p>
              <p className="text-ink-2">No card provider is configured, so the order is recorded and nothing is charged.</p>
            </div>
            {error && <p className="text-[0.9375rem] leading-5 text-low" role="alert">{error}</p>}
            <Button
              track="place_order"
              size="atc"
              block
              loading={placing}
              onClick={() => startPlacing(async () => {
                setError(null)
                const r = await placeOrder()
                if (r && !r.ok) setError(r.error)
              })}
            >
              Place order · {formatMoney(total, currency)}
            </Button>
          </div>
        )}
      </Step>
    </div>
  )
}

function Step({ n, title, active, done, summary, onEdit, children }: {
  n: number; title: string; active: boolean; done: boolean; summary?: string; onEdit?: () => void; children: React.ReactNode
}) {
  return (
    <section className="border-b-2 border-dashed border-ink/30 p-5 last:border-b-0 md:p-7" aria-current={active ? "step" : undefined}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={`flex items-center gap-3 ${active || done ? "" : "text-ink-3"}`}>
          <span className="figure text-[1.75rem]" aria-hidden>
            {String(n).padStart(2, "0")}
          </span>
          <span className="panel-title !text-[1.75rem]">{title}</span>
        </h2>
        {done && onEdit && (
          <button type="button" onClick={onEdit} className="link min-h-11 text-[1rem]">Edit</button>
        )}
      </div>
      {done && summary && <p className="mt-2 text-[0.9375rem] leading-5 text-ink-2">{summary}</p>}
      {active && <div className="mt-5">{children}</div>}
    </section>
  )
}

function Field({ label, error, className = "", ...input }: React.ComponentProps<"input"> & { label: string; error?: string; name: string }) {
  const id = `f-${input.name}`
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-1.5 label">{label}</label>
      <input
        id={id}
        {...input}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`field ${error ? "!border-low" : ""}`}
      />
      {error && <p id={`${id}-err`} className="mt-1 text-[0.9375rem] leading-5 text-low">{error}</p>}
    </div>
  )
}
