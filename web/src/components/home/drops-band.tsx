import Image from "next/image"
import Link from "next/link"
import { formatDropDate } from "@/lib/format"
import { imageUrl } from "@/lib/product"
import type { StoreRelease } from "@/lib/types"
import { Container } from "../container"
import { Countdown } from "../countdown"
import { NotifyForm } from "../notify-form"
import { Badge } from "../ui/badge"
import { ButtonLink } from "../ui/button"

/**
 * Drops on an ink band (SITE_SPEC §6.1.4): the live drop, a real countdown to
 * the next release's release_at, and anything further out.
 */
export function DropsBand({ live, upcoming }: { live: StoreRelease | null; upcoming: StoreRelease[] }) {
  const dated = upcoming.filter((r) => r.release_at).sort((a, b) => Date.parse(a.release_at!) - Date.parse(b.release_at!))
  const next = dated[0] ?? null
  const later = upcoming.filter((r) => r !== next)
  if (!live && !next) return null

  return (
    <section id="drops" className="scroll-mt-28 bg-ink py-12 text-page lg:py-20">
      <Container className="flex flex-col gap-10 lg:gap-14">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-eyebrow text-ink-inverse-muted">Small releases, on a calendar</p>
            <h2 className="font-display text-section">Drops</h2>
          </div>
          <Link href="/drops" className="text-[14px] underline underline-offset-4 hover:text-ink-inverse-muted">
            All drops
          </Link>
        </div>

        <div className={`grid gap-10 ${live && next ? "lg:grid-cols-2 lg:gap-16" : ""}`}>
          {live && <LiveDrop release={live} />}
          {next && <NextDrop release={next} />}
        </div>

        {later.length > 0 && (
          <ul className="flex flex-col border-t border-white/15">
            {later.map((r) => (
              <li key={r.id} className="border-b border-white/15">
                <Link href={`/drops/${r.handle}`} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                  <span className="font-display text-[24px] leading-none">{r.title}</span>
                  <span className="font-mono text-[13px] text-accent">{formatDropDate(r.release_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}

function LiveDrop({ release }: { release: StoreRelease }) {
  const image = imageUrl(release.hero_image ?? release.products[0]?.thumbnail)
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 lg:gap-6">
      <Link href={`/drops/${release.handle}`} className="relative aspect-[4/5] overflow-hidden bg-page">
        {image && <Image src={image} alt={release.title} fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />}
      </Link>
      <div className="flex flex-col items-start gap-3">
        <Badge tone="live" dot>
          Live now
        </Badge>
        <h3 className="font-display text-[34px] leading-[0.95] lg:text-[48px]">{release.title}</h3>
        {release.product_promise && <p className="text-[15px] text-ink-inverse-muted">{release.product_promise}</p>}
        <ButtonLink href={`/drops/${release.handle}`} variant="inverse" track="hero_shop_drop" className="mt-2">
          Shop the drop
        </ButtonLink>
      </div>
    </div>
  )
}

function NextDrop({ release }: { release: StoreRelease }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow text-accent">Next drop · {formatDropDate(release.release_at)}</p>
        <Link href={`/drops/${release.handle}`} className="font-display text-[34px] leading-[0.95] hover:text-ink-inverse-muted lg:text-[48px]">
          {release.title}
        </Link>
        {release.product_promise && <p className="text-[15px] text-ink-inverse-muted">{release.product_promise}</p>}
      </div>
      <Countdown iso={release.release_at!} />
      <div className="flex flex-col gap-2">
        <p className="text-[13px] text-ink-inverse-muted">Get an email the moment it drops.</p>
        <NotifyForm releaseId={release.id} compact tone="dark" />
      </div>
    </div>
  )
}
