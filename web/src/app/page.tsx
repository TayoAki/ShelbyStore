import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { CoreBand } from "@/components/home/core-band"
import { DropsBand } from "@/components/home/drops-band"
import { FitStrip } from "@/components/home/fit-strip"
import { Hero } from "@/components/home/hero"
import { SeriesBand } from "@/components/home/series-band"
import { ShapeTiles } from "@/components/home/shape-tiles"
import { getRegion, listCategories, listCoreProducts, listProducts, listReleases } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { shapesFrom } from "@/lib/shapes"

/**
 * Home (SITE_SPEC §6.1): hero with the core cap and its price above the fold,
 * shop by shape, the live-count proof band, drops with a real countdown, the
 * content series, and the fit promise.
 */
export default async function HomePage() {
  const region = await getRegion()
  const [releases, core, all, categories, series] = await Promise.all([
    listReleases(),
    region ? listCoreProducts(region.id) : Promise.resolve([]),
    region ? listProducts(region.id) : Promise.resolve([]),
    listCategories(),
    listSeries(),
  ])
  const live = releases.find((r) => r.phase === "live") ?? null
  const upcoming = releases.filter((r) => r.phase === "upcoming")
  const next = [...upcoming].filter((r) => r.release_at).sort((a, b) => Date.parse(a.release_at!) - Date.parse(b.release_at!))[0] ?? null

  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <Hero core={core[0] ?? null} live={live} />
      <ShapeTiles shapes={shapesFrom(categories, all)} next={next} />
      <CoreBand products={core} />
      <DropsBand live={live} upcoming={upcoming} />
      <SeriesBand series={series[0] ?? null} />
      {/* Last band: sits flush on the footer. */}
      <FitStrip last />
    </>
  )
}
