import { CheckCircle } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { FitScales } from "@/components/fit-scale"
import { OfferRow } from "@/components/offer/offer-row"
import { BuyBox } from "@/components/pdp/buy-box"
import { Gallery } from "@/components/pdp/gallery"
import { SelectionProvider } from "@/components/pdp/selection"
import { RETURNS_PERK, SHIPPING_PERK } from "@/components/perks"
import { ProductCard } from "@/components/product-card"
import { ButtonLink } from "@/components/ui/button"
import { Track } from "@/components/track"
import { getRegion, listOffers, listProducts } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { colorThumbs, fitProfileOf, imagesFor, meta, offerOf, price, sizeChartOf } from "@/lib/product"
import { parseAnswers, rankHats } from "@/lib/quiz"

export const metadata: Metadata = {
  title: "Your match",
  description: "The hat, colour and size that match how you wear a hat.",
}

/**
 * Quiz result (SITE_SPEC §12.4): the match with "why it fits you" (each line
 * an answer paired with a product fact), a buy box preselected to the matched
 * colour and size, the runner-up, and the two-pack when the match is the core.
 * Stateless: the answers live in the URL, so a result can be shared.
 */
export default function QuizResultPage(props: PageProps<"/quiz/result">) {
  return (
    <Suspense fallback={<div className="h-[80vh] animate-pulse bg-tile" />}>
      <Result searchParams={props.searchParams} />
    </Suspense>
  )
}

async function Result({ searchParams }: { searchParams: PageProps<"/quiz/result">["searchParams"] }) {
  const answers = parseAnswers(await searchParams)
  if (!answers) redirect("/quiz")
  const region = await getRegion()
  if (!region) redirect("/quiz")
  const [products, offers] = await Promise.all([listProducts(region.id), listOffers(region.id)])
  const stock = await getStock(products.map((p) => p.id))
  const [match, runnerUp] = rankHats(products, stock, answers)
  if (!match) {
    return (
      <div className="container-article flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-heading text-[26px] uppercase leading-[39px]">Everything Is Sold Out Right Now</h1>
        <p className="font-body text-[15px]">Check back soon, or browse what&apos;s coming.</p>
        <Link href="/drops" className="btn btn--light">
          <span>See upcoming drops</span>
        </Link>
      </div>
    )
  }

  const { product, color, size, why } = match
  const offer = offers.find((o) => offerOf(o)?.singleHandle === product.handle) ?? null
  const offerPrice = offer ? price(offer).amount : null
  const singlePrice = price(product).amount
  const profile = fitProfileOf(product)
  const initialSelection: Record<string, string> = {}
  if (color) initialSelection.Color = color
  if (size) initialSelection.Size = size
  const colors = colorThumbs(product).map((c) => c.color)
  const imagesByColor = Object.fromEntries(colors.map((c) => [c, imagesFor(product, c)]))
  const buyProps = {
    product,
    release: null,
    fitNotes: meta(product, "fit_notes"),
    sizeChart: sizeChartOf(product),
    initialSelection,
    source: "quiz",
    showQuizLink: false,
    perks: [SHIPPING_PERK, RETURNS_PERK],
    addOn:
      offer && offerPrice !== null ? (
        <OfferRow
          href={offerOf(offer)!.path}
          title="The Two-Pack"
          subtitle="Any two colors"
          price={offerPrice}
          saving={singlePrice !== null ? singlePrice * 2 - offerPrice : null}
          currency={price(product).currency}
          image="/hats/everyday-cap-black-1.jpg"
          track="quiz_offer"
        />
      ) : undefined,
  }

  return (
    <>
      <Track event="quiz_completed" props={{ match: product.handle, color, size, runner_up: runnerUp?.product.handle ?? null, ...answers }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <div className="container-shop pt-[37.904px] text-center">
        <p className="type-eyebrow uppercase text-muted">Your Match</p>
        <h1 className="font-heading text-[26px] uppercase leading-[39px]">
          {product.title}
          {color ? ` in ${color}` : ""}
        </h1>
      </div>
      <SelectionProvider initialColor={color ?? colors[0] ?? null} syncUrl={false}>
        <div className="container-shop mt-[28.432px] grid gap-6 pb-[28.432px] lg:grid-cols-[minmax(0,740px)_370px] lg:justify-between lg:gap-[68px] lg:pb-[50.512px]">
          <div className="-mx-[21.328px] lg:mx-0">
            <Gallery images={imagesFor(product)} imagesByColor={imagesByColor} title={product.title} />
          </div>
          <div className="flex flex-col">
            <h2 className="font-heading text-[14px] uppercase tracking-[1.3px]">Why It Fits You</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {why.map((w) => (
                <li key={w} className="flex gap-2 font-body text-[14px] leading-[21px]">
                  <CheckCircle size={14} weight="fill" className="mt-[3px] shrink-0" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
            <hr className="my-5 border-tertiary" />
            <Suspense fallback={<BuyBox {...buyProps} stock={null} />}>
              <LiveBuyBox {...buyProps} />
            </Suspense>
            {profile && (
              <div className="mt-6 border-t border-tertiary pt-6">
                <h3 className="mb-5 font-heading text-[18px] leading-[23.4px]">Fit Guide</h3>
                <FitScales profile={profile} />
              </div>
            )}
          </div>
        </div>
      </SelectionProvider>
      <section className="bg-band py-[28.432px] lg:py-[50.512px]">
        <div className="container-shop flex flex-col items-center">
          {runnerUp && (
            <>
              <h2 className="mb-[22.08px] type-section">Runner-Up</h2>
              <div className="w-[263px]">
                <ProductCard product={runnerUp.product} stock={stock} status={null} track="quiz_runner_up" />
              </div>
            </>
          )}
          <ButtonLink href="/quiz" variant="light" className="mt-8" track="quiz_retake">
            Retake the quiz
          </ButtonLink>
        </div>
      </section>
    </>
  )
}

async function LiveBuyBox(props: Omit<Parameters<typeof BuyBox>[0], "stock">) {
  const stock = await getStock([props.product.id])
  return <BuyBox {...props} stock={stock} />
}
