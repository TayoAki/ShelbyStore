import { toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sdk } from "./sdk"

export type PropertyFilter = { key: string; op: "eq" | "neq" | "is_set" | "is_not_set" | "contains"; value?: string }
export type FunnelStep = { event: string; filters?: PropertyFilter[]; label?: string }

export type Overview = {
  range: { from: string; to: string; timezone: string }
  totals: {
    pageviews: number
    visitors: number
    sessions: number
    orders: number
    revenue: number
    conversion_rate: number | null
    bounce_rate: number | null
  }
  daily: { day: string; pageviews: number; visitors: number; orders: number }[]
  top_paths: { path: string; views: number; visitors: number; avg_time_ms: number | null; avg_scroll_pct: number | null }[]
  top_assets: { asset: string; sessions: number; visitors: number; orders: number; revenue: number; conversion_rate: number | null }[]
  referrers: { host: string; sessions: number }[]
  devices: { device_type: string; sessions: number }[]
}

export type FunnelResult = {
  steps: {
    index: number
    event: string
    label: string
    count: number
    conversion_from_start: number | null
    conversion_from_previous: number | null
    median_seconds_from_start: number | null
  }[]
  overall_conversion: number | null
  breakdown: { value: string | null; steps: number[]; conversion: number | null }[]
}

export type Schema = {
  events: { name: string; count: number }[]
  properties: string[]
  breakdowns: string[]
  presets: { key: string; name: string; steps: FunnelStep[] }[]
}

export type AnalyticsEventRow = {
  id: string
  event: string
  distinct_id: string
  session_id: string | null
  occurred_at: string
  path: string | null
  asset: string | null
  device_type: string | null
  platform: string
  properties: Record<string, unknown> | null
}

export type Experiment = {
  id: string
  key: string
  name: string
  hypothesis: string | null
  audience: string | null
  change_description: string | null
  status: "draft" | "running" | "stopped"
  variants: { key: string; weight: number }[]
  funnel_steps: FunnelStep[] | null
  minimum_sample: number
  started_at: string | null
  ended_at: string | null
  decision: "ship" | "keep_control" | "iterate" | null
  notes: string | null
  created_at: string
}

export type ExperimentResults = {
  steps: string[]
  range?: { from: string; to: string }
  variants: {
    variant: string
    is_control: boolean
    exposures: number
    conversions: number
    conversion_rate: number | null
    uplift: number | null
    p_value: number | null
    steps: number[]
  }[]
  verdict:
    | { status: "inconclusive"; reason: string }
    | { status: "no_difference"; reason: string }
    | { status: "significant"; reason: string; better: string[]; worse: string[] }
}

const err = (e: unknown) => toast.error((e as { message?: string })?.message ?? "Something went wrong")

export const useSchema = () =>
  useQuery({ queryKey: ["analytics", "schema"], queryFn: () => sdk.client.fetch<Schema>("/admin/analytics/schema") })

export const useOverview = (days: number) =>
  useQuery({
    queryKey: ["analytics", "overview", days],
    queryFn: () =>
      sdk.client.fetch<{ overview: Overview }>("/admin/analytics/overview", {
        query: { from: new Date(Date.now() - days * 86400000).toISOString() },
      }),
  })

export const useFunnel = () =>
  useMutation({
    mutationFn: (body: { steps: FunnelStep[]; from?: string; window_days: number; breakdown?: string | null }) =>
      sdk.client.fetch<{ funnel: FunnelResult }>("/admin/analytics/funnel", { method: "POST", body }),
    onError: err,
  })

export const useLiveEvents = (event?: string) =>
  useQuery({
    queryKey: ["analytics", "live", event ?? ""],
    queryFn: () =>
      sdk.client.fetch<{ events: AnalyticsEventRow[] }>("/admin/analytics/events", {
        query: { limit: 100, ...(event ? { event } : {}) },
      }),
    refetchInterval: 5000,
  })

export const useExperiments = () =>
  useQuery({
    queryKey: ["analytics", "experiments"],
    queryFn: () => sdk.client.fetch<{ experiments: Experiment[] }>("/admin/analytics/experiments"),
  })

export const useExperiment = (id: string) =>
  useQuery({
    queryKey: ["analytics", "experiments", id],
    queryFn: () =>
      sdk.client.fetch<{ experiment: Experiment; results: ExperimentResults | null }>(`/admin/analytics/experiments/${id}`),
  })

const useInvalidate = () => {
  const client = useQueryClient()
  return () => client.invalidateQueries({ queryKey: ["analytics", "experiments"] })
}

export const useCreateExperiment = () => {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch<{ experiment: Experiment }>("/admin/analytics/experiments", { method: "POST", body }),
    onSuccess: invalidate,
    onError: err,
  })
}

export const useUpdateExperiment = (id: string) => {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch<{ experiment: Experiment }>(`/admin/analytics/experiments/${id}`, { method: "POST", body }),
    onSuccess: () => {
      invalidate()
      toast.success("Saved")
    },
    onError: err,
  })
}

export const useExperimentStatus = (id: string) => {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (status: "running" | "stopped") =>
      sdk.client.fetch(`/admin/analytics/experiments/${id}/status`, { method: "POST", body: { status } }),
    onSuccess: invalidate,
    onError: err,
  })
}

export const useExperimentDecision = (id: string) => {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (body: { decision: string; notes?: string }) =>
      sdk.client.fetch(`/admin/analytics/experiments/${id}/decision`, { method: "POST", body }),
    onSuccess: () => {
      invalidate()
      toast.success("Decision recorded")
    },
    onError: err,
  })
}

export const useDeleteExperiment = (id: string) => {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/analytics/experiments/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
    onError: err,
  })
}

export const pct = (v: number | null | undefined, digits = 1) =>
  v === null || v === undefined ? "—" : `${(v * 100).toFixed(digits)}%`
export const num = (v: number | null | undefined) => (v === null || v === undefined ? "—" : v.toLocaleString())
export const money = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v)
export const duration = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return "—"
  if (seconds < 90) return `${Math.round(seconds)}s`
  if (seconds < 5400) return `${Math.round(seconds / 60)}m`
  if (seconds < 172800) return `${(seconds / 3600).toFixed(1)}h`
  return `${(seconds / 86400).toFixed(1)}d`
}
