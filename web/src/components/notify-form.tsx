"use client"

import { useActionState, useEffect } from "react"
import { track } from "@/lib/analytics"
import { notifyMe, type NotifyState } from "@/lib/actions/notify"
import { Button } from "./ui/button"

export function NotifyForm({
  releaseId,
  compact = false,
  tone = "light",
}: {
  releaseId: string
  compact?: boolean
  /** "dark" on ink bands. */
  tone?: "light" | "dark"
}) {
  const [state, action, pending] = useActionState<NotifyState, FormData>(notifyMe, null)

  useEffect(() => {
    if (state?.ok) track("notify_me_submitted", { release_id: releaseId })
  }, [state?.ok, releaseId])

  if (state?.ok) {
    return (
      <p className={`text-[13px] ${tone === "dark" ? "text-page" : "text-ok"}`}>
        ✓ You&apos;re on the list. We&apos;ll email you when it drops.
      </p>
    )
  }
  return (
    <form action={action} className={`flex w-full flex-wrap gap-2 ${compact ? "max-w-md" : "max-w-lg"}`}>
      <input type="hidden" name="release_id" value={releaseId} />
      <label className="sr-only" htmlFor={`notify-${releaseId}`}>
        Email
      </label>
      <input
        id={`notify-${releaseId}`}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="Email for the drop alert"
        className="h-10 min-w-0 flex-1 rounded-[2px] border border-ink-faint bg-paper px-3 text-[14px] text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
      />
      <Button size="sm" variant={tone === "dark" ? "inverse" : "secondary"} loading={pending} data-track="notify_me">
        Notify me
      </Button>
      {state?.error && (
        <p role="alert" className={`basis-full text-[13px] ${tone === "dark" ? "text-accent" : "text-danger"}`}>
          {state.error}
        </p>
      )}
    </form>
  )
}
