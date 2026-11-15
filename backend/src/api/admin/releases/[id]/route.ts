import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { canTransition } from "../../../../lib/playbook"
import { RELEASE_MODULE } from "../../../../modules/release"
import ReleaseModuleService from "../../../../modules/release/service"
import { deleteReleaseWorkflow, updateReleaseWorkflow } from "../../../../workflows/release"
import { AdminUpdateReleaseType } from "../../../validators"
import { getAdminRelease, toReleaseData } from "../helpers"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const release = await getAdminRelease(req.scope, req.params.id)
  res.json({ release })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateReleaseType>,
  res: MedusaResponse
) => {
  const service: ReleaseModuleService = req.scope.resolve(RELEASE_MODULE)
  const current = await service.retrieveRelease(req.params.id)
  const { data, product_ids } = toReleaseData(req.validatedBody)

  if (data.status && !canTransition(current.status as any, data.status)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `A ${current.status} release can't be moved to ${data.status}`
    )
  }
  if (data.status === "scheduled") {
    const releaseAt = (data as any).release_at ?? current.release_at
    if (!releaseAt) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Set a release date before scheduling")
    }
    if (current.status === "held") {
      // Moving a held release back onto the calendar needs a new date in the future.
      if (new Date(releaseAt).getTime() <= Date.now()) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Move the release date into the future before rescheduling"
        )
      }
      ;(data as any).hold_reason = null
    }
  }

  await updateReleaseWorkflow(req.scope).run({
    input: { id: req.params.id, data, product_ids },
  })
  const release = await getAdminRelease(req.scope, req.params.id)
  res.json({ release })
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  await deleteReleaseWorkflow(req.scope).run({ input: { id: req.params.id } })
  res.json({ id: req.params.id, object: "release", deleted: true })
}
