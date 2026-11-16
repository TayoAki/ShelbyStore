import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { Sleeves } from "@/components/box/back-panel"
import { SelectedBoxRope } from "@/components/box/selected-rope"
import { SidePanel } from "@/components/box/side-panel"
import { ContinuityBanner } from "@/components/continuity-banner"
import { BuyCard, type LimitedSwatch } from "@/components/pdp/buy-card"
import { SelectionProvider } from "@/components/pdp/selection"
import { getStock } from "@/lib/data/stock"
import { RecordView } from "@/components/recently-viewed"
import { Track } from "@/components/track"
import { EditionBadge } from "@/components/ui/badge"
import { getProduct, getRegion } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { ropeCatalog } from "@/lib/data/rope"
import { POLICY } from "@/lib/policy"
import { colorThumbs, fitProfileOf, imagesFor, meta, offerOf } from "@/lib/product"
import { CORE_COLORS, crownCm, editionOf, holeDate, ROPE_CAP, ropeName } from "@/lib/rope"

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const region = await getRegion()
  const product = region ? await getProduct(handle, region.id) : null
  return product ? { title: product.title, description: meta(product, "promise") ?? product.description ?? undefined } : { title: "Not found" }
}

export default function ProductPage(props: PageProps<"/products/[handle]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  )
}

async function ProductContent({ params, searchParams }: { params: PageProps<"/products/[handle]">["params"]; searchParams: PageProps<"/products/[handle]">["searchParams"] }) {
  const [{ handle }, sp] = await Promise.all([params, searchParams])
  const c = await ropeCatalog()
  if (!c.region) notFound()
  const product = await getProduct(handle, c.region.id)
  if (!product) {
    // An upcoming edition is unpublished until its release: send people to its hole.
    const release = c.releases.find((r) => r.products.some((p) => p.handle === handle))
    if (release) redirect(`/card/${release.handle}`)
    notFound()
  }
  const offer = offerOf(product)
  if (offer) redirect(offer.path)

  const ed = editionOf(product)
  const isEdition = !!ed && ed.hole > 1
  const release = c.releases.find((r) => r.products.some((p) => p.id === product.id)) ?? null
  const colors = colorThumbs(product).map((x) => x.color)
  const requested = typeof sp.color === "string" && colors.includes(sp.color) ? sp.color : null
  const initial = requested ?? colors[0] ?? null
  const imagesByColor = Object.fromEntries(colors.map((col) => [col, imagesFor(product, col)]))
  const ropeByColor = Object.fromEntries(colors.map((col) => [col, ropeName(product, col)]))
  const fit = fitProfileOf(product)
  const details = Object.entries(((product.metadata as { details?: Record<string, string> } | null)?.details ?? {}) as Record<string, string>)

  // Limited group on the core PDP: live editions (their PDP) and upcoming holes (their card page).
  const linked: { group: "CORE" | "LIMITED"; swatches: LimitedSwatch[] } = isEdition
    ? {
        group: "CORE",
        swatches: CORE_COLORS.map((col) => ({ name: col, href: `/products/${ROPE_CAP}?color=${encodeURIComponent(col)}`, caption: null, selected: false })),
      }
    : {
        group: "LIMITED",
        swatches: c.holes
          .filter((h) => !h.core && (h.status === "live" || h.status === "upcoming"))
          .map((h) => ({
            name: h.name,
            href: h.productHandle ? `/products/${h.productHandle}` : `/card/${h.handle}`,
            caption: h.status === "upcoming" ? (holeDate(h.date).day ?? "").replace(/ \d{4}$/, "") : null,
            selected: false,
          })),
      }
  const { day } = holeDate(release?.release_at ?? release?.published_at ?? null)
  const editionInfo = isEdition ? { hole: ed!.hole, size: ed!.size, dateLabel: day, released: release?.phase === "live" } : null
  const tag = isEdition ? <EditionBadge>{`Hole ${ed!.hole}${ed!.size ? ` · ${ed!.size} made` : ""}`}</EditionBadge> : null
  const buyProps = {
    product,
    colors,
    linked,
    ropeByColor,
    edition: editionInfo,
    releaseId: release?.phase === "live" ? release.id : null,
    crown: fit ? { value: fit.crown, note: crownCm(product) ? `about ${crownCm(product)} cm` : null, structure: fit.structure } : null,
    bundles: null,
    imagesByColor,
    fallbackImages: imagesFor(product),
    modelNumber: isEdition ? ed!.hole : 1,
    tag,
  }

  return (
    <>
      <Track event="product_viewed" props={{ product_id: product.id, handle: product.handle, release_id: release?.id }} />
      <RecordView handle={product.handle} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <div className="box mt-3 md:mt-5">
        <nav aria-label="Breadcrumb" className="box-flush label px-[var(--panel-pad)] py-3 !text-[12px] text-ink-2">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/shop" className="hover:underline">
            The Rope Cap
          </Link>
          {isEdition && <> / Hole {ed!.hole}</>}
        </nav>
        <SelectionProvider initialColor={initial}>
          <div className="box-row">
            <Suspense fallback={<BuyCard {...buyProps} stock={null} />}>
              <LiveBuyCard {...buyProps} />
            </Suspense>
            <SidePanel product={product} fallbackColor={initial ?? colors[0]} />
          </div>
          <SelectedBoxRope fallback={initial ?? colors[0]} />
        </SelectionProvider>

        <section aria-labelledby="details-title" className="panel overflow-hidden">
          <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center">
            <div className="window aspect-[4/3]">
              <Image src="/hats/rope-brim.jpg" alt="A hand setting the brim of a navy rope cap on the course" fill sizes="(min-width: 768px) 40vw, 92vw" className="object-cover" />
              <span className="window-shade" aria-hidden />
            </div>
            <div className="flex flex-col gap-6">
              <h2 id="details-title" className="panel-title">
                Washed before it reaches you.
              </h2>
              <p className="max-w-[60ch] text-[1.125rem] leading-[1.6]">{product.description}</p>
              <dl className="grid gap-4 border-t-2 border-ink pt-4 sm:grid-cols-2">
                <div>
                  <dt className="label">Care</dt>
                  <dd className="mt-1 text-[1rem] leading-6">{details.find(([k]) => k === "Care")?.[1] ?? "Spot clean. Reshape and air dry."}</dd>
                </div>
                <div>
                  <dt className="label">Returns</dt>
                  <dd className="mt-1 text-[1rem] leading-6">
                    {POLICY.returns}. {POLICY.dispatch}.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {!isEdition && <Sleeves pair={c.pair} foursome={c.foursome} tracks={{ pair: "pdp_offer", foursome: "pdp_foursome" }} />}
        <Suspense fallback={null}>
          <SeriesBand />
        </Suspense>
      </div>
    </>
  )
}

async function LiveBuyCard(props: Omit<Parameters<typeof BuyCard>[0], "stock">) {
  const stock = await getStock([props.product.id])
  return <BuyCard {...props} stock={stock} />
}

async function SeriesBand() {
  const series = (await listSeries())[0]
  if (!series?.stance) return null
  return (
    <section aria-labelledby="series-title" className="panel">
      <div className="relative flex flex-col gap-4 p-[var(--panel-pad)] md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-[60ch] flex-col gap-3">
          <h2 id="series-title" className="panel-title">
            {series.title}
          </h2>
          <p className="text-[1.125rem] leading-[1.6]">{series.stance}</p>
        </div>
        <Link href={`/stories/${series.handle}`} className="btn btn-outline-black shrink-0" data-track="series_story">
          See the full test
        </Link>
      </div>
    </section>
  )
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-4 px-3 pt-3 md:gap-6 md:px-6 lg:grid-cols-2" aria-busy>
      <div className="panel flex flex-col gap-4 p-[var(--panel-pad)]">
        <div className="aspect-[4/3] animate-pulse rounded-[var(--radius-window)] bg-wash" />
        <div className="h-16 w-2/3 animate-pulse rounded-[3px] bg-wash" />
        <div className="h-12 w-full animate-pulse rounded-[3px] bg-wash" />
      </div>
      <div className="panel hidden h-[32rem] lg:block" />
    </div>
  )
}
