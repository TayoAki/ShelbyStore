import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import PostHog from "posthog-react-native"
import { useEffect, useRef } from "react"
import { Dimensions, Platform } from "react-native"

/**
 * Client analytics for the app. Event names and properties follow
 * docs/analytics.md (shared with the web storefront and the backend).
 *
 * - PostHog (self-hosted or Cloud): EXPO_PUBLIC_POSTHOG_KEY + EXPO_PUBLIC_POSTHOG_HOST
 * - Umami (self-hosted): EXPO_PUBLIC_UMAMI_URL + EXPO_PUBLIC_UMAMI_WEBSITE_ID
 *
 * Each is a no-op when its variables are missing.
 */

export type AnalyticsEvent =
  | "product_viewed"
  | "drop_viewed"
  | "add_to_cart"
  | "checkout_started"
  | "notify_me_submitted"

type Props = Record<string, string | number | boolean | null | undefined>

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
const UMAMI_URL = (process.env.EXPO_PUBLIC_UMAMI_URL || "").replace(/\/$/, "")
const UMAMI_WEBSITE_ID = process.env.EXPO_PUBLIC_UMAMI_WEBSITE_ID
const UMAMI_HOSTNAME = "app.shelby"

export const posthog: PostHog | null = POSTHOG_KEY
  ? new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST, captureAppLifecycleEvents: true })
  : null

// --- Attribution context: merged into every event -----------------------------

let context: Props = {}

/** Called when ?asset= / release attribution is captured or restored. */
export function setAnalyticsContext(next: { asset?: string; release_id?: string }) {
  context = clean({ ...context, asset: next.asset, release_id: next.release_id })
  posthog?.register(context as Record<string, string>)
}

export function clearAnalyticsContext() {
  for (const key of Object.keys(context)) posthog?.unregister(key)
  context = {}
}

// --- Device id (Umami session key) --------------------------------------------

const DEVICE_KEY = "shelby.analytics_device_id"
let deviceId: string | null = null

async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId
  const fromPostHog = posthog?.getDistinctId()
  if (fromPostHog) return (deviceId = fromPostHog)
  try {
    const stored = await AsyncStorage.getItem(DEVICE_KEY)
    if (stored) return (deviceId = stored)
  } catch {
    // fall through
  }
  const fresh = `dev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  AsyncStorage.setItem(DEVICE_KEY, fresh).catch(() => undefined)
  return (deviceId = fresh)
}

/**
 * The id written to cart metadata (`analytics_id`), so the backend's
 * authoritative `order_completed` event joins this visitor in PostHog.
 */
export function analyticsId(): string | null {
  return posthog?.getDistinctId() ?? null
}

// --- Umami ------------------------------------------------------------------

/**
 * Umami drops requests whose User-Agent looks like a bot. React Native's
 * default on Android ("okhttp/x") is on that list, so send a browser-style
 * UA that still identifies the platform and the app.
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
  return undefined // web: the browser sends its own
}

async function sendUmami(payload: { url: string; name?: string; data?: Props }) {
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) return
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
          id: await getDeviceId(),
          ...(payload.name ? { name: payload.name, data: payload.data } : {}),
        },
      }),
    })
  } catch {
    // Analytics never blocks shopping.
  }
}

// --- Public API -------------------------------------------------------------

let currentPath = "/"

/** Screen view. `path` is the expo-router pathname; `asset` keeps tagged landings countable. */
export function trackScreen(path: string, query?: { asset?: string }) {
  currentPath = path
  posthog?.screen(path, context as Record<string, string>)
  const search = query?.asset ? `?asset=${encodeURIComponent(query.asset)}` : ""
  void sendUmami({ url: `${path}${search}` })
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  const merged = clean({ ...context, ...props })
  posthog?.capture(event, merged as Record<string, string | number | boolean>)
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
