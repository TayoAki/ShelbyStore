import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOM_QUOTE_MODULE } from "../../../modules/custom-quote"
import CustomQuoteModuleService from "../../../modules/custom-quote/service"

/** GET /admin/custom-quotes?status=new: newest first. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: CustomQuoteModuleService = req.scope.resolve(CUSTOM_QUOTE_MODULE)
  const status = typeof req.query.status === "string" && req.query.status ? req.query.status : undefined
  const [quotes, count] = await service.listAndCountCustomQuotes(status ? { status: status as any } : {}, {
    order: { created_at: "DESC" },
    take: 200,
  })
  res.json({ custom_quotes: quotes, count })
}
