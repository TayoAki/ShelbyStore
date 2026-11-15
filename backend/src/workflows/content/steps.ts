import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CONTENT_MODULE } from "../../modules/content"
import ContentModuleService from "../../modules/content/service"

type Data = Record<string, unknown>
const svc = (container: { resolve: (k: string) => unknown }) =>
  container.resolve(CONTENT_MODULE) as ContentModuleService

const pick = (record: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, record[k]]))

export const createSeriesStep = createStep(
  "create-content-series",
  async (data: Data, { container }) => {
    const series = await svc(container).createContentSeries(data as any)
    return new StepResponse(series, series.id)
  },
  async (id, { container }) => {
    if (id) await svc(container).deleteContentSeries(id)
  }
)

export const updateSeriesStep = createStep(
  "update-content-series",
  async (data: Data & { id: string }, { container }) => {
    const previous = await svc(container).retrieveContentSeries(data.id)
    const series = await svc(container).updateContentSeries(data as any)
    return new StepResponse(series, pick(previous as any, Object.keys(data)))
  },
  async (restore, { container }) => {
    if (restore) await svc(container).updateContentSeries(restore as any)
  }
)

export const deleteSeriesStep = createStep(
  "delete-content-series",
  async (id: string, { container }) => {
    await svc(container).softDeleteContentSeries(id)
    return new StepResponse(id, id)
  },
  async (id, { container }) => {
    if (id) await svc(container).restoreContentSeries(id)
  }
)

export const createEpisodeStep = createStep(
  "create-content-episode",
  async (data: Data & { series_id: string }, { container }) => {
    const episode = await svc(container).createContentEpisodes(data as any)
    return new StepResponse(episode, episode.id)
  },
  async (id, { container }) => {
    if (id) await svc(container).deleteContentEpisodes(id)
  }
)

export const updateEpisodeStep = createStep(
  "update-content-episode",
  async (data: Data & { id: string }, { container }) => {
    const previous = await svc(container).retrieveContentEpisode(data.id)
    const episode = await svc(container).updateContentEpisodes(data as any)
    return new StepResponse(episode, pick(previous as any, Object.keys(data)))
  },
  async (restore, { container }) => {
    if (restore) await svc(container).updateContentEpisodes(restore as any)
  }
)

export const deleteEpisodeStep = createStep(
  "delete-content-episode",
  async (id: string, { container }) => {
    await svc(container).softDeleteContentEpisodes(id)
    return new StepResponse(id, id)
  },
  async (id, { container }) => {
    if (id) await svc(container).restoreContentEpisodes(id)
  }
)
