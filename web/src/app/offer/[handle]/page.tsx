import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { Exposure } from "@/components/exposure"
import { FitScales } from "@/components/fit-scale"
import { ClosingCta } from "@/components/lp/closing-cta"
import { Faq } from "@/components/lp/faq"
import { ProofList } from "@/components/lp/proof-list"
import { StickyCta } from "@/components/lp/sticky-cta"
import { StockRow } from "@/components/home/in-stock-today"
import { RETURNS_PERK, SHIPPING_PERK } from "@/components/perks"
import { PairPicker, type PairColor, type PairVariant } from "@/components/offer/pair-picker"
import { Leaf, Package, Ruler, Truck } from "@phosphor-icons/react/dist/ssr"
import { Track } from "@/components/track"
import { getProduct, getRegion } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { getStock } from "@/lib/data/stock"
import { getVariant } from "@/lib/experiments"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { colorThumbs, detailsOf, fitProfileOf, imagesFor, offerOf, oneSizeRange, price, variantOptions } from "@/lib/product"
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
    <Suspense fallback={<div className="h-[80vh] animate-pulse bg-tile" />}>
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

  const colors: PairColor[] = colorThumbs(single).map((c) => ({ color: c.color, images: imagesFor(single, c.color) }))
  const variants: PairVariant[] = (offer.variants ?? []).map((v) => {
    const o = variantOptions(v)
    return { id: v.id, first: o["First cap"], second: o["Second cap"] }
  })

  const savingFirst = variant === "saving" && showSaving
  const headline = savingFirst ? `Save ${money(saving)} on two ${name}s.` : `Two ${name}s. ${money(p.amount)}.`
  const story = series.find((s) => s.stance) ?? null
  const fit = fitProfileOf(single)
  const details = Object.fromEntries(detailsOf(single))
  const range = oneSizeRange(single, POLICY.oneSize)
  const rangeLine = range.charAt(0).toUpperCase() + range.slice(1)

  const pickerProps = {
    productId: offer.id,
    colors,
    variants,
    price: p.amount,
    compareAt,
    saving,
    currency: p.currency,
    headline,
    typeLine: "The Two-Pack · Core",
    description: `${offer.description ?? ""} Pick any two colors.${singlePrice !== null ? ` Singles stay ${money(singlePrice)}.` : ""}`.trim(),
    oneSizeLine: rangeLine,
    perks: [SHIPPING_PERK, { ...RETURNS_PERK, title: "30-Day Returns On The Pair" }, { icon: "ruler" as const, title: "One Size, Adjustable", detail: `${rangeLine}.` }],
  }

  const included: { icon: typeof Package; label: string; value: string }[] = [
    { icon: Package, label: "Two Caps", value: `Two ${name}s in the colors you pick. The same color twice is fine.` },
    { icon: Ruler, label: "One Size Each", value: rangeLine + "." },
    { icon: Leaf, label: "The Specs", value: [details.Fabric, details.Crown].filter(Boolean).join(". ") || "Same as the single." },
    { icon: Truck, label: "One Shipping Charge", value: `${POLICY.shipping}.` },
  ]

  return (
    <>
      <Exposure experiment={HEADLINE_EXPERIMENT} variant={variant} />
      <Track event="offer_viewed" props={{ offer: offer.handle }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>

      <section id="offer" className="container-shop scroll-mt-[130px] pb-[28.432px] lg:pb-[50.512px] lg:pt-[21px]">
        <Suspense fallback={<PairPicker {...pickerProps} stock={null} />}>
          <LivePicker {...pickerProps} />
        </Suspense>
      </section>

      <section className="bg-band py-[28.432px] lg:py-[50.512px]">
        <div className="container-shop">
          <h2 className="mb-[22.08px] type-section">What&apos;s Included</h2>
          <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {included.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex flex-col gap-2">
                <Icon size={32} weight="light" aria-hidden />
                <span className="font-heading text-[12px] uppercase tracking-[1.3px]">{label}</span>
                <span className="font-body text-[13px] leading-[19.5px]">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-band pb-[28.432px] lg:pb-[50.512px]">
        <div className="container-shop">
          <h2 className="mb-[22.08px] type-section">Why Two</h2>
          <ul className="grid gap-6 lg:grid-cols-3">
            {[
              ["A Dark One And A Light One", "Washed black or navy for most days, bone or olive when the outfit is lighter."],
              ["One For The Car Or Bag", "So there's a cap where you are, not the one you left at home."],
              ["You Already Know The Fit", "Same low crown, same strap. If one fits, the second will too."],
            ].map(([t, b]) => (
              <li key={t} className="bg-white p-6">
                <span className="block font-heading text-[16px] uppercase">{t}</span>
                <span className="mt-2 block font-body text-[14px] leading-[21px]">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-band pb-[28.432px] lg:pb-[50.512px]">
        <div className="container-shop">
          <h2 className="mb-[22.08px] type-section">Proof</h2>
          <div className="bg-white px-4 py-8">
            <StockRow product={single} track="offer_stock" />
            <p className="mt-6 text-center font-body text-[12px] text-muted">A pair is available while both of its colors are in stock.</p>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {story?.stance && (
              <figure className="bg-white p-6">
                <blockquote className="border-l-4 border-black pl-5 font-heading text-[22px] leading-[28.6px]">“{story.stance}”</blockquote>
                <figcaption className="mt-4">
                  <Link href={`/stories/${story.handle}`} className="btn btn--micro" data-track="offer_story">
                    <span>See {story.title}</span>
                  </Link>
                </figcaption>
              </figure>
            )}
            {fit && (
              <div className="bg-white p-6">
                <FitScales profile={fit} />
              </div>
            )}
          </div>
          <div className="mt-6">
            <ProofList
              items={[
                { label: "Fit", body: `One size. The strap ${range.replace(/^fits/, "fits heads")}.`, href: `/fit-guide#${single.handle}`, linkText: "Read the fit guide", track: "offer_fit_guide" },
                { label: "Returns", body: `${POLICY.returns} on the pair. ${POLICY.dispatch}.`, href: "/help/shipping-returns", linkText: "Shipping & returns", track: "offer_policy" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="py-[28.432px] lg:py-[50.512px]">
        <div className="container-shop max-w-[820px]">
          <Faq
            items={[
              {
                q: "Will it fit?",
                a: (
                  <>
                    One size: the strap {range.replace(/^fits/, "fits heads")}, which covers most adults. Not sure?{" "}
                    <Link href="/quiz" className="underline" data-track="offer_quiz">
                      Take the 30-second fit quiz
                    </Link>
                    .
                  </>
                ),
              },
              { q: "Can I pick the same color twice?", a: "Yes. Pick it for both caps." },
              { q: "Returns", a: `${POLICY.returns}. The pair is one item at checkout, so it's returned as a pair.` },
              { q: "Shipping", a: `${POLICY.dispatch}. ${POLICY.shipping}.` },
              {
                q: "Is this a sale?",
                a: showSaving ? `No. Two cost ${money(p.amount)}; singles stay ${money(singlePrice)}. There's no deadline.` : "No. There's no deadline.",
              },
            ]}
          />
        </div>
      </section>

      <ClosingCta
        title="Pick Your Two"
        body={showSaving ? `${money(p.amount)} for two ${name}s, ${money(saving)} less than two singles.` : undefined}
        cta={{ href: "#offer", label: "Pick your two", track: "offer_close_cta" }}
        secondary={{ href: `/products/${single.handle}`, label: `Just one? ${money(singlePrice)}`, track: "offer_single" }}
      />
      <StickyCta
        label={`Add the pair - ${money(p.amount)}`}
        price={money(p.amount)}
        thumb={colors[0]?.images[0] ?? null}
        href="#offer"
        track="offer_sticky_add"
        afterId="offer-cta"
        hideWhileId="offer"
      />
    </>
  )
}

async function LivePicker(props: Omit<Parameters<typeof PairPicker>[0], "stock">) {
  const stock = await getStock([props.productId])
  return <PairPicker {...props} stock={stock} />
}
