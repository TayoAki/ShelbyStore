import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RELEASE_MODULE } from "../../../modules/release"
import ReleaseModuleService from "../../../modules/release/service"

export type CreateReleaseStepInput = Record<string, unknown> & {
  title: string
  handle: string
}

export const createReleaseStep = createStep(
  "create-release",
  async (input: CreateReleaseStepInput, { container }) => {
    const service: ReleaseModuleService = container.resolve(RELEASE_MODULE)
    const release = await service.createReleases(input as any)
    return new StepResponse(release, release.id)
  },
  async (id, { container }) => {
    if (!id) return
    const service: ReleaseModuleService = container.resolve(RELEASE_MODULE)
    await service.deleteReleases(id)
  }
)
