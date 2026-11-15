import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RELEASE_MODULE } from "../../../modules/release"
import ReleaseModuleService from "../../../modules/release/service"

export const deleteReleaseStep = createStep(
  "delete-release",
  async (id: string, { container }) => {
    const service: ReleaseModuleService = container.resolve(RELEASE_MODULE)
    await service.softDeleteReleases(id)
    return new StepResponse(id, id)
  },
  async (id, { container }) => {
    if (!id) return
    const service: ReleaseModuleService = container.resolve(RELEASE_MODULE)
    await service.restoreReleases(id)
  }
)
