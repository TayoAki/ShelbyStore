"use client"

import { useState } from "react"
import { TeeSheetForm } from "./tee-sheet-form"

/** "Join the tee sheet" button that opens the inline tee-sheet form. */
export function TeeSheetDisclosure({ releaseHandle, hole, name }: { releaseHandle: string; hole: number; name: string }) {
  const [open, setOpen] = useState(false)
  if (open) return <TeeSheetForm releaseHandle={releaseHandle} hole={hole} name={name} tone="light" label={false} />
  return (
    <button type="button" className="btn btn-outline-black btn-small" onClick={() => setOpen(true)} data-track="notify_me">
      Join the tee sheet
    </button>
  )
}
