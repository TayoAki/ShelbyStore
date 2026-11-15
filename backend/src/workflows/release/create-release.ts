import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createReleaseStep, CreateReleaseStepInput } from "./steps/create-release"
import { syncReleaseProductsStep } from "./steps/sync-release-products"

export type CreateReleaseWorkflowInput = {
  data: CreateReleaseStepInput
  product_ids?: string[]
}

export const createReleaseWorkflow = createWorkflow(
  "create-release",
  (input: CreateReleaseWorkflowInput) => {
    const release = createReleaseStep(input.data)

    when("create-release-has-products", { input }, ({ input }) => !!input.product_ids?.length).then(() => {
      const syncInput = transform({ input, release }, ({ input, release }) => ({
        release_id: release.id,
        product_ids: input.product_ids!,
      }))
      syncReleaseProductsStep(syncInput)
    })

    return new WorkflowResponse(release)
  }
)
