import {
  ReleaseAsset,
  ReleaseLike,
  TIER_REQUIRED_ASSETS,
  VariantStock,
  toDate,
} from "./types"

export type GoLiveCheckKey =
  | "brief"
  | "products"
  | "inventory_by_size"
  | "creative"
  | "mobile_pdp"
  | "fulfillment"
  | "channel_links"
  | "tracking"

export type GoLiveCheck = {
  key: GoLiveCheckKey
  label: string
  passed: boolean
  /** auto = computed from data, manual = confirmed by the ecommerce & ops lead. */
  source: "auto" | "manual"
  detail?: string
}

export type GoLiveEvaluation = {
  ready: boolean
  checks: GoLiveCheck[]
  /** Human-readable reasons for a hold. Empty when ready. */
  failures: string[]
}

const describeVariant = (v: VariantStock) =>
  `${v.product_title} / ${v.variant_title}`

/** SOP 2 step 3: date, tier, owner, backup approver; SOP 3 step 1: one product promise. */
const checkBrief = (release: ReleaseLike): GoLiveCheck => {
  const missing: string[] = []
  if (!toDate(release.release_at)) missing.push("release date")
  if (!release.owner) missing.push("owner")
  if (!release.backup_approver) missing.push("backup approver")
  if (!release.product_promise) missing.push("product promise")
  return {
    key: "brief",
    label: "Release brief complete",
    source: "auto",
    passed: missing.length === 0,
    detail: missing.length ? `Missing: ${missing.join(", ")}` : undefined,
  }
}

const checkProducts = (productCount: number): GoLiveCheck => ({
  key: "products",
  label: "Products attached",
  source: "auto",
  passed: productCount > 0,
  detail: productCount > 0 ? undefined : "Attach at least one product",
})

/** SOP 4 step 1: check live inventory by size. */
const checkInventory = (variants: VariantStock[]): GoLiveCheck => {
  if (!variants.length) {
    return {
      key: "inventory_by_size",
      label: "Inventory by size",
      source: "auto",
      passed: false,
      detail: "No sellable variants found",
    }
  }
  const empty = variants.filter((v) => v.available !== null && v.available <= 0)
  return {
    key: "inventory_by_size",
    label: "Inventory by size",
    source: "auto",
    passed: empty.length === 0,
    detail: empty.length
      ? `Out of stock: ${empty.map(describeVariant).join(", ")}`
      : undefined,
  }
}

/** SOP 3: the approver signs off every asset; required kinds depend on tier. */
export const checkCreative = (release: ReleaseLike): GoLiveCheck => {
  const assets: ReleaseAsset[] = Array.isArray(release.assets)
    ? release.assets
    : []
  const required = TIER_REQUIRED_ASSETS[release.tier] ?? []
  const missingKinds = required.filter(
    (kind) => !assets.some((a) => a.kind === kind && a.approved)
  )
  const unapprovedRequired = assets.filter((a) => !a.approved && !a.optional)
  const skippedOptional = assets.filter((a) => !a.approved && a.optional)

  const problems: string[] = []
  if (missingKinds.length) {
    problems.push(
      `Needs approved ${missingKinds.map((k) => k.replace("_", " ")).join(" + ")} for a ${release.tier} release`
    )
  }
  if (unapprovedRequired.length) {
    problems.push(
      `Awaiting approval: ${unapprovedRequired.map((a) => a.key).join(", ")}`
    )
  }
  const notes = skippedOptional.length
    ? `Optional assets not approved will be skipped: ${skippedOptional.map((a) => a.key).join(", ")}`
    : undefined

  return {
    key: "creative",
    label: "Creative approved",
    source: "auto",
    passed: problems.length === 0,
    detail: problems.length ? problems.join(". ") : notes,
  }
}

const manual = (
  key: GoLiveCheckKey,
  label: string,
  passed: boolean | undefined
): GoLiveCheck => ({
  key,
  label,
  source: "manual",
  passed: !!passed,
  detail: passed ? undefined : "Not confirmed",
})

/**
 * Go/no-go evaluation (SOP 4 step 1). Every check is critical: if one fails the
 * release is held and the date moves (SOP 2 step 3).
 */
export function evaluateGoLive(
  release: ReleaseLike,
  ctx: { product_count: number; variants: VariantStock[] }
): GoLiveEvaluation {
  const checks: GoLiveCheck[] = [
    checkBrief(release),
    checkProducts(ctx.product_count),
    checkInventory(ctx.variants),
    checkCreative(release),
    manual("mobile_pdp", "Mobile product page checked", release.check_mobile_pdp),
    manual("fulfillment", "Fulfillment coverage confirmed", release.check_fulfillment),
    manual("channel_links", "Channel links go to the right SKU", release.check_channel_links),
    manual("tracking", "Tracking and reporting work", release.check_tracking),
  ]
  const failures = checks
    .filter((c) => !c.passed)
    .map((c) => (c.detail ? `${c.label}: ${c.detail}` : c.label))
  return { ready: failures.length === 0, checks, failures }
}
