/**
 * Minimal Umami API client for reading tagged sessions.
 *
 * Self-hosted Umami (our Railway service): UMAMI_URL + UMAMI_USERNAME +
 * UMAMI_PASSWORD. Umami Cloud: UMAMI_API_KEY (UMAMI_URL defaults to
 * https://api.umami.is/v1). UMAMI_WEBSITE_ID is required either way.
 * Without them, `isUmamiConfigured()` is false and callers show
 * "connect analytics" instead of a number.
 */

export type UmamiRange = { startAt: Date; endAt: Date }

export type AssetSessions = {
  /** Distinct sessions that landed on a URL tagged ?asset=<key>. */
  landing_sessions: number
  /** Distinct sessions with a `product_viewed` event carrying asset=<key>
   *  (the attribution persists after landing, so this includes later pages). */
  product_view_sessions: number
}

type Fetch = typeof fetch

export const isUmamiConfigured = () =>
  !!process.env.UMAMI_WEBSITE_ID &&
  (!!process.env.UMAMI_API_KEY ||
    (!!process.env.UMAMI_URL && !!process.env.UMAMI_USERNAME && !!process.env.UMAMI_PASSWORD))

const baseUrl = () =>
  (process.env.UMAMI_URL || (process.env.UMAMI_API_KEY ? "https://api.umami.is/v1" : "")).replace(/\/$/, "")

let cachedToken: string | null = null

async function authHeaders(fetchImpl: Fetch, refresh = false): Promise<Record<string, string>> {
  if (process.env.UMAMI_API_KEY) {
    return { "x-umami-api-key": process.env.UMAMI_API_KEY }
  }
  if (!cachedToken || refresh) {
    const res = await fetchImpl(`${baseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: process.env.UMAMI_USERNAME,
        password: process.env.UMAMI_PASSWORD,
      }),
    })
    if (!res.ok) {
      throw new Error(`Umami login failed (${res.status})`)
    }
    cachedToken = ((await res.json()) as { token: string }).token
  }
  return { authorization: `Bearer ${cachedToken}` }
}

async function getJson<T>(path: string, params: Record<string, string>, fetchImpl: Fetch): Promise<T> {
  const prefix = process.env.UMAMI_API_KEY ? "" : "/api"
  const url = `${baseUrl()}${prefix}${path}?${new URLSearchParams(params)}`
  let res = await fetchImpl(url, { headers: await authHeaders(fetchImpl) })
  if (res.status === 401 && !process.env.UMAMI_API_KEY) {
    res = await fetchImpl(url, { headers: await authHeaders(fetchImpl, true) })
  }
  if (!res.ok) {
    throw new Error(`Umami ${path} failed (${res.status})`)
  }
  return (await res.json()) as T
}

type Stats = { visits: number; pageviews: number; visitors: number }
type SessionPage = { count: number }

/**
 * Distinct sessions for one asset tag over a date range.
 *
 * - landing: `stats` with a URL-query filter. Stats only counts pageview rows,
 *   which is what we want for "arrived through the tagged link".
 * - product views: the `sessions` list filtered to sessions that fired a
 *   `product_viewed` custom event with asset=<key> (stats ignores custom
 *   events, so it can't answer this). Only `count` is read.
 */
export async function getAssetSessions(
  asset: string,
  range: UmamiRange,
  fetchImpl: Fetch = fetch
): Promise<AssetSessions> {
  const websiteId = process.env.UMAMI_WEBSITE_ID!
  const time = { startAt: String(range.startAt.getTime()), endAt: String(range.endAt.getTime()) }
  const [landing, productViews] = await Promise.all([
    getJson<Stats>(`/websites/${websiteId}/stats`, { ...time, query: `c.asset=${asset}` }, fetchImpl),
    getJson<SessionPage>(
      `/websites/${websiteId}/sessions`,
      // epf = event property filter: <data type 1 = string>.<operator>.<property>.<value>
      { ...time, event: "product_viewed", epf0: `1.eq.asset.${asset}`, page: "1", pageSize: "1" },
      fetchImpl
    ),
  ])
  return {
    landing_sessions: landing.visits ?? 0,
    product_view_sessions: productViews.count ?? 0,
  }
}

/** Sessions for several assets. Failures per asset come back as null. */
export async function getSessionsByAsset(
  assets: string[],
  range: UmamiRange,
  fetchImpl: Fetch = fetch
): Promise<Record<string, AssetSessions | null>> {
  const unique = [...new Set(assets.filter(Boolean))]
  const results = await Promise.all(
    unique.map((a) => getAssetSessions(a, range, fetchImpl).catch(() => null))
  )
  return Object.fromEntries(unique.map((a, i) => [a, results[i]]))
}

/** For tests. */
export function _resetUmami() {
  cachedToken = null
}
