"use client"

import { useActionState, useEffect } from "react"
import { notifyMe, type NotifyState } from "@/lib/actions/notify"
import { track } from "@/lib/analytics"

/**
 * The tee sheet: the waitlist for a numbered hole (a reminder on the real
 * release). A keylined field with its printed JOIN block beside it; `tone`
 * picks the look on paper (light) or on an ink panel (dark).
 */
export function TeeSheetForm({
  releaseHandle,
  hole,
  name,
  tone = "dark",
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
  const id = `tee-${releaseHandle}`
  if (state?.ok)
    return (
      <p className="text-[0.9375rem] leading-6" role="status">
        You&apos;re on the tee sheet for Hole {hole}. We&apos;ll email you when it goes live.
      </p>
    )
  return (
    <form action={action} className="flex flex-col gap-3">
      {label && (
        <label htmlFor={id} className="label">
          Join the tee sheet
        </label>
      )}
      <input type="hidden" name="release_id" value={releaseHandle} />
      <div className="flex max-w-[420px] gap-2">
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={`Email for Hole ${hole}, ${name}`}
          aria-label={label ? undefined : `Email for Hole ${hole}, ${name}`}
          className={`field min-w-0 flex-1 ${tone === "dark" ? "!border-white/70" : ""}`}
        />
        <button
          type="submit"
          data-track="notify_me"
          disabled={pending}
          className={`btn ${tone === "dark" ? "btn-on-ink" : "btn-secondary"}`}
        >
          Join
        </button>
      </div>
      {state?.error && (
        <p className="text-[0.9375rem]" role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
