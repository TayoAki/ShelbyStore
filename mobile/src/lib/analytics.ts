import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import { useEffect, useRef } from "react"
import { AppState, Dimensions, Platform } from "react-native"

import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./config"

/**
 * Client analytics for the app, sent to Shelby's own first-party analytics
 * (Medusa `/store/analytics/events`). Event names and properties follow
 * docs/analytics.md, shared with the web storefront and the backend.
 *
 * - Person: a persistent device id in AsyncStorage (also written to cart
 *   metadata as `analytics_id`, so the server-side order event joins it).
 * - Session: in memory; a new one starts after 30 minutes of inactivity.
 * - Optional mirror to self-hosted Umami (EXPO_PUBLIC_UMAMI_URL +
 *   EXPO_PUBLIC_UMAMI_WEBSITE_ID) for its traffic dashboard.
 *
 * Disable with EXPO_PUBLIC_ANALYTICS_DISABLED=true.
 */

export type AnalyticsEvent =
  | "product_viewed"
  | "drop_viewed"
  | "add_to_cart"
  | "checkout_started"
  | "notify_me_submitted"

type Props = Record<string, string | number | boolean | null | undefined>

const DISABLED = process.env.EXPO_PUBLIC_ANALYTICS_DISABLED === "true"
const UMAMI_URL = (process.env.EXPO_PUBLIC_UMAMI_URL || "").replace(/\/$/, "")
const UMAMI_WEBSITE_ID = process.env.EXPO_PUBLIC_UMAMI_WEBSITE_ID
const UMAMI_HOSTNAME = "app.shelby"
const SESSION_IDLE_MS = 30 * 60 * 1000
const FLUSH_MS = 3000
const MAX_QUEUE = 10

// --- Identity -------------------------------------------------------------------

const DEVICE_KEY = "shelby.analytics_device_id"
let distinctId: string | null = null

const freshId = () => `dev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

/** Resolves once the persistent id is loaded (or created). */
const ready: Promise<string> = AsyncStorage.getItem(DEVICE_KEY)
  .then((stored) => stored || freshId())
  .catch(() => freshId())
  .then((id) => {
    distinctId = id
    AsyncStorage.setItem(DEVICE_KEY, id).catch(() => undefined)
    return id
  })

/**
 * The id written to cart metadata (`analytics_id`), so the backend's
 * authoritative `order_completed` event joins this person's journey.
 */
export function analyticsId(): string | null {
  return distinctId
}

let session = { id: freshId(), last: Date.now() }
function sessionId() {
  const now = Date.now()
  if (now - session.last > SESSION_IDLE_MS) session = { id: freshId(), last: now }
  session.last = now
  return session.id
}

// --- Attribution context: merged into every event -------------------------------

let context: Props = {}

/** Called when ?asset= / release attribution is captured or restored. */
export function setAnalyticsContext(next: { asset?: string; release_id?: string }) {
  context = clean({ ...context, asset: next.asset, release_id: next.release_id })
}

export function clearAnalyticsContext() {
  context = {}
}

// --- Transport ------------------------------------------------------------------

/**
 * Some analytics backends drop requests whose User-Agent looks like a bot, and
 * React Native's Android default ("okhttp/x") is on those lists. Send a
 * browser-style UA that still names the platform and the app.
 */
function userAgent() {
  const version = String(Platform.Version ?? "")
  const app = `ShelbyApp/${Constants.expoConfig?.version ?? "1.0"}`
  if (Platform.OS === "ios") {
    return `Mozilla/5.0 (iPhone; CPU iPhone OS ${version.replace(/\./g, "_")} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ${app}`
  }
  if (Platform.OS === "android") {
    return `Mozilla/5.0 (Linux; Android ${version}) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 ${app}`
  }
  return undefined // web export: the browser sends its own
}

type Queued = {
  event: string
  distinct_id: string
  session_id: string
  timestamp: string
  path: string
  url: string
  asset?: string
  platform: "app"
  device_type: "app"
  properties: Props
}

const queue: Queued[] = []
let timer: ReturnType<typeof setTimeout> | null = null

async function flush() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (!queue.length || !MEDUSA_PUBLISHABLE_KEY) return
  const events = queue.splice(0, 50)
  const ua = userAgent()
  try {
    await fetch(`${MEDUSA_BACKEND_URL}/store/analytics/events`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
        ...(ua ? { "user-agent": ua } : {}),
      },
      body: JSON.stringify({ sent_at: new Date().toISOString(), events }),
    })
  } catch {
    // Analytics never blocks shopping; a failed batch is dropped.
  }
  if (queue.length) void flush()
}

AppState.addEventListener("change", (state) => {
  if (state !== "active") void flush()
})

async function enqueue(event: string, properties: Props, path: string, url: string) {
  if (DISABLED) return
  const id = distinctId ?? (await ready)
  queue.push({
    event,
    distinct_id: id,
    session_id: sessionId(),
    timestamp: new Date().toISOString(),
    path,
    url,
    ...(typeof context.asset === "string" ? { asset: context.asset } : {}),
    platform: "app",
    device_type: "app",
    properties: clean(properties),
  })
  if (queue.length >= MAX_QUEUE) void flush()
  else if (!timer) timer = setTimeout(() => void flush(), FLUSH_MS)
}

async function sendUmami(payload: { url: string; name?: string; data?: Props }) {
  if (DISABLED || !UMAMI_URL || !UMAMI_WEBSITE_ID) return
  const { width, height } = Dimensions.get("window")
  const ua = userAgent()
  try {
    await fetch(`${UMAMI_URL}/api/send`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(ua ? { "user-agent": ua } : {}) },
      body: JSON.stringify({
        type: "event",
        payload: {
          website: UMAMI_WEBSITE_ID,
          hostname: UMAMI_HOSTNAME,
          url: payload.url,
          title: payload.name ?? payload.url,
          language: Intl.DateTimeFormat().resolvedOptions().locale,
          screen: `${Math.round(width)}x${Math.round(height)}`,
          // A per-device id keeps sessions apart on shared IPs (carrier NAT).
          id: distinctId ?? (await ready),
          ...(payload.name ? { name: payload.name, data: payload.data } : {}),
        },
      }),
    })
  } catch {
    // ignore
  }
}

// --- Public API -------------------------------------------------------------------

let currentPath = "/"
let currentUrl = "app://shelby/"

/** Screen view. `path` is the expo-router pathname; `asset` keeps tagged landings countable. */
export function trackScreen(path: string, query?: { asset?: string }) {
  currentPath = path
  const search = query?.asset ? `?asset=${encodeURIComponent(query.asset)}` : ""
  currentUrl = `app://shelby${path}${search}`
  void enqueue("$screen", { ...context, screen: path }, path, currentUrl)
  void sendUmami({ url: `${path}${search}` })
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  const merged = clean({ ...context, ...props })
  void enqueue(event, merged, currentPath, currentUrl)
  void sendUmami({ url: currentPath, name: event, data: merged })
}

/** Fires `event` once per `key` (e.g. once per product id) when props become available. */
export function useTrackOnce(event: AnalyticsEvent, key: string | null | undefined, props: () => Props) {
  const sent = useRef<string | null>(null)
  useEffect(() => {
    if (!key || sent.current === key) return
    sent.current = key
    track(event, props())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key])
}

function clean(props: Props): Props {
  return Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined && v !== null && v !== ""))
}
