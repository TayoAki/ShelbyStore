import Link from "next/link"
import { listReleases } from "@/lib/data/catalog"
import { AnnouncementRotator } from "./announcement-rotator"

/**
 * 36px black bar that scrolls away (SITE_SPEC §6.0.1). True messages only:
 * the shipping and returns policy, plus the live drop when there is one.
 */
export async function AnnouncementBar() {
  const live = (await listReleases()).find((r) => r.phase === "live") ?? null
  const messages = [
    <span key="ship">Standard Shipping $6</span>,
    <span key="returns">30-Day Returns</span>,
    ...(live
      ? [
          <Link key="drop" href={`/drops/${live.handle}`} data-track="announcement_drop" className="underline-offset-2 hover:underline">
            {live.title} Is Live Now
          </Link>,
        ]
      : []),
  ]
  return (
    <div className="bg-primary text-white">
      <AnnouncementRotator messages={messages} />
    </div>
  )
}
