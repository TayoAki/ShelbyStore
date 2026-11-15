import { model } from "@medusajs/framework/utils"
import ReleaseReminder from "./release-reminder"

/**
 * A product release ("drop") as described in the product-drop playbook.
 *
 * The fields map onto the playbook's SOPs:
 * - SOP 2 (Scope the release): tier, release_at, owner, backup_approver, capacity_hours
 * - SOP 3 (Produce and check creative): product_promise, proof, assets
 * - SOP 4 (Launch and review): check_* go/no-go flags, hold_reason, actual_hours,
 *   launch costs, decision
 * - Pilot scorecard inputs: contribution_floor, fulfillment_cost_per_order,
 *   selling_cost_rate, starting_units, units_added, returns_window_days
 */
const Release = model
  .define("release", {
    id: model.id({ prefix: "rel" }).primaryKey(),
    title: model.text().searchable(),
    handle: model.text().unique(),

    // SOP 2: "major" = new silhouette or story with dedicated assets,
    // "light" = approved variation using PDP, Stories and a native short video.
    tier: model.enum(["major", "light"]).default("light"),
    status: model
      .enum(["draft", "scheduled", "held", "live", "reviewed"])
      .default("draft"),
    release_at: model.dateTime().nullable(),
    published_at: model.dateTime().nullable(),

    // Customer-facing copy (shown in the app).
    story: model.text().nullable(),
    product_promise: model.text().nullable(),
    proof: model.text().nullable(),
    hero_image: model.text().nullable(),

    // Ownership (SOP 2 step 3).
    owner: model.text().nullable(),
    backup_approver: model.text().nullable(),

    // Creative asset plan (SOP 3). Array of ReleaseAsset, see lib/playbook/types.
    assets: model.json().nullable(),

    // Go/no-go checks confirmed by the ecommerce & ops lead (SOP 4 step 1).
    // Inventory by size is computed live from stock, not stored.
    check_mobile_pdp: model.boolean().default(false),
    check_fulfillment: model.boolean().default(false),
    check_channel_links: model.boolean().default(false),
    check_tracking: model.boolean().default(false),
    hold_reason: model.text().nullable(),

    // Workload (pilot: "Team workload").
    capacity_hours: model.float().nullable(),
    actual_hours: model.float().nullable(),

    // Economics (pilot: "Release contribution"). Amounts in store currency, major units.
    launch_spend: model.float().default(0),
    fulfillment_cost_per_order: model.float().default(0),
    selling_cost_rate: model.float().default(0),
    contribution_floor: model.float().nullable(),

    // Sell-through denominators (captured at go-live, adjusted manually).
    starting_units: model.number().nullable(),
    units_added: model.number().default(0),
    returns_window_days: model.number().default(30),

    // Next-release decision (SOP 4 step 3).
    decision: model.enum(["repeat", "simplify", "pause"]).nullable(),
    decision_notes: model.text().nullable(),
    decided_by: model.text().nullable(),
    decided_at: model.dateTime().nullable(),

    reminders: model.hasMany(() => ReleaseReminder, { mappedBy: "release" }),
  })
  .cascades({ delete: ["reminders"] })
  .indexes([{ on: ["status", "release_at"] }])

export default Release
