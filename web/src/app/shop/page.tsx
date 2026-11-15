import type { Metadata } from "next"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { ProductCard, type CardStatus } from "@/components/product-card"
import { ShopFilters } from "@/components/shop-filters"
import { getRegion, liveReleaseIndex, listProducts, listReleases } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { optionGroups, stockState, variantOptions } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"

export const metadata: Metadata = { title: "Shop" }

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <Container className="flex flex-col gap-6 py-8 lg:py-12">
      <Suspense fallback={<ShopSkeleton />}>
        <ShopContent searchParams={props.searchParams} />
      </Suspense>
    </Container>
  )
}

async function ShopContent({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const query = await searchParams
  const want = {
    size: ([] as string[]).concat(query.size ?? []),
    color: ([] as string[]).concat(query.color ?? []),
  }
  const region = await getRegion()
  const [products, live, releases] = await Promise.all([
    region ? listProducts(region.id) : Promise.resolve([] as Product[]),
    liveReleaseIndex(),
    listReleases(),
  ])
  const stock = await getStock(products.map((p) => p.id))
  const pastIds = new Set(releases.filter((r) => r.phase === "past").flatMap((r) => r.products.map((p) => p.id)))

  const status = (p: Product): CardStatus =>
    p.collection?.handle === "core" ? "core" : live[p.id] ? "live" : pastIds.has(p.id) ? "past" : null
  const rank = (p: Product) => ({ core: 0, live: 1, past: 2 } as Record<string, number>)[status(p) ?? ""] ?? 3

  const sizes = unique(products.flatMap((p) => optionGroups(p).filter((g) => /size/i.test(g.title)).flatMap((g) => g.values)))
  const colors = unique(products.flatMap((p) => optionGroups(p).filter((g) => /colou?r/i.test(g.title)).flatMap((g) => g.values)))

  const visible = products
    .filter((p) => matches(p, stock, want))
    .sort((a, b) => rank(a) - rank(b))

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-section">Shop</h1>
        <p className="text-[13px] text-ink-muted">
          {visible.length} {visible.length === 1 ? "product" : "products"}
          {want.size.length ? ` with ${want.size.join(", ")} in stock` : ""}
        </p>
      </div>
      <ShopFilters sizes={sizes} colors={colors} />
      {visible.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-10">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} stock={stock} status={status(p)} preload={i < 2} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-ink-muted">Nothing matches those filters right now.</p>
      )}
    </>
  )
}

/** Size filter = that size IN STOCK (availability is why shoppers filter). */
function matches(p: Product, stock: VariantStock, want: { size: string[]; color: string[] }) {
  if (!want.size.length && !want.color.length) return true
  return (p.variants ?? []).some((v) => {
    const o = variantOptions(v)
    const size = Object.entries(o).find(([k]) => /size/i.test(k))?.[1]
    const color = Object.entries(o).find(([k]) => /colou?r/i.test(k))?.[1]
    if (want.color.length && (!color || !want.color.includes(color))) return false
    if (want.size.length) {
      if (!size || !want.size.includes(size)) return false
      if (stockState(stock[v.id]) === "sold_out") return false
    }
    return true
  })
}

const unique = (xs: string[]) => {
  const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"]
  return [...new Set(xs)].sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return ia !== -1 && ib !== -1 ? ia - ib : a.localeCompare(b)
  })
}

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5" aria-busy>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="aspect-[4/5] animate-pulse bg-surface" />
          <div className="h-4 w-2/3 animate-pulse bg-surface" />
        </div>
      ))}
    </div>
  )
}
