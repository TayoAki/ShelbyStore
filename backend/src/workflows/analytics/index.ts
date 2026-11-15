import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createExperimentStep, deleteExperimentStep, updateExperimentStep } from "./steps"

export const createExperimentWorkflow = createWorkflow(
  "create-analytics-experiment",
  (input: { data: Record<string, unknown> }) => {
    const experiment = createExperimentStep(input.data)
    return new WorkflowResponse(experiment)
  }
)

/** Edits, status changes (start/stop) and decisions all go through here. */
export const updateExperimentWorkflow = createWorkflow(
  "update-analytics-experiment",
  (input: { id: string; data: Record<string, unknown> }) => {
    const update = transform({ input }, ({ input }) => ({ id: input.id, ...input.data }))
    const experiment = updateExperimentStep(update)
    return new WorkflowResponse(experiment)
  }
)

export const deleteExperimentWorkflow = createWorkflow(
  "delete-analytics-experiment",
  (input: { id: string }) => {
    deleteExperimentStep(input.id)
    return new WorkflowResponse(input.id)
  }
)
