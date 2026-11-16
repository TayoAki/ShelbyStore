"use server"

import { cookies } from "next/headers"
import { ATTRIBUTION_COOKIE, DISTINCT_ID_COOKIE, isDistinctId, parseAttribution } from "../attribution"
import { sdk } from "../medusa"
import { CORE_COLORS } from "../rope"

/** `values` echoes what was typed, so a failed submit keeps the form filled in (React resets uncontrolled fields after an action). */
export type QuoteState = { ok?: boolean; firstName?: string; error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> } | null

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Custom club / outing quote (SITE_SPEC G.6.10): validates here (24 minimum,
 * twelves per colour, email, URL) and again in the backend (zod), then posts to
 * /store/custom-quotes with the visit's attribution.
 */
export async function requestQuote(_prev: QuoteState, form: FormData): Promise<QuoteState> {
  const get = (k: string) => String(form.get(k) ?? "").trim()
  const fe: Record<string, string> = {}
  const name = get("name")
  const email = get("email")
  const organisation = get("organisation")
  const quantity = Number(get("quantity"))
  const colors: Record<string, number> = {}
  for (const c of CORE_COLORS) {
    const n = Number(get(`color_${c}`) || 0)
    if (n) colors[c] = n
  }
  const total = Object.values(colors).reduce((a, b) => a + b, 0)
  const artwork = get("artwork_url")
  if (!name) fe.name = "Enter your name"
  if (!EMAIL.test(email)) fe.email = "Enter a valid email"
  if (!organisation) fe.organisation = "Enter your club or organisation"
  if (!Number.isInteger(quantity) || quantity < 24) fe.quantity = "The minimum is 24 caps"
  if (Object.values(colors).some((n) => n % 12 !== 0)) fe.colors = "Each color is ordered in twelves"
  else if (total !== quantity) fe.colors = `The colors add up to ${total}; make them match the ${quantity || 0} caps`
  if (artwork && !/^https?:\/\/\S+$/.test(artwork)) fe.artwork_url = "Enter a full link, starting with https://"
  if (form.get("rights") !== "on") fe.rights = "Please confirm you have the right to use this artwork"
  const values = Object.fromEntries(["name", "email", "organisation", "needed_by", "artwork_url", "notes", "rights"].map((k) => [k, get(k)]))
  if (Object.keys(fe).length) return { fieldErrors: fe, values }

  const jar = await cookies()
  const attribution = parseAttribution(jar.get(ATTRIBUTION_COOKIE)?.value)
  const distinct = jar.get(DISTINCT_ID_COOKIE)?.value
  try {
    await sdk.client.fetch("/store/custom-quotes", {
      method: "POST",
      body: {
        name,
        email,
        organisation,
        quantity,
        colors,
        needed_by: get("needed_by") || null,
        artwork_url: artwork || null,
        notes: get("notes") || null,
        rights_confirmed: true,
        company_website: get("company_website") || null,
        source: { ...(attribution ?? {}), ...(isDistinctId(distinct) ? { analytics_id: distinct } : {}) },
      },
    })
    return { ok: true, firstName: name.split(/\s+/)[0] }
  } catch (e) {
    return { error: (e as Error).message || "Something went wrong. Please try again, or email us.", values }
  }
}
