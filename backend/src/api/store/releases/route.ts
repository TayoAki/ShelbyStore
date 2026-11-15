import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { listStoreReleases, StorePhase } from "./helpers"

const PHASES: StorePhase[] = ["live", "upcoming", "past"]

/** Drop calendar: live drops, upcoming drops (teasers) and recent past drops. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const phase = PHASES.find((p) => p === req.query.phase)
  const releases = await listStoreReleases(query, phase)
  res.json({ releases })
}
