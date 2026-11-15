import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { isBotUserAgent, normalizeEvent } from "../../../../lib/analytics"
import { ANALYTICS_MODULE } from "../../../../modules/analytics"
import type AnalyticsModuleService from "../../../../modules/analytics/service"
import { StoreAnalyticsBatchType } from "../validators"

/**
 * Event ingestion for the storefront (via its same-origin /api/e proxy) and
 * the app. Validated and normalized server-side; bots are dropped. No IP
 * address is stored.
 */
export const POST = async (req: MedusaRequest<StoreAnalyticsBatchType>, res: MedusaResponse) => {
  const ua = req.get("user-agent") ?? null
  if (isBotUserAgent(ua)) {
    res.status(202).json({ accepted: 0 })
    return
  }
  const receivedAt = new Date()
  const sentAt = req.validatedBody.sent_at ? new Date(req.validatedBody.sent_at) : null
  const rows = req.validatedBody.events
    .map((e) => normalizeEvent(e, { receivedAt, sentAt, userAgent: ua }))
    .filter((r): r is NonNullable<typeof r> => r !== null)

  const service: AnalyticsModuleService = req.scope.resolve(ANALYTICS_MODULE)
  // Clients deliver at-least-once; the unique `$insert_id` index drops repeats.
  const inserted = rows.length ? await service.ingestEvents(rows) : 0
  res.status(202).json({ accepted: inserted, duplicates: rows.length - inserted })
}
