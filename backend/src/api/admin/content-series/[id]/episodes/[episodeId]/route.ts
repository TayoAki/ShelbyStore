import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { CONTENT_MODULE } from "../../../../../../modules/content"
import ContentModuleService from "../../../../../../modules/content/service"
import {
  deleteContentEpisodeWorkflow,
  updateContentEpisodeWorkflow,
} from "../../../../../../workflows/content"
import { getSeriesDetail, withDates } from "../../../helpers"
import { AdminUpdateEpisodeType } from "../../../validators"

async function assertEpisode(req: AuthenticatedMedusaRequest) {
  const service: ContentModuleService = req.scope.resolve(CONTENT_MODULE)
  const [episode] = await service.listContentEpisodes({
    id: req.params.episodeId,
    series_id: req.params.id,
  } as any)
  if (!episode) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Episode not found in this series")
  }
  return service
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateEpisodeType>,
  res: MedusaResponse
) => {
  const service = await assertEpisode(req)
  const body = req.validatedBody
  if (body.asset_key) {
    const clash = await service.listContentEpisodes({ asset_key: body.asset_key })
    if (clash.some((e) => e.id !== req.params.episodeId)) {
      throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, `Asset key "${body.asset_key}" is already used`)
    }
  }
  await updateContentEpisodeWorkflow(req.scope).run({
    input: { data: { ...withDates(body), id: req.params.episodeId } },
  })
  res.json(await getSeriesDetail(req.scope, req.params.id))
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  await assertEpisode(req)
  await deleteContentEpisodeWorkflow(req.scope).run({ input: { id: req.params.episodeId } })
  res.json(await getSeriesDetail(req.scope, req.params.id))
}
