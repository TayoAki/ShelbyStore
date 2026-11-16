import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { Accordion } from "@/components/accordion"
import { Carousel } from "@/components/carousel"
import { ContinuityBanner } from "@/components/continuity-banner"
import { FitScales } from "@/components/fit-scale"
import { OfferRow } from "@/components/offer/offer-row"
import { BuyBox } from "@/components/pdp/buy-box"
import { DetailsBand, LIFESTYLE } from "@/components/pdp/details-band"
import { Gallery } from "@/components/pdp/gallery"
import { SelectionProvider } from "@/components/pdp/selection"
import { RETURNS_PERK, SHIPPING_PERK, STOCK_PERK, type Perk } from "@/components/perks"
import { cardStatus, ProductCard } from "@/components/product-card"
import { RecordView, ViewedCarousel } from "@/components/recently-viewed"
import { Track } from "@/components/track"
import { catalogItems } from "@/lib/catalog-items"
import { getProduct, getRegion, liveReleaseIndex, listOffers, listProducts } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import {
  colorThumbs,
  detailsOf,
  fitProfileOf,
  imagesFor,
  isOneSize,
  meta,
  offerOf,
  oneSizeRange,
  price,
  productTypeOf,
  shapeOf,
  sizeChartOf,
} from "@/lib/product"
import type { Product } from "@/lib/types"

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const region = await getRegion()
  const product = region ? await getProduct(handle, region.id) : null
  return product
    ? { title: product.title, description: meta(product, "promise") ?? product.description ?? undefined }
    : { title: "Not found" }
}

export default function ProductPage(props: PageProps<"/products/[handle]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  )
}

/** Melin's PDP (SITE_SPEC §6.4). */
async function ProductContent({
  params,
  searchParams,
}: {
  params: PageProps<"/products/[handle]">["params"]
  searchParams: PageProps<"/products/[handle]">["searchParams"]
}) {
  const [{ handle }, query] = await Promise.all([params, searchParams])
  const region = await getRegion()
  if (!region) notFound()
  const [product, releases, all, offers] = await Promise.all([
    getProduct(handle, region.id),
    liveReleaseIndex(),
    listProducts(region.id),
    listOffers(region.id),
  ])
  if (!product) notFound()
  const ownOffer = offerOf(product)
  if (ownOffer) redirect(ownOffer.path)

  const offer = offers.find((o) => offerOf(o)?.singleHandle === product.handle) ?? null
  const offerPrice = offer ? price(offer).amount : null
  const singlePrice = price(product).amount
  const offerSaving = offerPrice !== null && singlePrice !== null ? singlePrice * 2 - offerPrice : null

  const release = releases[product.id] ?? null
  const isCore = product.collection?.handle === "core"
  const md = (product.metadata ?? {}) as Record<string, unknown>
  const colors = colorThumbs(product).map((c) => c.color)
  const requested = typeof query.color === "string" ? query.color : null
  const initialColor = requested && colors.includes(requested) ? requested : (colors[0] ?? null)
  const imagesByColor = Object.fromEntries(colors.map((c) => [c, imagesFor(product, c)]))
  const p = price(product)
  const fitNotes = meta(product, "fit_notes")
  const sizeChart = sizeChartOf(product)
  const shape = shapeOf(product)
  const profile = fitProfileOf(product)
  const care = Object.fromEntries(detailsOf(product)).Care
  const oneSize = isOneSize(product)
  const perks: Perk[] = [
    SHIPPING_PERK,
    RETURNS_PERK,
    oneSize
      ? { icon: "ruler", title: "One Size, Adjustable", detail: cap(oneSizeRange(product, POLICY.oneSize)) + "." }
      : { icon: "ruler", title: "Sized S/M & L/XL", detail: "Measure around your head just above the ears." },
    STOCK_PERK,
    ...(care ? [{ icon: "care" as const, title: "Product Care", detail: care }] : []),
  ]

  const myShape = shape?.handle
  const alsoLike = all
    .filter((x) => x.id !== product.id)
    .sort((a, b) => {
      const score = (x: Product) => (shapeOf(x)?.handle !== myShape ? 0 : 2) + (x.collection?.handle === "core" ? 0 : 1)
      return score(a) - score(b)
    })
  const lifestyle = LIFESTYLE[product.handle] ?? null
  const description = product.description ? (
    <p className="line-clamp-4 font-system text-[16px] leading-6">{product.description}</p>
  ) : null

  const buyBoxProps = {
    product,
    release,
    fitNotes,
    sizeChart,
    perks,
    sticky: true,
    addOn:
      offer && offerPrice !== null ? (
        <OfferRow
          href={offerOf(offer)!.path}
          title="The Two-Pack"
          subtitle="Any two colors"
          price={offerPrice}
          saving={offerSaving}
          currency={p.currency}
          image="/hats/everyday-cap-black-1.jpg"
          track="pdp_offer"
        />
      ) : undefined,
  }

  return (
    <>
      <Track event="product_viewed" props={{ product_id: product.id, handle: product.handle, release_id: release?.id }} />
      <RecordView handle={product.handle} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <SelectionProvider initialColor={initialColor}>
        <div className="container-shop grid gap-6 pb-[28.432px] pt-0 lg:grid-cols-[minmax(0,740px)_370px] lg:justify-between lg:gap-[68px] lg:pb-[50.512px] lg:pt-[21px]">
          <div className="-mx-[21.328px] lg:mx-0">
            <Gallery
              images={imagesFor(product)}
              imagesByColor={imagesByColor}
              title={product.title}
              videoUrl={typeof md.video_url === "string" ? md.video_url : null}
              badge={release ? "Limited" : isCore ? "Core" : null}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between">
              <h1 className="pr-[10px] font-body text-[20px] uppercase leading-[25px]">{product.title}</h1>
              <span className="font-body text-[18px] leading-[25px]">{formatMoney(p.amount, p.currency)}</span>
            </div>
            <p className="mt-[2px] font-body text-[15px] leading-[19.5px] text-muted">{productTypeOf(product)}</p>
            <nav aria-label="Breadcrumb" className="mt-4 font-body text-[12px] leading-[18px]">
              <Link href="/shop" className="hover:underline">
                Shop All
              </Link>
              {shape && (
                <>
                  {" > "}
                  <Link href={`/shop?shape=${shape.handle}`} className="hover:underline">
                    {shape.name}
                  </Link>
                </>
              )}
              {" > "}
              <span className="text-muted" aria-current="page">
                {product.title}
              </span>
            </nav>
            {description && <div className="mt-3 hidden lg:block">{description}</div>}
            <hr className="my-5 border-line" />
            <Suspense fallback={<BuyBox {...buyBoxProps} stock={null} />}>
              <LiveBuyBox {...buyBoxProps} />
            </Suspense>
            {description && <div className="mt-4 lg:hidden">{description}</div>}
            {profile && (
              <div className="mt-6 border-t border-line pt-6">
                <h4 className="mb-5 font-heading text-[18px] leading-[23.4px]">Fit Guide</h4>
                <FitScales profile={profile} />
                <Link href={`/fit-guide#${product.handle}`} className="btn btn--micro mt-4" data-track="fit_guide">
                  <span>Read the fit guide</span>
                </Link>
              </div>
            )}
            <div className="mt-6">
              <Accordion title="Shipping & Returns">
                {POLICY.shipping}. {POLICY.dispatch}. Returns are accepted within 30 days of delivery.{" "}
                <Link href="/help/shipping-returns" className="underline">
                  Full policy
                </Link>
              </Accordion>
            </div>
          </div>
        </div>
      </SelectionProvider>

      <DetailsBand product={product} color={initialColor} />
      {lifestyle && (
        <section className="bg-band pb-[28.432px] lg:pb-[50.512px]">
          <div className="container-shop">
            <h2 className="mb-[22.08px] type-section">Gallery</h2>
            <div className="relative aspect-[4/5] lg:aspect-video">
              <Image src={lifestyle} alt={`${product.title}, worn`} fill sizes="(min-width:1024px) 1178px, 100vw" className="object-cover" />
            </div>
          </div>
        </section>
      )}
      {alsoLike.length > 0 && (
        <section className="bg-band py-[28.432px] lg:py-[50.512px]">
          <div className="container-shop">
            <h2 className="mb-[22.08px] type-section">You May Also Like</h2>
            <Suspense fallback={<AlsoLike products={alsoLike} releases={releases} />}>
              <AlsoLikeLive products={alsoLike} releases={releases} />
            </Suspense>
          </div>
        </section>
      )}
      <ViewedCarousel catalog={catalogItems(all)} exclude={product.handle} />
    </>
  )
}

async function LiveBuyBox(props: Omit<Parameters<typeof BuyBox>[0], "stock">) {
  const stock = await getStock([props.product.id])
  return <BuyBox {...props} stock={stock} />
}

async function AlsoLikeLive({ products, releases }: { products: Product[]; releases: Record<string, { id: string }> }) {
  const stock = await getStock(products.map((p) => p.id))
  return <AlsoLike products={products} releases={releases} stock={stock} />
}

function AlsoLike({
  products,
  releases,
  stock,
}: {
  products: Product[]
  releases: Record<string, { id: string }>
  stock?: Record<string, number | null>
}) {
  return (
    <Carousel label="You may also like">
      {products.map((x) => (
        <ProductCard key={x.id} product={x} stock={stock} status={cardStatus(x, releases)} releaseId={releases[x.id]?.id} track="pdp_also_like" />
      ))}
    </Carousel>
  )
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function ProductSkeleton() {
  return (
    <div className="container-shop grid gap-6 lg:grid-cols-[minmax(0,740px)_370px] lg:justify-between lg:gap-[68px] lg:pt-[21px]" aria-busy>
      <div className="-mx-[21.328px] aspect-square animate-pulse bg-tile lg:mx-0" />
      <div className="flex flex-col gap-4">
        <div className="h-6 w-2/3 animate-pulse bg-tile" />
        <div className="h-4 w-24 animate-pulse bg-tile" />
        <div className="h-12 w-full animate-pulse bg-tile" />
        <div className="h-[52px] w-full animate-pulse bg-tile" />
      </div>
    </div>
  )
}
