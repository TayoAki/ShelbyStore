import { model } from "@medusajs/framework/utils"

/**
 * A custom club or outing order request from /custom (web SITE_SPEC G.6.10):
 * 24 caps minimum, in twelves per colour, quoted by hand.
 */
const CustomQuote = model
  .define("custom_quote", {
    id: model.id({ prefix: "cquote" }).primaryKey(),
    name: model.text(),
    email: model.text(),
    organisation: model.text(),
    quantity: model.number(),
    /** Caps per colour, e.g. { "Pine": 24, "Tour White": 12 }. */
    colors: model.json(),
    needed_by: model.dateTime().nullable(),
    artwork_url: model.text().nullable(),
    notes: model.text().nullable(),
    rights_confirmed: model.boolean().default(false),
    status: model.enum(["new", "quoted", "won", "lost"]).default("new"),
    /** Attribution captured on the storefront (asset, UTM, analytics id). */
    source: model.json().nullable(),
  })
  .indexes([{ on: ["status", "created_at"] }])

export default CustomQuote
