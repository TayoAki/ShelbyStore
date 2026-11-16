import Image from "next/image"
import Link from "next/link"
import { Reveal } from "../motion/reveal"

/** "Stories" (v5 §6.1.9 newsroom grid, G.6.2 item 10): two posts in columns 2–3. */
export function Stories({ story }: { story: { title: string; handle: string; excerpt: string | null } | null }) {
  const posts = [
    ...(story
      ? [{ title: story.title, href: `/stories/${story.handle}`, image: "/hats/rope-brim.jpg", contain: false, excerpt: story.excerpt ?? "", track: "home_story" }]
      : []),
    { title: "Fit Guide", href: "/fit-guide", image: "/hats/rope-cap-tour-white-3.jpg", contain: true, excerpt: "One size, a mid crown and how to measure in a minute.", track: "fit_guide" },
  ]
  return (
    <Reveal id="stories" aria-label="Stories" className="px-5 py-10">
      <h2 className="mb-10 text-center font-display text-2xl leading-8 md:text-[30px] md:leading-9">Stories</h2>
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4 md:gap-5">
        {posts.map((p, i) => (
          <Link key={p.href} href={p.href} data-track={p.track} className={`block ${i === 0 ? "md:col-start-2" : ""}`}>
            <span className="relative block aspect-[5/4] overflow-hidden rounded-2xl bg-white">
              <Image src={p.image} alt="" fill sizes="(min-width: 768px) 25vw, 100vw" className={p.contain ? "object-contain" : "object-cover"} />
            </span>
            <h3 className="mt-6 mb-2 px-6 text-lg leading-7 lg:text-xl">{p.title}</h3>
            <p className="px-6 text-sm leading-5 text-light-charcoal">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </Reveal>
  )
}
