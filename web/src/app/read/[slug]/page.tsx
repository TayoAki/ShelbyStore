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
import { colorThumbs, imagesFor, offerOf, oneSizeRange, price } from "@/lib/product"
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
    <Suspense fallback={<div className="h-[80vh] animate-pulse bg-tile" />}>
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
      .replace("{colors}", String(colorThumbs(product).length))
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
      <div className="relative aspect-[390/260] w-full bg-tile lg:aspect-[1440/412]">
        <Image src="/hats/story-crush.jpg" alt={a.lead.alt} fill preload sizes="100vw" className="object-cover" />
      </div>
      <article className="container-article pb-[50.512px] pt-[27px]">
        <header id="advertorial-head">
          <AdLabel />
          <p className="mt-3 article-meta opacity-60">{a.kicker}</p>
          <h1 className="mt-3 article-h1">{a.headline}</h1>
          <p className="mt-4 font-body text-[18px] leading-[27px] tracking-[-0.12px]">{a.dek}</p>
          <p className="mt-4 font-body text-[12px] uppercase tracking-[0.48px]">
            By Shelby <span className="px-2">|</span> {readTime(a)} min read <span className="px-2">|</span> <time dateTime={a.published}>{date}</time>
          </p>
        </header>

        <div className="mt-6">
          {a.blocks.map((b, i) => {
            if (b.kind === "p") return <p key={i} className="article-p">{fill(b.text)}</p>
            if (b.kind === "h2")
              return (
                <h2 key={i} className="article-h2">
                  {b.text}
                </h2>
              )
            if (b.kind === "figure")
              return (
                <figure key={i} className="my-6">
                  <span className={`relative block aspect-square max-h-[448px] w-full ${/-\d\.jpg$/.test(b.src) ? "bg-white" : ""}`}>
                    <Image src={b.src} alt={b.alt} fill sizes="(min-width:1024px) 672px, 100vw" className={/-\d\.jpg$/.test(b.src) ? "object-contain" : "object-cover"} />
                  </span>
                  <figcaption className="mt-2 font-body text-[12px] leading-[18px] text-muted">{b.caption}</figcaption>
                </figure>
              )
            if (b.kind === "cta") {
              const href = b.to === "offer" && offerPath ? offerPath : `/products/${product.handle}`
              return (
                <p key={i} className="my-6">
                  <ButtonLink href={href} variant="light" track={b.track}>
                    {b.label}
                  </ButtonLink>
                </p>
              )
            }
            if (b.kind === "proof")
              return (
                <div key={i} className="my-6 bg-band p-6">
                  {story?.stance && (
                    <>
                      <blockquote className="border-l-4 border-black pl-5 font-heading text-[22px] leading-[28.6px]">“{story.stance}”</blockquote>
                      <Link href={`/stories/${story.handle}`} className="btn btn--micro mt-4" data-track="advertorial_story">
                        <span>Watch the test</span>
                      </Link>
                    </>
                  )}
                  <Suspense fallback={<p className="mt-4 font-body text-[14px] text-muted">Checking today&apos;s stock…</p>}>
                    <StockLine product={product} />
                  </Suspense>
                </div>
              )
            return null
          })}
        </div>

        <div id="advertorial-offer" className="mt-10 scroll-mt-[130px]">
          <OfferCard
            product={product}
            cta={`Shop the ${product.title.replace(/^The /, "")}`}
            track="advertorial_offer_pdp"
            second={
              offerPath && offerPrice !== null
                ? { href: offerPath, label: `Or get two for ${formatMoney(offerPrice, p.currency)}`, track: "advertorial_offer_pack" }
                : null
            }
          />
        </div>
        <hr className="mb-6 mt-12 border-0 border-t-4 border-black" />
        <p className="font-body text-[13px] leading-[19.5px] text-muted">
          This is an advertisement from Shelby, the company that makes the Everyday Cap.
        </p>
      </article>

      <StickyCta
        label={`Shop - ${formatMoney(p.amount, p.currency)}`}
        thumb={imagesFor(product, colorThumbs(product)[0]?.color)[0] ?? null}
        href="#advertorial-offer"
        track="advertorial_sticky"
        afterId="advertorial-head"
        hideWhileId="advertorial-offer"
      />
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
    <p className="mt-4 flex items-center gap-2 font-body text-[14px]">
      <span aria-hidden className="h-[10px] w-[10px] rounded-full bg-instock" />
      <span>
        <span className="font-heading">{total} in stock</span> right now, across {colours} colors. Live from the warehouse.
      </span>
    </p>
  )
}
