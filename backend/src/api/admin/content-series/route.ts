import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createContentSeriesWorkflow } from "../../../workflows/content"
import { getSeriesDetail, toSlug } from "./helpers"
import { AdminCreateSeriesType } from "./validators"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "content_series",
    fields: [
      "id",
      "title",
      "handle",
      "stance",
      "channel",
      "owner",
      "status",
      "decision",
      "revision_target",
      "episode_target",
      "updated_at",
      "episodes.id",
      "episodes.published_at",
      "episodes.deleted_at",
    ],
  })
  const now = Date.now()
  const series = (data as any[])
    .map((s) => {
      const eps = (s.episodes ?? []).filter((e: any) => e && !e.deleted_at)
      return {
        ...s,
        episodes: undefined,
        episode_count: eps.length,
        published_count: eps.filter((e: any) => e.published_at && new Date(e.published_at).getTime() <= now)
          .length,
      }
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  res.json({ series, count: series.length })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateSeriesType>,
  res: MedusaResponse
) => {
  const body = req.validatedBody
  const { result } = await createContentSeriesWorkflow(req.scope).run({
    input: { data: { ...body, handle: body.handle ?? toSlug(body.title), status: "draft" } },
  })
  res.status(201).json(await getSeriesDetail(req.scope, result.id))
}
