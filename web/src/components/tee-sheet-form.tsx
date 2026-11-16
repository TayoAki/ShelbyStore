"use client"

import { useActionState, useEffect } from "react"
import { notifyMe, type NotifyState } from "@/lib/actions/notify"
import { track } from "@/lib/analytics"

/**
 * The tee sheet (SITE_SPEC G.5.7): the waitlist for the next hole. Same pill
 * input + white button box as v5 §6.0.8; function unchanged (a reminder on the
 * release). `tone` picks the light (on white) or dark (on green/black) look.
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
      <p className={`text-xs leading-4 ${tone === "dark" ? "text-white" : "text-black"}`} role="status">
        You&apos;re on the tee sheet for Hole {hole}. We&apos;ll email you when it goes live.
      </p>
    )
  return (
    <form action={action} className="flex flex-col gap-3">
      {label && (
        <label htmlFor={id} className={`eyebrow ${tone === "dark" ? "text-white" : "text-black"}`}>
          JOIN THE TEE SHEET
        </label>
      )}
      <input type="hidden" name="release_id" value={releaseHandle} />
      <div className="relative max-w-[384px]">
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={`Email for Hole ${hole}, ${name}`}
          aria-label={label ? undefined : `Email for Hole ${hole}, ${name}`}
          className="h-[42px] w-full rounded-full border border-black bg-white px-3 py-2.5 pr-20 text-base text-black placeholder:text-gray-500"
        />
        <button
          type="submit"
          data-track="notify_me"
          disabled={pending}
          className="btn btn-primary absolute top-1/2 right-1 -translate-y-1/2 font-bold text-black active:opacity-[.85]"
        >
          JOIN
        </button>
      </div>
      {state?.error && (
        <p className={`text-xs ${tone === "dark" ? "text-white" : "text-red"}`} role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
