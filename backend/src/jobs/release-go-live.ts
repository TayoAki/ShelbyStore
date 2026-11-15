import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RELEASE_MODULE } from "../modules/release"
import ReleaseModuleService from "../modules/release/service"
import { goLiveReleaseWorkflow } from "../workflows/release"

/**
 * Every minute: take scheduled releases whose date has arrived through the
 * go/no-go checks. Each one either goes live or is held with reasons.
 */
export default async function releaseGoLiveJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: ReleaseModuleService = container.resolve(RELEASE_MODULE)

  const due = await service.listReleases({
    status: "scheduled",
    release_at: { $lte: new Date() },
  } as any)

  for (const release of due) {
    try {
      const { result } = await goLiveReleaseWorkflow(container).run({
        input: { release_id: release.id },
      })
      if (result.ready) {
        logger.info(`[releases] ${release.handle} is live`)
      } else {
        logger.warn(`[releases] ${release.handle} held: ${result.failures.join("; ")}`)
      }
    } catch (e) {
      logger.error(`[releases] go-live failed for ${release.handle}: ${(e as Error).message}`)
    }
  }
}

export const config = {
  name: "release-go-live",
  schedule: "* * * * *",
}
