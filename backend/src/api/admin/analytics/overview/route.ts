import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getOverview, parseRange } from "../helpers"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { from, to } = parseRange(req.query.from as string | undefined, req.query.to as string | undefined, 7)
  res.json({ overview: await getOverview(req.scope, from, to) })
}
