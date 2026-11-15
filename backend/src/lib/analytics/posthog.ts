import { PostHog } from "posthog-node"

/**
 * Server-side PostHog capture. Works the same against PostHog Cloud or a
 * self-hosted PostHog: set POSTHOG_API_KEY (project key, phc_...) and
 * POSTHOG_HOST (e.g. https://us.i.posthog.com or your own domain).
 * Without POSTHOG_API_KEY every call is a no-op.
 */
let client: PostHog | null | undefined

export function getPostHog(): PostHog | null {
  if (client !== undefined) {
    return client
  }
  const key = process.env.POSTHOG_API_KEY
  client = key
    ? new PostHog(key, {
        host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
        flushAt: 20,
        flushInterval: 10_000,
      })
    : null
  return client
}

export const isPostHogConfigured = () => !!process.env.POSTHOG_API_KEY

export type ServerEvent = {
  event: string
  distinctId: string
  properties?: Record<string, unknown>
  /** Dedupes retries (e.g. the order id). */
  insertId?: string
  timestamp?: Date
}

/** Captures and sends immediately. Returns false when PostHog isn't configured. */
export async function captureServerEvent(e: ServerEvent): Promise<boolean> {
  const ph = getPostHog()
  if (!ph) {
    return false
  }
  await ph.captureImmediate({
    distinctId: e.distinctId,
    event: e.event,
    timestamp: e.timestamp,
    properties: {
      ...e.properties,
      ...(e.insertId ? { $insert_id: e.insertId } : {}),
      $lib_source: "shelby-backend",
    },
  })
  return true
}

/** For tests. */
export function _resetPostHog() {
  client = undefined
}
