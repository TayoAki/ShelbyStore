import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { AdLabel } from "@/components/lp/ad-label"
import { OfferCard } from "@/components/lp/offer-card"
import { StickyCta } from "@/components/lp/sticky-cta"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
import { getProduct, getRegion, listOffers } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { getAdvertorial, type Advertorial } from "@/lib/landing/advertorials"
import { POLICY } from "@/lib/policy"
import { colorThumbs, offerOf, oneSizeRange, price } from "@/lib/product"
import type { Product } from "@/lib/types"

export async function generateMetadata({ params }: PageProps<"/read/[slug]">): Promise<Metadata> {
  const a = getAdvertorial((await params).slug)
  return a ? { title: a.headline, description: a.dek } : { title: "Not found" }
}

/** Minutes to read at 200 words a minute. */
function readTime(a: Advertorial) {
  const words = [a.headline, a.dek, ...a.blocks.map((b) => ("text" in b ? b.text : "caption" in b ? b.caption : ""))]
    .join(" ")
    .split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * Advertorial / presell (SITE_SPEC §12.3; the essay's "develop a story and
 * build belief", with sponsored labelling): an editorial article in Shelby's
 * voice, clearly marked as an advertisement, that argues problem → why →
 * what we changed → how we check it → offer. Success = onward clicks, then
 * purchases. Not linked from the nav: it's a paid-traffic landing page.
 */
export default function AdvertorialPage(props: PageProps<"/read/[slug]">) {
  return (
    <Suspense fallback={<div className="h-[80vh] animate-pulse bg-surface" />}>
      <ArticleContent params={props.params} />
    </Suspense>
  )
}

async function ArticleContent({ params }: { params: PageProps<"/read/[slug]">["params"] }) {
  const a = getAdvertorial((await params).slug)
  if (!a) notFound()
  const region = await getRegion()
  const product = region ? await getProduct(a.product, region.id) : null
  if (!region || !product) notFound()
  const [series, offers] = await Promise.all([listSeries(), listOffers(region.id)])
  const story = series.find((s) => s.stance) ?? null
  const offer = offers.find((o) => offerOf(o)?.singleHandle === product.handle) ?? null
  const p = price(product)
  const offerPrice = offer ? price(offer).amount : null
  const offerPath = offer ? offerOf(offer)!.path : null

  const fill = (t: string) =>
    t
      .replace("{range}", oneSizeRange(product, POLICY.oneSize))
      .replace("{price}", formatMoney(p.amount, p.currency))
      .replace("{offer_price}", offerPrice !== null ? formatMoney(offerPrice, p.currency) : "")
      .replace("{colours}", String(colorThumbs(product).length))
      .replace("{returns}", POLICY.returns.replace(/^./, (c) => c.toUpperCase()))
      // Without an offer, drop the "or two for" clause rather than leave a gap.
      .replace(/, or two for \./, ".")
  const date = new Date(`${a.published}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  return (
    <>
      <Track event="advertorial_viewed" props={{ slug: a.slug }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>

      <article className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 pb-16 pt-8 md:px-0 lg:pt-14">
        <header id="advertorial-head" className="flex flex-col gap-4">
          <AdLabel />
          <p className="text-eyebrow text-accent-ink">{a.kicker}</p>
          <h1 className="font-display text-[38px] leading-[0.95] lg:text-[56px]">{a.headline}</h1>
          <p className="text-[19px] leading-snug text-ink-muted lg:text-[21px]">{a.dek}</p>
          <p className="font-mono text-[12px] text-ink-muted">
            By Shelby · {readTime(a)} min read · <time dateTime={a.published}>{date}</time>
          </p>
        </header>

        <figure className="-mx-4 flex flex-col gap-2 md:mx-0">
          <div className="relative aspect-[16/10] overflow-hidden bg-paper">
            <Image src={a.lead.src} alt={a.lead.alt} fill preload sizes="(min-width:768px) 680px, 100vw" className="object-cover" />
          </div>
          <figcaption className="px-4 text-[13px] text-ink-muted md:px-0">{a.lead.caption}</figcaption>
        </figure>

        <div className="flex flex-col gap-5 text-[18px] leading-[1.65]">
          {a.blocks.map((b, i) => {
            if (b.kind === "p") return <p key={i}>{fill(b.text)}</p>
            if (b.kind === "h2")
              return (
                <h2 key={i} className="mt-4 font-display text-[28px] leading-none lg:text-[34px]">
                  {b.text}
                </h2>
              )
            if (b.kind === "figure")
              return (
                <figure key={i} className="my-2 flex flex-col gap-2">
                  <div className="relative aspect-[4/5] overflow-hidden bg-paper sm:aspect-[4/3]">
                    <Image src={b.src} alt={b.alt} fill sizes="(min-width:768px) 680px, 100vw" className="object-cover" />
                  </div>
                  <figcaption className="text-[13px] leading-snug text-ink-muted">{b.caption}</figcaption>
                </figure>
              )
            if (b.kind === "cta") {
              const href = b.to === "offer" && offerPath ? offerPath : `/products/${product.handle}`
              return (
                <p key={i}>
                  <ButtonLink href={href} variant="secondary" track={b.track}>
                    {b.label} →
                  </ButtonLink>
                </p>
              )
            }
            if (b.kind === "proof")
              return (
                <div key={i} className="flex flex-col gap-3 bg-paper p-5 text-[16px] leading-relaxed">
                  {story?.stance && (
                    <>
                      <p className="text-eyebrow text-accent-ink">{story.title}</p>
                      <blockquote>“{story.stance}”</blockquote>
                      <Link href={`/stories/${story.handle}`} className="w-fit text-[14px] underline underline-offset-4" data-track="advertorial_story">
                        Watch the test
                      </Link>
                    </>
                  )}
                  <Suspense fallback={<p className="text-[14px] text-ink-muted">Checking today&apos;s stock…</p>}>
                    <StockLine product={product} />
                  </Suspense>
                </div>
              )
            return null
          })}
        </div>

        <div id="advertorial-offer" className="scroll-mt-28">
          <OfferCard
            product={product}
            cta={`Shop the ${product.title.replace(/^The /, "")}`}
            track="advertorial_offer_pdp"
            second={
              offerPath && offerPrice !== null
                ? { href: offerPath, label: `Or get two for ${formatMoney(offerPrice, p.currency)} →`, track: "advertorial_offer_pack" }
                : null
            }
          />
        </div>

        <p className="border-t border-line pt-4 text-[12px] leading-relaxed text-ink-muted">
          This is an advertisement from Shelby, the company that makes the Everyday Cap.
        </p>
      </article>

      <StickyCta
        label={`Shop · ${formatMoney(p.amount, p.currency)}`}
        detail={product.title}
        href="#advertorial-offer"
        track="advertorial_sticky"
        afterId="advertorial-head"
        hideWhileId="advertorial-offer"
      />
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  )
}

/** Today's live count across the product's colours. */
async function StockLine({ product }: { product: Product }) {
  const stock = await getStock([product.id])
  const counts = (product.variants ?? []).map((v) => stock[v.id])
  if (!counts.length || counts.some((n) => n === null || n === undefined)) return null
  const total = counts.reduce<number>((s, n) => s + (n ?? 0), 0)
  const colours = colorThumbs(product).length
  return (
    <p className="text-[14px]">
      <span className="font-mono text-ok">● {total} in stock</span>
      <span className="text-ink-muted"> right now, across {colours} colours. Live from the warehouse.</span>
    </p>
  )
}
