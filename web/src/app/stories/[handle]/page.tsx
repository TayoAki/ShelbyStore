import type { Metadata } from "next"
import Image from "next/image"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { Exposure } from "@/components/exposure"
import { BuyBox } from "@/components/pdp/buy-box"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution"
import { getRegion, listCoreProducts } from "@/lib/data/catalog"
import { getSeries } from "@/lib/data/content"
import { getStock } from "@/lib/data/stock"
import { getVariant } from "@/lib/experiments"
import { formatMoney } from "@/lib/format"
import { meta, modelInfoOf, price, sizeChartOf } from "@/lib/product"
import type { Product } from "@/lib/types"

/** The A/B test on this page's headline (Admin → Analytics → Experiments). */
const HEADLINE_EXPERIMENT = "story-headline"

export async function generateMetadata({ params }: PageProps<"/stories/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const series = await getSeries(handle)
  return series
    ? { title: series.title, description: series.stance ?? series.audience_question ?? undefined }
    : { title: "Not found" }
}

/**
 * Story landing page for cold social traffic (SITE_SPEC §10). Someone who just
 * watched one episode doesn't know the brand yet, so this page continues the
 * video's promise and argues in modules: hook → problem → stance → proof →
 * offer (a working buy box) → participation → closing action.
 */
export default function StoryPage(props: PageProps<"/stories/[handle]">) {
  return (
    <Suspense fallback={<div className="aspect-[4/5] w-full animate-pulse bg-surface lg:aspect-[16/7]" />}>
      <StoryContent params={props.params} />
    </Suspense>
  )
}

async function StoryContent({ params }: { params: PageProps<"/stories/[handle]">["params"] }) {
  const { handle } = await params
  const [series, region] = await Promise.all([getSeries(handle), getRegion()])
  if (!series || !series.stance) notFound()
  const product = region ? ((await listCoreProducts(region.id))[0] ?? null) : null

  // Which episode brought this visitor (ad-to-page continuity).
  const asset = parseAttribution((await cookies()).get(ATTRIBUTION_COOKIE)?.value)?.asset
  const fromEpisode = series.episodes.find((e) => e.asset_key === asset) ?? null

  // Hypothesis: leading with the stance (the claim) beats leading with the
  // viewer's question. The control is the question; null = not running.
  const variant = await getVariant(HEADLINE_EXPERIMENT)
  const leadWithStance = variant === "stance"
  const question = series.audience_question ?? series.title
  const headline = leadWithStance ? series.stance : question
  const subhead = leadWithStance ? question : series.stance

  return (
    <>
      <Exposure experiment={HEADLINE_EXPERIMENT} variant={variant} />
      <Track event="story_viewed" props={{ series: series.handle, from_episode: fromEpisode?.asset_key }} />

      {/* 1. Hook: continue the video's promise */}
      <section className="bg-surface">
        <Container className="grid gap-6 py-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-14">
          <div className="relative aspect-[4/5] overflow-hidden bg-surface-2 lg:order-2">
            {product?.thumbnail && (
              <Image src={product.thumbnail} alt={product.title} fill preload sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            )}
          </div>
          <div className="flex flex-col items-start gap-5 lg:order-1">
            <p className="text-eyebrow text-accent">
              {series.title}
              {fromEpisode && <span className="text-ink-muted"> · You just watched: {fromEpisode.title}</span>}
            </p>
            <h1 className="font-display text-[44px] leading-[0.95] lg:text-[76px]">{headline}</h1>
            {subhead && <p className="max-w-lg text-[17px] leading-relaxed text-ink-muted lg:text-[19px]">{subhead}</p>}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink href="#offer" block track="story_shop">
                Shop the {product?.title.replace(/^The /, "") ?? "tee"}
              </ButtonLink>
              <ButtonLink href="#proof" variant="secondary" block track="story_see_proof">
                See the proof
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Problem: the audience's own frustration */}
      {series.audience && (
        <section className="py-12 lg:py-20">
          <Container className="flex max-w-3xl flex-col gap-4">
            <p className="text-eyebrow text-ink-muted">Sound familiar?</p>
            <p className="text-[24px] leading-snug lg:text-[32px]">{series.audience}</p>
          </Container>
        </section>
      )}

      {/* 3. Stance: the rule, stated plainly */}
      <section className="bg-ink py-12 text-white lg:py-20">
        <Container className="flex flex-col gap-4">
          <p className="text-eyebrow text-white/60">Our rule</p>
          <blockquote className="max-w-5xl font-display text-[34px] leading-[0.95] lg:text-[64px]">“{series.stance}”</blockquote>
        </Container>
      </section>

      {/* 4. Proof: what the camera shows, episode by episode */}
      <section id="proof" className="scroll-mt-28 py-12 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <p className="text-eyebrow text-ink-muted">The proof</p>
            <h2 className="font-display text-section">Watch the test</h2>
            {series.proof && <p className="text-[16px] leading-relaxed text-ink-muted">{series.proof}</p>}
          </div>
          <ol className="flex flex-col border-t border-line">
            {series.episodes.map((e, i) => (
              <li key={e.asset_key} className={`flex gap-4 border-b border-line py-5 ${e.asset_key === fromEpisode?.asset_key ? "bg-surface px-3" : ""}`}>
                <span className="font-mono text-[12px] text-ink-muted">{String(series.episodes.length - i).padStart(2, "0")}</span>
                <div className="flex flex-col gap-1">
                  {e.post_url ? (
                    <a href={e.post_url} target="_blank" rel="noreferrer" className="text-[16px] font-medium underline-offset-4 hover:underline" data-track="story_episode">
                      {e.title}
                    </a>
                  ) : (
                    <span className="text-[16px] font-medium">{e.title}</span>
                  )}
                  {e.subject && <span className="text-[14px] text-ink-muted">{e.subject}</span>}
                  {e.asset_key === fromEpisode?.asset_key && <span className="text-eyebrow text-accent">The one you watched</span>}
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 5. Offer: a working buy box, so the decision happens here */}
      {product && <Offer product={product} />}

      {/* 6. Participation + 7. closing action */}
      <section className="py-12 lg:py-20">
        <Container className="flex flex-col items-start gap-6">
          {series.participation_prompt && (
            <div className="flex w-full flex-col gap-2 border border-line p-6 lg:max-w-2xl">
              <p className="text-eyebrow text-accent">Your turn</p>
              <p className="text-[20px] leading-snug">{series.participation_prompt}</p>
              <p className="text-[13px] text-ink-muted">
                Reply on {series.channel === "tiktok" ? "TikTok" : series.channel}. Your answers shape the next episode.
              </p>
            </div>
          )}
          <h2 className="font-display text-section">{question}</h2>
          <ButtonLink href="#offer" track="story_close_cta">
            Get the {product?.title.replace(/^The /, "") ?? "tee"}
          </ButtonLink>
        </Container>
      </section>
    </>
  )
}

function Offer({ product }: { product: Product }) {
  const p = price(product)
  const fitNotes = meta(product, "fit_notes")
  const props = { product, release: null, fitNotes, modelInfo: modelInfoOf(product), sizeChart: sizeChartOf(product) }
  return (
    <section id="offer" className="scroll-mt-28 bg-surface py-12 lg:py-20">
      <Container className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
          {product.thumbnail && <Image src={product.thumbnail} alt={product.title} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />}
        </div>
        <div className="flex flex-col gap-6 lg:pt-6">
          <div className="flex flex-col gap-2">
            <p className="text-eyebrow text-ink-muted">The core · always in stock</p>
            <h2 className="text-2xl font-semibold tracking-[-0.01em] lg:text-3xl">{product.title}</h2>
            <p className="font-mono text-[15px]">{formatMoney(p.amount, p.currency)}</p>
            {meta(product, "promise") && <p className="text-[16px] italic text-ink-muted">“{meta(product, "promise")}”</p>}
          </div>
          <Suspense fallback={<BuyBox {...props} stock={null} />}>
            <LiveBuyBox {...props} />
          </Suspense>
        </div>
      </Container>
    </section>
  )
}

async function LiveBuyBox(props: Omit<Parameters<typeof BuyBox>[0], "stock">) {
  const stock = await getStock([props.product.id])
  return <BuyBox {...props} stock={stock} />
}
