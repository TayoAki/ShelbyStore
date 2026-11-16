import Image from "next/image"
import { ButtonLink } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import { price } from "@/lib/product"
import { isWithinDays } from "@/lib/data/rope"
import { holeDate, pad2, type Hole } from "@/lib/rope"
import type { Product } from "@/lib/types"

/**
 * Home hero (v5 §6.1.1 box, G.6.2 item 1): full-bleed rounded photo, copy at
 * the bottom right, the cap and its live price in the first screen. M3 on load.
 */
export async function Hero({ core, next, pair }: { core: Product | null; next: Hole | null; pair: Product | null }) {
  const soon = next && (await isWithinDays(next.date, 60)) ? next : null
  const p = core ? price(core) : null
  return (
    <section
      id="hero"
      data-hero=""
      className="hero-in relative m-2.5 h-[calc(100svh-var(--hero-header-offset-mobile-lg)-var(--global-banner-height,32px))] overflow-hidden rounded-[20px] text-white md:h-[calc(100vh-var(--hero-header-offset-desktop-lg)-var(--global-banner-height,32px))]"
    >
      <Image src="/hats/rope-lifestyle-hero.jpg" alt="A golfer walking a links course in a Pine rope cap" fill preload sizes="100vw" className="hidden object-cover object-center md:block" />
      <Image src="/hats/rope-lifestyle-hero-mobile.jpg" alt="A golfer in a Pine rope cap on a links course" fill preload sizes="100vw" className="object-cover md:hidden" style={{ objectPosition: "50% 35%" }} />
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(0deg,rgba(0,0,0,.35),rgba(0,0,0,0))]" aria-hidden />
      <div className="hero-in-content pointer-events-none absolute inset-0 flex flex-col items-start justify-end p-8 pt-20 text-left md:items-end md:p-16 md:text-right">
        <p className="mb-4 font-mono text-xs leading-5 font-medium tracking-[.1em] uppercase">
          THE ROPE CAP · HOLE 1 · OUT NOW{soon ? ` · HOLE ${soon.hole} ${(holeDate(soon.date).day ?? "").replace(/ \d{4}$/, "")}` : ""}
        </p>
        <h1 className="mb-2 font-display text-2xl leading-8 tracking-[.025em]">One rope cap. Made properly.</h1>
        <p className="kicker mb-2 text-white">Mid crown. Washed cotton. A rope worth looking at.</p>
        {core && (
          <p className="mb-6 text-sm leading-5">
            The Rope Cap · {formatMoney(p?.amount, p?.currency)} · 4 colors
          </p>
        )}
        <div className="pointer-events-auto grid grid-cols-2 gap-2">
          <ButtonLink href="/products/rope-cap" variant="primary" track="hero_shop_core">
            SHOP THE ROPE CAP
          </ButtonLink>
          {pair && (
            <ButtonLink href="/offer/the-pair" variant="primary" track="hero_shop_pair">
              THE PAIR · {formatMoney(price(pair).amount)}
            </ButtonLink>
          )}
        </div>
      </div>
      <span className="sr-only">{next ? `Next: Hole ${pad2(next.hole)}` : ""}</span>
    </section>
  )
}
