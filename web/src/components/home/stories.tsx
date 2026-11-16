import Image from "next/image"
import Link from "next/link"
import type { StoreSeries } from "@/lib/data/content"
import { ButtonLink } from "../ui/button"

type Post = { meta: string; title: string; excerpt: string; href: string; image: string; contain: boolean; track: string }

/** "Stories" in Melin's Blog slot (SITE_SPEC §6.1.9): two posts, image left, text right. */
export function Stories({ series }: { series: StoreSeries | null }) {
  const posts: Post[] = [
    ...(series
      ? [
          {
            meta: `Story | ${series.title}`,
            title: series.title,
            excerpt: series.stance ?? "",
            href: `/stories/${series.handle}`,
            image: "/hats/story-crush.jpg",
            contain: false,
            track: "home_story",
          },
        ]
      : []),
    {
      meta: "Guide | Fit",
      title: "Fit Guide",
      excerpt: "Crown height, structure and the one-size range, hat by hat.",
      href: "/fit-guide",
      image: "/hats/everyday-cap-black-3.jpg",
      contain: true,
      track: "fit_guide",
    },
  ]
  return (
    <section id="stories" className="bg-white py-[28.432px] lg:py-[50.512px]">
      <div className="px-[28px] lg:px-[51px]">
        <h2 className="type-section">Stories</h2>
        <div className="mt-6 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-0">
          {posts.map((p) => (
            <article key={p.href} className="flex">
              <Link href={p.href} data-track={p.track} className={`relative block h-[133px] w-[133px] shrink-0 lg:h-[251px] lg:w-[335px] ${p.contain ? "bg-tile" : ""}`}>
                <Image src={p.image} alt="" fill sizes="(min-width:1024px) 335px, 133px" className={p.contain ? "cutout object-contain" : "object-cover"} />
              </Link>
              <div className="flex min-w-0 flex-col justify-center px-4 lg:px-6">
                <p className="type-eyebrow uppercase">{p.meta}</p>
                <h3 className="mt-2 font-heading text-[16px] leading-[20.8px]">{p.title}</h3>
                <p className="mt-2 line-clamp-3 font-body text-[14px] leading-[21px]">{p.excerpt}</p>
                <ButtonLink href={p.href} variant="light" className="mt-4 hidden w-[136px] lg:inline-flex" track={p.track}>
                  Read more
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
