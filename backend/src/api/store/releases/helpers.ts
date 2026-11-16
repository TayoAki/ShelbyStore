import { RemoteQueryFunction } from "@medusajs/framework/types"

type Query = Omit<RemoteQueryFunction, symbol>

export type StorePhase = "live" | "upcoming" | "past"

type Status = "draft" | "scheduled" | "held" | "live" | "reviewed"

/** Statuses customers can see. Drafts stay internal. */
const VISIBLE_STATUSES: Status[] = ["scheduled", "held", "live", "reviewed"]

const PHASE_STATUSES: Record<StorePhase, Status[]> = {
  upcoming: ["scheduled", "held"],
  live: ["live"],
  past: ["reviewed"],
}

/**
 * Only customer-facing fields. Owners, costs, hours, checks and decisions
 * never leave the admin API.
 */
const STORE_FIELDS = [
  "id",
  "handle",
  "title",
  "tier",
  "status",
  "release_at",
  "published_at",
  "story",
  "product_promise",
  "proof",
  "hero_image",
  "products.id",
  "products.handle",
  "products.title",
  "products.thumbnail",
  "products.metadata",
]

/** The numbered-edition facts customers may see (web SITE_SPEC G.1.5). */
function editionOf(metadata: unknown): { hole: number; size: number | null } | null {
  const e = (metadata as { edition?: { hole?: unknown; size?: unknown } } | null)?.edition
  if (!e || typeof e.hole !== "number") return null
  return { hole: e.hole, size: typeof e.size === "number" ? e.size : null }
}

const phaseOf = (status: string): StorePhase =>
  status === "live" ? "live" : status === "reviewed" ? "past" : "upcoming"

export function toStoreRelease(r: any) {
  const phase = phaseOf(r.status)
  return {
    id: r.id,
    handle: r.handle,
    title: r.title,
    tier: r.tier,
    phase,
    // A held release has missed its date; show "coming soon" until it's rescheduled.
    release_at: r.status === "held" ? null : r.release_at ?? null,
    published_at: r.published_at ?? null,
    story: r.story ?? null,
    product_promise: r.product_promise ?? null,
    proof: r.proof ?? null,
    hero_image: r.hero_image ?? null,
    products: (r.products ?? []).filter(Boolean).map((p: any) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      thumbnail: p.thumbnail ?? null,
      // Only the public edition facts (hole, size): editions are drafts until
      // their release goes live, so the store product API can't return them.
      edition: editionOf(p.metadata),
    })),
  }
}

export async function listStoreReleases(query: Query, phase?: StorePhase) {
  const { data } = await query.graph({
    entity: "release",
    fields: STORE_FIELDS,
    filters: { status: (phase ? PHASE_STATUSES[phase] : VISIBLE_STATUSES) as any },
  })
  const releases = (data as any[]).map(toStoreRelease)

  const time = (v: string | null) => (v ? new Date(v).getTime() : Number.MAX_SAFE_INTEGER)
  const upcoming = releases
    .filter((r) => r.phase === "upcoming")
    .sort((a, b) => time(a.release_at) - time(b.release_at))
  const live = releases
    .filter((r) => r.phase === "live")
    .sort((a, b) => time(b.published_at) - time(a.published_at))
  const past = releases
    .filter((r) => r.phase === "past")
    .sort((a, b) => time(b.published_at) - time(a.published_at))
    .slice(0, 12)

  return [...live, ...upcoming, ...past]
}

export async function findStoreRelease(query: Query, idOrHandle: string) {
  const { data } = await query.graph({
    entity: "release",
    fields: STORE_FIELDS,
    filters: {
      ...(idOrHandle.startsWith("rel_") ? { id: idOrHandle } : { handle: idOrHandle }),
      status: VISIBLE_STATUSES as any,
    },
  })
  return data?.[0] ? toStoreRelease(data[0]) : null
}
