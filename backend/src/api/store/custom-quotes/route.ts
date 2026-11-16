import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { CUSTOM_QUOTE_MODULE } from "../../../modules/custom-quote"
import CustomQuoteModuleService from "../../../modules/custom-quote/service"
import type { StoreCreateCustomQuoteType } from "./validators"

const LIMIT = 5
const WINDOW_SECONDS = 60 * 60

/**
 * POST /store/custom-quotes: a custom club or outing order request.
 * Validated by StoreCreateCustomQuote (middlewares.ts). A filled honeypot is
 * accepted silently and dropped; each IP may send 5 requests an hour.
 */
export async function POST(req: MedusaRequest<StoreCreateCustomQuoteType>, res: MedusaResponse) {
  const body = req.validatedBody
  if (body.company_website) {
    res.status(201).json({ ok: true })
    return
  }

  const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() || req.ip || "unknown"
  if (await overLimit(req, ip)) {
    res.status(429).json({ message: "Too many requests. Try again in an hour, or email us." })
    return
  }

  const service: CustomQuoteModuleService = req.scope.resolve(CUSTOM_QUOTE_MODULE)
  const colors = Object.fromEntries(Object.entries(body.colors).filter(([, n]) => (n ?? 0) > 0))
  const quote = await service.createCustomQuotes({
    name: body.name,
    email: body.email,
    organisation: body.organisation,
    quantity: body.quantity,
    colors,
    needed_by: body.needed_by ? new Date(body.needed_by) : null,
    artwork_url: body.artwork_url || null,
    notes: body.notes || null,
    rights_confirmed: true,
    source: (body.source as Record<string, unknown> | null) ?? null,
  })

  const eventBus = req.scope.resolve(Modules.EVENT_BUS)
  await eventBus.emit({ name: "custom_quote.created", data: { id: quote.id } })

  res.status(201).json({ ok: true, id: quote.id })
}

/** Per-IP rate limit in the cache module (Redis in production, memory locally). */
async function overLimit(req: MedusaRequest, ip: string): Promise<boolean> {
  try {
    const cache = req.scope.resolve(Modules.CACHE)
    const key = `custom-quote:rl:${ip}`
    const count = ((await cache.get<number>(key)) ?? 0) + 1
    await cache.set(key, count, WINDOW_SECONDS)
    return count > LIMIT
  } catch (e) {
    req.scope.resolve(ContainerRegistrationKeys.LOGGER).warn(`[custom-quotes] rate limit unavailable: ${(e as Error).message}`)
    return false
  }
}
