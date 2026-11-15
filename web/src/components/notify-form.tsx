"use client"

import { useActionState, useEffect } from "react"
import { track } from "@/lib/analytics"
import { notifyMe, type NotifyState } from "@/lib/actions/notify"
import { Button } from "./ui/button"

export function NotifyForm({ releaseId, compact = false }: { releaseId: string; compact?: boolean }) {
  const [state, action, pending] = useActionState<NotifyState, FormData>(notifyMe, null)

  useEffect(() => {
    if (state?.ok) track("notify_me_submitted", { release_id: releaseId })
  }, [state?.ok, releaseId])

  if (state?.ok) {
    return <p className="text-[13px] text-ok">✓ You&apos;re on the list. We&apos;ll email you when it drops.</p>
  }
  return (
    <form action={action} className={`flex w-full gap-2 ${compact ? "max-w-md" : "max-w-lg"}`}>
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
        className="h-10 min-w-0 flex-1 rounded-[2px] border border-line bg-page px-3 text-[14px] placeholder:text-ink-faint focus:border-ink focus:outline-none"
      />
      <Button size="sm" variant="secondary" loading={pending}>
        Notify me
      </Button>
      {state?.error && (
        <p role="alert" className="sr-only">
          {state.error}
        </p>
      )}
    </form>
  )
}
