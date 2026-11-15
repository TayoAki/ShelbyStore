import { SeriesStatus } from "./types"

/** Manual status changes. Decisions set continue / revise / paused. */
const MANUAL: Record<SeriesStatus, SeriesStatus[]> = {
  draft: ["piloting"],
  piloting: ["draft"],
  // A reviewed batch starts the next batch (or goes back to the drawing board).
  continue: ["piloting", "draft"],
  revise: ["piloting", "draft"],
  paused: ["draft"],
}

export const canTransitionSeries = (from: SeriesStatus, to: SeriesStatus) =>
  from === to || MANUAL[from]?.includes(to) === true

export const STATUS_FOR_DECISION = {
  continue: "continue",
  revise: "revise",
  pause: "paused",
} as const
