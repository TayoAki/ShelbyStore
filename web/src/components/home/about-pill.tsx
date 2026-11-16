import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { Reveal } from "../motion/reveal"

/**
 * "About Shelby" (v5 §6.1.8 expanding pill window, G.6.2 item 8): the window
 * opens from the centre, the borders grow, then the serif quote fades in (M28).
 */
const ABOUT =
  "We make one rope cap. We kept the crown lower than most, washed the cotton until it felt broken in, and put a rope on it worth looking at. Each season gets a new numbered color."

/** Also the story page's stance window (G.6.14): pass `quote`, `label` and `cta`. */
export function AboutPill({
  id = "about",
  label = "About Shelby",
  quote = ABOUT,
  cta,
}: {
  id?: string
  label?: string
  quote?: string
  cta?: ReactNode | null
} = {}) {
  return (
    <Reveal id={id} aria-label={label} className="relative mx-2.5 my-10 flex flex-col items-center rounded-xl pt-20 pb-6 md:rounded-3xl md:pt-22">
      <div className="relative flex items-center justify-center">
        <span className="pill-border pointer-events-none absolute h-[102vw] w-[67vw] rounded-full border-[1.4px] border-[#21212180] md:h-[43vw] md:w-[68vw] 2xl:h-[40vw] 2xl:w-[65vw]" aria-hidden />
        <span className="pill-border pointer-events-none absolute h-[98vw] w-[63vw] rounded-full border-[1.4px] border-[#21212180] md:h-[40vw] md:w-[65vw] 2xl:h-[37vw] 2xl:w-[62vw]" aria-hidden />
        <div className="pill-window relative mx-auto flex h-[94vw] w-[59vw] flex-col items-center justify-center gap-4 overflow-hidden rounded-full md:h-[37vw] md:w-[62vw] 2xl:h-[34vw] 2xl:w-[59vw]">
          <Image src="/hats/rope-brim.jpg" alt="" fill sizes="62vw" className="-z-10 rounded-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-black/30" />
          <p className="pill-quote max-w-[85%] text-center font-serif text-base leading-6 text-white italic md:max-w-[80%] md:text-lg md:leading-8 lg:text-2xl lg:leading-10">
            {quote}
          </p>
        </div>
      </div>
      {cta === undefined ? (
        <Link href="/reasons/rope-cap" className="btn btn-secondary mt-10" data-track="home_reasons">
          WHY THE ROPE CAP
        </Link>
      ) : (
        cta
      )}
    </Reveal>
  )
}
