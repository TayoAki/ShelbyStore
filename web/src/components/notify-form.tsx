"use client"

import { useActionState, useEffect } from "react"
import { track } from "@/lib/analytics"
import { notifyMe, type NotifyState } from "@/lib/actions/notify"
import { Button } from "./ui/button"

/** Email field joined to "NOTIFY ME" (SITE_SPEC §6.6 notify form). */
export function NotifyForm({ releaseId }: { releaseId: string }) {
  const [state, action, pending] = useActionState<NotifyState, FormData>(notifyMe, null)
  useEffect(() => {
    if (state?.ok) track("notify_me_submitted", { release_id: releaseId })
  }, [state?.ok, releaseId])
  if (state?.ok) return <p className="font-body text-[13px]">You&apos;re on the list. We&apos;ll email you when it drops.</p>
  return (
    <form action={action} className="flex w-full max-w-[420px] flex-col gap-1">
      <div className="flex">
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
          placeholder="Email address"
          className="h-[39px] min-w-0 flex-1 rounded-l-[3px] border border-black bg-white px-3 font-body text-[14px] focus:outline-none"
        />
        <Button className="rounded-l-none" loading={pending} track="notify_me">
          Notify me
        </Button>
      </div>
      {state?.error && (
        <p role="alert" className="font-body text-[12px] text-error">
          {state.error}
        </p>
      )}
    </form>
  )
}
