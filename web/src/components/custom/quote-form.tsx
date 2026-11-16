"use client"

import { useActionState, useEffect, useState } from "react"
import { requestQuote, type QuoteState } from "@/lib/actions/custom-quote"
import { track } from "@/lib/analytics"
import { CORE_COLORS } from "@/lib/rope"
import { SwatchFace } from "../swatch"

const input = "h-[42px] w-full rounded-full border border-black bg-white px-4 text-base"
const label = "mb-1.5 block text-xs leading-4 font-medium tracking-[.05em] uppercase"

/**
 * The custom quote form (G.6.10): name, email, organisation, quantity (24+),
 * caps per colour in twelves that add up to the quantity, needed-by date,
 * artwork link, notes, a rights confirmation and a hidden honeypot.
 */
export function QuoteForm() {
  const [state, action, pending] = useActionState<QuoteState, FormData>(requestQuote, null)
  const [qty, setQty] = useState(24)
  const [colors, setColors] = useState<Record<string, number>>({ "Tour White": 12, "Clubhouse Navy": 12 })
  const total = Object.values(colors).reduce((a, b) => a + b, 0)
  const fe = state?.fieldErrors ?? {}
  const v = state?.values ?? {}
  useEffect(() => {
    if (state?.ok) track("custom_quote_form_sent", { quantity: qty, colors: Object.keys(colors).filter((c) => colors[c]) })
    // Only on success.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok])

  if (state?.ok)
    return (
      <p className="font-display text-2xl leading-8" role="status">
        Thanks, {state.firstName}. We&apos;ll reply within two business days.
      </p>
    )

  const err = (k: string) => (fe[k] ? <p className="mt-1 text-xs leading-4 text-red">{fe[k]}</p> : null)
  return (
    <form action={action} className="grid gap-5 md:grid-cols-2" noValidate>
      <div>
        <label htmlFor="q-name" className={label}>
          Name
        </label>
        <input id="q-name" name="name" defaultValue={v.name} required autoComplete="name" className={input} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="q-email" className={label}>
          Email
        </label>
        <input id="q-email" name="email" defaultValue={v.email} type="email" required autoComplete="email" className={input} />
        {err("email")}
      </div>
      <div className="md:col-span-2">
        <label htmlFor="q-org" className={label}>
          Club or organisation
        </label>
        <input id="q-org" name="organisation" defaultValue={v.organisation} required autoComplete="organization" className={input} />
        {err("organisation")}
      </div>
      <div>
        <label htmlFor="q-qty" className={label}>
          Caps (24 minimum)
        </label>
        <input id="q-qty" name="quantity" type="number" min={24} step={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className={input} />
        {err("quantity")}
      </div>
      <div>
        <label htmlFor="q-date" className={label}>
          Needed by (optional)
        </label>
        <input id="q-date" name="needed_by" defaultValue={v.needed_by} type="date" className={input} />
      </div>
      <fieldset className="md:col-span-2">
        <legend className={label}>Colors, in twelves</legend>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {CORE_COLORS.map((c) => (
            <div key={c} className="flex items-center gap-3 rounded-xl border border-stroke p-3">
              <SwatchFace name={c} size={20} />
              <div className="flex flex-1 flex-col">
                <label htmlFor={`q-${c}`} className="text-xs leading-4">
                  {c}
                </label>
                <input
                  id={`q-${c}`}
                  name={`color_${c}`}
                  type="number"
                  min={0}
                  step={12}
                  value={colors[c] ?? 0}
                  onChange={(e) => setColors((s) => ({ ...s, [c]: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-full border border-black px-3 py-1 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
        <p className={`mt-2 text-xs leading-4 ${total === qty ? "text-light-charcoal" : "text-red"}`}>
          {total} of {qty} caps assigned.
        </p>
        {err("colors")}
      </fieldset>
      <div className="md:col-span-2">
        <label htmlFor="q-art" className={label}>
          Artwork link (optional)
        </label>
        <input id="q-art" name="artwork_url" defaultValue={v.artwork_url} type="url" placeholder="https://" className={input} />
        {err("artwork_url")}
      </div>
      <div className="md:col-span-2">
        <label htmlFor="q-notes" className={label}>
          Notes (optional)
        </label>
        <textarea id="q-notes" name="notes" defaultValue={v.notes} rows={4} className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-base" />
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="q-hp">Company website</label>
        <input id="q-hp" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-start gap-3 text-sm leading-5 md:col-span-2">
        <input type="checkbox" name="rights" defaultChecked={v.rights === "on"} required className="checkbox mt-0.5" />I have the right to use this artwork.
      </label>
      {err("rights")}
      {state?.error && (
        <p className="text-xs leading-4 text-red md:col-span-2" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-secondary btn-atc md:col-span-2" disabled={pending} data-track="custom_submit">
        REQUEST A QUOTE
      </button>
    </form>
  )
}
