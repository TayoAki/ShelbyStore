import { Play } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { cookies } from "next/headers"
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution"
import { episodeForAsset } from "@/lib/data/content"

/**
 * Ad-to-page continuity (SITE_SPEC §10): a visitor who arrives from a content
 * episode's tracked link (`?asset=`) sees which post this page continues, in a
 * full-width #ededed bar under the header. Reads cookies: render in <Suspense>.
 */
export async function ContinuityBanner({ hideForSeries }: { hideForSeries?: string } = {}) {
  const asset = parseAttribution((await cookies()).get(ATTRIBUTION_COOKIE)?.value)?.asset
  const match = await episodeForAsset(asset)
  if (!match || match.series.handle === hideForSeries) return null
  return (
    <div className="bg-mega">
      <div className="container-shop flex flex-wrap items-center gap-x-3 gap-y-1 py-3 font-body text-[13px]">
        <Play size={12} weight="fill" aria-hidden />
        <span>
          You just watched: <span className="font-subheading">{match.episode.title}</span>
        </span>
        <Link href={`/stories/${match.series.handle}`} className="btn btn--micro ml-auto" data-track="continuity_story">
          <span>See the full test</span>
        </Link>
      </div>
    </div>
  )
}
