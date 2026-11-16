/**
 * The 2027 card (web G.6.7). Holes 1–4 are releases in Medusa; their live
 * phase, date and stock always come from the release and product records.
 * Holes 5–6 are announced dates with no release or product, so no countdown.
 * The static fields here are the fallback for draft editions, whose product
 * metadata the store API can't return before release.
 */
export type HoleConfig = {
  number: number
  name: string
  /** Release handle in Medusa (null = announced only). */
  releaseHandle: string | null
  productHandle: string | null
  colourway: string | null
  /** Announced date (Pacific 10:00 AM), shown without a countdown. */
  announcedAt: string | null
  editionSize: number | null
  promise: string
  moment: string
}

export const HOLES: HoleConfig[] = [
  {
    number: 1,
    name: "The Rope Cap",
    releaseHandle: "hole-1-rope-cap",
    productHandle: "rope-cap",
    colourway: null,
    announcedAt: null,
    editionSize: null,
    promise: "Four core colors, always in stock.",
    moment: "Season opener",
  },
  {
    number: 2,
    name: "Azalea",
    releaseHandle: "rope-cap-azalea",
    productHandle: "rope-cap-azalea",
    colourway: "Azalea",
    announcedAt: "2027-04-05T17:00:00Z",
    editionSize: 200,
    promise: "White crown, azalea rope, tan leather strap. An edition of 200.",
    moment: "First major week",
  },
  {
    number: 3,
    name: "Cypress",
    releaseHandle: "rope-cap-cypress",
    productHandle: "rope-cap-cypress",
    colourway: "Cypress",
    announcedAt: "2027-06-01T17:00:00Z",
    editionSize: 200,
    promise: "Coastal green crown, sand rope, tan leather strap.",
    moment: "Father's Day and the national championship weekend",
  },
  {
    number: 4,
    name: "Haar",
    releaseHandle: "rope-cap-haar",
    productHandle: "rope-cap-haar",
    colourway: "Haar",
    announcedAt: "2027-07-12T17:00:00Z",
    editionSize: 200,
    promise: "Fog grey crown, cream rope, tonal brim, tan leather strap.",
    moment: "The links major",
  },
  {
    number: 5,
    name: "Away Match",
    releaseHandle: null,
    productHandle: null,
    colourway: null,
    announcedAt: "2027-09-13T17:00:00Z",
    editionSize: null,
    promise: "A pair of colors for the team match in September.",
    moment: "The team match in September",
  },
  {
    number: 6,
    name: "Winter Rules",
    releaseHandle: null,
    productHandle: null,
    colourway: null,
    announcedAt: "2027-11-08T18:00:00Z",
    editionSize: null,
    promise: "Corduroy for the holidays.",
    moment: "The holidays",
  },
]

export const holeByRelease = (handle: string) => HOLES.find((h) => h.releaseHandle === handle) ?? null
export const holeByProduct = (handle: string) => HOLES.find((h) => h.productHandle === handle) ?? null

/** "Hole 2: Azalea" → { number: 2, name: "Azalea" } */
export function parseHoleTitle(title: string): { number: number; name: string } | null {
  const m = /^hole\s+(\d+)\s*[:·-]\s*(.+)$/i.exec(title.trim())
  return m ? { number: Number(m[1]), name: m[2].trim() } : null
}

export const pad2 = (n: number) => String(n).padStart(2, "0")
