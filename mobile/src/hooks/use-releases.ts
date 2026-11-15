import { useQuery } from "@tanstack/react-query"

import { getRelease, listReleases, sortPast, sortUpcoming } from "@/lib/releases"
import type { StoreRelease } from "@/lib/types"

/** Drops change state on a schedule, so poll gently while a screen that shows them is open. */
const REFRESH_MS = 60_000

export function useReleases() {
  return useQuery({
    queryKey: ["releases"],
    queryFn: () => listReleases(),
    refetchInterval: REFRESH_MS,
    select: (releases: StoreRelease[]) => ({
      all: releases,
      live: releases.filter((r) => r.phase === "live"),
      upcoming: sortUpcoming(releases.filter((r) => r.phase === "upcoming")),
      past: sortPast(releases.filter((r) => r.phase === "past")),
    }),
  })
}

export function useRelease(handle: string | undefined) {
  return useQuery({
    queryKey: ["release", handle],
    queryFn: () => getRelease(handle!),
    enabled: !!handle,
    refetchInterval: REFRESH_MS,
  })
}

/** Maps product id → live release id, so adding a drop product attributes the cart to it. */
export function useLiveReleaseIndex(): Map<string, string> {
  const { data } = useReleases()
  const index = new Map<string, string>()
  for (const release of data?.live ?? []) {
    for (const product of release.products) index.set(product.id, release.id)
  }
  return index
}
