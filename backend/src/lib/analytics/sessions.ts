import { MedusaContainer } from "@medusajs/framework/types"
import { ANALYTICS_MODULE } from "../../modules/analytics"
import type AnalyticsModuleService from "../../modules/analytics/service"
import { assetSessionsQuery } from "./sql"

export type AssetSessions = {
  /** Distinct sessions that landed on a URL tagged ?asset=<key>. */
  landing_sessions: number
  /** Distinct sessions with a `product_viewed` event attributed to <key>
   *  (attribution persists after landing, so this includes later pages). */
  product_view_sessions: number
}

/**
 * Tagged sessions per asset from first-party analytics (the scorecards'
 * "channel response"). Per-asset failures come back as null.
 */
export async function getSessionsByAsset(
  container: MedusaContainer,
  assets: string[],
  range: { startAt: Date; endAt: Date }
): Promise<Record<string, AssetSessions | null>> {
  const service: AnalyticsModuleService = container.resolve(ANALYTICS_MODULE)
  const unique = [...new Set(assets.filter(Boolean))]
  const results = await Promise.all(
    unique.map((asset) =>
      service
        .runQuery<AssetSessions>(assetSessionsQuery(asset, range.startAt, range.endAt))
        .then((rows) => ({
          landing_sessions: Number(rows[0]?.landing_sessions ?? 0),
          product_view_sessions: Number(rows[0]?.product_view_sessions ?? 0),
        }))
        .catch(() => null)
    )
  )
  return Object.fromEntries(unique.map((a, i) => [a, results[i]]))
}
