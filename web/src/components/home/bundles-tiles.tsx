import Image from "next/image"
import Link from "next/link"
import { Reveal } from "../motion/reveal"

type Tile = { key: string; title: string; line: string; cta: string; href: string; track: string; images: string[]; bg: string }

/**
 * "One, two or four" (v5 §6.1.5 promo tiles 3-up, G.6.2 item 5): sage and golf
 * tint tiles, photos in white discs/pills/squares, serif italic titles, live
 * prices, zoom on hover (M6) and the content stagger (M7).
 */
export function BundlesTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <Reveal id="bundles" aria-label="One, two or four" className="grid gap-8 px-2.5 md:grid-cols-3 md:gap-2.5">
      {tiles.map((t, i) => (
        <div key={t.key} className="group relative aspect-[7/10] w-full overflow-hidden rounded-3xl" style={{ background: t.bg }}>
          <div className="absolute inset-x-[10%] top-[12%] flex justify-center transition-transform duration-900 ease-in-out group-hover:scale-[1.08]">
            {t.images.length === 1 ? (
              <div className="relative aspect-square w-[78%] overflow-hidden rounded-full bg-white">
                <Image src={t.images[0]} alt="" fill sizes="(min-width: 768px) 25vw, 70vw" className="object-contain p-[8%]" />
              </div>
            ) : t.images.length === 2 ? (
              <div className="grid aspect-[2/1] w-full grid-cols-2 overflow-hidden rounded-full bg-white px-[6%]">
                {t.images.map((src) => (
                  <div key={src} className="relative">
                    <Image src={src} alt="" fill sizes="(min-width: 768px) 13vw, 40vw" className="object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid aspect-square w-[78%] grid-cols-2 overflow-hidden rounded-2xl bg-white p-2">
                {t.images.map((src) => (
                  <div key={src} className="relative">
                    <Image src={src} alt="" fill sizes="(min-width: 768px) 12vw, 35vw" className="object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div data-reveal-child="" style={{ ["--i" as string]: i, ["--stagger" as string]: ".05s", ["--d" as string]: ".8s" }} className="absolute inset-x-0 bottom-[22%] flex flex-col items-center gap-1 text-center text-black select-none">
            <h3 className="font-serif text-[30px] leading-[38px] italic md:text-[40px] md:leading-[48px]">{t.title}</h3>
            <p className="font-mono text-xs leading-5 tracking-[.1em]">{t.line}</p>
          </div>
          <div className="absolute inset-x-2.5 bottom-2.5 flex gap-2.5 md:inset-x-5 md:bottom-5">
            <Link href={t.href} className="btn btn-outline-black w-full" data-track={t.track}>
              {t.cta}
            </Link>
          </div>
        </div>
      ))}
    </Reveal>
  )
}
