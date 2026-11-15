import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getReleaseScorecard } from "../../helpers"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const scorecard = await getReleaseScorecard(req.scope, req.params.id)
  res.json({ scorecard })
}
