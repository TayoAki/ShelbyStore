"use client"

import { useActionState, useEffect } from "react"
import { notifyMe, type NotifyState } from "@/lib/actions/notify"
import { track } from "@/lib/analytics"

/**
 * The tee sheet (SITE_SPEC v8 E.5.12): the waitlist for a numbered hole, a
 * reminder on its real release. An email field and a submit button side by
 * side from 480px, stacked below. `tone="dark"` is the footer version on black.
 */
export function TeeSheetForm({
  releaseHandle,
  hole,
  name,
  tone = "light",
  label = true,
}: {
  releaseHandle: string
  hole: number
  name: string
  tone?: "dark" | "light"
  label?: boolean
}) {
  const [state, action, pending] = useActionState<NotifyState, FormData>(notifyMe, null)
  useEffect(() => {
    if (state?.ok) track("notify_me_submitted", { release: releaseHandle, hole })
  }, [state?.ok, releaseHandle, hole])
  const id = `tee-${releaseHandle}-${tone}`
  const dark = tone === "dark"
  const holeNo = String(hole).padStart(2, "0")
  if (state?.ok)
    return (
      <p className={`text-[14.4px] ${dark ? "text-on-ink" : ""}`} role="status">
        You&apos;re on the tee sheet for Hole {holeNo}. We&apos;ll email you when it opens.
      </p>
    )
  return (
    <form action={action} className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className={`text-[12.6px] font-medium ${dark ? "text-on-ink" : ""}`}>
          Join the tee sheet for Hole {holeNo}, {name}
        </label>
      )}
      <input type="hidden" name="release_id" value={releaseHandle} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          aria-label={label ? undefined : `Email for Hole ${holeNo}, ${name}`}
          className="field min-w-0 flex-1"
        />
        <button type="submit" data-track="notify_me" disabled={pending} aria-busy={pending || undefined} className={`btn shrink-0 ${dark ? "btn-white btn-sm" : "btn-charcoal"}`}>
          {dark ? "Submit" : "Join the Tee Sheet"}
        </button>
      </div>
      <p className={`meta ${dark ? "text-center !text-on-ink/70" : ""}`}>One email when Hole {holeNo} opens. Nothing else.</p>
      {state?.error && (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
