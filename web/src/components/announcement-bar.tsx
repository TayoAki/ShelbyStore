import { POLICY } from "@/lib/policy"

/** Reassurance, not promotion (SITE_SPEC §6.0). */
export function AnnouncementBar() {
  return (
    <div className="text-eyebrow flex h-8 items-center justify-center bg-ink px-4 text-center text-page">
      {POLICY.announcement}
    </div>
  )
}
