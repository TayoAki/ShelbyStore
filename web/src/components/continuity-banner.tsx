import { PlayCircle } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { cookies } from "next/headers"
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution"
import { episodeForAsset } from "@/lib/data/content"

/**
 * Ad-to-page continuity (SITE_SPEC §10): a visitor who arrives from a content
 * episode's tracked link (`?asset=`) sees which post this page continues, in a
 * white rounded strip under the header (v5 §6.0.6). Reads cookies: render in <Suspense>.
 */
export async function ContinuityBanner({ hideForSeries }: { hideForSeries?: string } = {}) {
  const asset = parseAttribution((await cookies()).get(ATTRIBUTION_COOKIE)?.value)?.asset
  const match = await episodeForAsset(asset)
  if (!match || match.series.handle === hideForSeries) return null
  return (
    <div className="mx-2.5 mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-white px-4 py-3 text-sm leading-5">
      <PlayCircle size={20} weight="fill" aria-hidden />
      <span>
        You just watched: <span className="font-medium">{match.episode.title}</span>
      </span>
      <Link href={`/stories/${match.series.handle}`} className="link ml-auto text-xs leading-4" data-track="continuity_story">
        See the full test
      </Link>
    </div>
  )
}
