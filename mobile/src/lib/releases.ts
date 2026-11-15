import { sdk } from "./medusa"
import type { ReleasePhase, StoreRelease } from "./types"

export async function listReleases(phase?: ReleasePhase): Promise<StoreRelease[]> {
  const { releases } = await sdk.client.fetch<{ releases: StoreRelease[] }>("/store/releases", {
    query: phase ? { phase } : undefined,
  })
  return releases
}

export async function getRelease(handle: string): Promise<StoreRelease> {
  const { release } = await sdk.client.fetch<{ release: StoreRelease }>(
    `/store/releases/${encodeURIComponent(handle)}`
  )
  return release
}

export async function createReminder(
  releaseId: string,
  body: { email?: string; push_token?: string }
): Promise<{ id: string }> {
  const { reminder } = await sdk.client.fetch<{ reminder: { id: string } }>(
    `/store/releases/${encodeURIComponent(releaseId)}/reminders`,
    { method: "POST", body }
  )
  return reminder
}

/** Sorts upcoming drops soonest first; undated ("coming soon") drops go last. */
export function sortUpcoming(releases: StoreRelease[]): StoreRelease[] {
  return [...releases].sort((a, b) => {
    if (!a.release_at) return 1
    if (!b.release_at) return -1
    return new Date(a.release_at).getTime() - new Date(b.release_at).getTime()
  })
}

/** Most recent first, by when it went live (or was scheduled). */
export function sortPast(releases: StoreRelease[]): StoreRelease[] {
  const at = (r: StoreRelease) => new Date(r.published_at ?? r.release_at ?? 0).getTime()
  return [...releases].sort((a, b) => at(b) - at(a))
}
