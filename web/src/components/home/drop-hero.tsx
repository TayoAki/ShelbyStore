import Image from "next/image"
import type { Product, StoreRelease } from "@/lib/types"
import { Container } from "../container"
import { Badge } from "../ui/badge"
import { ButtonLink } from "../ui/button"

/** Campaign hero: the live drop, or the core tee when nothing is live (SITE_SPEC §6.1.1). */
export function DropHero({ live, core }: { live: StoreRelease | null; core: Product | null }) {
  const image = live?.hero_image ?? live?.products[0]?.thumbnail ?? core?.thumbnail ?? null
  const eyebrow = live ? (
    <Badge tone="live" dot>
      Live now
    </Badge>
  ) : (
    <Badge tone="core">The core</Badge>
  )
  const title = live?.title ?? core?.title ?? "The Everyday Tee"
  const promise =
    live?.product_promise ??
    ((core?.metadata as Record<string, unknown> | null)?.promise as string | undefined) ??
    "The tee you reach for first."
  const href = live ? `/drops/${live.handle}` : core ? `/products/${core.handle}` : "/shop"

  return (
    <section className="bg-surface">
      <Container className="grid gap-6 py-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-12">
        <div className="relative order-1 aspect-[4/5] overflow-hidden bg-surface-2 lg:order-2">
          {image && (
            <Image src={image} alt={title} fill preload sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          )}
        </div>
        <div className="order-2 flex flex-col items-start gap-5 lg:order-1">
          {eyebrow}
          <h1 className="font-display text-hero">{title}</h1>
          <p className="max-w-md text-[17px] leading-relaxed text-ink-muted lg:text-[19px]">{promise}</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href={href} block>
              {live ? "Shop the drop" : "Shop the core"}
            </ButtonLink>
            {live && (
              <ButtonLink href="/#core" variant="secondary" block>
                Shop the core
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
