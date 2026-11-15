import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { canTransitionSeries, evaluateSeriesReadiness } from "../../../../lib/content-playbook"
import { CONTENT_MODULE } from "../../../../modules/content"
import ContentModuleService from "../../../../modules/content/service"
import { deleteContentSeriesWorkflow, updateContentSeriesWorkflow } from "../../../../workflows/content"
import { getSeriesDetail } from "../helpers"
import { AdminUpdateSeriesType } from "../validators"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  res.json(await getSeriesDetail(req.scope, req.params.id))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateSeriesType>,
  res: MedusaResponse
) => {
  const service: ContentModuleService = req.scope.resolve(CONTENT_MODULE)
  const current = await service.retrieveContentSeries(req.params.id)
  const data = req.validatedBody

  if (data.status && !canTransitionSeries(current.status as any, data.status)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `A ${current.status} series can't be moved to ${data.status}`
    )
  }
  if (data.status === "piloting" && current.status !== "piloting") {
    // SOP 1 + 2: don't film until the stance, proof, format and prompt are in place.
    const readiness = evaluateSeriesReadiness({ ...current, ...data } as any)
    if (!readiness.ready) {
      const missing = readiness.checks.filter((c) => !c.passed).map((c) => c.label)
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Not ready to pilot. Still missing: ${missing.join("; ")}`
      )
    }
  }

  await updateContentSeriesWorkflow(req.scope).run({
    input: { data: { ...data, id: req.params.id } },
  })
  res.json(await getSeriesDetail(req.scope, req.params.id))
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  await deleteContentSeriesWorkflow(req.scope).run({ input: { id: req.params.id } })
  res.json({ id: req.params.id, object: "content_series", deleted: true })
}
