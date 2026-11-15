import { RemoteQueryFunction } from "@medusajs/framework/types"
import { getSessionsByAsset, isUmamiConfigured } from "./analytics"
import { EpisodeLike, buildSeriesScorecard, evaluateSeriesReadiness } from "./content-playbook"
import { lineNetAmount } from "./release-data"

type Query = Omit<RemoteQueryFunction, symbol>

/** Orders and net sales per `asset` tag (order metadata), placed since `since`. */
export async function loadOrdersByAsset(query: Query, assets: string[], since: Date) {
  const wanted = new Set(assets)
  const out: Record<string, { orders: number; net_sales: number }> = {}
  for (const a of wanted) out[a] = { orders: 0, net_sales: 0 }
  if (!wanted.size) return out

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "status",
      "metadata",
      "items.quantity",
      "items.unit_price",
      "items.is_tax_inclusive",
      "items.adjustments.amount",
      "items.tax_lines.rate",
      "items.detail.return_received_quantity",
    ],
    filters: { created_at: { $gte: since } },
  })
  for (const order of orders as any[]) {
    const asset = order.metadata?.asset
    if (order.status === "canceled" || typeof asset !== "string" || !wanted.has(asset)) continue
    const net = (order.items ?? []).reduce((sum: number, item: any) => {
      const qty = Number(item.quantity) || 0
      if (!qty) return sum
      const kept = Math.max(0, qty - (Number(item.detail?.return_received_quantity) || 0))
      return sum + (lineNetAmount(item) / qty) * kept
    }, 0)
    out[asset].orders += 1
    out[asset].net_sales += net
  }
  return out
}

export const storefrontUrl = () =>
  (process.env.STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "")

export const trackedLink = (landingPath: string | null | undefined, asset: string) => {
  const path = landingPath && landingPath.startsWith("/") ? landingPath : `/${landingPath ?? ""}`
  const url = new URL(storefrontUrl() + path)
  url.searchParams.set("asset", asset)
  return url.toString()
}

/** Series + episodes + readiness + tracked links + live scorecard. */
export async function loadSeriesDetail(query: Query, id: string, now = new Date()) {
  const { data } = await query.graph({
    entity: "content_series",
    fields: ["*", "episodes.*"],
    filters: { id },
  })
  const series = data?.[0] as any
  if (!series) return null

  const episodes = ((series.episodes ?? []) as any[])
    .filter((e) => e && !e.deleted_at)
    .sort(
      (a, b) =>
        new Date(a.published_at ?? 8.64e15).getTime() - new Date(b.published_at ?? 8.64e15).getTime()
    )
  const published = episodes.filter((e) => e.published_at && new Date(e.published_at) <= now)
  const since = published.length
    ? new Date(Math.min(...published.map((e) => new Date(e.published_at).getTime())))
    : now
  const assets = published.map((e) => e.asset_key)

  const orders = await loadOrdersByAsset(query, assets, since)

  let analytics: "connected" | "not_configured" | "unavailable" = "not_configured"
  let sessions: Record<string, { landing_sessions: number; product_view_sessions: number } | null> = {}
  if (isUmamiConfigured() && assets.length) {
    // Each episode is counted from its own publish date (same-age comparison is
    // handled by the manual metrics; sessions accumulate from publish onwards).
    const results = await Promise.all(
      published.map((e) =>
        getSessionsByAsset([e.asset_key], { startAt: new Date(e.published_at), endAt: now })
          .then((r) => r[e.asset_key])
          .catch(() => null)
      )
    )
    published.forEach((e, i) => (sessions[e.asset_key] = results[i]))
    analytics = results.every((r) => r === null) ? "unavailable" : "connected"
  }

  const episodeMetrics: EpisodeLike[] = episodes.map((e) => ({
    ...e,
    landing_sessions: sessions[e.asset_key]?.landing_sessions ?? null,
    product_view_sessions: sessions[e.asset_key]?.product_view_sessions ?? null,
    orders: orders[e.asset_key]?.orders ?? 0,
    net_sales: orders[e.asset_key]?.net_sales ?? 0,
  }))

  return {
    series: {
      ...series,
      episodes: episodes.map((e) => ({ ...e, tracked_link: trackedLink(e.landing_path, e.asset_key) })),
    },
    readiness: evaluateSeriesReadiness(series),
    scorecard: buildSeriesScorecard({ series, episodes: episodeMetrics, now }),
    analytics,
  }
}
