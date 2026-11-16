import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { FitScales } from "@/components/fit-scale"
import { StockRow } from "@/components/home/in-stock-today"
import { ProductOffer } from "@/components/lp/product-offer"
import { ReasonBlock } from "@/components/lp/reason-block"
import { StickyCta } from "@/components/lp/sticky-cta"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
import { getProduct, getRegion, listOffers } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { formatMoney } from "@/lib/format"
import { getListicle, type ListicleReason } from "@/lib/landing/listicles"
import { POLICY } from "@/lib/policy"
import { colorThumbs, detailsOf, fitProfileOf, imagesFor, offerOf, oneSizeRange, price } from "@/lib/product"

export async function generateMetadata({ params }: PageProps<"/reasons/[handle]">): Promise<Metadata> {
  const listicle = getListicle((await params).handle)
  if (!listicle) return { title: "Not found" }
  return { title: listicle.title.replace("{count}", String(listicle.reasons.length)), description: listicle.description }
}

/**
 * Listicle (SITE_SPEC §12.2; the essay's "educate through a sequence of
 * reasons"), derived from Melin's article page: numbered reasons, an image
 * per reason, the fact behind each, and one simple onward action.
 */
export default function ListiclePage(props: PageProps<"/reasons/[handle]">) {
  return (
    <Suspense fallback={<div className="h-[80vh] animate-pulse bg-tile" />}>
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
  const reasons = listicle.reasons.filter((r) => (r.needs !== "story" || story) && (r.needs !== "fit_profile" || fit))
  const fill = (text: string) =>
    text
      .replace("{range}", oneSizeRange(product, POLICY.oneSize))
      .replace("{fabric}", (details.Fabric ?? "").toLowerCase())
      .replace("{Fabric}", details.Fabric ?? "")
      .replace("{crown}", details.Crown ?? "Low and unstructured")
      .replace("{returns}", POLICY.returns)
      .replace("{shipping}", POLICY.shipping)
      .replace("{dispatch}", POLICY.dispatch)
      .replace("{story}", story?.title ?? "")
  const title = listicle.title.replace("{count}", String(reasons.length))
  const name = product.title.replace(/^The /, "")
  const money = (n: number | null) => formatMoney(n, p.currency)

  const live = (r: ListicleReason) => {
    if (r.live === "fit_scales" && fit) return <div className="mb-4"><FitScales profile={fit} /></div>
    if (r.live === "stock") return <div className="mb-4 bg-tile px-4 py-6"><StockRow product={product} track="listicle_stock" /></div>
    if (r.live === "story" && story) {
      return (
        <blockquote className="mb-4 border-l-4 border-black pl-5 font-heading text-[22px] leading-[28.6px]">“{story.stance}”</blockquote>
      )
    }
    return null
  }

  const colourGrid = (
    <div className="mb-4 grid grid-cols-2 gap-4">
      {colorThumbs(product).map((c) => (
        <figure key={c.color}>
          <span className="relative block aspect-square bg-white">
            {imagesFor(product, c.color)[0] && <Image src={imagesFor(product, c.color)[0]} alt={`${product.title} in ${c.color}`} fill sizes="(min-width:1024px) 328px, 50vw" className="object-contain" />}
          </span>
          <figcaption className="mt-2 font-body text-[12px] leading-[18px] text-muted">{c.color}</figcaption>
        </figure>
      ))}
    </div>
  )

  return (
    <>
      <Track event="listicle_viewed" props={{ listicle: listicle.handle }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <div id="listicle-hook" className="relative aspect-[390/260] w-full bg-tile lg:aspect-[1440/412]">
        <Image src={listicle.heroImage.src} alt={listicle.heroImage.alt} fill preload sizes="100vw" className="cutout object-contain" />
      </div>
      <article className="container-article pt-[27px]">
        <p className="article-meta opacity-60">
          {reasons.length} Reasons <span className="pl-3">| {name}</span>
        </p>
        <h1 className="mt-3 article-h1">{title}</h1>
        <p className="mt-4 article-p">{listicle.dek}</p>
        <ol className="border-y border-tertiary">
          {reasons.map((r, i) => (
            <li key={r.title} className="flex h-10 items-center gap-3">
              <span className="font-heading text-[14px]">{i + 1}</span>
              <a href={`#reason-${i + 1}`} className="btn btn--micro" data-track="listicle_jump">
                <span>{r.title}</span>
              </a>
            </li>
          ))}
        </ol>

        {reasons.map((r, i) => (
          <div key={r.title}>
            <ReasonBlock n={i + 1} title={r.title} image={r.image} media={r.media === "color_grid" ? colourGrid : undefined} fact={fill(r.fact)}>
              {r.body.map((b) => (
                <p key={b}>{fill(b)}</p>
              ))}
              {live(r)}
            </ReasonBlock>
            {listicle.ctaAfter.includes(i + 1) && (
              <ButtonLink href="#buy" size="atc" block className="mt-8" track={i + 1 === reasons.length ? "listicle_end_cta" : "listicle_mid_cta"}>
                Shop the {name}
              </ButtonLink>
            )}
          </div>
        ))}

        <div className="mt-12">
          <ProductOffer
            product={product}
            id="buy"
            source="listicle"
            footer={
              offer && offerPrice !== null ? (
                <ButtonLink href={offerOf(offer)!.path} variant="link" className="mt-4 self-center" track="listicle_offer">
                  Or get two for {money(offerPrice)}
                </ButtonLink>
              ) : null
            }
          />
        </div>
        <hr className="mb-[50.512px] mt-12 border-0 border-t-4 border-black" />
      </article>
      <StickyCta
        label={`Shop the ${name} - ${money(p.amount)}`}
        thumb={imagesFor(product, colorThumbs(product)[0]?.color)[0] ?? null}
        href="#buy"
        track="listicle_sticky"
        afterId="listicle-hook"
        hideWhileId="buy"
      />
    </>
  )
}
