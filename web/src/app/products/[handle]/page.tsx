import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { BundleRows } from "@/components/bundle-rows"
import { CardCarousel } from "@/components/card-carousel"
import { ContinuityBanner } from "@/components/continuity-banner"
import { MaterialRing } from "@/components/material-ring"
import { Reveal } from "@/components/motion/reveal"
import { BuyCard, type LimitedSwatch } from "@/components/pdp/buy-card"
import { Gallery } from "@/components/pdp/gallery"
import { ScorecardBand } from "@/components/pdp/scorecard-band"
import { SelectionProvider } from "@/components/pdp/selection"
import { ProductCard } from "@/components/product-card"
import { RecordView } from "@/components/recently-viewed"
import { SeriesPill } from "@/components/series-pill"
import { Track } from "@/components/track"
import { EditionBadge } from "@/components/ui/badge"
import { getProduct, getRegion } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { liveStock, ropeCatalog } from "@/lib/data/rope"
import { getStock } from "@/lib/data/stock"
import { POLICY } from "@/lib/policy"
import { colorThumbs, fitProfileOf, imagesFor, meta, offerOf } from "@/lib/product"
import { CORE_COLORS, crownCm, editionOf, holeDate, ROPE_CAP, ropeName } from "@/lib/rope"
import type { Product } from "@/lib/types"

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
  const sideByColor = Object.fromEntries(colors.map((col) => [col, imagesByColor[col][2] ?? imagesByColor[col][0]]))
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
  const bundles = !isEdition ? <BundleRows pair={c.pair} foursome={c.foursome} /> : null
  const badge = isEdition ? <EditionBadge>{`HOLE ${ed!.hole}${ed!.size ? ` · EDITION OF ${ed!.size}` : ""}`}</EditionBadge> : <span className="badge bg-white">CORE</span>
  const buyProps = {
    product,
    colors,
    linked,
    ropeByColor,
    edition: editionInfo,
    releaseId: release?.phase === "live" ? release.id : null,
    crown: fit ? { value: fit.crown, note: crownCm(product) ? `about ${crownCm(product)} cm` : null, structure: fit.structure } : null,
    bundles,
  }

  return (
    <>
      <Track event="product_viewed" props={{ product_id: product.id, handle: product.handle, release_id: release?.id }} />
      <RecordView handle={product.handle} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <SelectionProvider initialColor={initial}>
        <nav aria-label="Breadcrumb" className="mx-5 mb-2.5 text-xs text-light-charcoal max-lg:mt-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/shop" className="hover:underline">
            The Rope Cap
          </Link>
          {isEdition && <> / {ed!.hole && `Hole ${ed!.hole}`}</>}
        </nav>
        <div className="relative md:mx-5 md:grid md:grid-cols-[1fr_45vw] md:items-start md:gap-5 xl:grid-cols-[1fr_38vw] 2xl:grid-cols-[1fr_33vw]">
          <Gallery imagesByColor={imagesByColor} fallback={imagesFor(product)} title={product.title} badge={badge} />
          <div className="mt-4 md:mt-0">
            <Suspense fallback={<BuyCard {...buyProps} stock={null} />}>
              <LiveBuyCard {...buyProps} />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<ScorecardBand product={product} sideByColor={sideByColor} edition={isEdition ? { size: ed!.size, left: null } : null} />}>
          <LiveScorecard product={product} sideByColor={sideByColor} size={isEdition ? ed!.size : null} isEdition={isEdition} />
        </Suspense>

        <Reveal aria-label="Details" className="m-2.5 my-10 grid min-h-[166px] gap-5 rounded-xl bg-white p-5 md:grid-cols-2 md:rounded-3xl md:p-6">
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl md:rounded-3xl">
            <Image src="/hats/rope-brim.jpg" alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-xs leading-4 font-medium uppercase md:text-sm">The details</h3>
              <p className="mt-2 text-sm leading-[22px] tracking-[.025em] text-charcoal">{product.description}</p>
            </div>
            <div>
              <h3 className="text-xs leading-4 font-medium uppercase md:text-sm">Care &amp; returns</h3>
              <p className="mt-2 text-sm leading-[22px] tracking-[.025em] text-charcoal">
                {details.find(([k]) => k === "Care")?.[1] ?? ""} {POLICY.returns}. {POLICY.dispatch}.
              </p>
            </div>
          </div>
        </Reveal>

        {details.length >= 4 && (
          <MaterialRing
            background="/hats/rope-clubhouse.jpg"
            callouts={details.slice(0, 4).map(([k, v]) => ({ title: k, body: v }))}
            centre={
              <div className="relative aspect-square w-[75%] overflow-hidden rounded-full bg-white shadow-[0_.85rem_1rem_rgba(0,0,0,0.25)]">
                <Image src={imagesByColor[initial ?? ""]?.[0] ?? imagesFor(product)[0]} alt="" fill sizes="300px" className="object-contain p-[8%]" />
              </div>
            }
          />
        )}
      </SelectionProvider>

      <Suspense fallback={null}>
        <AlsoLike exclude={product} active={initial} />
      </Suspense>
      <Suspense fallback={null}>
        <SeriesBand />
      </Suspense>
    </>
  )
}

async function LiveBuyCard(props: Omit<Parameters<typeof BuyCard>[0], "stock">) {
  const stock = await getStock([props.product.id])
  return <BuyCard {...props} stock={stock} />
}

async function LiveScorecard({ product, sideByColor, size, isEdition }: { product: Product; sideByColor: Record<string, string>; size: number | null; isEdition: boolean }) {
  if (!isEdition) return <ScorecardBand product={product} sideByColor={sideByColor} edition={null} />
  const stock = await getStock([product.id])
  const left = (product.variants ?? []).reduce((n, v) => n + (typeof stock[v.id] === "number" ? (stock[v.id] as number) : 0), 0)
  return <ScorecardBand product={product} sideByColor={sideByColor} edition={{ size, left }} />
}

/** "You may also like" (G.6.3 item 15): the other core colourways and the live editions. */
async function AlsoLike({ exclude, active }: { exclude: Product; active: string | null }) {
  const c = await ropeCatalog()
  const { stock } = await liveStock(c)
  const cards: { product: Product; color: string; key: string }[] = []
  if (c.core) for (const col of CORE_COLORS) if (!(c.core.id === exclude.id && col === active)) cards.push({ product: c.core, color: col, key: `core-${col}` })
  for (const e of c.editions) if (e.id !== exclude.id) cards.push({ product: e, color: colorThumbs(e)[0]?.color ?? e.title, key: e.handle })
  if (!cards.length) return null
  return (
    <CardCarousel title="YOU MAY ALSO LIKE">
      {cards.map((x) => (
        <ProductCard key={x.key} product={x.product} color={x.color} colors={x.product.id === c.core?.id ? [...CORE_COLORS] : undefined} stock={stock} badge={x.product.id === c.core?.id ? "CORE" : "LIMITED"} track="pdp_also_like" />
      ))}
    </CardCarousel>
  )
}

async function SeriesBand() {
  const series = (await listSeries())[0]
  if (!series?.stance) return null
  return <SeriesPill title={series.title} stance={series.stance} href={`/stories/${series.handle}`} episodes={series.episodes.map((e) => e.title)} />
}

function ProductSkeleton() {
  return (
    <div className="md:mx-5 md:grid md:grid-cols-[1fr_45vw] md:gap-5 xl:grid-cols-[1fr_38vw]" aria-busy>
      <div className="mx-2.5 aspect-square animate-pulse rounded-2xl bg-white md:mx-0 md:aspect-[7/4]" />
      <div className="mx-2.5 mt-4 flex flex-col gap-4 rounded-xl bg-white p-6 md:mx-0 md:mt-0">
        <div className="h-8 w-2/3 animate-pulse rounded bg-natural-white" />
        <div className="h-5 w-24 animate-pulse rounded bg-natural-white" />
        <div className="h-12 w-full animate-pulse rounded-full bg-natural-white" />
      </div>
    </div>
  )
}
