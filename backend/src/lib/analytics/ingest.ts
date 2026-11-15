import { EVENT_NAME_PATTERN, PROPERTY_KEY_PATTERN } from "./sql"

/** What a client may send per event. */
export type IncomingEvent = {
  event: string
  distinct_id: string
  session_id?: string | null
  timestamp?: string | null
  path?: string | null
  url?: string | null
  referrer?: string | null
  asset?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  device_type?: string | null
  platform?: string | null
  properties?: Record<string, unknown> | null
}

export type EventRow = {
  event: string
  distinct_id: string
  session_id: string | null
  occurred_at: Date
  received_at: Date
  path: string | null
  url: string | null
  referrer: string | null
  asset: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  device_type: string | null
  platform: string
  properties: Record<string, unknown> | null
}

export const MAX_BATCH = 50
export const MAX_PROPERTIES_BYTES = 8 * 1024
const MAX_FUTURE_MS = 5 * 60 * 1000
const MAX_PAST_MS = 7 * 24 * 60 * 60 * 1000

const BOT_UA = /bot|crawl|spider|slurp|headlesschrome|lighthouse|pingdom|uptime|monitor|preview|facebookexternalhit|curl\/|wget|python-requests|axios\//i
export const isBotUserAgent = (ua: string | null | undefined) => !!ua && BOT_UA.test(ua)

export function deviceFromUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet"
  if (/mobi|iphone|ipod|android/i.test(ua)) return "mobile"
  return "desktop"
}

const text = (v: unknown, max: number) => {
  if (typeof v !== "string") return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}
/** Attribution values: same cleaning as the storefront cookie. */
const tag = (v: unknown) => {
  const t = text(v, 120)
  return t && /^[\w.\-~ ]+$/.test(t) ? t : null
}

function cleanProperties(props: unknown): Record<string, unknown> | null {
  if (!props || typeof props !== "object" || Array.isArray(props)) return null
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props as Record<string, unknown>)) {
    if (!PROPERTY_KEY_PATTERN.test(k) || v === undefined) continue
    out[k] = v
  }
  const json = JSON.stringify(out)
  if (json.length > MAX_PROPERTIES_BYTES) return { $truncated: true }
  return Object.keys(out).length ? out : null
}

/**
 * Validates and normalizes one client event. Returns null to drop it.
 * Client clocks are corrected by the batch's send-time offset (like PostHog's
 * `sent_at`), then clamped to [received - 7d, received + 5min].
 */
export function normalizeEvent(
  e: IncomingEvent,
  ctx: { receivedAt: Date; sentAt?: Date | null; userAgent?: string | null; allowServerPlatform?: boolean }
): EventRow | null {
  if (!EVENT_NAME_PATTERN.test(e.event ?? "")) return null
  const distinctId = text(e.distinct_id, 200)
  if (!distinctId) return null

  const received = ctx.receivedAt.getTime()
  const offset = ctx.sentAt && !Number.isNaN(ctx.sentAt.getTime()) ? received - ctx.sentAt.getTime() : 0
  let ts = e.timestamp ? new Date(e.timestamp).getTime() + offset : received
  if (!Number.isFinite(ts) || ts > received + MAX_FUTURE_MS || ts < received - MAX_PAST_MS) ts = received

  const platform =
    e.platform === "app" ? "app" : e.platform === "server" && ctx.allowServerPlatform ? "server" : "web"
  const deviceType =
    e.device_type && /^(mobile|tablet|desktop|app|server)$/.test(e.device_type)
      ? e.device_type
      : platform === "app"
        ? "app"
        : deviceFromUserAgent(ctx.userAgent)

  const props = cleanProperties(e.properties)
  return {
    event: e.event,
    distinct_id: distinctId,
    session_id: text(e.session_id, 200),
    occurred_at: new Date(ts),
    received_at: ctx.receivedAt,
    path: text(e.path, 1000),
    url: text(e.url, 2048),
    referrer: text(e.referrer, 2048),
    asset: tag(e.asset ?? props?.asset),
    utm_source: tag(e.utm_source ?? props?.utm_source),
    utm_medium: tag(e.utm_medium ?? props?.utm_medium),
    utm_campaign: tag(e.utm_campaign ?? props?.utm_campaign),
    device_type: deviceType,
    platform,
    properties: props,
  }
}

