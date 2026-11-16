import type { Metadata } from "next"
import Image from "next/image"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Play } from "@phosphor-icons/react/dist/ssr"
import { Exposure } from "@/components/exposure"
import { ProductOffer } from "@/components/lp/product-offer"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution"
import { getRegion, listCoreProducts } from "@/lib/data/catalog"
import { getSeries } from "@/lib/data/content"
import { getVariant } from "@/lib/experiments"

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
    <Suspense fallback={<div className="aspect-[390/260] w-full animate-pulse bg-tile lg:aspect-[1440/412]" />}>
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

  const name = product?.title.replace(/^The /, "") ?? "Everyday Cap"
  const episodeNo = fromEpisode ? [...series.episodes].sort((a, b) => Date.parse(a.published_at) - Date.parse(b.published_at)).findIndex((e) => e.asset_key === fromEpisode.asset_key) + 1 : 0

  return (
    <>
      <Exposure experiment={HEADLINE_EXPERIMENT} variant={variant} />
      <Track event="story_viewed" props={{ series: series.handle, from_episode: fromEpisode?.asset_key }} />
      <div className="relative aspect-[390/260] w-full bg-tile lg:aspect-[1440/412]">
        <Image src="/hats/story-crush.jpg" alt="A cap folded in half and slid into a back pocket" fill preload sizes="100vw" className="object-cover" />
      </div>
      <article className="container-article pt-[27px]">
        <p className="article-meta opacity-60">
          {series.title}
          {episodeNo > 0 && <span className="pl-3">| Episode {episodeNo}</span>}
        </p>
        <h1 className={`mt-3 ${headline.length > 80 ? "font-subheading text-[28px] leading-[36.4px]" : "article-h1"}`}>{headline}</h1>
        {fromEpisode && (
          <p className="mt-3 flex items-center gap-2 font-body text-[13px] text-muted">
            <Play size={12} weight="fill" aria-hidden /> You just watched: {fromEpisode.title}
          </p>
        )}
        {subhead && <p className="mt-4 article-p">{subhead}</p>}
        <div className="mt-2 flex flex-wrap gap-3">
          <ButtonLink href="#offer" track="story_shop">
            Shop the {name}
          </ButtonLink>
          <ButtonLink href="#proof" variant="light" track="story_see_proof">
            See the proof
          </ButtonLink>
        </div>

        {series.audience && (
          <>
            <h2 className="article-h2">The Problem</h2>
            <p className="article-p">{series.audience}</p>
          </>
        )}

        <h2 className="article-h2">The Stance</h2>
        <blockquote className="border-l-4 border-black pl-5 font-heading text-[22px] leading-[28.6px]">“{series.stance}”</blockquote>

        <section id="proof" className="scroll-mt-[130px]">
          <h2 className="article-h2">The Proof</h2>
          {series.proof && <p className="article-p">{series.proof}</p>}
          <ol className="border-t border-tertiary">
            {[...series.episodes]
              .sort((a, b) => Date.parse(a.published_at) - Date.parse(b.published_at))
              .map((e, i) => (
                <li key={e.asset_key} className={`flex items-start gap-4 border-b border-tertiary py-[14px] ${e.asset_key === fromEpisode?.asset_key ? "bg-band px-3" : ""}`}>
                  <span className="font-heading text-[14px]">{i + 1}</span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-subheading text-[15px]">{e.title}</span>
                    {e.subject && <span className="font-body text-[13px] text-muted">{e.subject}</span>}
                  </div>
                  {e.post_url && (
                    <a href={e.post_url} target="_blank" rel="noreferrer" className="btn btn--link shrink-0" data-track="story_episode">
                      <span>Watch</span>
                    </a>
                  )}
                </li>
              ))}
          </ol>
        </section>

        {product && (
          <div className="mt-12">
            <ProductOffer product={product} source="story" ctaTrack="story_shop" />
          </div>
        )}

        {series.participation_prompt && (
          <div className="mt-12 bg-primary p-6 text-white">
            <p className="font-heading text-[18px] uppercase">Your Turn</p>
            <p className="mt-2 font-body text-[15px] leading-[22.5px]">{series.participation_prompt}</p>
            <p className="mt-2 font-body text-[13px] text-white/70">
              Reply on {series.channel === "tiktok" ? "TikTok" : series.channel}. Your answers shape the next episode.
            </p>
          </div>
        )}

        <hr className="mb-6 mt-12 border-0 border-t-4 border-black" />
        <div className="pb-[50.512px]">
          <ButtonLink href="#offer" size="atc" block track="story_close_cta">
            Get the {name}
          </ButtonLink>
        </div>
      </article>
    </>
  )
}
