import Image from "next/image"
import { listSeries } from "@/lib/data/content"
import { ButtonLink } from "./ui/button"

/**
 * Eastside's "Have you heard our story?" block (SITE_SPEC v8 E.6.3): one
 * blog-style card, the image at 4:3 beside the stance and a "Read the Story"
 * outline button (`series_story`). Hidden when there is no story.
 */
export async function StoryTeaser({ title = "Have you seen the crown test?", track = "series_story" }: { title?: string; track?: string }) {
  const series = (await listSeries())[0]
  if (!series) return null
  return (
    <section aria-labelledby="story-teaser" className="wrap py-12">
      <h2 id="story-teaser" className="title-blog">
        {title}
      </h2>
      <div className="mt-6 grid items-center gap-6 md:grid-cols-2 md:gap-10">
        <div className="relative aspect-[4/3] overflow-hidden bg-tile">
          <Image src="/hats/story-crush.jpg" alt="" fill sizes="(min-width: 750px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col items-start gap-3">
          <h3 className="title-card">{series.title}</h3>
          {series.stance && <p className="body-editorial max-w-[48ch]">{series.stance}</p>}
          <ButtonLink href={`/stories/${series.handle}`} variant="outline" className="mt-2" track={track}>
            Read the Story
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
