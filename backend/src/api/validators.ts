import { z } from "@medusajs/framework/zod"

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")

export const ReleaseAssetSchema = z.object({
  key: slug,
  kind: z.enum(["editorial", "product_images", "stories", "short_video", "email", "other"]),
  channel: z.string().min(1),
  url: z.url().nullish(),
  approved: z.boolean().default(false),
  optional: z.boolean().optional(),
})

const money = z.number().min(0)

const releaseFields = {
  title: z.string().min(1),
  handle: slug,
  tier: z.enum(["major", "light"]),
  // Manual statuses only. `live` comes from go-live, `reviewed` from a decision.
  status: z.enum(["draft", "scheduled", "held"]),
  release_at: z.iso.datetime({ offset: true }).nullable(),
  story: z.string().nullable(),
  product_promise: z.string().nullable(),
  proof: z.string().nullable(),
  hero_image: z.url().nullable(),
  owner: z.string().nullable(),
  backup_approver: z.string().nullable(),
  assets: z.array(ReleaseAssetSchema),
  check_mobile_pdp: z.boolean(),
  check_fulfillment: z.boolean(),
  check_channel_links: z.boolean(),
  check_tracking: z.boolean(),
  capacity_hours: money.nullable(),
  actual_hours: money.nullable(),
  launch_spend: money,
  fulfillment_cost_per_order: money,
  selling_cost_rate: z.number().min(0).max(1),
  contribution_floor: z.number().nullable(),
  units_added: z.number().int().min(0),
  returns_window_days: z.number().int().min(1).max(365),
  product_ids: z.array(z.string()),
}

export const AdminCreateRelease = z
  .object(releaseFields)
  .partial()
  .required({ title: true })
export type AdminCreateReleaseType = z.infer<typeof AdminCreateRelease>

export const AdminUpdateRelease = z.object(releaseFields).partial()
export type AdminUpdateReleaseType = z.infer<typeof AdminUpdateRelease>

export const AdminReleaseDecision = z.object({
  decision: z.enum(["repeat", "simplify", "pause"]),
  notes: z.string().nullish(),
})
export type AdminReleaseDecisionType = z.infer<typeof AdminReleaseDecision>

export const StoreCreateReminder = z
  .object({
    email: z.email().optional(),
    push_token: z
      .string()
      .regex(/^Expo(nent)?PushToken\[.+\]$/, "Expected an Expo push token")
      .optional(),
  })
  .refine((d) => !!d.email || !!d.push_token, {
    message: "Provide an email or a push token",
  })
export type StoreCreateReminderType = z.infer<typeof StoreCreateReminder>
