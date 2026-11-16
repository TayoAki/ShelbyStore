import { PlayCircle } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Exposure } from "@/components/exposure"
import { Digits } from "@/components/digits"
import { RopeBuyBlock } from "@/components/rope-buy-block"
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
 * Story page for cold social traffic, in the box's vocabulary: the headline
 * (under test) on the front panel with a die-cut window, the problem, the
 * stance printed on a full ink panel, the proof as numbered episodes on one
 * keylined plate, the Rope Cap's front panel, your turn, and the close.
 */
export default function StoryPage(props: PageProps<"/stories/[handle]">) {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 h-[70vh] max-w-[1440px] animate-pulse bg-wash" />}>
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

  const episodes = [...series.episodes].sort((x, y) => Date.parse(x.published_at) - Date.parse(y.published_at))

  return (
    <>
      <Exposure experiment={HEADLINE_EXPERIMENT} variant={variant} />
      <Track event="story_viewed" props={{ series: series.handle, from_episode: fromEpisode?.asset_key }} />
      <div className="box mt-3 md:mt-6">
        <section className="panel overflow-hidden">
          <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center">
            <div className="flex flex-col gap-5 lg:order-2">
              <h1 className={`panel-title ${headline && headline.length > 80 ? "!text-[clamp(2rem,1.5rem+2vw,3rem)]" : ""}`}>{headline}</h1>
              {subhead && <p className="max-w-[56ch] text-[1.125rem] leading-[1.6] text-ink-2">{subhead}</p>}
              {fromEpisode && (
                <p className="flex items-center gap-2 text-[0.9375rem]">
                  <PlayCircle size={20} weight="fill" aria-hidden /> You just watched: <span className="font-semibold">{fromEpisode.title}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Link href="#offer" className="btn btn-secondary btn-large" data-track="story_shop">
                  Shop the Rope Cap
                </Link>
                <Link href="#proof" className="btn btn-outline-black btn-large" data-track="story_see_proof">
                  See the proof
                </Link>
              </div>
              <p className="label text-ink-2">{series.title} · from Shelby</p>
            </div>
            <div className="window aspect-[4/3] lg:order-1">
              <Image src="/hats/rope-brim.jpg" alt="A golfer setting the brim of a navy rope cap on the course" fill preload sizes="(min-width: 1024px) 50vw, 92vw" className="object-cover" />
              <span className="window-shade" aria-hidden />
            </div>
          </div>
        </section>

        {series.audience && (
          <section aria-labelledby="problem-title" className="panel">
            <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center">
              <div className="window aspect-[4/3]">
                <Image src="/hats/rope-lifestyle-hero.jpg" alt="A golfer in a Pine rope cap on a links course" fill sizes="(min-width: 768px) 40vw, 92vw" className="object-cover" />
                <span className="window-shade" aria-hidden />
              </div>
              <div className="flex flex-col gap-4">
                <h2 id="problem-title" className="panel-title">
                  The problem
                </h2>
                <p className="max-w-[60ch] text-[1.125rem] leading-[1.6]">{series.audience}</p>
                <Link href="/fit-guide" className="link w-fit font-semibold" data-track="story_fit_guide">
                  How our crown compares
                </Link>
              </div>
            </div>
          </section>
        )}

        <section id="stance" aria-labelledby="stance-title" className="panel ink-dark" style={{ "--panel-bg": "#1E3B2F", "--panel-ink": "#F1ECE0", "--panel-line": "#10241B" } as React.CSSProperties}>
          <div className="relative flex flex-col gap-5 p-[var(--panel-pad)] md:py-16">
            <h2 id="stance-title" className="label">
              The stance
            </h2>
            <p className="model !text-[clamp(2.25rem,1.5rem+3.2vw,4.5rem)] max-w-[22ch] !leading-[.95]">{series.stance}</p>
            {series.proof && <p className="max-w-[60ch] text-[1.125rem] leading-[1.6] opacity-90">{series.proof}</p>}
          </div>
        </section>

        {episodes.length > 0 && (
          <section id="proof" aria-labelledby="proof-title" className="flex scroll-mt-28 flex-col gap-4">
            <h2 id="proof-title" className="panel-title">
              The proof
            </h2>
            <ol className="grid plate sm:grid-cols-2 lg:grid-cols-4">
              {episodes.map((e, i) => (
                <li key={e.asset_key} className="bg-paper">
                  <Link
                    href={e.post_url ?? `/stories/${series.handle}`}
                    {...(e.post_url ? { target: "_blank", rel: "noreferrer" } : {})}
                    data-track="story_episode"
                    aria-current={fromEpisode?.asset_key === e.asset_key ? "true" : undefined}
                    className={`flex h-full flex-col gap-2 p-5 hover:bg-wash ${fromEpisode?.asset_key === e.asset_key ? "outline-[3px] outline-offset-[-3px] outline-ink" : ""}`}
                  >
                    <span className="text-[2.5rem] leading-none" aria-hidden>
                      <Digits value={String(i + 1).padStart(2, "0")} />
                    </span>
                    <span className="label">Episode {i + 1} · TikTok</span>
                    <span className="text-[1.125rem] font-semibold">{e.title}</span>
                    {e.subject && <span className="text-[0.9375rem] leading-6 text-ink-2">{e.subject}</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section id="offer" aria-label="The Rope Cap" className="box-flush scroll-mt-28">
          <RopeBuyBlock source="story" withSide />
        </section>

        {series.participation_prompt && (
          <section aria-labelledby="turn-title" className="panel">
            <div className="relative flex flex-col items-start gap-3 p-[var(--panel-pad)]">
              <h2 id="turn-title" className="panel-title">
                Your turn
              </h2>
              <p className="max-w-[56ch] text-[1.25rem] leading-[1.5]">{series.participation_prompt}</p>
              <p className="text-[0.9375rem] text-ink-2">Reply on {series.channel === "tiktok" ? "TikTok" : series.channel}. Your answers shape the next episode.</p>
            </div>
          </section>
        )}

        <section aria-labelledby="close-title" className="panel ink-dark" style={{ "--panel-bg": "#14213D", "--panel-ink": "#FFFFFF", "--panel-line": "#14213D" } as React.CSSProperties}>
          <div className="relative flex flex-col items-start gap-5 p-[var(--panel-pad)] md:flex-row md:items-end md:justify-between">
            <h2 id="close-title" className="model !text-[clamp(2.5rem,1.8rem+3vw,4.5rem)] max-w-[16ch]">
              {series.title}
            </h2>
            <Link href="#offer" className="btn btn-on-ink btn-large shrink-0" style={{ "--btn-bg": "#FFFFFF", "--btn-fg": "#14213D" } as React.CSSProperties} data-track="story_close_cta">
              Get the Rope Cap
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
