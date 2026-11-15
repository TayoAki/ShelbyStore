import type { Attribution } from "./types"

/** First-party analytics person id (set by src/proxy.ts, readable by JS). */
export const DISTINCT_ID_COOKIE = "_shelby_id"
export const DISTINCT_ID_MAX_AGE = 365 * 24 * 60 * 60
export const isDistinctId = (v: string | undefined | null): v is string => !!v && /^[A-Za-z0-9-]{8,64}$/.test(v)

/** Cookie holding the latest `?asset=` / UTM touch. Readable by client analytics. */
export const ATTRIBUTION_COOKIE = "_shelby_attr"
export const ATTRIBUTION_MAX_AGE = 7 * 24 * 60 * 60

const KEYS = ["asset", "utm_source", "utm_medium", "utm_campaign"] as const

const clean = (v: string | null | undefined) => {
  const t = (v ?? "").trim().slice(0, 120)
  return /^[\w.\-~ ]+$/.test(t) ? t : undefined
}

export function attributionFromParams(params: URLSearchParams): Attribution | null {
  const out: Attribution = {}
  for (const key of KEYS) {
    const value = clean(params.get(key))
    if (value) out[key] = value
  }
  // An asset tag doubles as the campaign when no utm_campaign is given.
  return Object.keys(out).length ? out : null
}

export function parseAttribution(raw: string | undefined): Attribution | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Attribution
    const out: Attribution = {}
    for (const key of KEYS) {
      const value = clean(parsed[key])
      if (value) out[key] = value
    }
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}
