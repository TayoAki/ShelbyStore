import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { ContinuityBanner } from "@/components/continuity-banner"
import { BuyBox } from "@/components/pdp/buy-box"
import { Gallery } from "@/components/pdp/gallery"
import { ProductCard } from "@/components/product-card"
import { Track } from "@/components/track"
import { Badge } from "@/components/ui/badge"
import { getProduct, getRegion, liveReleaseIndex, listProducts } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { meta, modelInfoOf, price, sizeChartOf } from "@/lib/product"
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
      <ProductContent params={props.params} />
    </Suspense>
  )
}

async function ProductContent({ params }: { params: PageProps<"/products/[handle]">["params"] }) {
  const { handle } = await params
  const region = await getRegion()
  if (!region) notFound()
  const [product, releases, all] = await Promise.all([getProduct(handle, region.id), liveReleaseIndex(), listProducts(region.id)])
  if (!product) notFound()

  const release = releases[product.id] ?? null
  const isCore = product.collection?.handle === "core"
  const md = (product.metadata ?? {}) as Record<string, unknown>
  const images = [...new Set([product.thumbnail, ...(product.images ?? []).map((i) => i.url)].filter(Boolean) as string[])]
  const p = price(product)
  const fitNotes = meta(product, "fit_notes")
  const modelInfo = modelInfoOf(product)
  const sizeChart = sizeChartOf(product)
  const promise = meta(product, "promise")
  const pairs = all.filter((x) => x.id !== product.id).slice(0, 4)

  return (
    <>
      <Track event="product_viewed" props={{ product_id: product.id, handle: product.handle, release_id: release?.id }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <Container className="grid gap-6 pb-12 lg:grid-cols-12 lg:gap-12 lg:py-10">
        <div className="lg:col-span-7">
          <Gallery images={images} title={product.title} videoUrl={typeof md.video_url === "string" ? md.video_url : null} />
        </div>
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <div className="flex flex-col gap-3">
            <div>
              {release ? (
                <Badge tone="live" dot>
                  From the drop: {release.title}
                </Badge>
              ) : isCore ? (
                <Badge tone="core">Core</Badge>
              ) : null}
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.01em] lg:text-3xl">{product.title}</h1>
            <p className="font-mono text-[15px]">{formatMoney(p.amount, p.currency)}</p>
            {promise && <p className="text-[17px] italic leading-snug text-ink-muted">“{promise}”</p>}
          </div>
          <Suspense
            fallback={
              <BuyBox product={product} stock={null} release={release} fitNotes={fitNotes} modelInfo={modelInfo} sizeChart={sizeChart} />
            }
          >
            <LiveBuyBox product={product} release={release} fitNotes={fitNotes} modelInfo={modelInfo} sizeChart={sizeChart} />
          </Suspense>
          <Details product={product} fitNotes={fitNotes} modelInfo={modelInfo} />
        </div>
      </Container>
      {pairs.length > 0 && (
        <Container className="flex flex-col gap-6 py-12 lg:py-16">
          <h2 className="font-display text-section">Pairs with</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
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

function Details({ product, fitNotes, modelInfo }: { product: Product; fitNotes: string | null; modelInfo: string | null }) {
  const sections: { title: string; body: React.ReactNode; open?: boolean }[] = [
    { title: "Details", body: product.description },
    { title: "Fit", body: [fitNotes, modelInfo].filter(Boolean).join(" ") || null, open: true },
    { title: "Shipping & returns", body: `${POLICY.shipping}. ${POLICY.dispatch}. ${POLICY.returns}.` },
  ]
  return (
    <div className="border-t border-line">
      {sections
        .filter((s) => s.body)
        .map((s) => (
          <details key={s.title} open={s.open} className="group border-b border-line">
            <summary className="flex h-14 cursor-pointer list-none items-center justify-between text-[15px] font-medium [&::-webkit-details-marker]:hidden">
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
