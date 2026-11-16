import Image from "next/image"
import { formatMoney } from "@/lib/format"
import { colorThumbs, price } from "@/lib/product"
import type { Product } from "@/lib/types"
import { ButtonLink } from "../ui/button"

/**
 * Home hero (SITE_SPEC §6.1.1): Melin's full-bleed photo hero (1440×810 /
 * 390×521), with the headline as live text (the page's one <h1>) and the core
 * cap's price in the first screen.
 */
export function Hero({ core }: { core: Product | null }) {
  const p = core ? price(core) : null
  const colors = core ? colorThumbs(core).length : 0
  const href = core ? `/products/${core.handle}` : "/shop"
  const line = core ? [core.title, p ? formatMoney(p.amount, p.currency) : null, colors ? `${colors} colors` : null].filter(Boolean).join(" · ") : null
  const alt = "Someone wearing the washed black Everyday Cap on a coastal road"
  return (
    <section id="hero" className="relative aspect-[390/521] w-full lg:aspect-video">
      <Image src="/hats/lifestyle-hero-mobile.jpg" alt={alt} fill preload sizes="100vw" className="object-cover object-[50%_70%] lg:hidden" />
      <Image src="/hats/lifestyle-hero.jpg" alt={alt} fill preload sizes="100vw" className="hidden object-cover object-[50%_50%] lg:block" />
      <div className="absolute left-5 top-16 max-w-[600px] text-black lg:left-[111px] lg:top-[164px]">
        <h1 className="font-heavy text-[24px] uppercase leading-[32px] tracking-[1.6px] lg:text-[44px] lg:leading-[57px] lg:tracking-[3px]">
          One cap.
          <br />
          Every color.
          <br />
          Always in stock.
        </h1>
        {line && <p className="mt-4 font-body text-[14px] leading-[21px] lg:mt-8 lg:text-[18px] lg:leading-[27px]">{line}</p>}
        <ButtonLink href={href} variant="light" size="hero" className="mt-4 lg:mt-6" track="hero_shop_core">
          Shop now
        </ButtonLink>
      </div>
    </section>
  )
}
