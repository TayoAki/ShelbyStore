import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { captureServerEvent } from "../lib/analytics/capture"
import { CUSTOM_QUOTE_MODULE } from "../modules/custom-quote"
import CustomQuoteModuleService from "../modules/custom-quote/service"

/**
 * A new custom club/outing request: email the team (CUSTOM_QUOTES_EMAIL, through
 * whichever provider handles the "email" channel; logs only when unset) and
 * record `custom_quote_submitted` in first-party analytics.
 */
export default async function customQuoteCreated({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: CustomQuoteModuleService = container.resolve(CUSTOM_QUOTE_MODULE)
  const quote = await service.retrieveCustomQuote(data.id)
  const colors = (quote.colors ?? {}) as Record<string, number>
  const summary = `${quote.organisation}: ${quote.quantity} caps (${Object.entries(colors)
    .map(([c, n]) => `${n} ${c}`)
    .join(", ")})`

  const to = process.env.CUSTOM_QUOTES_EMAIL
  if (to) {
    try {
      await container.resolve(Modules.NOTIFICATION).createNotifications({
        to,
        channel: "email",
        template: process.env.CUSTOM_QUOTE_EMAIL_TEMPLATE || "custom-quote",
        data: {
          subject: `Custom quote request: ${summary}`,
          name: quote.name,
          email: quote.email,
          organisation: quote.organisation,
          quantity: quote.quantity,
          colors,
          needed_by: quote.needed_by,
          artwork_url: quote.artwork_url,
          notes: quote.notes,
        },
      })
    } catch (e) {
      logger.warn(`[custom-quotes] email for ${quote.id} failed: ${(e as Error).message}`)
    }
  } else {
    logger.info(`[custom-quotes] New request ${quote.id} (${summary}). Set CUSTOM_QUOTES_EMAIL to get these by email.`)
  }

  const source = (quote.source ?? {}) as Record<string, unknown>
  await captureServerEvent(container, {
    event: "custom_quote_submitted",
    distinctId: typeof source.analytics_id === "string" ? source.analytics_id : `quote:${quote.id}`,
    insertId: `custom_quote_submitted:${quote.id}`,
    properties: {
      quantity: quote.quantity,
      colors: Object.keys(colors),
      needed_by: quote.needed_by ? new Date(quote.needed_by).toISOString().slice(0, 10) : null,
      page_type: "custom",
      ...(typeof source.asset === "string" ? { asset: source.asset } : {}),
    },
  }).catch((e) => logger.warn(`[custom-quotes] analytics for ${quote.id} failed: ${(e as Error).message}`))
}

export const config: SubscriberConfig = {
  event: "custom_quote.created",
}
