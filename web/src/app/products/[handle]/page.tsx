import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { ContinuityBanner } from "@/components/continuity-banner"
import { FitScales } from "@/components/fit-scale"
import { BuyBox } from "@/components/pdp/buy-box"
import { Gallery } from "@/components/pdp/gallery"
import { SelectionProvider } from "@/components/pdp/selection"
import { ProductCard } from "@/components/product-card"
import { Track } from "@/components/track"
import { Badge } from "@/components/ui/badge"
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
  modelInfoOf,
  offerOf,
  price,
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

/** Product page (SITE_SPEC §6.4). */
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
  // Bundles are sold on their own landing page (SITE_SPEC §12.1).
  const ownOffer = offerOf(product)
  if (ownOffer) redirect(ownOffer.path)
  // An offer built on this product (e.g. the two-pack), linked under the buy box.
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
  const images = imagesFor(product)
  const imagesByColor = Object.fromEntries(colors.map((c) => [c, imagesFor(product, c)]))
  const p = price(product)
  const fitNotes = meta(product, "fit_notes")
  const modelInfo = modelInfoOf(product)
  const sizeChart = sizeChartOf(product)
  const promise = meta(product, "promise")
  const shape = shapeOf(product)
  const profile = fitProfileOf(product)

  // Complete the look: other shapes first, then the core, then the rest.
  const myShape = shape?.handle
  const pairs = all
    .filter((x) => x.id !== product.id)
    .sort((a, b) => {
      const score = (x: Product) => (shapeOf(x)?.handle !== myShape ? 0 : 2) + (x.collection?.handle === "core" ? 0 : 1)
      return score(a) - score(b)
    })
    .slice(0, 4)

  return (
    <>
      <Track event="product_viewed" props={{ product_id: product.id, handle: product.handle, release_id: release?.id }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <SelectionProvider initialColor={initialColor}>
        <Container className="grid gap-6 pb-12 lg:grid-cols-12 lg:gap-12 lg:py-10">
          <div className="lg:col-span-7">
            <Gallery
              images={images}
              imagesByColor={imagesByColor}
              title={product.title}
              videoUrl={typeof md.video_url === "string" ? md.video_url : null}
            />
          </div>
          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <div className="flex flex-col gap-3">
              <div>
                {release ? (
                  <Badge tone="live" dot>
                    Limited · {release.title}
                  </Badge>
                ) : isCore ? (
                  <Badge tone="core">Core · always in stock</Badge>
                ) : null}
              </div>
              <h1 className="font-display text-[32px] leading-[0.95] lg:text-[44px]">{product.title}</h1>
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-[15px]">{formatMoney(p.amount, p.currency)}</p>
                {shape && (
                  <p className="text-[13px] text-ink-muted">
                    <Link href={`/shop?shape=${shape.handle}`} className="hover:underline">
                      {shape.name}
                    </Link>
                    {" · "}
                    {isOneSize(product) ? "One size" : "Sized"}
                  </p>
                )}
              </div>
              {promise && <p className="text-[16px] italic leading-snug text-ink-muted">“{promise}”</p>}
            </div>
            <Suspense
              fallback={
                <BuyBox product={product} stock={null} release={release} fitNotes={fitNotes} modelInfo={modelInfo} sizeChart={sizeChart} />
              }
            >
              <LiveBuyBox product={product} release={release} fitNotes={fitNotes} modelInfo={modelInfo} sizeChart={sizeChart} />
            </Suspense>
            {offer && offerPrice !== null && (
              <Link
                href={offerOf(offer)!.path}
                className="-mt-2 flex items-center justify-between gap-3 bg-paper px-4 py-3 text-[14px] hover:bg-surface"
                data-track="pdp_offer"
              >
                <span>
                  <span className="font-medium">Get two for {formatMoney(offerPrice, p.currency)}</span>
                  {offerSaving !== null && offerSaving > 0 && (
                    <span className="text-ink-muted"> · save {formatMoney(offerSaving, p.currency)}</span>
                  )}
                </span>
                <span aria-hidden>→</span>
              </Link>
            )}
            {profile && (
              <div className="flex flex-col gap-3 border-t border-line pt-5">
                <p className="text-[15px] font-semibold">How it fits</p>
                <FitScales profile={profile} />
              </div>
            )}
            <Details product={product} fitNotes={fitNotes} modelInfo={modelInfo} />
          </div>
        </Container>
      </SelectionProvider>
      {pairs.length > 0 && (
        <Container className="flex flex-col gap-6 py-12 lg:py-16">
          <h2 className="font-display text-section">Complete the look</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4">
            {pairs.map((x) => (
              <ProductCard key={x.id} product={x} status={x.collection?.handle === "core" ? "core" : releases[x.id] ? "live" : null} />
            ))}
          </div>
        </Container>
      )}
      {/* Room for the pinned mobile buy bar so it never covers the footer. */}
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  )
}

async function LiveBuyBox(props: Omit<Parameters<typeof BuyBox>[0], "stock">) {
  const stock = await getStock([props.product.id])
  return <BuyBox {...props} stock={stock} />
}

/** Accordions: details (mood copy, then spec facts kept separate), fit, shipping & returns. */
function Details({ product, fitNotes, modelInfo }: { product: Product; fitNotes: string | null; modelInfo: string | null }) {
  const specs = detailsOf(product)
  const sections: { title: string; body: React.ReactNode; open?: boolean }[] = [
    {
      title: "Details",
      body:
        product.description || specs.length ? (
          <>
            {product.description}
            {specs.length > 0 && (
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-line pt-4">
                {specs.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-eyebrow pt-0.5 text-ink">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        ) : null,
      open: true,
    },
    {
      title: "Fit",
      body:
        fitNotes || modelInfo ? (
          <>
            {[fitNotes, modelInfo].filter(Boolean).join(" ")}{" "}
            <Link href={`/fit-guide#${product.handle}`} className="text-ink underline underline-offset-4" data-track="fit_guide">
              See the fit guide
            </Link>
          </>
        ) : null,
    },
    { title: "Shipping & returns", body: `${POLICY.shipping}. ${POLICY.dispatch}. ${POLICY.returns}.` },
  ]
  return (
    <div className="border-t border-line">
      {sections
        .filter((s) => s.body)
        .map((s) => (
          <details key={s.title} open={s.open} className="group border-b border-line">
            <summary className="flex h-14 cursor-pointer list-none items-center justify-between text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
              {s.title}
              <span aria-hidden className="text-xl leading-none transition-transform duration-150 group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="pb-5 text-[15px] leading-relaxed text-ink-muted">{s.body}</div>
          </details>
        ))}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <Container className="grid gap-6 pb-12 lg:grid-cols-12 lg:gap-12 lg:py-10" aria-busy>
      <div className="-mx-4 aspect-[4/5] animate-pulse bg-surface md:-mx-6 lg:col-span-7 lg:mx-0" />
      <div className="flex flex-col gap-4 lg:col-span-5">
        <div className="h-8 w-2/3 animate-pulse bg-surface" />
        <div className="h-5 w-24 animate-pulse bg-surface" />
        <div className="h-12 w-full animate-pulse bg-surface" />
        <div className="h-12 w-full animate-pulse bg-surface" />
      </div>
    </Container>
  )
}
