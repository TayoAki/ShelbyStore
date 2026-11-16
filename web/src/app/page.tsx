import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { AboutShelby } from "@/components/home/about"
import { BrowseByStyle } from "@/components/home/browse-by-style"
import { CrushTest } from "@/components/home/crush-test"
import { DropBanner } from "@/components/home/drop-banner"
import { FindYourFit } from "@/components/home/find-your-fit"
import { Hero } from "@/components/home/hero"
import { InStockToday } from "@/components/home/in-stock-today"
import { ShopByColor } from "@/components/home/shop-by-color"
import { Stories } from "@/components/home/stories"
import { getRegion, listCategories, listCoreProducts, listProducts, listReleases } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { colorThumbs, imagesFor } from "@/lib/product"
import { shapesFrom } from "@/lib/shapes"

/**
 * Home in Melin's section order with Shelby content in each slot (SITE_SPEC
 * §6.1): hero, Browse By Style, drop banner, Find Your Fit, Shop By Color, In
 * Stock Today, From The Crush Test, About Shelby, Stories. The newsletter and
 * footer come from the layout.
 */
export default async function HomePage() {
  const region = await getRegion()
  const [releases, coreList, all, categories, series] = await Promise.all([
    listReleases(),
    region ? listCoreProducts(region.id) : Promise.resolve([]),
    region ? listProducts(region.id) : Promise.resolve([]),
    listCategories(),
    listSeries(),
  ])
  const core = coreList[0] ?? null
  const live = releases.find((r) => r.phase === "live") ?? null
  const next =
    releases
      .filter((r) => r.phase === "upcoming" && r.release_at)
      .sort((a, b) => Date.parse(a.release_at!) - Date.parse(b.release_at!))[0] ?? null
  const secondColor = core ? colorThumbs(core)[1]?.color : null
  const shopAllImage = core ? (imagesFor(core, secondColor)[0] ?? null) : null

  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <Hero core={core} />
      <BrowseByStyle shapes={shapesFrom(categories, all)} shopAllImage={shopAllImage} />
      <DropBanner live={live} next={next} />
      <FindYourFit />
      <ShopByColor product={core} />
      <InStockToday product={core} />
      <CrushTest series={series[0] ?? null} />
      <AboutShelby />
      <Stories series={series[0] ?? null} />
    </>
  )
}
