import { PlayCircle } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { cookies } from "next/headers"
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution"
import { episodeForAsset } from "@/lib/data/content"

/**
 * Ad-to-page continuity (SITE_SPEC §10): a visitor who arrives from a content
 * episode's tracked link (`?asset=`) sees which post this page continues, on a
 * printed strip under the header. Reads cookies: render in <Suspense>.
 */
export async function ContinuityBanner({ hideForSeries }: { hideForSeries?: string } = {}) {
  const asset = parseAttribution((await cookies()).get(ATTRIBUTION_COOKIE)?.value)?.asset
  const match = await episodeForAsset(asset)
  if (!match || match.series.handle === hideForSeries) return null
  return (
    <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-ink bg-paper px-4 py-3 text-[0.9375rem] leading-6 md:px-6">
      <PlayCircle size={20} weight="fill" aria-hidden />
      <span>
        You just watched: <span className="font-medium">{match.episode.title}</span>
      </span>
      <Link href={`/stories/${match.series.handle}`} className="link ml-auto font-semibold" data-track="continuity_story">
        See the full test
      </Link>
    </div>
  )
}
