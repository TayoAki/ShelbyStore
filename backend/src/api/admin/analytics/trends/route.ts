import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { trendsQuery } from "../../../../lib/analytics"
import { analytics, parseRange, STORE_TIMEZONE } from "../helpers"
import { AdminTrendsQueryType } from "../validators"

export const POST = async (req: AuthenticatedMedusaRequest<AdminTrendsQueryType>, res: MedusaResponse) => {
  const body = req.validatedBody
  const { from, to } = parseRange(body.from, body.to, 30)
  const rows = await analytics(req.scope).runQuery(
    trendsQuery({ events: body.events, from, to, timezone: STORE_TIMEZONE, breakdown: body.breakdown, filters: body.filters })
  )
  res.json({ trends: rows, range: { from: from.toISOString(), to: to.toISOString(), timezone: STORE_TIMEZONE } })
}
