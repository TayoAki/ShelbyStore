"use client"

import { useState } from "react"
import { TeeSheetForm } from "./tee-sheet-form"

/** "JOIN THE TEE SHEET" button that opens the inline tee-sheet form (G.5.5, G.5.7). */
export function TeeSheetDisclosure({ releaseHandle, hole, name }: { releaseHandle: string; hole: number; name: string }) {
  const [open, setOpen] = useState(false)
  if (open) return <TeeSheetForm releaseHandle={releaseHandle} hole={hole} name={name} tone="light" label={false} />
  return (
    <button type="button" className="btn btn-outline-black btn-small" onClick={() => setOpen(true)} data-track="notify_me">
      JOIN THE TEE SHEET
    </button>
  )
}
