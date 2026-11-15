import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { syncReleaseProductsStep } from "./steps/sync-release-products"
import { updateReleaseStep } from "./steps/update-release"

export type UpdateReleaseWorkflowInput = {
  id: string
  data: Record<string, unknown>
  product_ids?: string[]
}

export const updateReleaseWorkflow = createWorkflow(
  "update-release",
  (input: UpdateReleaseWorkflowInput) => {
    const updateInput = transform({ input }, ({ input }) => ({ id: input.id, ...input.data }))
    const release = updateReleaseStep(updateInput)

    when("update-release-has-products", { input }, ({ input }) => Array.isArray(input.product_ids)).then(() => {
      const syncInput = transform({ input }, ({ input }) => ({
        release_id: input.id,
        product_ids: input.product_ids!,
      }))
      syncReleaseProductsStep(syncInput)
    })

    return new WorkflowResponse(release)
  }
)
