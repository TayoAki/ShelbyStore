import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@medusajs/ui"
import { sdk } from "./sdk"

export type ReleaseTier = "major" | "light"
export type ReleaseStatus = "draft" | "scheduled" | "held" | "live" | "reviewed"
export type ReleaseDecision = "repeat" | "simplify" | "pause"
export type AssetKind = "editorial" | "product_images" | "stories" | "short_video" | "email" | "other"

export type ReleaseAsset = {
  key: string
  kind: AssetKind
  channel: string
  url?: string | null
  approved: boolean
  optional?: boolean
}

export type GoLiveCheck = {
  key: string
  label: string
  passed: boolean
  source: "auto" | "manual"
  detail?: string
}

export type AdminRelease = {
  id: string
  title: string
  handle: string
  tier: ReleaseTier
  status: ReleaseStatus
  release_at: string | null
  published_at: string | null
  story: string | null
  product_promise: string | null
  proof: string | null
  hero_image: string | null
  owner: string | null
  backup_approver: string | null
  assets: ReleaseAsset[] | null
  check_mobile_pdp: boolean
  check_fulfillment: boolean
  check_channel_links: boolean
  check_tracking: boolean
  hold_reason: string | null
  capacity_hours: number | null
  actual_hours: number | null
  launch_spend: number
  fulfillment_cost_per_order: number
  selling_cost_rate: number
  contribution_floor: number | null
  starting_units: number | null
  units_added: number
  returns_window_days: number
  decision: ReleaseDecision | null
  decision_notes: string | null
  decided_by: string | null
  decided_at: string | null
  products: {
    id: string
    title: string
    handle: string
    status: string
    thumbnail: string | null
    variants: { id: string; title: string; unit_cost: number | null; available: number | null }[]
  }[]
  go_live: { ready: boolean; checks: GoLiveCheck[]; failures: string[] }
  reminder_count: number
}

export type ReleaseListItem = Pick<
  AdminRelease,
  | "id"
  | "title"
  | "handle"
  | "tier"
  | "status"
  | "release_at"
  | "published_at"
  | "owner"
  | "decision"
  | "hold_reason"
  | "hero_image"
> & { products: { id: string; thumbnail: string | null }[] }

export type Scorecard = {
  phase: "pre_launch" | "collecting" | "day7_ready" | "returns_mature"
  dates: { published_at: string | null; day7_review_at: string | null; returns_mature_at: string | null }
  contribution: {
    net_sales: number
    product_cost: number
    selling_cost: number
    fulfillment_cost: number
    launch_spend: number
    contribution: number
    floor: number | null
    meets_floor: boolean | null
    orders: number
    variants_missing_cost: string[]
  }
  sell_through: { net_units: number; starting_units: number | null; units_added: number; rate: number | null }
  core_availability: {
    variants_tracked: number
    out_of_stock: { variant_id: string; label: string }[]
    interrupted: boolean
  }
  workload: { capacity_hours: number | null; actual_hours: number | null; within_cap: boolean | null }
  channel_response: {
    asset: string
    orders: number
    units: number
    net_sales: number
    landing_sessions: number | null
    product_view_sessions: number | null
    conversion_rate: number | null
  }[]
  analytics: { sessions: "connected" | "not_configured" | "unavailable"; note: string | null }
  recommendation: {
    decision: ReleaseDecision | null
    reasons: string[]
    missing_inputs: string[]
    returns_pending: boolean
    notes: string[]
  }
}

const keys = {
  list: ["releases"] as const,
  detail: (id: string) => ["releases", id] as const,
  scorecard: (id: string) => ["releases", id, "scorecard"] as const,
}

const errorMessage = (e: unknown) => (e as { message?: string })?.message ?? "Something went wrong"

export const useReleases = () =>
  useQuery({
    queryKey: keys.list,
    queryFn: () => sdk.client.fetch<{ releases: ReleaseListItem[] }>("/admin/releases"),
  })

export const useRelease = (id: string) =>
  useQuery({
    queryKey: keys.detail(id),
    queryFn: () => sdk.client.fetch<{ release: AdminRelease }>(`/admin/releases/${id}`),
  })

export const useScorecard = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: keys.scorecard(id),
    queryFn: () => sdk.client.fetch<{ scorecard: Scorecard }>(`/admin/releases/${id}/scorecard`),
    enabled,
  })

const useInvalidate = (id?: string) => {
  const client = useQueryClient()
  return () => {
    client.invalidateQueries({ queryKey: keys.list })
    if (id) client.invalidateQueries({ queryKey: keys.detail(id) })
  }
}

export const useCreateRelease = () => {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch<{ release: AdminRelease }>("/admin/releases", { method: "POST", body }),
    onSuccess: invalidate,
    onError: (e) => toast.error(errorMessage(e)),
  })
}

export const useUpdateRelease = (id: string) => {
  const invalidate = useInvalidate(id)
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch<{ release: AdminRelease }>(`/admin/releases/${id}`, { method: "POST", body }),
    onSuccess: invalidate,
    onError: (e) => toast.error(errorMessage(e)),
  })
}

export const useGoLive = (id: string) => {
  const invalidate = useInvalidate(id)
  return useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ release: AdminRelease; evaluation: { ready: boolean } }>(
        `/admin/releases/${id}/go-live`,
        { method: "POST" }
      ),
    onSuccess: (res) => {
      invalidate()
      if (res.evaluation.ready) toast.success("Release is live")
      else toast.warning("Release held. See the go/no-go checks.")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}

export const useRecordDecision = (id: string) => {
  const client = useQueryClient()
  const invalidate = useInvalidate(id)
  return useMutation({
    mutationFn: (body: { decision: ReleaseDecision; notes?: string }) =>
      sdk.client.fetch<{ release: AdminRelease }>(`/admin/releases/${id}/decision`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      invalidate()
      client.invalidateQueries({ queryKey: keys.scorecard(id) })
      toast.success("Decision recorded")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}

export const useDeleteRelease = (id: string) => {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/releases/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
    onError: (e) => toast.error(errorMessage(e)),
  })
}

// --- Display helpers ---------------------------------------------------------

export const STATUS_COLOR: Record<ReleaseStatus, "grey" | "blue" | "orange" | "green" | "purple"> = {
  draft: "grey",
  scheduled: "blue",
  held: "orange",
  live: "green",
  reviewed: "purple",
}

export const DECISION_COLOR: Record<ReleaseDecision, "green" | "orange" | "red"> = {
  repeat: "green",
  simplify: "orange",
  pause: "red",
}

export const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—"

export const formatMoney = (n: number | null | undefined) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n)

/** ISO string ↔ value for <input type="datetime-local"> in the browser's timezone. */
export const toLocalInput = (iso: string | null) => {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null)
