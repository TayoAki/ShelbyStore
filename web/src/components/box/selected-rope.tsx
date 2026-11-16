"use client"

import { useId } from "react"
import { useSelection } from "../pdp/selection"
import { BoxRope } from "../rope-rule"

/**
 * The box's rope, in the rope colour of the cap chosen on the front panel.
 * `run`: "across" crosses the fold full width; "phone" is the short crossing
 * between the stacked front and side panels (hidden once they sit side by
 * side); "rail" runs down the side panel's left edge on a phone, joining the
 * two crossings into one cord: front, side, back.
 */
export function SelectedBoxRope({ fallback, run = "across" }: { fallback: string | null; run?: "across" | "phone" | "rail" }) {
  const { color } = useSelection()
  const id = `rope-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const c = color ?? fallback
  if (run === "rail") return <BoxRope color={c} id={id} vertical className="absolute inset-y-0 left-0 z-[1] lg:hidden" />
  return <BoxRope color={c} id={id} className={run === "phone" ? "lg:hidden" : ""} />
}
