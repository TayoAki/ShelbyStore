import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RELEASE_MODULE } from "../../../modules/release"
import ReleaseModuleService from "../../../modules/release/service"

export type UpdateReleaseStepInput = Record<string, unknown> & { id: string }

export const updateReleaseStep = createStep(
  "update-release",
  async (input: UpdateReleaseStepInput, { container }) => {
    const service: ReleaseModuleService = container.resolve(RELEASE_MODULE)
    const previous = await service.retrieveRelease(input.id)
    const restore = Object.fromEntries(
      Object.keys(input).map((key) => [key, (previous as any)[key]])
    ) as UpdateReleaseStepInput
    const release = await service.updateReleases(input as any)
    return new StepResponse(release, restore)
  },
  async (restore, { container }) => {
    if (!restore) return
    const service: ReleaseModuleService = container.resolve(RELEASE_MODULE)
    await service.updateReleases(restore as any)
  }
)
