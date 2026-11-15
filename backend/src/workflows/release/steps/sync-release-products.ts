import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RELEASE_MODULE } from "../../../modules/release"

type Input = { release_id: string; product_ids: string[] }

const linkDef = (release_id: string, product_id: string) => ({
  [RELEASE_MODULE]: { release_id },
  [Modules.PRODUCT]: { product_id },
})

/** Replaces the release's product list with `product_ids`. */
export const syncReleaseProductsStep = createStep(
  "sync-release-products",
  async ({ release_id, product_ids }: Input, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    const { data } = await query.graph({
      entity: "release",
      fields: ["products.id"],
      filters: { id: release_id },
    })
    const current: string[] = ((data?.[0] as any)?.products ?? [])
      .filter(Boolean)
      .map((p: { id: string }) => p.id)

    const wanted = [...new Set(product_ids)]
    const toAdd = wanted.filter((id) => !current.includes(id))
    const toRemove = current.filter((id) => !wanted.includes(id))

    if (toRemove.length) {
      await link.dismiss(toRemove.map((id) => linkDef(release_id, id)))
    }
    if (toAdd.length) {
      await link.create(toAdd.map((id) => linkDef(release_id, id)))
    }
    return new StepResponse(wanted, { release_id, toAdd, toRemove })
  },
  async (comp, { container }) => {
    if (!comp) return
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    if (comp.toAdd.length) {
      await link.dismiss(comp.toAdd.map((id) => linkDef(comp.release_id, id)))
    }
    if (comp.toRemove.length) {
      await link.create(comp.toRemove.map((id) => linkDef(comp.release_id, id)))
    }
  }
)
