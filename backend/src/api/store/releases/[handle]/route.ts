import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { findStoreRelease } from "../helpers"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const release = await findStoreRelease(query, req.params.handle)
  if (!release) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Release not found")
  }
  res.json({ release })
}
