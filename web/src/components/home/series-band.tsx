import Image from "next/image"
import Link from "next/link"
import type { StoreSeries } from "@/lib/data/content"
import { Container } from "../container"

/**
 * The content series on-site (Tuan Le playbook, SITE_SPEC §6.1.5): the stance,
 * the proof, the episodes, and a specific way to join in.
 */
export function SeriesBand({ series }: { series: StoreSeries | null }) {
  if (!series?.stance) return null
  return (
    <section id="series" className="scroll-mt-28 py-12 lg:py-20">
      <Container className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Link href={`/stories/${series.handle}`} className="relative aspect-[4/5] overflow-hidden bg-surface" data-track="series_story">
          <Image src="/hats/story-crush.jpg" alt="A cap folded into a back pocket" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </Link>
        <div className="flex flex-col gap-6 lg:justify-center">
          <p className="text-eyebrow text-accent-ink">{series.title}</p>
          <blockquote className="font-display text-[32px] leading-[0.95] lg:text-[52px]">“{series.stance}”</blockquote>
          {series.proof && <p className="max-w-xl text-[15px] leading-relaxed text-ink-muted lg:text-base">{series.proof}</p>}
          <Link
            href={`/stories/${series.handle}`}
            className="text-eyebrow w-fit border-b border-ink pb-1 hover:text-ink-muted"
            data-track="series_story"
          >
            See the full test →
          </Link>
          {series.episodes.length > 0 && (
            <ol className="flex flex-col border-t border-line">
              {series.episodes.slice(0, 4).map((e, i) => (
                <li key={e.title} className="flex gap-4 border-b border-line py-3">
                  <span className="font-mono text-[12px] text-ink-muted">{String(series.episodes.length - i).padStart(2, "0")}</span>
                  <div className="flex flex-col gap-0.5">
                    {e.post_url ? (
                      <a href={e.post_url} className="text-[15px] font-medium underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                        {e.title}
                      </a>
                    ) : (
                      <span className="text-[15px] font-medium">{e.title}</span>
                    )}
                    {e.subject && <span className="text-[13px] text-ink-muted">{e.subject}</span>}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {series.participation_prompt && (
            <div className="flex flex-col gap-2 rounded-[2px] bg-ink p-5 text-page">
              <p className="text-eyebrow text-accent">Your turn</p>
              <p className="text-[17px] leading-snug">{series.participation_prompt}</p>
              <p className="text-[13px] text-ink-inverse-muted">
                Reply on {series.channel === "tiktok" ? "TikTok" : series.channel}. Your answers shape the next episode.
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
