import Image from "next/image"
import Link from "next/link"
import type { StoreSeries } from "@/lib/data/content"
import { Carousel } from "../carousel"
import { ButtonLink } from "../ui/button"

const IMAGES: { src: string; contain: boolean }[] = [
  { src: "/hats/story-crush.jpg", contain: false },
  { src: "/hats/everyday-cap-black-3.jpg", contain: true },
  { src: "/hats/story-crush.jpg", contain: false },
  { src: "/hats/everyday-cap-bone-1.jpg", contain: true },
]

/**
 * "From The Crush Test" in Melin's reviews slot (SITE_SPEC §6.1.7): episode
 * cards from the active content series (no reviews are invented).
 */
export function CrushTest({ series }: { series: StoreSeries | null }) {
  if (!series || !series.episodes.length) return null
  const episodes = [...series.episodes].sort((a, b) => Date.parse(a.published_at) - Date.parse(b.published_at)).slice(0, 4)
  const channel = series.channel === "tiktok" ? "TikTok" : series.channel
  const cards = episodes.map((e, i) => (
    <article key={e.asset_key} className="flex flex-col">
      <h3 className="font-subheading text-[16px] leading-6">{e.title}</h3>
      <p className="font-body text-[13px] text-muted">
        Episode {i + 1} · {channel}
      </p>
      <span className={`relative mt-3 block aspect-square ${IMAGES[i].contain ? "bg-white" : "bg-tile"}`}>
        <Image src={IMAGES[i].src} alt="" fill sizes="(min-width:1024px) 292px, 233px" className={IMAGES[i].contain ? "object-contain" : "object-cover"} />
      </span>
      {e.subject && <p className="mt-3 line-clamp-3 font-body text-[14px] leading-[21px]">{e.subject}</p>}
      <Link href={`/stories/${series.handle}`} data-track="story_episode" className="btn btn--link mt-3 self-start">
        <span>See the test</span>
      </Link>
    </article>
  ))
  return (
    <section id="series" className="bg-white py-[28.432px] lg:py-[50.512px]">
      <div className="mx-auto max-w-[1216px] px-4 lg:px-0">
        <h2 className="type-section">From {series.title}</h2>
        <div className="mt-10 hidden grid-cols-4 gap-4 lg:grid">{cards}</div>
        <div className="mt-6 lg:hidden">
          <Carousel item="w-[233px]" gap="gap-4" arrows={false} label={series.title}>
            {cards}
          </Carousel>
        </div>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={`/stories/${series.handle}`} variant="light" track="series_story">
            See the full test
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
