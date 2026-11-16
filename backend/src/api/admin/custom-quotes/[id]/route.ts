import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOM_QUOTE_MODULE } from "../../../../modules/custom-quote"
import CustomQuoteModuleService from "../../../../modules/custom-quote/service"
import type { AdminUpdateCustomQuoteType } from "../../../store/custom-quotes/validators"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: CustomQuoteModuleService = req.scope.resolve(CUSTOM_QUOTE_MODULE)
  const quote = await service.retrieveCustomQuote(req.params.id)
  res.json({ custom_quote: quote })
}

/** POST /admin/custom-quotes/:id { status }: move a request through new → quoted → won / lost. */
export async function POST(req: MedusaRequest<AdminUpdateCustomQuoteType>, res: MedusaResponse) {
  const service: CustomQuoteModuleService = req.scope.resolve(CUSTOM_QUOTE_MODULE)
  const quote = await service.updateCustomQuotes({ id: req.params.id, status: req.validatedBody.status })
  res.json({ custom_quote: quote })
}
