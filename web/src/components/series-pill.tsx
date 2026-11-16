import Image from "next/image"
import Link from "next/link"
import { Reveal } from "./motion/reveal"

const PATH =
  "M 122.5 0.669 L 122.5 0.669 C 190.747 0.669 244.331 54.253 244.331 122.5 L 244.331 249.331 C 244.331 317.578 190.747 371.162 122.5 371.162 C 54.253 371.162 0.669 317.578 0.669 249.331 L 0.669 122.5 C 0.669 54.253 54.253 0.669 122.5 0.669"

/**
 * Brand pill with the content series (v5 §6.4.10, G.6.3 item 16): the pill
 * frame over a photo, the stance as the heading, the episode titles as the
 * marquee (M27, M27b).
 */
export function SeriesPill({ title, stance, href, episodes, cta = "SEE THE FULL TEST", track = "series_story" }: { title: string; stance: string; href: string; episodes: string[]; cta?: string; track?: string }) {
  return (
    <Reveal aria-label={title} className="relative mx-2.5 my-10 flex aspect-[0.63] flex-col overflow-hidden rounded-xl text-center text-white md:aspect-[2.56] md:rounded-3xl">
      <Image src="/hats/rope-lifestyle-hero.jpg" alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-black/25" />
      <svg viewBox="-5 -5 255 382" className="absolute inset-x-0 top-6 m-auto h-fit w-full px-8 md:inset-0 md:w-[calc(25%+5.3rem)] md:rotate-90" aria-hidden>
        <path d={PATH} fill="none" stroke="white" strokeWidth={0.662} />
        <rect x={12.669} y={12.669} width={219.663} height={346.663} rx={109.831} fill="none" stroke="white" strokeWidth={0.662} transform="rotate(-180 122.5 186)" />
        <rect x={24.669} y={24.669} width={195.663} height={322.663} rx={97.831} fill="#212121" fillOpacity={0.1} stroke="white" strokeWidth={0.662} transform="rotate(-180 122.5 186)" />
      </svg>
      <div className="pill-content relative z-10 m-auto flex max-w-[640px] flex-col items-center gap-3 max-md:px-16 max-md:pt-[30%] md:absolute md:inset-0 md:h-fit">
        <p className="font-mono text-xs leading-5 tracking-[.1em] uppercase">{title}</p>
        <p className="font-serif text-xl leading-7 italic lg:text-2xl lg:leading-8">{stance}</p>
        <Link href={href} className="btn btn-primary mx-auto my-2 w-fit" data-track={track}>
          {cta}
        </Link>
      </div>
      {episodes.length > 0 && (
        <div className="relative mt-auto mb-9 overflow-hidden" aria-hidden>
          <div className="animate-marquee flex w-max">
            {[0, 1].map((k) => (
              <ul key={k} className="flex">
                {episodes.map((e) => (
                  <li key={e} className="flex items-center gap-6 pr-6 font-mono text-xs leading-5 tracking-[.1em] whitespace-nowrap uppercase">
                    {e}
                    <span className="size-1.5 rounded-full bg-white" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}
    </Reveal>
  )
}
