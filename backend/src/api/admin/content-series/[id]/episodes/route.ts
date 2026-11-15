import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { CONTENT_MODULE } from "../../../../../modules/content"
import ContentModuleService from "../../../../../modules/content/service"
import { createContentEpisodeWorkflow } from "../../../../../workflows/content"
import { getSeriesDetail, toSlug, withDates } from "../../helpers"
import { AdminCreateEpisodeType } from "../../validators"

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateEpisodeType>,
  res: MedusaResponse
) => {
  const service: ContentModuleService = req.scope.resolve(CONTENT_MODULE)
  const series = await service.retrieveContentSeries(req.params.id, { relations: ["episodes"] })
  const body = req.validatedBody
  const asset_key =
    body.asset_key ?? toSlug(`${series.handle}-${(series.episodes?.length ?? 0) + 1}`)

  const clash = await service.listContentEpisodes({ asset_key })
  if (clash.length) {
    throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, `Asset key "${asset_key}" is already used`)
  }

  await createContentEpisodeWorkflow(req.scope).run({
    input: { data: { ...withDates(body), asset_key, series_id: series.id } },
  })
  res.status(201).json(await getSeriesDetail(req.scope, req.params.id))
}
