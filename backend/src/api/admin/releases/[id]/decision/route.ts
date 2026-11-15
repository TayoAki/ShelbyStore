import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { RELEASE_MODULE } from "../../../../../modules/release"
import ReleaseModuleService from "../../../../../modules/release/service"
import { updateReleaseWorkflow } from "../../../../../workflows/release"
import { AdminReleaseDecisionType } from "../../../../validators"
import { getAdminRelease } from "../../helpers"

/** SOP 4 step 3: record whether to repeat, simplify or pause the next release. */
export const POST = async (
  req: AuthenticatedMedusaRequest<AdminReleaseDecisionType>,
  res: MedusaResponse
) => {
  const service: ReleaseModuleService = req.scope.resolve(RELEASE_MODULE)
  const current = await service.retrieveRelease(req.params.id)
  if (current.status !== "live" && current.status !== "reviewed") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Record a decision after the release has gone live"
    )
  }

  let decidedBy = req.auth_context?.actor_id ?? null
  try {
    const user = await req.scope.resolve(Modules.USER).retrieveUser(decidedBy!)
    decidedBy = user.email ?? decidedBy
  } catch {
    // Keep the actor id if the user can't be loaded.
  }

  await updateReleaseWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      data: {
        decision: req.validatedBody.decision,
        decision_notes: req.validatedBody.notes ?? null,
        decided_by: decidedBy,
        decided_at: new Date(),
        status: "reviewed",
      },
    },
  })
  const release = await getAdminRelease(req.scope, req.params.id)
  res.json({ release })
}
