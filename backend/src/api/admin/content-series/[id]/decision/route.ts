import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { STATUS_FOR_DECISION } from "../../../../../lib/content-playbook"
import { CONTENT_MODULE } from "../../../../../modules/content"
import ContentModuleService from "../../../../../modules/content/service"
import { updateContentSeriesWorkflow } from "../../../../../workflows/content"
import { getSeriesDetail } from "../../helpers"
import { AdminSeriesDecisionType } from "../../validators"

/** SOP 3 step 3: record the batch decision and the one change for the next batch. */
export const POST = async (
  req: AuthenticatedMedusaRequest<AdminSeriesDecisionType>,
  res: MedusaResponse
) => {
  const service: ContentModuleService = req.scope.resolve(CONTENT_MODULE)
  const current = await service.retrieveContentSeries(req.params.id)
  if (current.status === "draft") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Run the pilot before recording a decision")
  }
  const body = req.validatedBody
  if (body.decision === "revise" && !body.revision_target) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Say what to revise: the opening, the topic or the booking path"
    )
  }

  let decidedBy = req.auth_context?.actor_id ?? null
  try {
    decidedBy = (await req.scope.resolve(Modules.USER).retrieveUser(decidedBy!)).email ?? decidedBy
  } catch {
    // keep the actor id
  }

  await updateContentSeriesWorkflow(req.scope).run({
    input: {
      data: {
        id: req.params.id,
        decision: body.decision,
        revision_target: body.decision === "revise" ? body.revision_target : null,
        next_change: body.next_change ?? null,
        decision_notes: body.notes ?? null,
        decided_by: decidedBy,
        decided_at: new Date(),
        status: STATUS_FOR_DECISION[body.decision],
      },
    },
  })
  res.json(await getSeriesDetail(req.scope, req.params.id))
}
