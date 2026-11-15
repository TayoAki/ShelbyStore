import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ANALYTICS_EVENTS, captureServerEvent, isPostHogConfigured } from "../lib/analytics"
import { RELEASE_MODULE } from "../modules/release"
import ReleaseModuleService from "../modules/release/service"
import { RELEASE_LIVE_EVENT } from "../workflows/release"

/** Marks drop launches in PostHog so dashboards can annotate them. */
export default async function analyticsReleaseLive({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!isPostHogConfigured()) {
    return
  }
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const service: ReleaseModuleService = container.resolve(RELEASE_MODULE)
    const release = await service.retrieveRelease(data.id)
    await captureServerEvent({
      event: ANALYTICS_EVENTS.releaseLive,
      distinctId: "shelby-backend",
      insertId: `release_live:${release.id}`,
      properties: {
        release_id: release.id,
        handle: release.handle,
        tier: release.tier,
        title: release.title,
      },
    })
  } catch (e) {
    logger.warn(`[analytics] release_live for ${data.id} failed: ${(e as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: RELEASE_LIVE_EVENT,
}
