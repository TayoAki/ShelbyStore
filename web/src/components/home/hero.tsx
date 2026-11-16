import Image from "next/image"
import { formatMoney } from "@/lib/format"
import { meta, optionGroups, price } from "@/lib/product"
import type { Product, StoreRelease } from "@/lib/types"
import { Container } from "../container"
import { ButtonLink } from "../ui/button"

/**
 * Home hero (SITE_SPEC §6.1.1): the core cap with its price and CTA above the
 * fold on mobile, as live text (never baked into the image).
 */
export function Hero({ core, live }: { core: Product | null; live: StoreRelease | null }) {
  const title = core?.title ?? "The Everyday Cap"
  const promise = (core && meta(core, "promise")) ?? "The cap you reach for first."
  const p = core ? price(core) : null
  const colors = core ? (optionGroups(core).find((g) => /colou?r/i.test(g.title))?.values.length ?? 0) : 0
  const href = core ? `/products/${core.handle}` : "/shop"

  return (
    <section id="hero" className="border-b border-line">
      <div className="relative aspect-square w-full overflow-hidden bg-surface lg:hidden">
        <Image
          src="/hats/lifestyle-hero-mobile.jpg"
          alt="Someone wearing the washed black Everyday Cap on a coastal road"
          fill
          preload
          sizes="100vw"
          className="object-cover object-[50%_75%]"
        />
      </div>
      <Container className="grid gap-6 py-6 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-12 lg:py-10">
        <div className="flex flex-col items-start gap-4 lg:gap-6">
          <div className="flex flex-col gap-1.5">
            <p className="text-eyebrow text-ink-muted">The core · always in stock</p>
            {live && (
              <p className="text-eyebrow text-accent-ink">
                <span aria-hidden>● </span>
                {live.title} is live
              </p>
            )}
          </div>
          <h1 className="font-display text-hero">{title}</h1>
          <p className="max-w-md text-[16px] leading-relaxed text-ink-muted lg:text-[19px]">{promise}</p>
          {p && (
            <p className="flex items-baseline gap-3">
              <span className="font-mono text-[20px] lg:text-[24px]">{formatMoney(p.amount, p.currency)}</span>
              <span className="text-[13px] text-ink-muted">
                One size{colors > 1 ? ` · ${colors} colours` : ""}
              </span>
            </p>
          )}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <ButtonLink href={href} block track="hero_shop_core">
              Shop the {title.replace(/^The /, "")}
            </ButtonLink>
            {live ? (
              <ButtonLink href={`/drops/${live.handle}`} variant="secondary" block track="hero_shop_drop">
                Shop the drop
              </ButtonLink>
            ) : (
              <ButtonLink href="/shop" variant="ghost">
                All hats
              </ButtonLink>
            )}
          </div>
        </div>
        <div className="relative hidden aspect-[16/11] overflow-hidden bg-surface lg:block">
          <Image
            src="/hats/lifestyle-hero.jpg"
            alt="Someone wearing the washed black Everyday Cap on a coastal road"
            fill
            preload
            sizes="(min-width: 1024px) 58vw, 1px"
            className="object-cover object-[70%_50%]"
          />
        </div>
      </Container>
    </section>
  )
}
