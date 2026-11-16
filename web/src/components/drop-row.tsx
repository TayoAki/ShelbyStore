import Image from "next/image"
import Link from "next/link"
import { formatDropDate } from "@/lib/format"
import type { StoreRelease } from "@/lib/types"
import { NotifyForm } from "./notify-form"
import { RelativeTime } from "./relative-time"

/** One upcoming release on the drop calendar (SITE_SPEC §6.1.3). */
export function DropRow({ release }: { release: StoreRelease }) {
  const image = release.hero_image ?? release.products[0]?.thumbnail
  return (
    <li className="grid grid-cols-[96px_1fr] gap-4 border-t border-line py-6 lg:grid-cols-[140px_1fr_380px] lg:items-center lg:gap-8">
      <Link href={`/drops/${release.handle}`} className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
        {image && <Image src={image} alt={release.title} fill sizes="140px" className="object-cover" />}
      </Link>
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow text-accent-ink">
          {release.release_at ? formatDropDate(release.release_at) : "Date coming soon"}
          {release.release_at && (
            <span className="text-ink-muted">
              {" · "}
              <RelativeTime iso={release.release_at} />
            </span>
          )}
        </p>
        <Link href={`/drops/${release.handle}`} className="font-display text-[26px] leading-[0.95] hover:text-ink-muted lg:text-[34px]">
          {release.title}
        </Link>
        <p className="text-eyebrow text-ink-muted">{release.tier === "major" ? "New silhouette" : "New colour"}</p>
        {release.product_promise && <p className="max-w-xl text-[15px] text-ink-muted">{release.product_promise}</p>}
      </div>
      <div className="col-span-2 lg:col-span-1">
        <NotifyForm releaseId={release.id} compact />
      </div>
    </li>
  )
}
