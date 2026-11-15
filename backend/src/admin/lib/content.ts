import { toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sdk } from "./sdk"

export type SeriesStatus = "draft" | "piloting" | "continue" | "revise" | "paused"
export type SeriesDecision = "continue" | "revise" | "pause"
export type RevisionTarget = "opening" | "topic" | "booking_path"

export type ContentEpisode = {
  id: string
  title: string
  subject: string | null
  asset_key: string
  landing_path: string
  post_url: string | null
  published_at: string | null
  metrics_recorded_at: string | null
  views: number | null
  avg_pct_viewed: number | null
  relevant_comments: number | null
  submissions: number | null
  production_hours: number | null
  audience_language: string | null
  tracked_link: string
}

export type ContentSeries = {
  id: string
  title: string
  handle: string
  goal: string | null
  audience: string | null
  stance: string | null
  competitor_swap_passed: boolean
  competitor_swap_notes: string | null
  proof: string | null
  audience_question: string | null
  format: string | null
  format_source: string | null
  beat_sheet: string[] | null
  participation_prompt: string | null
  channel: string
  owner: string | null
  production_hours_budget: number | null
  episode_target: number
  baseline_avg_pct_viewed: number | null
  baseline_participation_per_1k: number | null
  baseline_orders_per_post: number | null
  status: SeriesStatus
  decision: SeriesDecision | null
  revision_target: RevisionTarget | null
  decision_notes: string | null
  next_change: string | null
  decided_by: string | null
  decided_at: string | null
  episodes: ContentEpisode[]
}

export type EpisodeRow = {
  id: string
  title: string
  asset_key: string
  age_days: number | null
  views: number | null
  avg_pct_viewed: number | null
  participation: number
  participation_per_1k: number | null
  landing_sessions: number | null
  product_view_sessions: number | null
  orders: number
  net_sales: number
  production_hours: number | null
  over_budget: boolean | null
}

export type SeriesScorecard = {
  target_episodes: number
  published_episodes: number
  measured_episodes: number
  episodes: EpisodeRow[]
  attention: { avg_pct_viewed: number | null; baseline: number | null; delta: number | null }
  participation: {
    total: number
    per_1k_views: number | null
    volume_ok: boolean
    episodes_with_participation: number
    baseline_per_1k: number | null
  }
  business: {
    landing_sessions: number | null
    product_view_sessions: number | null
    orders: number
    net_sales: number
    orders_per_post: number | null
    baseline_orders_per_post: number | null
  }
  effort: {
    hours_per_episode: number | null
    budget: number | null
    within_budget: boolean | null
    over_budget_episodes: string[]
  }
  comparability: { same_age: boolean | null; note: string | null }
  baseline_set: boolean
  recommendation: {
    decision: SeriesDecision | null
    revision_target: RevisionTarget | null
    reasons: string[]
    notes: string[]
  }
}

export type SeriesDetail = {
  series: ContentSeries
  readiness: { ready: boolean; checks: { key: string; label: string; passed: boolean; detail?: string }[] }
  scorecard: SeriesScorecard
  analytics: "connected" | "not_configured" | "unavailable"
}

export type SeriesListItem = Pick<
  ContentSeries,
  "id" | "title" | "handle" | "stance" | "channel" | "owner" | "status" | "decision" | "revision_target" | "episode_target"
> & { episode_count: number; published_count: number }

const keys = {
  list: ["content-series"] as const,
  detail: (id: string) => ["content-series", id] as const,
}
const message = (e: unknown) => (e as { message?: string })?.message ?? "Something went wrong"

export const useSeriesList = () =>
  useQuery({
    queryKey: keys.list,
    queryFn: () => sdk.client.fetch<{ series: SeriesListItem[] }>("/admin/content-series"),
  })

export const useSeries = (id: string) =>
  useQuery({
    queryKey: keys.detail(id),
    queryFn: () => sdk.client.fetch<SeriesDetail>(`/admin/content-series/${id}`),
  })

const useDetailMutation = <TBody,>(id: string, path: (body: TBody) => string, method: "POST" | "DELETE" = "POST") => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: TBody) =>
      sdk.client.fetch<SeriesDetail>(path(body), {
        method,
        body: method === "POST" ? (body as any)?.body ?? body : undefined,
      }),
    onSuccess: (data) => {
      client.setQueryData(keys.detail(id), data)
      client.invalidateQueries({ queryKey: keys.list })
    },
    onError: (e) => toast.error(message(e)),
  })
}

export const useCreateSeries = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch<SeriesDetail>("/admin/content-series", { method: "POST", body }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.list }),
    onError: (e) => toast.error(message(e)),
  })
}

export const useUpdateSeries = (id: string) =>
  useDetailMutation<Record<string, unknown>>(id, () => `/admin/content-series/${id}`)

export const useAddEpisode = (id: string) =>
  useDetailMutation<Record<string, unknown>>(id, () => `/admin/content-series/${id}/episodes`)

export const useUpdateEpisode = (id: string) =>
  useDetailMutation<{ episodeId: string; body: Record<string, unknown> }>(
    id,
    (b) => `/admin/content-series/${id}/episodes/${b.episodeId}`
  )

export const useDeleteEpisode = (id: string) =>
  useDetailMutation<{ episodeId: string }>(id, (b) => `/admin/content-series/${id}/episodes/${b.episodeId}`, "DELETE")

export const useRecordSeriesDecision = (id: string) =>
  useDetailMutation<Record<string, unknown>>(id, () => `/admin/content-series/${id}/decision`)

export const useDeleteSeries = (id: string) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/content-series/${id}`, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.list }),
    onError: (e) => toast.error(message(e)),
  })
}

export const SERIES_STATUS_COLOR: Record<SeriesStatus, "grey" | "blue" | "green" | "orange" | "red"> = {
  draft: "grey",
  piloting: "blue",
  continue: "green",
  revise: "orange",
  paused: "red",
}
export const DECISION_COLOR: Record<SeriesDecision, "green" | "orange" | "red"> = {
  continue: "green",
  revise: "orange",
  pause: "red",
}
export const REVISION_LABEL: Record<RevisionTarget, string> = {
  opening: "Opening (viewers leave early)",
  topic: "Topic or prompt (little participation)",
  booking_path: "Path to purchase (engaged but few orders)",
}

const num = (v: string) => (v.trim() === "" ? null : Number(v))
export const toNumberOrNull = (v: string) => {
  const n = num(v)
  return n === null || Number.isFinite(n) ? n : null
}
export const toLocalInput = (iso: string | null) => {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null)
