"use client"

import { useSelection } from "../pdp/selection"
import { BoxRope } from "../rope-rule"

/** The box's rope, in the rope colour of the cap chosen on the front panel. */
export function SelectedBoxRope({ fallback }: { fallback: string | null }) {
  const { color } = useSelection()
  return <BoxRope color={color ?? fallback} />
}
