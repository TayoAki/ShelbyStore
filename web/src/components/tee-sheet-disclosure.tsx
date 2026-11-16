"use client"

import { useState } from "react"
import { TeeSheetForm } from "./tee-sheet-form"

/** A "Join the tee sheet" link that opens the inline tee-sheet form. */
export function TeeSheetDisclosure({ releaseHandle, hole, name }: { releaseHandle: string; hole: number; name: string }) {
  const [open, setOpen] = useState(false)
  if (open) return <TeeSheetForm releaseHandle={releaseHandle} hole={hole} name={name} label={false} />
  return (
    <button type="button" className="link min-h-11 text-[14.4px]" onClick={() => setOpen(true)} data-track="notify_me">
      Join the tee sheet
    </button>
  )
}
