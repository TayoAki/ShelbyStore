import { PlayCircle } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Exposure } from "@/components/exposure"
import { CrownProfiles } from "@/components/crown-profiles"
import { RopeBuyBlock } from "@/components/rope-buy-block"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution"
import { getSeries } from "@/lib/data/content"
import { getVariant } from "@/lib/experiments"
import { pad2 } from "@/lib/rope"

/** The A/B test on this page's headline (Admin → Analytics → Experiments). */
const HEADLINE_EXPERIMENT = "story-headline"

export async function generateMetadata({ params }: PageProps<"/stories/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const series = await getSeries(handle)
  return series ? { title: series.title, description: series.stance ?? series.audience_question ?? undefined } : { title: "Not found" }
}

/**
 * Story page for cold social traffic (SITE_SPEC v8 E.6.9, Eastside's about
 * page): a full-bleed hero with the headline under test, the stance, the
 * chapters as alternating splits (the problem, then each episode), the proof
 * band with the crown profiles, the Rope Cap in the PDP layout, your turn,
 * and a closing editorial split.
 */
export default function StoryPage(props: PageProps<"/stories/[handle]">) {
  return (
    <Suspense fallback={<div className="h-[75vh] bg-tile" aria-busy />}>
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

  const photos = ["/hats/rope-brim.jpg", "/hats/rope-lifestyle-hero.jpg", "/hats/rope-clubhouse.jpg", "/hats/story-crush.jpg"]
  const chapters = [
    ...(series.audience ? [{ key: "problem", label: "The problem", title: "Most rope caps run tall.", body: series.audience, href: "/fit-guide", linkLabel: "How our crown compares", track: "story_fit_guide", external: false }] : []),
    ...episodes.map((e, i) => ({
      key: e.asset_key,
      label: `Episode ${pad2(i + 1)} · ${series.channel === "tiktok" ? "TikTok" : series.channel}`,
      title: e.title,
      body: e.subject ?? "",
      href: e.post_url ?? `/stories/${series.handle}`,
      linkLabel: fromEpisode?.asset_key === e.asset_key ? "You just watched this" : "Watch the episode",
      track: "story_episode",
      external: !!e.post_url,
    })),
  ]

  return (
    <>
      <Exposure experiment={HEADLINE_EXPERIMENT} variant={variant} />
      <Track event="story_viewed" props={{ series: series.handle, from_episode: fromEpisode?.asset_key }} />

      <section className="overlay-bottom relative h-[520px] overflow-hidden bg-ink md:h-[75vh] md:min-h-[520px]">
        <Image src="/hats/story-crush.jpg" alt="" fill preload sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-4 bottom-4 z-[1] md:inset-x-auto md:top-1/2 md:right-[50px] md:bottom-auto md:left-[57.4%] md:max-w-[563px] md:-translate-y-1/2">
          <h1 className={`title-feature text-on-ink ${headline && headline.length > 80 ? "!text-[32px] md:!text-[44px]" : ""}`}>{headline}</h1>
          {fromEpisode && (
            <p className="mt-3 flex items-center gap-2 text-[14.4px] text-on-ink">
              <PlayCircle size={18} weight="fill" aria-hidden /> You just watched: <span className="font-medium">{fromEpisode.title}</span>
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="stance-title" className="wrap mx-auto max-w-[780px] py-14 text-center">
        <p id="stance-title" className="eyebrow">
          {series.title}
        </p>
        {subhead && <p className="body-long mt-3">{subhead}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <ButtonLink href="#offer" track="story_shop">
            Shop the Rope Cap
          </ButtonLink>
          <Link href="/fit-guide" className="link text-[14.4px]" data-track="story_fit_guide">
            Fit guide
          </Link>
        </div>
      </section>

      {chapters.length > 0 && (
        <div className="wrap flex flex-col gap-14 pb-14 md:gap-20">
          {chapters.map((ch, i) => (
            <section key={ch.key} aria-labelledby={`ch-${i}`} className="grid items-center gap-6 md:grid-cols-[459px_minmax(0,1fr)] md:gap-16">
              <div className={`relative aspect-[4/5] overflow-hidden bg-tile ${i % 2 ? "md:order-2" : ""}`}>
                <Image src={photos[i % photos.length]} alt="" fill sizes="(min-width: 750px) 459px, 100vw" className="object-cover" />
              </div>
              <div className={`flex max-w-[560px] flex-col items-start ${i % 2 ? "md:order-1 md:justify-self-end" : ""}`}>
                <p className="eyebrow-sm">{ch.label}</p>
                <h2 id={`ch-${i}`} className="title-section mt-2 !text-[28px] md:!text-[38.4px]">
                  {ch.title}
                </h2>
                {ch.body && <p className="body-long mt-3">{ch.body}</p>}
                <Link
                  href={ch.href}
                  {...(ch.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  data-track={ch.track}
                  aria-current={ch.linkLabel === "You just watched this" ? "true" : undefined}
                  className="link mt-4 text-[14.4px]"
                >
                  {ch.linkLabel}
                </Link>
              </div>
            </section>
          ))}
        </div>
      )}

      <section id="proof" aria-labelledby="proof-title" className="band-tile scroll-mt-24 py-14">
        <div className="wrap grid items-center gap-8 md:grid-cols-2">
          <CrownProfiles low={11} top={11.5} fallbackColor="Pine" />
          <div className="flex flex-col items-start">
            <p className="eyebrow-sm">The proof</p>
            <h2 id="proof-title" className="title-section mt-2 !text-[28px] md:!text-[38.4px]">
              About 11–11.5 cm
            </h2>
            {series.proof && <p className="body-long mt-3">{series.proof}</p>}
            <Link href="/fit-guide" className="link mt-4 text-[14.4px]" data-track="story_see_proof">
              See the measurements
            </Link>
          </div>
        </div>
      </section>

      <section id="offer" aria-label="The Rope Cap" className="scroll-mt-24">
        <RopeBuyBlock source="story" />
      </section>

      {series.participation_prompt && (
        <section aria-labelledby="turn-title" className="wrap mx-auto max-w-[780px] pb-14 text-center">
          <p className="eyebrow-sm">Your turn</p>
          <h2 id="turn-title" className="title-blog mt-2">
            {series.participation_prompt}
          </h2>
          <p className="meta mt-3">Reply on {series.channel === "tiktok" ? "TikTok" : series.channel}. Your answers shape the next episode.</p>
        </section>
      )}

      <section aria-labelledby="close-title" className="grid md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden md:order-2">
          <Image src="/hats/rope-clubhouse.jpg" alt="" fill sizes="(min-width: 750px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="band-tile flex items-center justify-center p-6 md:order-1">
          <div className="flex max-w-[420px] flex-col items-center text-center">
            <h2 id="close-title" className="display-xl">
              {series.title}
            </h2>
            <p className="body-editorial mt-3">A mid crown that sits right the first time.</p>
            <a href="#offer" className="btn btn-black btn-sm mt-5" data-track="story_close_cta">
              Get the Rope Cap
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
