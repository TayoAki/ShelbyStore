import AsyncStorage from "@react-native-async-storage/async-storage"
import Medusa from "@medusajs/js-sdk"

import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./config"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
  debug: false,
  auth: {
    type: "jwt",
    jwtTokenStorageKey: "shelby.auth_token",
    jwtTokenStorageMethod: "custom",
    storage: AsyncStorage,
  },
})

/** Pulls a human-readable message out of whatever the SDK threw. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback
  if (typeof error === "string") return error
  if (error instanceof Error && error.message) return error.message
  const maybe = error as { message?: unknown }
  if (typeof maybe.message === "string" && maybe.message) return maybe.message
  return fallback
}

/** True when the SDK error is an HTTP 404 (missing cart, product, release). */
export function isNotFound(error: unknown): boolean {
  const maybe = error as { status?: number; statusText?: string } | null
  return !!maybe && (maybe.status === 404 || maybe.statusText === "Not Found")
}
