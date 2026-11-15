/** Mirrors the backend's GET /store/releases contract. Internal ops fields never reach the app. */
export type ReleasePhase = "live" | "upcoming" | "past"
export type ReleaseTier = "major" | "light"

export type StoreReleaseProduct = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
}

export type StoreRelease = {
  id: string
  handle: string
  title: string
  tier: ReleaseTier
  phase: ReleasePhase
  /** ISO date. null = date not set yet ("Coming soon"). */
  release_at: string | null
  published_at: string | null
  /** Customer-facing story / drop copy. */
  story: string | null
  /** One-sentence product promise. */
  product_promise: string | null
  /** What the camera shows: sleeve fall, drape, how it moves. */
  proof: string | null
  hero_image: string | null
  products: StoreReleaseProduct[]
}

export type Attribution = {
  release_id?: string
  asset?: string
  captured_at: number
}
