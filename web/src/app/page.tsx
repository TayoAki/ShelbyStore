import { Suspense } from "react"
import { Container } from "@/components/container"
import { DropRow } from "@/components/drop-row"
import { CoreBand } from "@/components/home/core-band"
import { DropHero } from "@/components/home/drop-hero"
import { SeriesBand } from "@/components/home/series-band"
import { ProductCard } from "@/components/product-card"
import { ButtonLink } from "@/components/ui/button"
import { getRegion, listCoreProducts, listProducts, listReleases } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { getStock } from "@/lib/data/stock"
import type { Product, StoreRelease } from "@/lib/types"

export default async function HomePage() {
  const region = await getRegion()
  const [releases, core, all, series] = await Promise.all([
    listReleases(),
    region ? listCoreProducts(region.id) : Promise.resolve([]),
    region ? listProducts(region.id) : Promise.resolve([]),
    listSeries(),
  ])
  const live = releases.find((r) => r.phase === "live") ?? null
  const upcoming = releases.filter((r) => r.phase === "upcoming")
  const past = releases.filter((r) => r.phase === "past")

  return (
    <>
      <DropHero live={live} core={core[0] ?? null} />
      <CoreBand products={core} />
      {upcoming.length > 0 && (
        <section className="py-12 lg:py-24">
          <Container>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div className="flex flex-col gap-3">
                <p className="text-eyebrow text-ink-muted">On the calendar</p>
                <h2 className="font-display text-section">Next drops</h2>
              </div>
              <ButtonLink href="/drops" variant="ghost">
                All drops
              </ButtonLink>
            </div>
            <ul className="border-b border-line">
              {upcoming.map((r) => (
                <DropRow key={r.id} release={r} />
              ))}
            </ul>
          </Container>
        </section>
      )}
      <SeriesBand series={series[0] ?? null} />
      <RecentlyDropped past={past} products={all} />
    </>
  )
}

function RecentlyDropped({ past, products }: { past: StoreRelease[]; products: Product[] }) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const items = past.flatMap((r) =>
    r.products.map((rp) => ({ product: byId.get(rp.id), release: r })).filter((x) => x.product)
  ) as { product: Product; release: StoreRelease }[]
  if (!items.length) return null
  return (
    <section className="py-12 lg:py-24">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-eyebrow text-ink-muted">Still available</p>
          <h2 className="font-display text-section">Recently dropped</h2>
        </div>
        <Suspense fallback={<Grid items={items} />}>
          <GridWithStock items={items} />
        </Suspense>
      </Container>
    </section>
  )
}

async function GridWithStock({ items }: { items: { product: Product; release: StoreRelease }[] }) {
  const stock = await getStock(items.map((i) => i.product.id))
  return <Grid items={items} stock={stock} />
}

function Grid({
  items,
  stock,
}: {
  items: { product: Product; release: StoreRelease }[]
  stock?: Record<string, number | null>
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-10">
      {items.map(({ product, release }) => (
        <ProductCard
          key={`${release.id}-${product.id}`}
          product={product}
          stock={stock}
          status={product.collection?.handle === "core" ? "core" : "past"}
          releaseTitle={release.title}
        />
      ))}
    </div>
  )
}
