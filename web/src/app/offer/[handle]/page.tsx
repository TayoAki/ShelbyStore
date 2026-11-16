import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Faq } from "@/components/accordion"
import { ContinuityBanner } from "@/components/continuity-banner"
import { Exposure } from "@/components/exposure"
import { Reveal } from "@/components/motion/reveal"
import { FoursomePicker, PairPicker } from "@/components/offer/pair-picker"
import { ScrollTo } from "@/components/scroll-to"
import { SeriesPill } from "@/components/series-pill"
import { Track } from "@/components/track"
import { listSeries } from "@/lib/data/content"
import { liveStock, ropeCatalog } from "@/lib/data/rope"
import { getStock } from "@/lib/data/stock"
import { getVariant } from "@/lib/experiments"
import { formatMoney } from "@/lib/format"
import { price } from "@/lib/product"
import { CORE_COLORS } from "@/lib/rope"

/** The A/B test on this page's headline (Admin → Analytics → Experiments; SITE_SPEC G.6.5). */
const HEADLINE_EXPERIMENT = "offer-headline"

export const metadata: Metadata = {
  title: "The Pair: two rope caps",
  description: "Two Rope Caps in any two colors, $44 each. $88 clears the free-shipping line. Or four for $152.",
}

/**
 * The offer landing page (SITE_SPEC G.6.5): The Pair above the fold, then the
 * Foursome step-up (the page's golf-green band), what's included, why two,
 * proof, FAQ and the closing pill. `/offer/the-foursome` is the same page.
 */
export default function OfferPage(props: PageProps<"/offer/[handle]">) {
  return (
    <Suspense fallback={<div className="m-2.5 h-[70vh] animate-pulse rounded-2xl bg-white" />}>
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

  return (
    <>
      <Exposure experiment={HEADLINE_EXPERIMENT} variant={variant} />
      <Track event="offer_viewed" props={{ offer: handle }} />
      {handle === "the-foursome" && <ScrollTo id="foursome" />}
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <Suspense fallback={<PairPicker pair={c.pair} colors={colors} single={single} stock={null} headline={headline} />}>
        <LivePair handle={handle} headline={headline} />
      </Suspense>
      {c.foursome && (
        <Suspense fallback={<FoursomePicker foursome={c.foursome} colors={colors} single={single} stock={null} />}>
          <LiveFoursome />
        </Suspense>
      )}
      <Reveal aria-label="What's included" className="grid grid-cols-1 gap-2.5 p-2.5 md:grid-cols-3">
        {[
          ["WHAT'S INCLUDED", "Two Rope Caps, one size each. Mid crown, washed cotton, braided rope, strap with a brass slide."],
          ["WHY TWO", "A light one and a dark one. One for the bag, one for the car. You already know the fit."],
          ["FREE SHIPPING", `The Pair is ${formatMoney(pairPrice)}, over the $85 line, so it ships free. 30-day returns.`],
        ].map(([t, b], i) => (
          <div key={t} data-reveal-child="" style={{ ["--i" as string]: i, ["--stagger" as string]: ".05s" }} className="flex flex-col gap-5 rounded-2xl bg-white px-5 pt-10 pb-8 md:p-8">
            <p className="eyebrow">{t}</p>
            <p className="text-sm leading-[21px]">{b}</p>
          </div>
        ))}
      </Reveal>
      <Suspense fallback={null}>
        <Proof stance={stance} handle={series[0]?.handle ?? null} />
      </Suspense>
      <Faq
        items={[
          { q: "Will it fit?", a: "One size. The strap fits 21.5–23.75 in (55–60 cm), and the crown sits mid. The fit guide shows how to measure." },
          { q: "Can I pick the same color twice?", a: "Yes. Pick it for both caps." },
          { q: "Returns", a: "30 days, on the pair." },
          { q: "Shipping", a: "The Pair ships free (orders of $85 or more). Ships in 1–2 business days." },
          { q: "Is this a sale?", a: `No. Singles stay ${formatMoney(single)}; two are ${formatMoney(pairPrice)} and four are ${formatMoney(c.foursome ? price(c.foursome).amount : null)}, every day.` },
        ]}
      />
      {stance && <SeriesPill title={series[0].title} stance={stance} href="#top" episodes={series[0].episodes.map((e) => e.title)} cta={`ADD THE PAIR – ${formatMoney(pairPrice)}`} track="offer_close_cta" />}
    </>
  )
}

async function LivePair({ handle, headline }: { handle: string; headline: string }) {
  const c = await ropeCatalog()
  const stock = await getStock([c.pair!.id])
  return (
    <div id="top" data-offer={handle}>
      <PairPicker pair={c.pair!} colors={[...CORE_COLORS]} single={price(c.core!).amount} stock={stock} headline={headline} />
    </div>
  )
}

async function LiveFoursome() {
  const c = await ropeCatalog()
  const stock = await getStock([c.foursome!.id])
  return <FoursomePicker foursome={c.foursome!} colors={[...CORE_COLORS]} single={price(c.core!).amount} stock={stock} />
}

async function Proof({ stance, handle }: { stance: string | null; handle: string | null }) {
  const c = await ropeCatalog()
  const { stock } = await liveStock(c)
  const rows = CORE_COLORS.map((col) => {
    const v = c.core?.variants?.find((x) => x.options?.some((o) => o.value === col))
    return { col, n: v ? stock[v.id] : undefined }
  })
  return (
    <Reveal aria-label="Proof" className="mx-2.5 my-10 grid gap-2.5 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-6 md:p-8">
        <p className="eyebrow">IN STOCK TODAY</p>
        <ul className="mt-4 flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.col} className="flex justify-between text-sm leading-5">
              <span>{r.col}</span>
              <span className={typeof r.n === "number" && r.n > 0 ? "text-green" : "text-light-charcoal"}>{typeof r.n === "number" ? (r.n > 0 ? `● ${r.n} in stock` : "● Restocking") : "● In stock"}</span>
            </li>
          ))}
        </ul>
      </div>
      {stance && handle && (
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 md:p-8">
          <p className="eyebrow">THE CROWN TEST</p>
          <p className="font-serif text-xl leading-7 italic">{stance}</p>
          <Link href={`/stories/${handle}`} className="link w-fit text-sm" data-track="offer_story">
            See the test
          </Link>
        </div>
      )}
    </Reveal>
  )
}
