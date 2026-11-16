"use client"

import { CheckCircle } from "@phosphor-icons/react"
import { useActionState, useEffect, useState } from "react"
import { requestQuote, type QuoteState } from "@/lib/actions/custom-quote"
import { track } from "@/lib/analytics"
import { CORE_COLORS } from "@/lib/rope"
import { SwatchFace } from "../swatch"

const input = "field"
const label = "mb-1.5 block text-[12.6px] font-medium"

/**
 * The custom quote form (SITE_SPEC v8 E.6.8, G.6.10): name, email, organisation, quantity (24+),
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
      <p className="flex flex-col items-center gap-3 py-8 text-center text-[14.4px]" role="status">
        <CheckCircle size={40} className="text-green" aria-hidden />
        Thanks, {state.firstName}. We&apos;ll reply within two business days.
      </p>
    )

  const err = (k: string) => (fe[k] ? <p className="field-error">{fe[k]}</p> : null)
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2" noValidate>
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
            <div key={c} className="flex items-center gap-3 rounded-sm border border-border p-3">
              <SwatchFace name={c} size={20} />
              <div className="flex flex-1 flex-col">
                <label htmlFor={`q-${c}`} className="text-[12.6px]">
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
                  className="field mt-1"
                />
              </div>
            </div>
          ))}
        </div>
        <p className={`meta mt-2 ${total === qty ? "" : "!text-error"}`}>
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
        <textarea id="q-notes" name="notes" defaultValue={v.notes} rows={4} className="field" />
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="q-hp">Company website</label>
        <input id="q-hp" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex min-h-11 items-center gap-1.5 text-[14.4px] md:col-span-2">
        <input type="checkbox" name="rights" defaultChecked={v.rights === "on"} required className="check" />I have the right to use this artwork.
      </label>
      {err("rights")}
      {state?.error && (
        <p className="field-error md:col-span-2" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-charcoal btn-block md:col-span-2" disabled={pending} aria-busy={pending || undefined} data-track="custom_submit">
        Send Request
      </button>
    </form>
  )
}
