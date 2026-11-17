import { MedusaContainer } from "@medusajs/framework/types"
import { ANALYTICS_MODULE } from "../../modules/analytics"
import type AnalyticsModuleService from "../../modules/analytics/service"
import { normalizeEvent } from "./ingest"

export type ServerEvent = {
  event: string
  distinctId: string
  properties?: Record<string, unknown>
  /** Dedupes retries (e.g. order_completed:<order id>). */
  insertId?: string
  timestamp?: Date
}

/**
 * Records a server-side event (platform "server") in first-party analytics.
 * Attribution properties (asset, utm_*) are lifted into their columns so
 * funnels, breakdowns and scorecards can use them. Returns false if the event
 * was dropped or its insert id was already recorded.
 */
export async function captureServerEvent(container: MedusaContainer, e: ServerEvent): Promise<boolean> {
  const service: AnalyticsModuleService = container.resolve<AnalyticsModuleService>(ANALYTICS_MODULE)
  const now = new Date()
  const row = normalizeEvent(
    {
      event: e.event,
      distinct_id: e.distinctId,
      timestamp: (e.timestamp ?? now).toISOString(),
      platform: "server",
      device_type: "server",
      properties: { ...e.properties, ...(e.insertId ? { $insert_id: e.insertId } : {}) },
    },
    { receivedAt: now, allowServerPlatform: true }
  )
  if (!row) return false
  // A repeated insert id (e.g. a retried order.placed) is skipped by the unique index.
  return (await service.ingestEvents([row])) === 1
}
