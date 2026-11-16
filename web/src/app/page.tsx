import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { ColorStrip, type StripItem } from "@/components/color-strip"
import { ContinuityBanner } from "@/components/continuity-banner"
import { lead } from "@/components/header"
import { HoleCard } from "@/components/hole-card"
import { KitCard } from "@/components/kit-card"
import { ProductCard } from "@/components/product-card"
import { Rail } from "@/components/rail"
import { TabsRail } from "@/components/tabs-rail"
import { ButtonLink } from "@/components/ui/button"
import { listSeries } from "@/lib/data/content"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { formatMoney } from "@/lib/format"
import { colorThumbs, price } from "@/lib/product"
import { CORE_COLORS, editionOf, nextHole, type Hole } from "@/lib/rope"
import type { VariantStock } from "@/lib/types"

const CARD_COLS = "[grid-auto-columns:164px] md:[grid-auto-columns:349px]"

/**
 * Home (SITE_SPEC v8 E.6.1), in Eastside's order: the mobile colour strip, the
 * full-bleed hero, the Rope Cap tabs rail, Shop by color, The Card rail, the
 * crown-story editorial split and the quiz splash.
 */
export default async function HomePage() {
  const [c, series] = await Promise.all([ropeCatalog(), listSeries()])
  const story = series[0] ?? null
  const live = c.holes.find((h) => h.status === "live" && !h.core) ?? null
  const strip: StripItem[] = [
    ...CORE_COLORS.map((col) => ({ label: col === "Clubhouse Navy" ? "Navy" : col, href: `/products/rope-cap?color=${encodeURIComponent(col)}`, image: lead(col), track: "shop_by_color" })),
    { label: "Holes", href: "/card", image: live?.image ?? lead("Pine"), track: "home_scorecard" },
    ...(c.pair ? [{ label: "Pair", href: "/offer/the-pair", image: lead("Pine"), track: "home_pair" }] : []),
  ]

  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <ColorStrip items={strip} />

      {/* Hero */}
      <section className="relative h-[650px] overflow-hidden bg-ink md:h-[75vh] md:min-h-[520px]">
        <Image src="/hats/rope-lifestyle-hero.jpg" alt="A golfer in a rope cap on the course" fill preload sizes="100vw" className="hidden object-cover [object-position:center_40%] md:block" />
        <Image src="/hats/rope-lifestyle-hero-mobile.jpg" alt="A golfer in a rope cap on the course" fill preload sizes="100vw" className="object-cover md:hidden" />
        <div className="backdrop-radial absolute right-4 bottom-4 w-[220px] text-right text-white md:right-[50px] md:bottom-[50px] md:w-[260px]">
          <h1 className="display-hero">The Rope Cap</h1>
          <p className="mt-2 text-[12.6px] md:text-[14.4px]">A mid crown that sits right the first time.</p>
          <ButtonLink href="/products/rope-cap" variant="outline-white" className="mt-6" track="hero_shop_core">
            Shop the Rope Cap
          </ButtonLink>
          {c.pair && (
            <p className="mt-3">
              <Link href="/offer/the-pair" data-track="hero_shop_pair" className="text-[12.6px] text-white underline underline-offset-2 hover:!text-on-ink-hover">
                The Pair is {formatMoney(price(c.pair).amount)}
              </Link>
            </p>
          )}
        </div>
      </section>

      <Suspense fallback={<RopeTabs c={c} stock={undefined} holes={c.holes} />}>
        <LiveRopeTabs c={c} />
      </Suspense>

      {/* Shop by color */}
      <section aria-labelledby="by-color" className="band-tile py-10">
        <h2 id="by-color" className="display-md px-3 md:px-[80px]">
          Shop by color
        </h2>
        <Rail label="Shop by color" className="mt-[25px]" itemClass="[grid-auto-columns:179px] md:[grid-auto-columns:389px]">
          {CORE_COLORS.map((col) => (
            <li key={col}>
              <Link href={`/products/rope-cap?color=${encodeURIComponent(col)}`} data-track="shop_by_color" className="group block">
                <span className="relative block aspect-[5/7] bg-tile">
                  <Image src={lead(col)} alt="" fill sizes="(min-width: 750px) 389px, 179px" className="tile-photo object-contain" />
                </span>
                <span className="flex min-h-[27px] items-center text-[12.6px] tracking-[0.025em] uppercase transition-colors group-hover:text-link-hover">{col}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/card" data-track="home_scorecard" className="group block">
              <span className="relative block aspect-[5/7] overflow-hidden bg-tile">
                <Image src="/hats/rope-brim.jpg" alt="" fill sizes="(min-width: 750px) 389px, 179px" className="object-cover" />
              </span>
              <span className="flex min-h-[27px] items-center text-[12.6px] tracking-[0.025em] uppercase transition-colors group-hover:text-link-hover">The Card</span>
            </Link>
          </li>
        </Rail>
      </section>

      <Suspense fallback={<CardRail c={c} stock={undefined} holes={c.holes} />}>
        <LiveCardRail c={c} />
      </Suspense>

      {/* Crown story, editorial split */}
      {story && (
        <section aria-labelledby="crown-story" className="grid md:grid-cols-2">
          <Link href={`/stories/${story.handle}`} data-track="home_story" aria-label={story.title} className="relative block aspect-square overflow-hidden md:order-2">
            <Image src="/hats/story-crush.jpg" alt="" fill sizes="(min-width: 750px) 50vw, 100vw" className="object-cover" />
          </Link>
          <div className="band-tile flex items-center justify-center p-6 md:order-1">
            <div className="flex w-full max-w-[342px] flex-col items-center text-center md:max-w-[640px]">
              <h2 id="crown-story" className="display-xl">
                Sits right the first time.
              </h2>
              <p className="body-editorial mt-3 max-w-[337px]">Most rope caps run tall in the crown. Ours stops at about 11–11.5 cm, so it sits on your head, not on top of it.</p>
              <ButtonLink href={`/stories/${story.handle}`} variant="black" size="small" className="mt-5" track="series_story">
                See the crown test
              </ButtonLink>
              <Link href="/reasons/rope-cap" data-track="home_reasons" className="link mt-3 text-[14.4px]">
                Six reasons
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Quiz splash */}
      <section aria-labelledby="quiz-splash" className="overlay-bottom relative h-[403px] overflow-hidden md:h-[635px]">
        <Image src="/hats/rope-clubhouse.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 z-[1] flex items-center justify-center px-4">
          <div className="backdrop-radial flex max-w-[418px] flex-col items-center text-center text-white">
            <h2 id="quiz-splash" className="display-splash">
              Find your color
            </h2>
            <p className="mt-3 text-[14.4px] leading-[19.73px]">Four quick questions. One color, or a Pair.</p>
            <ButtonLink href="/quiz" variant="white" size="small" className="mt-5" track="home_quiz">
              Take the Quiz
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}

async function LiveRopeTabs({ c }: { c: RopeCatalog }) {
  const { stock, holes } = await liveStock(c)
  return <RopeTabs c={c} stock={stock} holes={holes} />
}

/** E.6.1 §3: Core colors, Numbered holes and Kits. */
function RopeTabs({ c, stock, holes }: { c: RopeCatalog; stock: VariantStock | undefined; holes: Hole[] }) {
  const next = nextHole(holes)
  const tabs = []
  if (c.core)
    tabs.push({
      key: "core",
      label: "Core colors",
      panel: (
        <Rail label="Core colors" itemClass={CARD_COLS}>
          {CORE_COLORS.map((col, i) => (
            <li key={col}>
              <ProductCard product={c.core!} color={col} colors={[...CORE_COLORS]} stock={stock} linkTrack="core_product" preload={i === 0} />
            </li>
          ))}
        </Rail>
      ),
    })
  tabs.push({
    key: "holes",
    label: "Numbered holes",
    panel: (
      <Rail label="Numbered holes" itemClass={CARD_COLS}>
        {holes.map((h) => (
          <li key={h.hole}>
            <HoleCard hole={h} price={null} linkTrack={h.status === "live" && !h.core ? "hero_shop_drop" : "card_hole"} countdown={next?.hole === h.hole} />
          </li>
        ))}
      </Rail>
    ),
  })
  if (c.pair || c.foursome)
    tabs.push({
      key: "kits",
      label: "Kits",
      panel: (
        <Rail label="Kits" itemClass={CARD_COLS}>
          {c.pair && (
            <li>
              <KitCard product={c.pair} title="The Pair" href="/offer/the-pair" image={lead("Clubhouse Navy")} hover={lead("Pine")} track="home_pair" />
            </li>
          )}
          {c.foursome && (
            <li>
              <KitCard product={c.foursome} title="The Foursome" href="/offer/the-pair#foursome" image={lead("Fescue")} hover={lead("Tour White")} track="home_foursome" />
            </li>
          )}
        </Rail>
      ),
    })
  return <TabsRail id="rope" title="The Rope Cap" tabs={tabs} />
}

async function LiveCardRail({ c }: { c: RopeCatalog }) {
  const { stock, holes } = await liveStock(c)
  return <CardRail c={c} stock={stock} holes={holes} />
}

/** E.6.1 §5: the numbered editions that exist as products, then upcoming holes with their tee sheet. */
function CardRail({ c, stock, holes }: { c: RopeCatalog; stock: VariantStock | undefined; holes: Hole[] }) {
  const editionCards = c.editions
    .map((p) => ({ p, hole: holes.find((h) => h.hole === editionOf(p)?.hole) ?? null }))
    .sort((a, b) => (a.hole?.hole ?? 99) - (b.hole?.hole ?? 99))
  const upcoming = holes.filter((h) => !h.core && h.status === "upcoming" && !c.editions.some((e) => e.handle === h.productHandle))
  const fallback = !editionCards.length ? holes.filter((h) => !h.core) : upcoming
  return (
    <section aria-labelledby="the-card" className="pt-12 pb-12 md:pb-16">
      <div className="flex items-baseline justify-between gap-4 px-3 md:px-[52px]">
        <h2 id="the-card" className="display-md">
          The Card
        </h2>
        <Link href="/card" data-track="home_scorecard" className="link shrink-0 text-[14.4px]">
          See all six holes
        </Link>
      </div>
      <Rail label="The Card" className="mt-6" itemClass={CARD_COLS}>
        {editionCards.map(({ p, hole }) => {
          const col = colorThumbs(p)[0]?.color ?? p.title
          const isLive = hole?.status === "live"
          return (
            <li key={p.id}>
              <ProductCard product={p} color={col} stock={stock} badge={hole ? `HOLE ${hole.hole}` : null} linkTrack={isLive ? "hero_shop_drop" : "card_hole"} />
            </li>
          )
        })}
        {fallback.map((h) => (
          <li key={h.hole}>
            <HoleCard hole={h} price={null} />
          </li>
        ))}
      </Rail>
    </section>
  )
}
