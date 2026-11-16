"use client"

import { EnvelopeSimple } from "@phosphor-icons/react"
import { useActionState, useEffect, useState } from "react"
import { notifyMe, type NotifyState } from "@/lib/actions/notify"
import { track } from "@/lib/analytics"
import { Button } from "./ui/button"

/** "GET DROP ALERTS" reveals an email field joined to "SIGN UP" (SITE_SPEC §6.0.6). */
export function NewsletterForm({ releaseId, releaseTitle }: { releaseId: string; releaseTitle: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<NotifyState, FormData>(notifyMe, null)
  useEffect(() => {
    if (state?.ok) track("notify_me_submitted", { release_id: releaseId, source: "newsletter" })
  }, [state?.ok, releaseId])

  if (state?.ok) return <p className="font-body text-[15px]">You&apos;re on the list for {releaseTitle}.</p>
  if (!open) {
    return (
      <Button variant="icon" className="w-[252px]" icon={<EnvelopeSimple size={14} />} onClick={() => setOpen(true)} track="notify_me">
        Get drop alerts
      </Button>
    )
  }
  return (
    <form action={action} className="mx-auto flex max-w-full flex-col items-center gap-2">
      <div className="flex">
        <input type="hidden" name="release_id" value={releaseId} />
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          placeholder="Email address"
          className="h-[39px] w-[280px] max-w-[60vw] rounded-l-[3px] border border-black bg-white px-3 font-body text-[14px] focus:outline-none"
        />
        <Button className="rounded-l-none" loading={pending} track="notify_me">
          Sign up
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
