import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { getSessionsByAsset } from "../../../lib/analytics"
import { AnalyticsStatus, buildScorecard, evaluateGoLive } from "../../../lib/playbook"
import {
  loadCoreStock,
  loadReleaseWithProducts,
  loadScorecardLines,
  loadVariantStock,
  unitCostsFrom,
} from "../../../lib/release-data"

export const toSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/** Converts validated body values into module input (ISO strings → Date). */
export function toReleaseData<T extends Record<string, any>>(body: T) {
  const { product_ids, ...data } = body
  if (typeof data.release_at === "string") {
    ;(data as any).release_at = new Date(data.release_at)
  }
  return { data, product_ids: product_ids as string[] | undefined }
}

/** Release detail for the admin: products, live go/no-go evaluation, reminder count. */
export async function getAdminRelease(container: MedusaContainer, id: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const release = await loadReleaseWithProducts(query, id)
  if (!release) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Release ${id} not found`)
  }
  const products = (release.products ?? []).filter(Boolean)
  const variants = await loadVariantStock(query, products)
  const go_live = evaluateGoLive(release, { product_count: products.length, variants })

  const { data: reminders } = await query.graph({
    entity: "release_reminder",
    fields: ["id"],
    filters: { release_id: id },
  })

  return {
    ...release,
    products: products.map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      status: p.status,
      thumbnail: p.thumbnail,
      variants: (p.variants ?? []).map((v: any) => ({
        id: v.id,
        title: v.title,
        unit_cost: v.metadata?.unit_cost ?? null,
        available: variants.find((s) => s.variant_id === v.id)?.available ?? null,
      })),
    })),
    go_live,
    reminder_count: reminders.length,
  }
}

export async function getReleaseScorecard(container: MedusaContainer, id: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const release = await loadReleaseWithProducts(query, id)
  if (!release) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Release ${id} not found`)
  }
  const products = (release.products ?? []).filter(Boolean)
  const publishedAt = release.published_at ? new Date(release.published_at) : null
  const now = new Date()
  const [lines, core_variants] = await Promise.all([
    publishedAt
      ? loadScorecardLines(query, products.map((p: any) => p.id), publishedAt)
      : Promise.resolve([]),
    loadCoreStock(query),
  ])

  // Tagged product-page sessions per asset, from first-party analytics (the half
  // of "channel response" orders can't tell us). Assets = planned creative + any
  // seen on orders.
  let analytics_status: AnalyticsStatus = "not_configured"
  let sessions_by_asset: Awaited<ReturnType<typeof getSessionsByAsset>> = {}
  if (publishedAt) {
    const assets = [
      ...((release.assets ?? []) as { key: string }[]).map((a) => a.key),
      ...lines.map((l) => l.asset).filter((a): a is string => !!a),
    ]
    try {
      sessions_by_asset = await getSessionsByAsset(container, assets, { startAt: publishedAt, endAt: now })
      const results = Object.values(sessions_by_asset)
      // Per-asset failures show as "—"; only call it unavailable if nothing came back.
      analytics_status =
        results.length && results.every((v) => v === null) ? "unavailable" : "connected"
    } catch {
      analytics_status = "unavailable"
    }
  }

  return buildScorecard({
    release,
    now,
    lines,
    unit_costs: unitCostsFrom(products),
    core_variants,
    sessions_by_asset,
    analytics_status,
  })
}
