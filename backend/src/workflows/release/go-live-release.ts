import { ProductStatus } from "@medusajs/framework/utils"
import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { emitEventStep, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { evaluateGoLiveStep } from "./steps/evaluate-go-live"
import { updateReleaseStep } from "./steps/update-release"

export const RELEASE_LIVE_EVENT = "release.live"

/**
 * SOP 4: check inventory, PDP, fulfillment, links and tracking. Publish the
 * products only if every check passes. Otherwise hold the release and record
 * why, so the team can fix the issue and move the date.
 */
export const goLiveReleaseWorkflow = createWorkflow(
  "go-live-release",
  (input: { release_id: string }) => {
    const evaluation = evaluateGoLiveStep({ release_id: input.release_id })

    when("release-passes-checks", { evaluation }, ({ evaluation }) => evaluation.ready).then(
      () => {
        const productUpdate = transform({ evaluation }, ({ evaluation }) => ({
          selector: { id: evaluation.product_ids },
          update: { status: ProductStatus.PUBLISHED },
        }))
        updateProductsWorkflow.runAsStep({ input: productUpdate })

        const liveUpdate = transform({ evaluation }, ({ evaluation }) => ({
          id: evaluation.release_id,
          status: "live",
          published_at: new Date(),
          starting_units: evaluation.starting_units,
          hold_reason: null,
        }))
        updateReleaseStep(liveUpdate).config({ name: "mark-release-live" })

        const event = transform({ evaluation }, ({ evaluation }) => ({
          eventName: RELEASE_LIVE_EVENT,
          data: { id: evaluation.release_id },
        }))
        emitEventStep(event)
      }
    )

    when("release-fails-checks", { evaluation }, ({ evaluation }) => !evaluation.ready).then(
      () => {
        const holdUpdate = transform({ evaluation }, ({ evaluation }) => ({
          id: evaluation.release_id,
          status: "held",
          hold_reason: evaluation.failures.join("\n"),
        }))
        updateReleaseStep(holdUpdate).config({ name: "mark-release-held" })
      }
    )

    return new WorkflowResponse(evaluation)
  }
)
