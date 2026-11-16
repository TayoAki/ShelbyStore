import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { BackPanelClose } from "@/components/box/close"
import { HolesPlate, Sleeves } from "@/components/box/back-panel"
import { SidePanel } from "@/components/box/side-panel"
import { ContinuityBanner } from "@/components/continuity-banner"
import { BuyCard } from "@/components/pdp/buy-card"
import { SelectionProvider } from "@/components/pdp/selection"
import { listSeries } from "@/lib/data/content"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { formatMoney } from "@/lib/format"
import { fitProfileOf, imagesFor, price } from "@/lib/product"
import { CORE_COLORS, crownCm, nextHole, ropeName } from "@/lib/rope"
import type { Product } from "@/lib/types"

/**
 * Home: the box printed flat. The front panel (window, model name, spec line,
 * ink stripes, price and Add to bag) and the side panel (the crown at true
 * scale, the spec) open side by side on desktop; the back panel carries the six
 * holes and the Pair and Foursome sleeves; the bottom flap closes the page.
 */
export default async function HomePage() {
  const [c, series] = await Promise.all([ropeCatalog(), listSeries()])
  const { core, pair, foursome, holes } = c
  const story = series[0] ?? null

  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-3 md:gap-6 md:px-6 md:pt-6">
        {core && (
          <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Suspense fallback={<HomeFront c={c} core={core} stock={null} />}>
              <LiveHomeFront c={c} core={core} />
            </Suspense>
            <SidePanel product={core} />
          </div>
        )}

        <HolesPlate holes={holes} next={nextHole(holes)} />
        <Sleeves pair={pair} foursome={foursome} />

        {story && (
          <section aria-labelledby="story-title" className="panel overflow-hidden">
            <span className="panel-inner" aria-hidden />
            <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center">
              <Link href={`/stories/${story.handle}`} data-track="home_story" className="window block aspect-[4/5] md:aspect-[4/3]" aria-label={story.title}>
                <Image src="/hats/story-crush.jpg" alt="A cap folded into a back pocket" fill sizes="(min-width: 768px) 40vw, 92vw" className="object-cover" />
                <span className="window-shade" aria-hidden />
              </Link>
              <div className="flex flex-col gap-4">
                <h2 id="story-title" className="panel-title">
                  {story.title}
                </h2>
                <p className="max-w-[56ch] text-[1.125rem] leading-[1.6]">{story.stance}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/stories/${story.handle}`} className="btn btn-outline-black" data-track="series_story">
                    See the full test
                  </Link>
                  <Link href="/reasons/rope-cap" className="btn btn-outline-black" data-track="home_reasons">
                    Six reasons
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <BackPanelClose />
      </div>
    </>
  )
}

async function LiveHomeFront({ c, core }: { c: RopeCatalog; core: Product }) {
  const { stock } = await liveStock(c)
  return <HomeFront c={c} core={core} stock={stock} />
}

function HomeFront({ c, core, stock }: { c: RopeCatalog; core: Product; stock: Awaited<ReturnType<typeof liveStock>>["stock"] | null }) {
  const colors = [...CORE_COLORS]
  const fit = fitProfileOf(core)
  return (
    <SelectionProvider initialColor={colors[0]} syncUrl={false}>
      <BuyCard
        product={core}
        stock={stock}
        colors={colors}
        linked={{ group: "LIMITED", swatches: [] }}
        ropeByColor={Object.fromEntries(colors.map((x) => [x, ropeName(core, x)]))}
        edition={null}
        releaseId={c.releases.find((r) => r.phase === "live" && r.products.some((p) => p.id === core.id))?.id ?? null}
        crown={fit ? { value: fit.crown, note: crownCm(core) ? `about ${crownCm(core)} cm` : null, structure: fit.structure } : null}
        bundles={null}
        imagesByColor={Object.fromEntries(colors.map((x) => [x, imagesFor(core, x)]))}
        fallbackImages={imagesFor(core)}
        modelNumber={1}
        source="home"
        details={{ href: `/products/${core.handle}`, titleTrack: "core_product", linkTrack: "shop_by_color" }}
        pairLink={c.pair ? { href: "/offer/the-pair", label: `The Pair is ${formatMoney(price(c.pair).amount)}`, track: "hero_shop_pair" } : undefined}
      />
    </SelectionProvider>
  )
}
