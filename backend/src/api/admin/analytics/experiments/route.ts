import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { createExperimentWorkflow } from "../../../../workflows/analytics"
import { analytics } from "../helpers"
import { AdminCreateExperimentType } from "../validators"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const experiments = await analytics(req.scope).listAnalyticsExperiments({}, { order: { created_at: "DESC" } })
  res.json({ experiments })
}

export const POST = async (req: AuthenticatedMedusaRequest<AdminCreateExperimentType>, res: MedusaResponse) => {
  const existing = await analytics(req.scope).listAnalyticsExperiments({ key: req.validatedBody.key })
  if (existing.length) {
    throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, `An experiment with key "${req.validatedBody.key}" exists`)
  }
  const { result } = await createExperimentWorkflow(req.scope).run({
    input: { data: { ...req.validatedBody, status: "draft" } },
  })
  res.status(201).json({ experiment: result })
}
