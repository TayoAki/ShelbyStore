import Link from "next/link"
import { cookies } from "next/headers"
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution"
import { episodeForAsset } from "@/lib/data/content"
import { Container } from "./container"

/**
 * Ad-to-page continuity: a visitor who arrives from a content episode's tracked
 * link (`?asset=`) sees that this page continues the post they just watched.
 * Reads cookies, so render it inside <Suspense>.
 */
export async function ContinuityBanner({ hideForSeries }: { hideForSeries?: string } = {}) {
  const asset = parseAttribution((await cookies()).get(ATTRIBUTION_COOKIE)?.value)?.asset
  const match = await episodeForAsset(asset)
  if (!match || match.series.handle === hideForSeries) return null
  return (
    <div className="border-b border-line bg-surface">
      <Container className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-[13px]">
        <span className="text-eyebrow text-accent-ink">From {match.series.title}</span>
        <span className="font-medium">{match.episode.title}</span>
        <Link href={`/stories/${match.series.handle}`} className="ml-auto underline underline-offset-4" data-track="continuity_story">
          See the full test
        </Link>
      </Container>
    </div>
  )
}
