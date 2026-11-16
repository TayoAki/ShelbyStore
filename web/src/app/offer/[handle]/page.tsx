import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Faq } from "@/components/accordion"
import { ContinuityBanner } from "@/components/continuity-banner"
import { Exposure } from "@/components/exposure"
import { FoursomePicker, PairPicker } from "@/components/offer/pair-picker"
import { ScrollTo } from "@/components/scroll-to"
import { Track } from "@/components/track"
import { listSeries } from "@/lib/data/content"
import { ropeCatalog } from "@/lib/data/rope"
import { getStock } from "@/lib/data/stock"
import { getVariant } from "@/lib/experiments"
import { formatMoney } from "@/lib/format"
import { price } from "@/lib/product"
import { POLICY } from "@/lib/policy"
import { CORE_COLORS } from "@/lib/rope"

/** The A/B test on this page's headline (Admin → Analytics → Experiments; SITE_SPEC G.6.5). */
const HEADLINE_EXPERIMENT = "offer-headline"

export const metadata: Metadata = {
  title: "The Pair: two rope caps",
  description: "Two Rope Caps in any two colors, $44 each. $88 clears the free-shipping line. Or four for $152.",
}

/**
 * The offer (SITE_SPEC v8 E.6.10): The Pair in the PDP layout, the story
 * link, The Foursome in a #F6F6F6 band, the FAQ and the closing splash.
 * `/offer/the-foursome` is the same page, scrolled to the Foursome.
 */
export default function OfferPage(props: PageProps<"/offer/[handle]">) {
  return (
    <Suspense fallback={<div className="wrap h-[70vh] pt-6" aria-busy />}>
      <OfferContent params={props.params} />
    </Suspense>
  )
}

async function OfferContent({ params }: { params: PageProps<"/offer/[handle]">["params"] }) {
  const { handle } = await params
  if (handle !== "the-pair" && handle !== "the-foursome") notFound()
  const [c, series, variant] = await Promise.all([ropeCatalog(), listSeries(), getVariant(HEADLINE_EXPERIMENT)])
  if (!c.pair || !c.core) notFound()
  const single = price(c.core).amount
  const pairPrice = price(c.pair).amount
  const saving = single !== null && pairPrice !== null ? single * 2 - pairPrice : null
  const headline = variant === "saving" && saving ? `Save ${formatMoney(saving)} on two rope caps.` : `Two rope caps. ${formatMoney(pairPrice)}.`
  const stance = series[0]?.stance ?? null
  const colors = [...CORE_COLORS] as string[]

  const crumbs = (
    <nav aria-label="Breadcrumb" className="crumbs-pdp">
      <Link href="/">Home</Link>
      <span className="dot" aria-hidden />
      <Link href="/products/rope-cap">The Rope Cap</Link>
      <span className="dot" aria-hidden />
      <span aria-current="page">The Pair</span>
    </nav>
  )

  return (
    <>
      <Exposure experiment={HEADLINE_EXPERIMENT} variant={variant} />
      <Track event="offer_viewed" props={{ offer: handle }} />
      {handle === "the-foursome" && <ScrollTo id="foursome" />}
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <div id="top" data-offer={handle} className="scroll-mt-24">
        <Suspense fallback={<PairPicker pair={c.pair} colors={colors} single={single} stock={null} headline={headline} crumbs={crumbs} />}>
          <LivePair headline={headline} crumbs={crumbs} />
        </Suspense>
      </div>
      {stance && series[0] && (
        <p className="wrap pt-8 pb-10 text-[14.4px] lg:pl-[calc(var(--gutter-page)+670px+50px+35px)]">
          {stance}{" "}
          <Link href={`/stories/${series[0].handle}`} className="link" data-track="offer_story">
            Why one cap
          </Link>
        </p>
      )}
      {c.foursome && (
        <Suspense fallback={<FoursomePicker foursome={c.foursome} colors={colors} single={single} stock={null} />}>
          <LiveFoursome />
        </Suspense>
      )}
      <Faq
        items={[
          { q: "Will it fit?", a: `One size. The strap fits ${POLICY.oneSize.replace(/^fits /, "")}, and the crown sits mid. The fit guide shows how to measure.` },
          { q: "Can I pick the same color twice?", a: "Yes. Pick it for both caps." },
          { q: "Returns", a: `${POLICY.returns}, on the pair.` },
          { q: "Shipping", a: `The Pair ships free (orders of $${POLICY.freeShippingThreshold} or more). ${POLICY.dispatch}.` },
          { q: "Is this a sale?", a: `No. Singles stay ${formatMoney(single)}; two are ${formatMoney(pairPrice)} and four are ${formatMoney(c.foursome ? price(c.foursome).amount : null)}, every day.` },
        ]}
      />
      <section aria-labelledby="offer-close" className="overlay-bottom relative h-[403px] overflow-hidden md:h-[635px]">
        <Image src="/hats/rope-clubhouse.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 z-[1] flex items-center justify-center px-4">
          <div className="backdrop-radial flex max-w-[418px] flex-col items-center text-center text-white">
            <h2 id="offer-close" className="display-splash">
              Two caps. {formatMoney(pairPrice)}.
            </h2>
            <p className="mt-3 text-[14.4px] leading-[19.73px]">Any two colors. Free shipping.</p>
            <a href="#top" className="btn btn-white btn-sm mt-5" data-track="offer_close_cta">
              Pick Your Two
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

async function LivePair({ headline, crumbs }: { headline: string; crumbs: React.ReactNode }) {
  const c = await ropeCatalog()
  const stock = await getStock([c.pair!.id])
  return <PairPicker pair={c.pair!} colors={[...CORE_COLORS]} single={price(c.core!).amount} stock={stock} headline={headline} crumbs={crumbs} />
}

async function LiveFoursome() {
  const c = await ropeCatalog()
  const stock = await getStock([c.foursome!.id])
  return <FoursomePicker foursome={c.foursome!} colors={[...CORE_COLORS]} single={price(c.core!).amount} stock={stock} />
}
