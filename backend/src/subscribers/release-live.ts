import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { RELEASE_MODULE } from "../modules/release"
import ReleaseModuleService from "../modules/release/service"
import { RELEASE_LIVE_EVENT } from "../workflows/release"

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
const APP_SCHEME = process.env.APP_SCHEME || "shelby"

/**
 * Sends "notify me" reminders when a drop goes live. Push links carry an
 * `asset` tag, so orders from reminders show up in the scorecard's channel response.
 */
export default async function releaseLiveHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: ReleaseModuleService = container.resolve(RELEASE_MODULE)

  const release = await service.retrieveRelease(data.id)
  const reminders = await service.listReleaseReminders({
    release_id: data.id,
    notified_at: null,
  } as any)
  if (!reminders.length) {
    return
  }

  const title = `${release.title} is live`
  const body = release.product_promise || "The drop is live. Shop it before sizes sell out."

  // Push (Expo). Batches of 100 per the Expo push API.
  const tokens = [...new Set(reminders.map((r) => r.push_token).filter(Boolean))] as string[]
  for (let i = 0; i < tokens.length; i += 100) {
    const messages = tokens.slice(i, i + 100).map((to) => ({
      to,
      title,
      body,
      sound: "default",
      data: {
        release_handle: release.handle,
        asset: "push-reminder",
        url: `${APP_SCHEME}://drops/${release.handle}?asset=push-reminder`,
      },
    }))
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(process.env.EXPO_ACCESS_TOKEN
            ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(messages),
      })
      if (!response.ok) {
        logger.warn(`[releases] Expo push failed (${response.status}) for ${release.handle}`)
      }
    } catch (e) {
      logger.warn(`[releases] Expo push error for ${release.handle}: ${(e as Error).message}`)
    }
  }

  // Email, through whichever provider handles the "email" channel.
  const emails = [...new Set(reminders.map((r) => r.email).filter(Boolean))] as string[]
  if (emails.length) {
    const notifications = container.resolve(Modules.NOTIFICATION)
    try {
      await notifications.createNotifications(
        emails.map((to) => ({
          to,
          channel: "email",
          template: process.env.RELEASE_LIVE_EMAIL_TEMPLATE || "release-live",
          data: {
            title,
            body,
            release_title: release.title,
            release_handle: release.handle,
            hero_image: release.hero_image,
          },
        }))
      )
    } catch (e) {
      logger.warn(`[releases] reminder emails failed for ${release.handle}: ${(e as Error).message}`)
    }
  }

  await service.updateReleaseReminders(
    reminders.map((r) => ({ id: r.id, notified_at: new Date() }))
  )
  logger.info(
    `[releases] ${release.handle}: notified ${tokens.length} device(s) and ${emails.length} email(s)`
  )
}

export const config: SubscriberConfig = {
  event: RELEASE_LIVE_EVENT,
}
