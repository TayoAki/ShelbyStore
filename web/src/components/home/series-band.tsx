import Link from "next/link"
import type { StoreSeries } from "@/lib/data/content"
import { Container } from "../container"

/**
 * The content series on-site (Tuan Le playbook): the stance, the proof, the
 * episodes, and a specific way to join in.
 */
export function SeriesBand({ series }: { series: StoreSeries | null }) {
  if (!series?.stance) return null
  return (
    <section id="series" className="scroll-mt-28 bg-ink py-12 text-white lg:py-24">
      <Container className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="text-eyebrow text-white/60">{series.title}</p>
          <blockquote className="font-display text-[34px] leading-[0.95] lg:text-[60px]">“{series.stance}”</blockquote>
          {series.proof && <p className="max-w-xl text-[15px] leading-relaxed text-white/70 lg:text-base">{series.proof}</p>}
          <Link href={`/stories/${series.handle}`} className="text-eyebrow w-fit border-b border-white/40 pb-1 hover:border-white" data-track="series_story">
            See the full test →
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          {series.episodes.length > 0 && (
            <ol className="flex flex-col">
              {series.episodes.slice(0, 4).map((e, i) => (
                <li key={e.title} className="flex gap-4 border-t border-white/15 py-4">
                  <span className="font-mono text-[12px] text-white/50">{String(series.episodes.length - i).padStart(2, "0")}</span>
                  <div className="flex flex-col gap-1">
                    {e.post_url ? (
                      <a href={e.post_url} className="font-medium underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                        {e.title}
                      </a>
                    ) : (
                      <span className="font-medium">{e.title}</span>
                    )}
                    {e.subject && <span className="text-[13px] text-white/60">{e.subject}</span>}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {series.participation_prompt && (
            <div className="flex flex-col gap-2 rounded-[2px] bg-white/10 p-5">
              <p className="text-eyebrow text-accent-soft">Your turn</p>
              <p className="text-[17px] leading-snug">{series.participation_prompt}</p>
              <p className="text-[13px] text-white/60">Reply on {series.channel === "tiktok" ? "TikTok" : series.channel}. Your answers shape the next episode.</p>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
