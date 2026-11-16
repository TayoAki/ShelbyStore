import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { ContinuityBanner } from "@/components/continuity-banner"
import { FitScales } from "@/components/fit-scale"
import { ProductOffer } from "@/components/lp/product-offer"
import { ReasonBlock } from "@/components/lp/reason-block"
import { StickyCta } from "@/components/lp/sticky-cta"
import { StockList } from "@/components/lp/stock-list"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
import { getProduct, getRegion, listOffers } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { formatMoney } from "@/lib/format"
import { getListicle, type ListicleReason } from "@/lib/landing/listicles"
import { POLICY } from "@/lib/policy"
import { colorThumbs, detailsOf, fitProfileOf, offerOf, oneSizeRange, price } from "@/lib/product"

export async function generateMetadata({ params }: PageProps<"/reasons/[handle]">): Promise<Metadata> {
  const listicle = getListicle((await params).handle)
  if (!listicle) return { title: "Not found" }
  return { title: listicle.title.replace("{count}", String(listicle.reasons.length)), description: listicle.description }
}

/**
 * Listicle (SITE_SPEC §12.2; the essay's "educate through a sequence of
 * reasons" for curiosity-driven, less-informed visitors): numbered reasons,
 * an image per reason, a fact behind each, and one simple onward action.
 */
export default function ListiclePage(props: PageProps<"/reasons/[handle]">) {
  return (
    <Suspense fallback={<div className="h-[80vh] animate-pulse bg-surface" />}>
      <ListicleContent params={props.params} />
    </Suspense>
  )
}

async function ListicleContent({ params }: { params: PageProps<"/reasons/[handle]">["params"] }) {
  const listicle = getListicle((await params).handle)
  if (!listicle) notFound()
  const region = await getRegion()
  const product = region ? await getProduct(listicle.product, region.id) : null
  if (!region || !product) notFound()
  const [series, offers] = await Promise.all([listSeries(), listOffers(region.id)])

  const story = series.find((s) => s.stance) ?? null
  const fit = fitProfileOf(product)
  const details = Object.fromEntries(detailsOf(product))
  const p = price(product)
  const offer = offers.find((o) => offerOf(o)?.singleHandle === product.handle) ?? null
  const offerPrice = offer ? price(offer).amount : null

  // Drop reasons whose source is missing; never fill them in.
  const reasons = listicle.reasons.filter(
    (r) => (r.needs !== "story" || story) && (r.needs !== "fit_profile" || fit)
  )
  const fill = (text: string) =>
    text
      .replace("{range}", oneSizeRange(product, POLICY.oneSize))
      .replace("{fabric}", (details.Fabric ?? "").toLowerCase())
      .replace("{crown}", details.Crown ?? "Low and unstructured")
      .replace("{returns}", POLICY.returns)
      .replace("{shipping}", POLICY.shipping)
      .replace("{dispatch}", POLICY.dispatch)
  const title = listicle.title.replace("{count}", String(reasons.length))
  const name = product.title.replace(/^The /, "")

  const live = (r: ListicleReason) => {
    if (r.live === "fit_scales" && fit) return <FitScales profile={fit} />
    if (r.live === "stock") return <StockList product={product} track="listicle_stock" />
    if (r.live === "story" && story) {
      return (
        <figure className="flex flex-col gap-3 border-l-2 border-accent pl-4">
          <blockquote className="text-[18px] leading-snug text-ink">“{story.stance}”</blockquote>
          <figcaption className="text-[13px]">
            {story.title} ·{" "}
            <Link href={`/stories/${story.handle}`} className="underline underline-offset-4 hover:text-ink-muted" data-track="listicle_story">
              Watch the test
            </Link>
          </figcaption>
        </figure>
      )
    }
    return null
  }

  const colourGrid = (
    <div className="grid grid-cols-2 gap-2">
      {colorThumbs(product).map((c) => (
        <figure key={c.color} className="flex flex-col gap-1">
          <div className="relative aspect-[4/5] overflow-hidden bg-paper">
            {c.image && <Image src={c.image} alt={`${product.title} in ${c.color}`} fill sizes="(min-width:1024px) 22vw, 50vw" className="object-cover" />}
          </div>
          <figcaption className="font-mono text-[11px] text-ink-muted">{c.color}</figcaption>
        </figure>
      ))}
    </div>
  )

  const cta = (track: string) => (
    <div className="flex flex-col items-start gap-3 border-t border-line py-8 sm:flex-row sm:items-center sm:gap-6">
      <ButtonLink href="#buy" track={track}>
        Shop the {name} · {formatMoney(p.amount, p.currency)}
      </ButtonLink>
      {offer && offerPrice !== null && (
        <Link href={offerOf(offer)!.path} className="text-[14px] underline underline-offset-4 hover:text-ink-muted" data-track="listicle_offer">
          Or get two for {formatMoney(offerPrice, p.currency)}
        </Link>
      )}
    </div>
  )

  return (
    <>
      <Track event="listicle_viewed" props={{ listicle: listicle.handle }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>

      {/* Hook + numbered jump list */}
      <section id="listicle-hook" className="bg-surface">
        <Container className="grid gap-8 py-8 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-16">
          <div className="relative aspect-[16/9] overflow-hidden bg-paper lg:order-2 lg:aspect-[4/3]">
            <Image src={listicle.heroImage.src} alt={listicle.heroImage.alt} fill preload sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-eyebrow text-ink-muted">
              {reasons.length} reasons · {listicle.eyebrow}
            </p>
            <h1 className="font-display text-[40px] leading-[0.92] lg:text-[64px]">{title}</h1>
            <p className="max-w-lg text-[17px] leading-relaxed text-ink-muted">{listicle.dek}</p>
            <ol className="flex flex-col border-t border-line">
              {reasons.map((r, i) => (
                <li key={r.title} className="border-b border-line">
                  <a href={`#reason-${i + 1}`} className="flex items-baseline gap-4 py-2.5 text-[15px] hover:underline" data-track="listicle_jump">
                    <span className="font-mono text-[12px] text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
                    {r.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* The reasons */}
      <Container>
        {reasons.map((r, i) => (
          <div key={r.title}>
            <ReasonBlock n={i + 1} title={r.title} image={r.image} media={r.media === "colour_grid" ? colourGrid : undefined} flip={i % 2 === 1}>
              {r.body.map((b) => (
                <p key={b}>{fill(b)}</p>
              ))}
              {live(r)}
            </ReasonBlock>
            {listicle.ctaAfter.includes(i + 1) && cta(i + 1 === reasons.length ? "listicle_end_cta" : "listicle_mid_cta")}
          </div>
        ))}
      </Container>

      {/* The buy block */}
      <ProductOffer
        product={product}
        id="buy"
        source="listicle"
        footer={
          offer && offerPrice !== null ? (
            <Link href={offerOf(offer)!.path} className="text-[14px] underline underline-offset-4 hover:text-ink-muted" data-track="listicle_offer">
              Or get two for {formatMoney(offerPrice, p.currency)} →
            </Link>
          ) : null
        }
      />

      <StickyCta
        label={`Shop · ${formatMoney(p.amount, p.currency)}`}
        detail={product.title}
        href="#buy"
        track="listicle_sticky"
        afterId="listicle-hook"
        hideWhileId="buy"
      />
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  )
}

