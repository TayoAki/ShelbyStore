import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { ContinuityBanner } from "@/components/continuity-banner"
import { Exposure } from "@/components/exposure"
import { FitScales } from "@/components/fit-scale"
import { ClosingCta } from "@/components/lp/closing-cta"
import { Faq } from "@/components/lp/faq"
import { ProofList } from "@/components/lp/proof-list"
import { StockList } from "@/components/lp/stock-list"
import { PairPicker, type PairColor, type PairVariant } from "@/components/offer/pair-picker"
import { Track } from "@/components/track"
import { getProduct, getRegion } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { getStock } from "@/lib/data/stock"
import { getVariant } from "@/lib/experiments"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { colorThumbs, detailsOf, fitProfileOf, offerOf, oneSizeRange, price, variantOptions } from "@/lib/product"
import type { Product } from "@/lib/types"

/** The A/B test on this page's headline (Admin → Analytics → Experiments; SITE_SPEC §12.7). */
const HEADLINE_EXPERIMENT = "offer-headline"

async function load(handle: string) {
  const region = await getRegion()
  if (!region) return null
  const offer = await getProduct(handle, region.id)
  const meta = offer ? offerOf(offer) : null
  if (!offer || !meta?.singleHandle) return null
  const single = await getProduct(meta.singleHandle, region.id)
  return single ? { offer, single } : null
}

/** "Everyday Cap" from "The Everyday Cap". */
const shortName = (p: Product) => p.title.replace(/^The /, "")

export async function generateMetadata({ params }: PageProps<"/offer/[handle]">): Promise<Metadata> {
  const data = await load((await params).handle)
  if (!data) return { title: "Not found" }
  const p = price(data.offer)
  return {
    title: `Two ${shortName(data.single)}s for ${formatMoney(p.amount, p.currency)}`,
    description: `Pick any two colours of the ${shortName(data.single)}. ${data.offer.description ?? ""}`.trim(),
  }
}

/**
 * Offer landing page (SITE_SPEC §12.1; the essay's "present one focused
 * deal"): one bundle, its true price anchor, the terms and reassurance at the
 * button, then what's included, why two, proof, questions and one closing
 * action. Warm traffic: retargeting, email, the PDP and bag links.
 */
export default function OfferPage(props: PageProps<"/offer/[handle]">) {
  return (
    <Suspense fallback={<div className="h-[80vh] animate-pulse bg-surface" />}>
      <OfferContent params={props.params} />
    </Suspense>
  )
}

async function OfferContent({ params }: { params: PageProps<"/offer/[handle]">["params"] }) {
  const { handle } = await params
  const data = await load(handle)
  if (!data) notFound()
  const { offer, single } = data
  const [series, variant] = await Promise.all([listSeries(), getVariant(HEADLINE_EXPERIMENT)])

  const p = price(offer)
  const singlePrice = price(single).amount
  // The anchor is computed from today's single price, so it is true whenever it renders.
  const compareAt = singlePrice !== null ? singlePrice * 2 : null
  const saving = compareAt !== null && p.amount !== null ? compareAt - p.amount : null
  const showSaving = saving !== null && saving > 0
  const name = shortName(single)
  const money = (n: number | null) => formatMoney(n, p.currency)

  // Pickers use the single cap's colour photos; each pair is a kit variant.
  const colors: PairColor[] = colorThumbs(single)
  const variants: PairVariant[] = (offer.variants ?? []).map((v) => {
    const o = variantOptions(v)
    return { id: v.id, first: o["First cap"], second: o["Second cap"] }
  })

  const savingFirst = variant === "saving" && showSaving
  const headline = savingFirst ? `Save ${money(saving)} on two ${name}s.` : `Two ${name}s. ${money(p.amount)}.`
  const subhead = savingFirst
    ? `Two ${name}s for ${money(p.amount)}. Pick any two colours.`
    : showSaving
      ? `Pick any two colours. You save ${money(saving)} against buying two singles at ${money(singlePrice)}.`
      : "Pick any two colours."

  const story = series.find((s) => s.stance) ?? null
  const fit = fitProfileOf(single)
  const details = detailsOf(single)
  const range = oneSizeRange(single, POLICY.oneSize)

  const header = (
    <div className="flex flex-col gap-3">
      <p className="text-eyebrow text-ink-muted">The Two-Pack · Core</p>
      <h1 className="font-display text-[40px] leading-[0.92] lg:text-[60px]">{headline}</h1>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[22px]">{money(p.amount)}</span>
        {showSaving && (
          <>
            <s className="font-mono text-[15px] text-ink-muted" aria-label={`Two singles cost ${money(compareAt)}`}>
              {money(compareAt)}
            </s>
            <span className="text-[14px] text-accent-ink">
              Save {money(saving)} against two singles at {money(singlePrice)}
            </span>
          </>
        )}
      </p>
      <p className="text-[16px] leading-relaxed text-ink-muted">{subhead}</p>
    </div>
  )

  const pickerProps = { productId: offer.id, colors, variants, price: p.amount, currency: p.currency }

  return (
    <>
      <Exposure experiment={HEADLINE_EXPERIMENT} variant={variant} />
      <Track event="offer_viewed" props={{ offer: offer.handle }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>

      {/* 1. The offer, above the fold */}
      <section id="offer" className="scroll-mt-28 py-6 lg:py-12">
        <Container>
          <Suspense fallback={<PairPicker {...pickerProps} stock={null}>{header}</PairPicker>}>
            <LivePicker {...pickerProps}>{header}</LivePicker>
          </Suspense>
        </Container>
      </section>

      {/* 2. What's included + 3. why two */}
      <section className="bg-surface py-12 lg:py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-section">What&apos;s in the pack</h2>
            <ul className="flex flex-col border-t border-line text-[15px]">
              <li className="border-b border-line py-3">
                Two {name}s, in the two colours you pick (the same colour twice is fine).
              </li>
              <li className="border-b border-line py-3">One size each: the strap {range.replace(/^fits/, "fits heads")}.</li>
              {details.map(([k, v]) => (
                <li key={k} className="grid grid-cols-[96px_1fr] gap-4 border-b border-line py-3">
                  <span className="text-ink-muted">{k}</span>
                  <span>{v}</span>
                </li>
              ))}
              <li className="border-b border-line py-3">
                One order, one shipping charge ({POLICY.shipping.toLowerCase()}).
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-section">Why two</h2>
            <ul className="grid gap-3">
              {[
                ["A dark one and a light one", "Washed black or navy for most days, bone or olive when the outfit is lighter."],
                ["One that lives in the car or your bag", "So there's a cap where you are, not the one you left at home."],
                ["You already know the fit", `Same low crown, same strap. If one fits, the second will too.`],
              ].map(([t, b]) => (
                <li key={t} className="flex flex-col gap-1 bg-paper p-5">
                  <span className="text-[16px] font-medium">{t}</span>
                  <span className="text-[14px] leading-relaxed text-ink-muted">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* 4. Proof */}
      <section className="py-12 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            <p className="text-eyebrow text-ink-muted">The proof</p>
            <h2 className="font-display text-section">What we can show you</h2>
            <ProofList
              items={[
                story?.stance && {
                  label: story.title,
                  body: `“${story.stance}”`,
                  href: `/stories/${story.handle}`,
                  linkText: "See the test",
                  track: "offer_story",
                },
                { label: "Fit", body: `One size. The strap ${range.replace(/^fits/, "fits heads")}.`, href: `/fit-guide#${single.handle}`, linkText: "Read the fit guide", track: "offer_fit_guide" },
                { label: "Returns", body: `${POLICY.returns} on the pair. ${POLICY.dispatch}.`, href: "/help/shipping-returns", linkText: "Shipping & returns", track: "offer_policy" },
              ]}
            />
            {fit && <FitScales profile={fit} />}
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-[18px] font-medium">Every colour, live from the warehouse</h3>
            <StockList product={single} track="offer_stock" />
            <p className="text-[12px] text-ink-muted">A pair is available while both of its colours are in stock.</p>
          </div>
        </Container>
      </section>

      {/* 5. Questions */}
      <section className="bg-surface py-12 lg:py-20">
        <Container className="max-w-3xl">
          <Faq
            items={[
              {
                q: "Will it fit?",
                a: (
                  <>
                    One size: the strap {range.replace(/^fits/, "fits heads")}, which covers most adults. Not sure?{" "}
                    <Link href="/quiz" className="underline underline-offset-4" data-track="offer_quiz">
                      Take the 30-second fit quiz
                    </Link>
                    .
                  </>
                ),
              },
              { q: "Can I pick the same colour twice?", a: "Yes. Pick it for both caps." },
              {
                q: "What if I don't like them?",
                a: `${POLICY.returns}. The pair is one item at checkout, so it's returned as a pair.`,
              },
              { q: "How fast does it ship?", a: `${POLICY.dispatch}. ${POLICY.shipping}.` },
              {
                q: "Is this a sale?",
                a: showSaving
                  ? `No. Two cost ${money(p.amount)}; a single stays ${money(singlePrice)}. There's no deadline.`
                  : "No. There's no deadline.",
              },
            ]}
          />
        </Container>
      </section>

      {/* 6. Closing action */}
      <ClosingCta
        title="Pick your two."
        body={showSaving ? `${money(p.amount)} for two ${name}s, ${money(saving)} less than two singles.` : undefined}
        cta={{ href: "#offer", label: "Choose colours", track: "offer_close_cta" }}
        secondary={{ href: `/products/${single.handle}`, label: `Just one? ${money(singlePrice)}`, track: "offer_single" }}
      />
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  )
}

async function LivePicker(props: Omit<Parameters<typeof PairPicker>[0], "stock">) {
  const stock = await getStock([props.productId])
  return <PairPicker {...props} stock={stock} />
}
