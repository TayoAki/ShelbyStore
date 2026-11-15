import { z } from "@medusajs/framework/zod"
import { MAX_BATCH } from "../../../lib/analytics"

const s = (max: number) => z.string().max(max).nullish()

/**
 * One batch from the storefront or the app. Field-level cleaning (patterns,
 * clamping, property size) happens in lib/analytics/ingest; this schema only
 * bounds shapes and sizes so a single request can't be huge.
 */
export const StoreAnalyticsBatch = z.object({
  sent_at: z.iso.datetime({ offset: true }).optional(),
  events: z
    .array(
      z.object({
        event: z.string().min(1).max(64),
        distinct_id: z.string().min(1).max(200),
        session_id: s(200),
        timestamp: s(64),
        path: s(1000),
        url: s(2048),
        referrer: s(2048),
        asset: s(120),
        utm_source: s(120),
        utm_medium: s(120),
        utm_campaign: s(120),
        device_type: s(20),
        platform: s(20),
        properties: z.record(z.string(), z.unknown()).nullish(),
      })
    )
    .min(1)
    .max(MAX_BATCH),
})
export type StoreAnalyticsBatchType = z.infer<typeof StoreAnalyticsBatch>
