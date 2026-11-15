import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createReleaseWorkflow } from "../../../workflows/release"
import { AdminCreateReleaseType } from "../../validators"
import { getAdminRelease, toReleaseData, toSlug } from "./helpers"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const filters: Record<string, unknown> = {}
  if (typeof req.query.status === "string") {
    filters.status = req.query.status.split(",")
  }
  const { data: releases } = await query.graph({
    entity: "release",
    fields: [
      "id",
      "title",
      "handle",
      "tier",
      "status",
      "release_at",
      "published_at",
      "owner",
      "decision",
      "hold_reason",
      "hero_image",
      "products.id",
      "products.thumbnail",
    ],
    filters,
  })

  // Newest release date first.
  const ts = (r: any) => new Date(r.release_at ?? r.published_at ?? 0).getTime()
  const q = typeof req.query.q === "string" ? req.query.q.toLowerCase() : ""
  const sorted = (releases as any[])
    .filter((r) => !q || r.title.toLowerCase().includes(q) || r.handle.includes(q))
    .sort((a, b) => ts(b) - ts(a))
  res.json({ releases: sorted, count: sorted.length })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateReleaseType>,
  res: MedusaResponse
) => {
  const body = req.validatedBody
  const { data, product_ids } = toReleaseData({
    ...body,
    handle: body.handle ?? toSlug(body.title),
  })
  const { result } = await createReleaseWorkflow(req.scope).run({
    input: { data: data as any, product_ids },
  })
  const release = await getAdminRelease(req.scope, result.id)
  res.status(201).json({ release })
}
