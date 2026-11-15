import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { RELEASE_MODULE } from "../../../../../modules/release"
import ReleaseModuleService from "../../../../../modules/release/service"
import { StoreCreateReminderType } from "../../../../validators"
import { findStoreRelease } from "../../helpers"

/** "Notify me" for an upcoming drop. Accepts the release id or handle. */
export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateReminderType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const release = await findStoreRelease(query, req.params.handle)
  if (!release) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Release not found")
  }
  if (release.phase !== "upcoming") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      release.phase === "live" ? "This drop is already live" : "This drop has ended"
    )
  }

  const service: ReleaseModuleService = req.scope.resolve(RELEASE_MODULE)
  const email = req.validatedBody.email?.trim().toLowerCase() ?? null
  const push_token = req.validatedBody.push_token ?? null
  const customer_id = req.auth_context?.actor_id || null

  // One reminder per email / device per release.
  const existing = await service.listReleaseReminders({
    release_id: release.id,
    $or: [
      ...(email ? [{ email }] : []),
      ...(push_token ? [{ push_token }] : []),
    ],
  } as any)

  if (existing.length) {
    const reminder = existing[0]
    const updated = await service.updateReleaseReminders({
      id: reminder.id,
      email: email ?? reminder.email,
      push_token: push_token ?? reminder.push_token,
      customer_id: customer_id ?? reminder.customer_id,
    })
    res.status(200).json({ reminder: { id: updated.id } })
    return
  }

  const reminder = await service.createReleaseReminders({
    release_id: release.id,
    email,
    push_token,
    customer_id,
  })
  res.status(201).json({ reminder: { id: reminder.id } })
}
