import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { updateExperimentWorkflow } from "../../../../../../workflows/analytics"
import { analytics } from "../../../helpers"
import { AdminExperimentDecisionType } from "../../../validators"

/** Records the outcome in the experiment log (ship / keep control / iterate). */
export const POST = async (req: AuthenticatedMedusaRequest<AdminExperimentDecisionType>, res: MedusaResponse) => {
  const current = await analytics(req.scope).retrieveAnalyticsExperiment(req.params.id)
  if (current.status === "draft") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Run the experiment before recording a decision")
  }
  const { result } = await updateExperimentWorkflow(req.scope).run({
    input: { id: req.params.id, data: { decision: req.validatedBody.decision, notes: req.validatedBody.notes ?? current.notes } },
  })
  res.json({ experiment: result })
}
