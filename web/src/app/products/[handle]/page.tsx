import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { AlsoLike } from "@/components/also-like"
import { ContinuityBanner } from "@/components/continuity-banner"
import { shortDate } from "@/components/hole-card"
import { BuyCard, type LimitedSwatch } from "@/components/pdp/buy-card"
import { Gallery } from "@/components/pdp/gallery"
import { SelectionProvider } from "@/components/pdp/selection"
import { RecordView } from "@/components/recently-viewed"
import { StoryTeaser } from "@/components/story-teaser"
import { Track } from "@/components/track"
import { ViewedRail } from "@/components/viewed-rail"
import { catalogItems } from "@/lib/catalog-items"
import { getProduct, getRegion } from "@/lib/data/catalog"
import { ropeCatalog } from "@/lib/data/rope"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { colorThumbs, fitProfileOf, imagesFor, meta, offerOf, price } from "@/lib/product"
import { CORE_COLORS, crownCm, editionOf, nextHole, pad2, ROPE_CAP, ropeName } from "@/lib/rope"
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
  const ropeByColor = Object.fromEntries(colors.map((col) => [col, ropeName(product, col)]))
  const fit = fitProfileOf(product)
  const hole = isEdition ? c.holes.find((h) => h.hole === ed!.hole) ?? null : null

  // Numbered dots on the core PDP: live editions (their PDP) and upcoming holes (their card page).
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
            caption: `No. ${pad2(h.hole)}`,
            selected: false,
          })),
      }
  const dateLabel = shortDate(release?.release_at ?? release?.published_at ?? null)
  const editionInfo = isEdition
    ? { hole: ed!.hole, size: ed!.size, dateLabel, released: release?.phase === "live", name: hole?.name ?? colors[0], cardHref: release ? `/card/${release.handle}` : null }
    : null
  const next = nextHole(c.holes)
  const kitLinks = isEdition ? [] : kits(c.pair, c.foursome)
  const crumbs = (
    <nav aria-label="Breadcrumb" className="crumbs-pdp">
      <Link href="/">Home</Link>
      <span className="dot" aria-hidden />
      {isEdition ? (
        <>
          <Link href="/card">The Card</Link>
          <span className="dot" aria-hidden />
          <span aria-current="page">Hole {pad2(ed!.hole)}</span>
        </>
      ) : (
        <span aria-current="page">{product.title}</span>
      )}
    </nav>
  )
  const buyProps = {
    product,
    colors,
    linked,
    ropeByColor,
    edition: editionInfo,
    releaseId: release?.phase === "live" ? release.id : null,
    crown: fit ? { value: fit.crown, note: crownCm(product) ? `about ${crownCm(product)} cm` : null, structure: fit.structure } : null,
    bundles: null,
    crumbs,
    kitLinks,
    next: next?.handle ? { handle: next.handle, hole: next.hole, name: next.name } : null,
  }
  const products = [c.core, ...c.editions, c.pair, c.foursome].filter((p): p is Product => !!p)

  return (
    <>
      <Track event="product_viewed" props={{ product_id: product.id, handle: product.handle, release_id: release?.id }} />
      <RecordView handle={product.handle} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <SelectionProvider initialColor={initial}>
        <div className="pdp-grid wrap pt-4 lg:pt-6">
          <Gallery title={product.title} imagesByColor={imagesByColor} fallback={imagesFor(product)} initialColor={initial} badge={isEdition ? `No. ${pad2(ed!.hole)}` : null} />
          <Suspense fallback={<BuyCard {...buyProps} stock={null} />}>
            <LiveBuyCard {...buyProps} />
          </Suspense>
        </div>
      </SelectionProvider>

      <AlsoLike core={c.core} editions={c.editions} holes={c.holes} pair={isEdition ? null : c.pair} exclude={product} active={initial} />
      <Suspense fallback={null}>
        <StoryTeaser />
      </Suspense>
      <ViewedRail catalog={catalogItems(products)} exclude={product.handle} />
    </>
  )
}

function kits(pair: Product | null, foursome: Product | null) {
  const out: { href: string; label: string; track: string }[] = []
  if (pair) out.push({ href: "/offer/the-pair", label: `The Pair is ${formatMoney(price(pair).amount)} — any two colors`, track: "pdp_offer" })
  if (foursome) out.push({ href: "/offer/the-pair#foursome", label: `The Foursome is ${formatMoney(price(foursome).amount)}`, track: "pdp_foursome" })
  return out
}

async function LiveBuyCard(props: Omit<Parameters<typeof BuyCard>[0], "stock">) {
  const stock = await getStock([props.product.id])
  return <BuyCard {...props} stock={stock} />
}

function ProductSkeleton() {
  return (
    <div className="wrap grid gap-6 pt-6 lg:grid-cols-[minmax(0,670fr)_minmax(340px,620fr)] lg:gap-[50px]" aria-busy>
      <div className="tile aspect-[5/6] lg:aspect-[2/3] lg:max-w-[650px]" />
      <div className="flex flex-col gap-3 lg:px-[35px]">
        <div className="h-4 w-40 bg-tile" />
        <div className="h-7 w-2/3 bg-tile" />
        <div className="h-5 w-24 bg-tile" />
        <div className="mt-4 h-[52px] w-full bg-tile" />
      </div>
    </div>
  )
}
