import "server-only"
import Medusa from "@medusajs/js-sdk"

/**
 * Server-side Medusa client. Every Store API call happens on the server
 * (Server Components and Server Actions), so the browser never talks to
 * Medusa directly and no CORS setup is needed for the storefront.
 */
export const MEDUSA_BACKEND_URL = (process.env.MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "")

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: process.env.MEDUSA_PUBLISHABLE_KEY,
  auth: { type: "jwt", jwtTokenStorageMethod: "nostore" },
})
