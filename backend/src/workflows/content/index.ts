import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  createEpisodeStep,
  createSeriesStep,
  deleteEpisodeStep,
  deleteSeriesStep,
  updateEpisodeStep,
  updateSeriesStep,
} from "./steps"

type Data = Record<string, unknown>

export const createContentSeriesWorkflow = createWorkflow(
  "create-content-series",
  (input: { data: Data }) => new WorkflowResponse(createSeriesStep(input.data))
)

export const updateContentSeriesWorkflow = createWorkflow(
  "update-content-series",
  (input: { data: Data & { id: string } }) => new WorkflowResponse(updateSeriesStep(input.data))
)

export const deleteContentSeriesWorkflow = createWorkflow(
  "delete-content-series",
  (input: { id: string }) => new WorkflowResponse(deleteSeriesStep(input.id))
)

export const createContentEpisodeWorkflow = createWorkflow(
  "create-content-episode",
  (input: { data: Data & { series_id: string } }) => new WorkflowResponse(createEpisodeStep(input.data))
)

export const updateContentEpisodeWorkflow = createWorkflow(
  "update-content-episode",
  (input: { data: Data & { id: string } }) => new WorkflowResponse(updateEpisodeStep(input.data))
)

export const deleteContentEpisodeWorkflow = createWorkflow(
  "delete-content-episode",
  (input: { id: string }) => new WorkflowResponse(deleteEpisodeStep(input.id))
)
