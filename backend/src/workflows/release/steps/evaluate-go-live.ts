import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { evaluateGoLive, GoLiveEvaluation } from "../../../lib/playbook"
import { loadReleaseWithProducts, loadVariantStock } from "../../../lib/release-data"

export type GoLiveEvaluationResult = GoLiveEvaluation & {
  release_id: string
  product_ids: string[]
  starting_units: number
}

/** Runs the SOP 4 go/no-go checks against live data. Read-only. */
export const evaluateGoLiveStep = createStep(
  "evaluate-release-go-live",
  async ({ release_id }: { release_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const release = await loadReleaseWithProducts(query, release_id)
    if (!release) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Release ${release_id} not found`)
    }
    if (release.status === "live" || release.status === "reviewed") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Release is already ${release.status}`
      )
    }
    const products = (release.products ?? []).filter(Boolean)
    const variants = await loadVariantStock(query, products)
    const evaluation = evaluateGoLive(release, {
      product_count: products.length,
      variants,
    })
    const starting_units = variants.reduce((sum, v) => sum + Math.max(0, v.available ?? 0), 0)

    return new StepResponse<GoLiveEvaluationResult>({
      ...evaluation,
      release_id,
      product_ids: products.map((p: { id: string }) => p.id),
      starting_units,
    })
  }
)
