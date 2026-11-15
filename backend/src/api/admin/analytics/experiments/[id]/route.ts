import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { deleteExperimentWorkflow, updateExperimentWorkflow } from "../../../../../workflows/analytics"
import { analytics, getExperimentResults } from "../../helpers"
import { AdminUpdateExperimentType } from "../../validators"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const experiment = await analytics(req.scope).retrieveAnalyticsExperiment(req.params.id)
  const results = experiment.status === "draft" ? null : await getExperimentResults(req.scope, experiment as any)
  res.json({ experiment, results })
}

export const POST = async (req: AuthenticatedMedusaRequest<AdminUpdateExperimentType>, res: MedusaResponse) => {
  const current = await analytics(req.scope).retrieveAnalyticsExperiment(req.params.id)
  const data = req.validatedBody
  // Changing what is being tested mid-flight would invalidate the results.
  if (current.status !== "draft" && (data.variants || data.key || data.funnel_steps)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Key, variants and the primary metric can only change while the experiment is a draft"
    )
  }
  const { result } = await updateExperimentWorkflow(req.scope).run({ input: { id: req.params.id, data } })
  res.json({ experiment: result })
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const current = await analytics(req.scope).retrieveAnalyticsExperiment(req.params.id)
  if (current.status === "running") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Stop the experiment before deleting it")
  }
  await deleteExperimentWorkflow(req.scope).run({ input: { id: req.params.id } })
  res.json({ id: req.params.id, object: "analytics_experiment", deleted: true })
}
