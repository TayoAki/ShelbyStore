import { Check } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { ContinuityBanner } from "@/components/continuity-banner"
import { FitScales } from "@/components/fit-scale"
import { OfferCard } from "@/components/lp/offer-card"
import { ProductOffer } from "@/components/lp/product-offer"
import { Track } from "@/components/track"
import { getRegion, listOffers, listProducts } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { fitProfileOf, offerOf, price } from "@/lib/product"
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
    <Suspense fallback={<div className="h-[80vh] animate-pulse bg-surface" />}>
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
      <Container className="flex flex-col items-start gap-4 py-16">
        <h1 className="font-display text-section">Everything is sold out right now</h1>
        <p className="text-ink-muted">Check back soon, or browse what&apos;s coming.</p>
        <Link href="/drops" className="underline underline-offset-4">
          See upcoming drops
        </Link>
      </Container>
    )
  }

  const { product, color, size, why } = match
  const offer = offers.find((o) => offerOf(o)?.singleHandle === product.handle) ?? null
  const offerPrice = offer ? price(offer).amount : null
  const profile = fitProfileOf(product)
  const initialSelection: Record<string, string> = {}
  if (color) initialSelection.Color = color
  if (size) initialSelection.Size = size

  return (
    <>
      <Track
        event="quiz_completed"
        props={{ match: product.handle, color, size, runner_up: runnerUp?.product.handle ?? null, ...answers }}
      />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>

      <section className="py-8 lg:py-14">
        <Container className="grid gap-8 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <p className="text-eyebrow text-accent-ink">Your match</p>
            <h1 className="font-display text-[38px] leading-[0.95] lg:text-[60px]">
              {product.title}
              {color ? ` in ${color}` : ""}
            </h1>
            {size && <p className="font-mono text-[14px]">Size {size}</p>}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-[16px] font-semibold">Why it fits you</h2>
            <ul className="flex flex-col gap-2">
              {why.map((w) => (
                <li key={w} className="flex gap-2 text-[15px] leading-snug">
                  <Check size={18} weight="bold" className="mt-0.5 shrink-0 text-ok" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
            <Link href="/quiz" className="mt-2 w-fit text-[13px] underline underline-offset-4 hover:text-ink-muted" data-track="quiz_retake">
              Retake the quiz
            </Link>
          </div>
        </Container>
      </section>

      <ProductOffer
        product={product}
        id="buy"
        eyebrow="Your match"
        initialSelection={initialSelection}
        source="quiz"
        showQuizLink={false}
        footer={
          profile ? (
            <div className="flex flex-col gap-3 border-t border-line pt-5">
              <p className="text-[15px] font-semibold">How it fits</p>
              <FitScales profile={profile} compact />
            </div>
          ) : null
        }
      />

      {(offer || runnerUp) && (
        <section className="py-12 lg:py-16">
          <Container className="grid gap-6 lg:grid-cols-2">
            {offer && offerPrice !== null && (
              <div className="flex flex-col gap-3">
                <p className="text-eyebrow text-ink-muted">Want two?</p>
                <OfferCard
                  product={offer}
                  href={offerOf(offer)!.path}
                  cta={`Pick your two · ${formatMoney(offerPrice, price(offer).currency)}`}
                  track="quiz_offer"
                />
              </div>
            )}
            {runnerUp && (
              <div className="flex flex-col gap-3">
                <p className="text-eyebrow text-ink-muted">Close second</p>
                <OfferCard
                  product={runnerUp.product}
                  cta={`See the ${runnerUp.product.title.replace(/^The /, "")}`}
                  track="quiz_runner_up"
                />
              </div>
            )}
          </Container>
        </section>
      )}
    </>
  )
}
