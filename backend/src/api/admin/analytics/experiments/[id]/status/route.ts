import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { updateExperimentWorkflow } from "../../../../../../workflows/analytics"
import { analytics } from "../../../helpers"
import { AdminExperimentStatusType } from "../../../validators"

/** Start (draft/stopped → running) or stop (running → stopped) an experiment. */
export const POST = async (req: AuthenticatedMedusaRequest<AdminExperimentStatusType>, res: MedusaResponse) => {
  const current = await analytics(req.scope).retrieveAnalyticsExperiment(req.params.id)
  const next = req.validatedBody.status
  if (next === current.status) {
    res.json({ experiment: current })
    return
  }
  if (next === "stopped" && current.status !== "running") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Only a running experiment can be stopped")
  }
  const data =
    next === "running"
      ? { status: "running", started_at: current.started_at ?? new Date(), ended_at: null }
      : { status: "stopped", ended_at: new Date() }
  const { result } = await updateExperimentWorkflow(req.scope).run({ input: { id: req.params.id, data } })
  res.json({ experiment: result })
}
