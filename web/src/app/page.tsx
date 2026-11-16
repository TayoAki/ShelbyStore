import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { CredibilityStrip } from "@/components/credibility-strip"
import { AboutPill } from "@/components/home/about-pill"
import { BundlesTiles } from "@/components/home/bundles-tiles"
import { Hero } from "@/components/home/hero"
import { InStockToday } from "@/components/home/in-stock-today"
import { NextHole } from "@/components/home/next-hole"
import { PickAColor } from "@/components/home/pick-a-color"
import { SeriesCarousel } from "@/components/home/series-carousel"
import { Stories } from "@/components/home/stories"
import { TheBuild } from "@/components/home/the-build"
import { listSeries } from "@/lib/data/content"
import { ropeCatalog } from "@/lib/data/rope"
import { formatMoney } from "@/lib/format"
import { imagesFor, price } from "@/lib/product"
import { CORE_COLORS, nextHole } from "@/lib/rope"

const BG = ["#B9B78D", "#EEF5E8", "#B9B78D", "#EEF5E8"]
const lead = (c: string) => `/hats/rope-cap-${c.toLowerCase().replace(/\s+/g, "-")}-1.jpg`

/**
 * Home (SITE_SPEC G.6.2): hero, Pick a color, the next hole (the page's
 * golf-green band), the build, one/two/four, in stock today, the Crown Test,
 * About Shelby, the credibility strip (hidden while empty) and stories.
 */
export default async function HomePage() {
  const [c, series] = await Promise.all([ropeCatalog(), listSeries()])
  const { core, pair, foursome, holes } = c
  const live = holes.find((h) => h.status === "live" && !h.core) ?? null
  const featured = live ?? nextHole(holes)
  const details = ((core?.metadata as { details?: Record<string, string> } | null)?.details ?? {}) as Record<string, string>
  const story = series[0] ?? null
  const per = (p: typeof pair, caps: number) => (p ? price(p).amount : null) !== null ? formatMoney(price(p!).amount! / caps) : null

  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <Hero core={core} next={nextHole(holes)} pair={pair} />
      {core && (
        <PickAColor
          tiles={CORE_COLORS.map((color, i) => ({
            color,
            image: imagesFor(core, color)[0] ?? lead(color),
            hover: imagesFor(core, color)[2] ?? null,
            bg: BG[i],
          }))}
        />
      )}
      {featured && (
        <NextHole
          hole={featured}
          // Upcoming editions are unpublished until their release, so their price shows once live.
          price={(() => {
            const ed = c.editions.find((e) => e.handle === featured.productHandle)
            return ed ? formatMoney(price(ed).amount) : null
          })()}
        />
      )}
      <TheBuild
        callouts={[
          { title: "CROWN", body: details.Crown },
          { title: "ROPE", body: details.Rope },
          { title: "BRIM", body: details.Brim },
          { title: "CLOSURE", body: details.Closure },
        ].filter((x) => x.body)}
      />
      <BundlesTiles
        tiles={[
          ...(core ? [{ key: "one", title: "The Rope Cap", line: formatMoney(price(core).amount), cta: "SHOP ONE", href: "/products/rope-cap", track: "core_product", images: [lead("Tour White")], bg: "#B9B78D" }] : []),
          ...(pair ? [{ key: "pair", title: "The Pair", line: `${formatMoney(price(pair).amount)} · ${per(pair, 2)} A CAP`, cta: "SHOP THE PAIR", href: "/offer/the-pair", track: "home_pair", images: [lead("Clubhouse Navy"), lead("Pine")], bg: "#EEF5E8" }] : []),
          ...(foursome ? [{ key: "four", title: "The Foursome", line: `${formatMoney(price(foursome).amount)} · ${per(foursome, 4)} A CAP`, cta: "SHOP THE FOURSOME", href: "/offer/the-pair#foursome", track: "home_foursome", images: CORE_COLORS.map(lead), bg: "#B9B78D" }] : []),
        ]}
      />
      <InStockToday product={core} />
      {story && <SeriesCarousel series={story} />}
      <AboutPill />
      <CredibilityStrip />
      <Stories story={story ? { title: story.title, handle: story.handle, excerpt: story.stance } : null} />
    </>
  )
}
