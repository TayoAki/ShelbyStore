import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { removeRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { RELEASE_MODULE } from "../../modules/release"
import { deleteReleaseStep } from "./steps/delete-release"

export const deleteReleaseWorkflow = createWorkflow(
  "delete-release",
  (input: { id: string }) => {
    const linkSelector = transform({ input }, ({ input }) => ({
      [RELEASE_MODULE]: { release_id: input.id },
    }))
    // Removes the release ↔ product links before the release itself.
    removeRemoteLinkStep(linkSelector as any)
    deleteReleaseStep(input.id)
    return new WorkflowResponse(input.id)
  }
)
