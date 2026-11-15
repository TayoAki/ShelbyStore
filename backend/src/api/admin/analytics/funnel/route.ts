import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { parseRange, runFunnel } from "../helpers"
import { AdminFunnelQueryType } from "../validators"

export const POST = async (req: AuthenticatedMedusaRequest<AdminFunnelQueryType>, res: MedusaResponse) => {
  const body = req.validatedBody
  const { from, to } = parseRange(body.from, body.to, 30)
  const funnel = await runFunnel(req.scope, {
    steps: body.steps,
    from,
    to,
    windowDays: body.window_days,
    breakdown: body.breakdown ?? null,
  })
  res.json({ funnel, range: { from: from.toISOString(), to: to.toISOString() } })
}
