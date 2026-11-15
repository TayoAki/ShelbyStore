import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { analytics } from "../helpers"

/** Live events: the latest events, newest first. */
export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 100) || 100))
  const filters: Record<string, string> = {}
  if (typeof req.query.event === "string" && req.query.event) filters.event = req.query.event
  if (typeof req.query.distinct_id === "string" && req.query.distinct_id) filters.distinct_id = req.query.distinct_id
  const events = await analytics(req.scope).listAnalyticsEvents(filters, {
    order: { occurred_at: "DESC" },
    take: limit,
  })
  res.json({ events })
}
