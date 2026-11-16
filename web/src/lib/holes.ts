/**
 * Holes 5–6 of the 2027 card (SITE_SPEC G.6.7): announced dates without a
 * product or a release yet, so they never show a countdown. Holes 1–4 come
 * from the backend's releases.
 */
export type AnnouncedHole = {
  hole: number
  name: string
  /** Release moment in UTC (10:00 AM Pacific). */
  date: string
  moment: string
  note: string
}

export const ANNOUNCED_HOLES: AnnouncedHole[] = [
  {
    hole: 5,
    name: "Away Match",
    date: "2027-09-13T17:00:00Z",
    moment: "The team match in September",
    note: "A pair of colors. Pick a side, or buy both.",
  },
  {
    hole: 6,
    name: "Winter Rules",
    date: "2027-11-08T18:00:00Z",
    moment: "The holidays",
    note: "Corduroy, chocolate crown, cream rope, leather strap.",
  },
]
