import { ReleaseStatus } from "./types"

/**
 * Status changes the team can make by hand. `live` is only reached through the
 * go-live workflow (which runs the go/no-go checks), and `reviewed` only by
 * recording a decision.
 */
const MANUAL_TRANSITIONS: Record<ReleaseStatus, ReleaseStatus[]> = {
  draft: ["scheduled"],
  scheduled: ["draft"],
  // A held release moves its date and goes back on the calendar (SOP 2 step 3).
  held: ["scheduled", "draft"],
  live: [],
  reviewed: [],
}

export function canTransition(from: ReleaseStatus, to: ReleaseStatus): boolean {
  return from === to || MANUAL_TRANSITIONS[from]?.includes(to) === true
}
