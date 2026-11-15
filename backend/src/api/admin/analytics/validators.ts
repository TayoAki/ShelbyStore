import { z } from "@medusajs/framework/zod"
import { EVENT_NAME_PATTERN, PROPERTY_KEY_PATTERN } from "../../../lib/analytics"

const eventName = z.string().regex(EVENT_NAME_PATTERN, "Event names are lowercase letters, digits, _ or a leading $")
const propertyKey = z.string().regex(PROPERTY_KEY_PATTERN)
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")

export const PropertyFilterSchema = z.object({
  key: propertyKey,
  op: z.enum(["eq", "neq", "is_set", "is_not_set", "contains"]),
  value: z.string().max(200).optional(),
})

export const FunnelStepSchema = z.object({
  event: eventName,
  filters: z.array(PropertyFilterSchema).max(5).optional(),
  label: z.string().max(80).optional(),
})

const DateRange = {
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
}

export const AdminFunnelQuery = z.object({
  steps: z.array(FunnelStepSchema).min(2).max(8),
  ...DateRange,
  window_days: z.number().min(0.01).max(90).default(7),
  breakdown: propertyKey.nullish(),
})
export type AdminFunnelQueryType = z.infer<typeof AdminFunnelQuery>

export const AdminTrendsQuery = z.object({
  events: z.array(eventName).min(1).max(5),
  ...DateRange,
  breakdown: propertyKey.nullish(),
  filters: z.array(PropertyFilterSchema).max(5).optional(),
})
export type AdminTrendsQueryType = z.infer<typeof AdminTrendsQuery>

const Variant = z.object({ key: slug.max(40), weight: z.number().positive().max(1000) })

const experimentFields = {
  key: slug.max(60),
  name: z.string().min(1).max(120),
  hypothesis: z.string().max(2000).nullish(),
  audience: z.string().max(500).nullish(),
  change_description: z.string().max(2000).nullish(),
  variants: z
    .array(Variant)
    .min(2)
    .max(4)
    .refine((vs) => new Set(vs.map((v) => v.key)).size === vs.length, "Variant keys must be unique"),
  funnel_steps: z.array(FunnelStepSchema).min(1).max(6).nullish(),
  minimum_sample: z.number().int().min(10).max(1_000_000),
  notes: z.string().max(5000).nullish(),
}

export const AdminCreateExperiment = z
  .object(experimentFields)
  .partial()
  .required({ key: true, name: true, variants: true })
export type AdminCreateExperimentType = z.infer<typeof AdminCreateExperiment>

export const AdminUpdateExperiment = z.object(experimentFields).partial()
export type AdminUpdateExperimentType = z.infer<typeof AdminUpdateExperiment>

export const AdminExperimentStatus = z.object({ status: z.enum(["running", "stopped"]) })
export type AdminExperimentStatusType = z.infer<typeof AdminExperimentStatus>

export const AdminExperimentDecision = z.object({
  decision: z.enum(["ship", "keep_control", "iterate"]),
  notes: z.string().max(5000).nullish(),
})
export type AdminExperimentDecisionType = z.infer<typeof AdminExperimentDecision>
