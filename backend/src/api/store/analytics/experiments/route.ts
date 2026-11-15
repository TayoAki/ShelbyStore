import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ANALYTICS_MODULE } from "../../../../modules/analytics"
import type AnalyticsModuleService from "../../../../modules/analytics/service"

/** Running experiments for client-side/server-side assignment: key + variant weights only. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: AnalyticsModuleService = req.scope.resolve(ANALYTICS_MODULE)
  const running = await service.listAnalyticsExperiments({ status: "running" })
  res.json({
    experiments: running.map((e) => ({
      key: e.key,
      variants: ((e.variants ?? []) as unknown as { key: string; weight: number }[]).map((v) => ({ key: v.key, weight: v.weight })),
    })),
  })
}
