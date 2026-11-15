import AsyncStorage from "@react-native-async-storage/async-storage"

import { setAnalyticsContext, clearAnalyticsContext } from "./analytics"
import { ATTRIBUTION_TTL_MS } from "./config"
import type { Attribution } from "./types"

const KEY = "shelby.attribution"

/**
 * Attribution feeds the playbook's "channel response" measure: which release and which
 * creative asset (e.g. `tiktok-tryon`) drove an order. It arrives via deep links such as
 * `shelby://drops/<handle>?asset=<asset-key>` and is written into cart metadata, which
 * Medusa copies onto the order.
 */
export async function readAttribution(now = Date.now()): Promise<Attribution | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Attribution
    if (!parsed.captured_at || now - parsed.captured_at > ATTRIBUTION_TTL_MS) {
      await AsyncStorage.removeItem(KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/**
 * Latest touch wins. A new asset without a release keeps the stored release only if it
 * was captured in the same visit chain; we keep it simple and merge fields that are set.
 */
export async function captureAttribution(input: { release_id?: string; asset?: string }): Promise<void> {
  const release_id = clean(input.release_id)
  const asset = clean(input.asset)
  if (!release_id && !asset) return
  const existing = await readAttribution()
  const next: Attribution = {
    release_id: release_id ?? existing?.release_id,
    asset: asset ?? existing?.asset,
    captured_at: Date.now(),
  }
  setAnalyticsContext(next)
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Attribution is best-effort; never block shopping on it.
  }
}

export async function clearAttribution(): Promise<void> {
  clearAnalyticsContext()
  try {
    await AsyncStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

/** Builds the cart metadata patch. Returns null when nothing would change. */
export function attributionPatch(
  current: Record<string, unknown> | null | undefined,
  attribution: Attribution | null,
  releaseIdOverride?: string
): Record<string, unknown> | null {
  const release_id = releaseIdOverride ?? attribution?.release_id
  const asset = attribution?.asset
  const next: Record<string, unknown> = { ...(current ?? {}) }
  if (release_id) next.release_id = release_id
  if (asset) next.asset = asset
  const changed = next.release_id !== current?.release_id || next.asset !== current?.asset
  return changed ? next : null
}

function clean(value?: string): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim().slice(0, 120)
  return trimmed || undefined
}
