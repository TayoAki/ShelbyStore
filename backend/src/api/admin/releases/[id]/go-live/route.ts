import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { goLiveReleaseWorkflow } from "../../../../../workflows/release"
import { getAdminRelease } from "../../helpers"

/** Run the go/no-go checks now. Publishes the release, or holds it with reasons. */
export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { result } = await goLiveReleaseWorkflow(req.scope).run({
    input: { release_id: req.params.id },
  })
  const release = await getAdminRelease(req.scope, req.params.id)
  res.json({ release, evaluation: result })
}
