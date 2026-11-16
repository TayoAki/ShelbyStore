import Image from "next/image"
import { formatDropDate } from "@/lib/format"
import type { StoreRelease } from "@/lib/types"
import { LIFESTYLE } from "../pdp/details-band"
import { ButtonLink } from "../ui/button"

/**
 * Drop banner in Melin's seasonal-campaign slot (SITE_SPEC §6.1.3): full-bleed
 * lifestyle photo, bottom scrim, centred eyebrow + campaign title + outline
 * button. The live drop first, else the next upcoming one.
 */
export function DropBanner({ live, next }: { live: StoreRelease | null; next: StoreRelease | null }) {
  const release = live ?? next
  if (!release) return null
  const image = LIFESTYLE[release.products[0]?.handle ?? ""] ?? "/hats/lifestyle-corduroy.jpg"
  return (
    <section id="drop" className="relative aspect-[390/520] w-full lg:aspect-[2/1]">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover object-[50%_35%]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.45)_0%,rgba(0,0,0,0)_55%)]" />
      <div className="absolute inset-x-4 bottom-8 flex flex-col items-center text-center text-white lg:bottom-16">
        <p className="font-body text-[14px] uppercase tracking-[4px]">
          {live ? "Limited release · Live now" : `Next drop · ${formatDropDate(release.release_at)}`}
        </p>
        <h2 className="mt-3 font-campaign text-[32px] uppercase leading-none tracking-[3px] lg:text-[48px]">{release.title}</h2>
        <ButtonLink
          href={live ? `/drops/${release.handle}` : `/drops/${release.handle}#notify`}
          variant="highlight"
          className="mt-5"
          track={live ? "hero_shop_drop" : "notify_me"}
        >
          {live ? "Shop the drop" : "Get notified"}
        </ButtonLink>
      </div>
    </section>
  )
}
