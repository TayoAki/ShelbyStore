import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Faq } from "@/components/accordion"
import { ContinuityBanner } from "@/components/continuity-banner"
import { Exposure } from "@/components/exposure"
import { Digits } from "@/components/digits"
import { SwatchFace } from "@/components/swatch"
import { FoursomePicker, PairPicker } from "@/components/offer/pair-picker"
import { ScrollTo } from "@/components/scroll-to"
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
 * The offer: The Pair as a two-window sleeve above the fold, The Foursome as
 * the step-up sleeve printed in pine, then what's included, the live proof,
 * the FAQ, and the close. `/offer/the-foursome` is the same page.
 */
export default function OfferPage(props: PageProps<"/offer/[handle]">) {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 h-[70vh] max-w-[1440px] animate-pulse bg-wash" />}>
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
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-3 md:gap-6 md:px-6 md:pt-6">
        <Suspense fallback={<PairPicker pair={c.pair} colors={colors} single={single} stock={null} headline={headline} />}>
          <LivePair handle={handle} headline={headline} />
        </Suspense>
        {c.foursome && (
          <Suspense fallback={<FoursomePicker foursome={c.foursome} colors={colors} single={single} stock={null} />}>
            <LiveFoursome />
          </Suspense>
        )}
        <section aria-labelledby="included-title" className="panel">
          <span className="panel-inner" aria-hidden />
          <div className="relative flex flex-col gap-6 p-[var(--panel-pad)]">
            <h2 id="included-title" className="panel-title">
              What&apos;s in the sleeve
            </h2>
            <dl className="grid plate md:grid-cols-3">
              {[
                ["Included", "Two Rope Caps, one size each. Mid crown, washed cotton, braided rope, strap with a brass slide."],
                ["Why two", "A light one and a dark one. One for the bag, one for the car. You already know the fit."],
                ["Shipping", `The Pair is ${formatMoney(pairPrice)}, over the $85 line, so it ships free. 30-day returns.`],
              ].map(([t, b]) => (
                <div key={t} className="flex flex-col gap-2 bg-paper p-5">
                  <dt className="label">{t}</dt>
                  <dd className="text-[1.0625rem] leading-7">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
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
        <section aria-labelledby="offer-close" className="panel ink-dark" style={{ "--panel-bg": "#14213D", "--panel-ink": "#FFFFFF", "--panel-line": "#14213D" } as React.CSSProperties}>
          <span className="panel-inner" aria-hidden />
          <div className="relative flex flex-col items-start gap-5 p-[var(--panel-pad)] md:flex-row md:items-end md:justify-between">
            <h2 id="offer-close" className="model !text-[clamp(2.5rem,1.8rem+3vw,4.5rem)] max-w-[16ch]">
              {headline}
            </h2>
            <a href="#top" className="btn btn-on-ink btn-large shrink-0" style={{ "--btn-bg": "#FFFFFF", "--btn-fg": "#14213D" } as React.CSSProperties} data-track="offer_close_cta">
              Add the pair · {formatMoney(pairPrice)}
            </a>
          </div>
        </section>
      </div>
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
    <section aria-labelledby="proof-title" className="panel">
      <span className="panel-inner" aria-hidden />
      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-8 p-[var(--panel-pad)] md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 id="proof-title" className="panel-title">
            In stock today
          </h2>
          <ul className="flex flex-col border-2 border-ink">
            {rows.map((r) => (
              <li key={r.col} className="flex items-center justify-between gap-3 border-ink px-4 py-3 [&+&]:border-t-2">
                <span className="flex items-center gap-3 text-[1.0625rem]">
                  <SwatchFace name={r.col} size={20} /> {r.col}
                </span>
                <span className="text-[1.375rem] leading-none">
                  {typeof r.n === "number" ? r.n > 0 ? <Digits value={r.n} label={`${r.n} in stock`} /> : <span className="label">Restocking</span> : <span className="label">In stock</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[0.875rem] text-ink-2">Live counts from the warehouse.</p>
        </div>
        {stance && handle && (
          <div className="flex flex-col gap-4">
            <h2 className="panel-title">The Crown Test</h2>
            <p className="text-[1.25rem] leading-[1.5]">{stance}</p>
            <Link href={`/stories/${handle}`} className="link w-fit font-semibold" data-track="offer_story">
              See the test
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
