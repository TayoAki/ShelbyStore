import Link from "next/link"
import { cookies } from "next/headers"
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution"
import { episodeForAsset } from "@/lib/data/content"

/**
 * Ad-to-page continuity (SITE_SPEC v8 E.5.12): a visitor who arrives from a
 * content episode's tracked link (`?asset=`) sees which post this page
 * continues, in a 44px white strip under the header. Reads cookies: render in
 * <Suspense>.
 */
export async function ContinuityBanner({ hideForSeries }: { hideForSeries?: string } = {}) {
  const asset = parseAttribution((await cookies()).get(ATTRIBUTION_COOKIE)?.value)?.asset
  const match = await episodeForAsset(asset)
  if (!match || match.series.handle === hideForSeries) return null
  return (
    <div className="wrap flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-border bg-bg py-2 text-[14.4px]">
      <span>
        You just watched: <span className="font-medium">{match.episode.title}</span>
      </span>
      <Link href={`/stories/${match.series.handle}`} className="link" data-track="continuity_story">
        See the full test
      </Link>
    </div>
  )
}
