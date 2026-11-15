import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { analytics, getExperimentResults } from "../../../helpers"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const experiment = await analytics(req.scope).retrieveAnalyticsExperiment(req.params.id)
  res.json({ results: await getExperimentResults(req.scope, experiment as any) })
}
