import { model } from "@medusajs/framework/utils"
import Release from "./release"

/** A customer's "notify me" signup for an upcoming release. */
const ReleaseReminder = model.define("release_reminder", {
  id: model.id({ prefix: "relrem" }).primaryKey(),
  email: model.text().nullable(),
  push_token: model.text().nullable(),
  customer_id: model.text().nullable(),
  notified_at: model.dateTime().nullable(),
  release: model.belongsTo(() => Release, { mappedBy: "reminders" }),
})

export default ReleaseReminder
