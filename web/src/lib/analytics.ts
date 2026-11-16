"use client"

import { ATTRIBUTION_COOKIE, DISTINCT_ID_COOKIE, DISTINCT_ID_MAX_AGE, isDistinctId, parseAttribution } from "./attribution"

/**
 * Shelby's first-party analytics client (our own PostHog-style tracker).
 * Events follow docs/analytics.md and are sent in batches to the same-origin
 * `/api/e` route, which forwards them to Medusa. Nothing goes to third parties;
 * the optional Umami tracker gets a mirror of custom events for its dashboard.
 *
 * - Person: first-party cookie `_shelby_id` (set by src/proxy.ts, 1 year).
 * - Session: sessionStorage, rolls over after 30 minutes of inactivity.
 * - Automatic: `$pageview` (load + client navigation), `$pageleave` (time on
 *   page + max scroll), `cta_click` for any element with data-track="<label>".
 * - Super-properties via `register()` (e.g. `$exp_<experiment>` variants) are
 *   merged into every event.
 *
 * Disable with NEXT_PUBLIC_ANALYTICS_DISABLED=true.
 */

export { DISTINCT_ID_COOKIE }
const SESSION_KEY = "_shelby_sid"
const PROPS_KEY = "_shelby_props"
const SESSION_IDLE_MS = 30 * 60 * 1000
const ENDPOINT = "/api/e"
const FLUSH_MS = 2000
const MAX_QUEUE = 10
const DISABLED = process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "true"

export const UMAMI_URL = process.env.NEXT_PUBLIC_UMAMI_URL
export const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void }
  }
}

type QueuedEvent = {
  event: string
  distinct_id: string
  session_id: string
  timestamp: string
  path: string
  url: string
  referrer: string | null
  asset?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  device_type: string
  platform: "web"
  properties: Record<string, unknown>
}

const browser = () => typeof window !== "undefined" && typeof document !== "undefined"

function readCookie(name: string): string | undefined {
  if (!browser()) return undefined
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1)
  return raw ? decodeURIComponent(raw) : undefined
}

function uuid() {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  }
}

/** The visitor's distinct id (also written to cart metadata as `analytics_id`). */
export function analyticsId(): string | undefined {
  if (!browser()) return undefined
  let id = readCookie(DISTINCT_ID_COOKIE)
  if (!isDistinctId(id)) {
    // proxy.ts normally sets it; this covers pages it doesn't run on.
    id = uuid()
    document.cookie = `${DISTINCT_ID_COOKIE}=${id}; Max-Age=${DISTINCT_ID_MAX_AGE}; Path=/; SameSite=Lax`
  }
  return id
}

function sessionId(): string {
  const now = Date.now()
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "null") as { id: string; last: number } | null
    const id = stored && now - stored.last < SESSION_IDLE_MS ? stored.id : uuid()
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, last: now }))
    return id
  } catch {
    return "no-session-storage"
  }
}

function superProps(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(PROPS_KEY) ?? "{}") as Record<string, unknown>
  } catch {
    return {}
  }
}

/** Super-properties merged into every later event (persisted per browser). */
export function register(props: Record<string, unknown>) {
  if (!browser()) return
  try {
    localStorage.setItem(PROPS_KEY, JSON.stringify({ ...superProps(), ...props }))
  } catch {
    // Private mode etc.: registration simply doesn't persist.
  }
}

export function currentAttribution() {
  return parseAttribution(readCookie(ATTRIBUTION_COOKIE))
}

const deviceType = () => {
  const w = window.innerWidth
  return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop"
}

// --- queue -------------------------------------------------------------------
//
// Delivery is at-least-once, de-duplicated by the server:
// - every event carries a unique `$insert_id`;
// - the queue is mirrored to sessionStorage, which survives same-tab navigations;
// - batches go out with fetch and leave the queue only after a 2xx response;
// - when the page is hidden or left, the queue is also sent with sendBeacon, and
//   whatever wasn't confirmed is resent from the next page. The server drops
//   insert ids it already has.

const QUEUE_KEY = "_shelby_q"
const MAX_STORED = 200
let queue: QueuedEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let inFlight = false

const insertId = (e: QueuedEvent) => e.properties.$insert_id as string

function persist() {
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_STORED)))
  } catch {
    // Storage full or blocked: delivery falls back to best effort.
  }
}

function restore() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedEvent[]
    if (Array.isArray(stored)) queue = stored.filter((e) => e && typeof e.event === "string").slice(-MAX_STORED)
  } catch {
    queue = []
  }
}

function schedule(ms = FLUSH_MS) {
  if (!timer) timer = setTimeout(flush, ms)
}

function flush() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (!queue.length || inFlight) return
  const batch = queue.slice(0, 50)
  const body = JSON.stringify({ sent_at: new Date().toISOString(), events: batch })
  inFlight = true
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "content-type": "text/plain" } })
    .then((res) => {
      if (!res.ok) return
      const sent = new Set(batch.map(insertId))
      queue = queue.filter((e) => !sent.has(insertId(e)))
      persist()
    })
    .catch(() => undefined)
    .finally(() => {
      inFlight = false
      if (queue.length) schedule(FLUSH_MS * 2)
    })
}

/** Page hidden or unloading: hand everything to sendBeacon (kept for resend). */
function beaconAll() {
  if (!queue.length || typeof navigator.sendBeacon !== "function") return
  for (let i = 0; i < queue.length; i += 50) {
    try {
      // A plain string goes as text/plain, which browsers always allow
      // (JSON Blobs are rejected by Chrome's sendBeacon). /api/e parses the text.
      navigator.sendBeacon(ENDPOINT, JSON.stringify({ sent_at: new Date().toISOString(), events: queue.slice(i, i + 50) }))
    } catch {
      // ignore
    }
  }
}

function enqueue(e: QueuedEvent) {
  queue.push(e)
  persist()
  if (queue.length >= MAX_QUEUE) flush()
  else schedule()
}

let lastUrl: string | null = null

/**
 * The page type an event happened on, so funnels can be split by landing-page
 * type (SITE_SPEC §12.0; the essay's page-type table).
 */
export function pageTypeFor(pathname: string): string {
  if (pathname === "/") return "home"
  if (pathname.startsWith("/products/")) return "pdp"
  if (pathname.startsWith("/offer/")) return "offer"
  if (pathname.startsWith("/reasons/")) return "listicle"
  if (pathname.startsWith("/read/")) return "advertorial"
  if (pathname === "/quiz/result") return "quiz_result"
  if (pathname === "/quiz") return "quiz"
  if (pathname.startsWith("/stories/")) return "story"
  if (pathname === "/shop") return "collection"
  // The Card keeps the "drops" value for continuity (SITE_SPEC G.6.0).
  if (pathname.startsWith("/card") || pathname.startsWith("/drops")) return "drops"
  if (pathname === "/custom") return "custom"
  if (pathname === "/fit-guide") return "fit_guide"
  if (pathname === "/cart") return "cart"
  if (pathname.startsWith("/checkout")) return "checkout"
  if (pathname.startsWith("/order/")) return "order"
  return "other"
}

export function track(event: string, props: Record<string, unknown> = {}) {
  capture(event, props)
}

/** `at` overrides the page the event belongs to (a page leave happens after the URL changed). */
function capture(event: string, props: Record<string, unknown>, at?: { url: string; referrer: string | null }) {
  if (DISABLED || !browser()) return
  const id = analyticsId()
  if (!id) return
  const attribution = currentAttribution() ?? {}
  const path = at ? new URL(at.url).pathname : location.pathname
  const properties = { page_type: pageTypeFor(path), ...superProps(), ...props, $insert_id: uuid() }
  enqueue({
    event,
    distinct_id: id,
    session_id: sessionId(),
    timestamp: new Date().toISOString(),
    path,
    url: at?.url ?? location.href,
    referrer: at ? at.referrer : lastUrl ?? (document.referrer || null),
    ...attribution,
    device_type: deviceType(),
    platform: "web",
    properties,
  })
  if (!event.startsWith("$")) {
    try {
      window.umami?.track(event, { ...attribution, ...props })
    } catch {
      // ignore
    }
  }
}

// --- automatic page tracking ---------------------------------------------------

let started = false
let pageStart = 0
let maxScroll = 0
let currentUrl: string | null = null
let currentReferrer: string | null = null

function scrollPct() {
  const doc = document.documentElement
  const max = Math.max(1, doc.scrollHeight - window.innerHeight)
  return Math.min(100, Math.round((window.scrollY / max) * 100))
}

function pageleave() {
  if (!currentUrl) return
  capture(
    "$pageleave",
    { time_on_page_ms: Date.now() - pageStart, max_scroll_pct: maxScroll },
    { url: currentUrl, referrer: currentReferrer }
  )
  currentUrl = null
}

function pageview() {
  const url = location.href
  if (url === currentUrl) return
  if (currentUrl) {
    const previous = currentUrl
    pageleave()
    lastUrl = previous
  }
  currentReferrer = lastUrl ?? (document.referrer || null)
  track("$pageview", { title: document.title })
  currentUrl = url
  pageStart = Date.now()
  maxScroll = scrollPct()
}

export function startAnalytics() {
  if (started || DISABLED || !browser()) return
  started = true

  // Events a previous page couldn't confirm (e.g. it navigated away mid-send).
  restore()
  if (queue.length) flush()

  pageview()

  // Client-side navigations (Next.js uses history.pushState). replaceState is
  // ignored on purpose: filters and scroll restoration use it.
  const push = history.pushState
  history.pushState = function (...args) {
    const result = push.apply(this, args)
    setTimeout(pageview, 0)
    return result
  }
  window.addEventListener("popstate", () => setTimeout(pageview, 0))

  window.addEventListener(
    "scroll",
    () => {
      const p = scrollPct()
      if (p > maxScroll) maxScroll = p
    },
    { passive: true }
  )

  document.addEventListener(
    "click",
    (e) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]") as HTMLElement | null
      if (!el) return
      track("cta_click", {
        label: el.dataset.track,
        text: (el.innerText || "").trim().slice(0, 80),
        href: el.getAttribute("href"),
      })
    },
    { capture: true }
  )

  // Leaving or backgrounding the tab: record the page leave and send with sendBeacon.
  const hide = () => {
    pageleave()
    beaconAll()
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") hide()
    else if (!currentUrl) {
      // Back from the background: start timing the same page again.
      currentUrl = location.href
      pageStart = Date.now()
    }
  })
  window.addEventListener("pagehide", hide)
}
