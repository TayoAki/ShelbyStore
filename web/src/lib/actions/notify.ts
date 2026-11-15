"use server"

import { sdk } from "../medusa"

export type NotifyState = { ok?: boolean; error?: string } | null

/** "Notify me" for an upcoming drop. */
export async function notifyMe(_prev: NotifyState, form: FormData): Promise<NotifyState> {
  const releaseId = String(form.get("release_id") ?? "")
  const email = String(form.get("email") ?? "").trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email" }
  try {
    await sdk.client.fetch(`/store/releases/${encodeURIComponent(releaseId)}/reminders`, {
      method: "POST",
      body: { email },
    })
    return { ok: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}
