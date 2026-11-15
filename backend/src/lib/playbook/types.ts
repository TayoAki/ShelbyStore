/**
 * Shared types for the product-drop playbook logic.
 * These are plain data shapes so the logic stays framework-free and testable.
 */

export type ReleaseTier = "major" | "light"
export type ReleaseStatus = "draft" | "scheduled" | "held" | "live" | "reviewed"
export type ReleaseDecision = "repeat" | "simplify" | "pause"

/** Creative asset kinds from SOP 3. */
export type AssetKind =
  | "editorial"
  | "product_images"
  | "stories"
  | "short_video"
  | "email"
  | "other"

export type ReleaseAsset = {
  /** Slug used as the attribution tag, e.g. "tiktok-tryon". Shows up as `?asset=` in links. */
  key: string
  kind: AssetKind
  channel: string
  url?: string | null
  approved: boolean
  /** Optional assets can be dropped if production overruns (SOP 2 step 3). */
  optional?: boolean
}

/**
 * Required asset kinds per tier.
 * SOP 3 step 2: a major release plans editorial images and a channel-native short video;
 * a light release uses clean product images and a simple try-on or comparison clip.
 */
export const TIER_REQUIRED_ASSETS: Record<ReleaseTier, AssetKind[]> = {
  major: ["editorial", "short_video"],
  light: ["product_images", "short_video"],
}

export const DAY_SEVEN_MS = 7 * 24 * 60 * 60 * 1000

/** The subset of a Release record the playbook logic reads. */
export type ReleaseLike = {
  tier: ReleaseTier
  status: ReleaseStatus
  release_at?: Date | string | null
  published_at?: Date | string | null
  product_promise?: string | null
  owner?: string | null
  backup_approver?: string | null
  assets?: ReleaseAsset[] | null
  check_mobile_pdp?: boolean
  check_fulfillment?: boolean
  check_channel_links?: boolean
  check_tracking?: boolean
  capacity_hours?: number | null
  actual_hours?: number | null
  launch_spend?: number | null
  fulfillment_cost_per_order?: number | null
  selling_cost_rate?: number | null
  contribution_floor?: number | null
  starting_units?: number | null
  units_added?: number | null
  returns_window_days?: number | null
}

/** Stock for one sellable variant. `available: null` means inventory isn't managed. */
export type VariantStock = {
  variant_id: string
  product_title: string
  variant_title: string
  available: number | null
}

export const toDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) {
    return null
  }
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const round2 = (n: number) => Math.round(n * 100) / 100
