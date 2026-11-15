import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ANALYTICS_MODULE } from "../../modules/analytics"
import type AnalyticsModuleService from "../../modules/analytics/service"

export const createExperimentStep = createStep(
  "create-analytics-experiment",
  async (input: Record<string, unknown>, { container }) => {
    const service: AnalyticsModuleService = container.resolve(ANALYTICS_MODULE)
    const experiment = await service.createAnalyticsExperiments(input as any)
    return new StepResponse(experiment, experiment.id)
  },
  async (id, { container }) => {
    if (!id) return
    const service: AnalyticsModuleService = container.resolve(ANALYTICS_MODULE)
    await service.deleteAnalyticsExperiments(id)
  }
)

export const updateExperimentStep = createStep(
  "update-analytics-experiment",
  async (input: Record<string, unknown> & { id: string }, { container }) => {
    const service: AnalyticsModuleService = container.resolve(ANALYTICS_MODULE)
    const previous = await service.retrieveAnalyticsExperiment(input.id)
    const restore = Object.fromEntries(Object.keys(input).map((k) => [k, (previous as any)[k]])) as typeof input
    const experiment = await service.updateAnalyticsExperiments(input as any)
    return new StepResponse(experiment, restore)
  },
  async (restore, { container }) => {
    if (!restore) return
    const service: AnalyticsModuleService = container.resolve(ANALYTICS_MODULE)
    await service.updateAnalyticsExperiments(restore as any)
  }
)

export const deleteExperimentStep = createStep(
  "delete-analytics-experiment",
  async (id: string, { container }) => {
    const service: AnalyticsModuleService = container.resolve(ANALYTICS_MODULE)
    await service.softDeleteAnalyticsExperiments(id)
    return new StepResponse(id, id)
  },
  async (id, { container }) => {
    if (!id) return
    const service: AnalyticsModuleService = container.resolve(ANALYTICS_MODULE)
    await service.restoreAnalyticsExperiments(id)
  }
)
