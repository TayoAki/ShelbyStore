import { PlayCircle } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Exposure } from "@/components/exposure"
import { AboutPill } from "@/components/home/about-pill"
import { SeriesCarousel } from "@/components/home/series-carousel"
import { RopeBuyBlock } from "@/components/rope-buy-block"
import { SeriesPill } from "@/components/series-pill"
import { Track } from "@/components/track"
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution"
import { getSeries } from "@/lib/data/content"
import { getVariant } from "@/lib/experiments"

/** The A/B test on this page's headline (Admin → Analytics → Experiments). */
const HEADLINE_EXPERIMENT = "story-headline"

export async function generateMetadata({ params }: PageProps<"/stories/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const series = await getSeries(handle)
  return series ? { title: series.title, description: series.stance ?? series.audience_question ?? undefined } : { title: "Not found" }
}

/**
 * Story page for cold social traffic (SITE_SPEC G.6.14 on v5 §6.9): hero →
 * problem → stance (pill window) → proof (episodes) → offer (the Rope Cap buy
 * card) → your turn (the page's golf-green band) → close (brand pill).
 */
export default function StoryPage(props: PageProps<"/stories/[handle]">) {
  return (
    <Suspense fallback={<div className="m-2.5 h-[70vh] animate-pulse rounded-[20px] bg-white" />}>
      <StoryContent params={props.params} />
    </Suspense>
  )
}

async function StoryContent({ params }: { params: PageProps<"/stories/[handle]">["params"] }) {
  const { handle } = await params
  const series = await getSeries(handle)
  if (!series || !series.stance) notFound()

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

      <section data-hero="" className="hero-in relative m-2.5 h-[78svh] overflow-hidden rounded-[20px] text-white md:h-[82vh]">
        <Image src="/hats/rope-brim.jpg" alt="A rope cap brim, close up, with the rope across the front" fill preload sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-[linear-gradient(0deg,rgba(0,0,0,.5),rgba(0,0,0,0))]" aria-hidden />
        <div className="hero-in-content absolute inset-0 flex flex-col items-start justify-end gap-3 p-8 pt-24 md:max-w-[70%] md:p-16">
          <p className="font-mono text-xs leading-5 font-medium tracking-[.1em] uppercase">{series.title.toUpperCase()}</p>
          <h1 className="font-display text-[30px] leading-9 md:text-[40px] md:leading-[48px]">{headline}</h1>
          {subhead && <p className="kicker text-white">{subhead}</p>}
          {fromEpisode && (
            <p className="flex items-center gap-2 text-sm leading-5">
              <PlayCircle size={18} weight="fill" aria-hidden /> You just watched: {fromEpisode.title}
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="#offer" className="btn btn-primary" data-track="story_shop">
              SHOP THE ROPE CAP
            </Link>
            <Link href="#proof" className="btn btn-outline-white" data-track="story_see_proof">
              SEE THE PROOF
            </Link>
          </div>
        </div>
      </section>

      {series.audience && (
        <section aria-label="The problem" className="mx-2.5 my-10 flex flex-col md:flex-row">
          <div className="relative aspect-[10/7] overflow-hidden rounded-xl md:min-w-[55vw]">
            <Image src="/hats/rope-lifestyle-hero.jpg" alt="A golfer in a Pine rope cap on a links course" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col items-center justify-center gap-6 rounded-xl px-5 py-6 text-center md:px-10">
            <h2 className="font-display text-2xl leading-8 capitalize">The problem</h2>
            <p className="text-sm leading-5">{series.audience}</p>
            <Link href="/fit-guide" className="link text-sm" data-track="story_fit_guide">
              How our crown compares
            </Link>
          </div>
        </section>
      )}

      <AboutPill id="stance" label="The stance" quote={series.stance} cta={null} />

      {series.proof && <p className="mx-auto max-w-[65ch] px-5 text-center text-sm leading-5">{series.proof}</p>}
      <SeriesCarousel series={series} onStory highlight={fromEpisode?.asset_key ?? null} />

      <section id="offer" aria-label="The Rope Cap" className="mx-2.5 my-10 scroll-mt-28">
        <div className="mx-auto max-w-[547px]">
          <RopeBuyBlock source="story" />
        </div>
      </section>

      {series.participation_prompt && (
        <section aria-label="Your turn" className="band-golf mx-2.5 my-10 flex flex-col items-center gap-3 rounded-3xl px-6 py-12 text-center md:px-10">
          <p className="font-mono text-xs leading-5 tracking-[.1em]">YOUR TURN</p>
          <p className="max-w-[55ch] text-base leading-6">{series.participation_prompt}</p>
          <p className="text-xs leading-4 text-golf-tint">Reply on {series.channel === "tiktok" ? "TikTok" : series.channel}. Your answers shape the next episode.</p>
        </section>
      )}

      <SeriesPill title={series.title.toUpperCase()} stance={series.stance} href="#offer" episodes={series.episodes.map((e) => e.title)} cta="GET THE ROPE CAP" track="story_close_cta" />
    </>
  )
}
