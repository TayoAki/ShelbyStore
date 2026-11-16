import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { FilterSidebar, MobileFilterBar } from "@/components/collection-filters"
import { cardStatus, ProductCard } from "@/components/product-card"
import { ButtonLink } from "@/components/ui/button"
import { catalogItems } from "@/lib/catalog-items"
import { getRegion, listCategories, liveReleaseIndex, listProducts, listReleases } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { optionGroups, price, shapeOf, stockState, variantOptions } from "@/lib/product"
import { SHAPE_COPY, shapesFrom } from "@/lib/shapes"
import type { Product, VariantStock } from "@/lib/types"

export const metadata: Metadata = { title: "Shop all hats" }

/** Melin's collection page (SITE_SPEC §6.3). */
export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent searchParams={props.searchParams} />
    </Suspense>
  )
}

const list = (v: string | string[] | undefined) =>
  ([] as string[])
    .concat(v ?? [])
    .flatMap((x) => x.split(","))
    .map((x) => x.trim())
    .filter(Boolean)

async function ShopContent({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const query = await searchParams
  const want = { size: list(query.size), color: list(query.color), shape: list(query.shape) }
  const q = typeof query.q === "string" ? query.q.trim() : ""
  const sort = typeof query.sort === "string" ? query.sort : "featured"
  const region = await getRegion()
  const [products, live, releases, categories] = await Promise.all([
    region ? listProducts(region.id) : Promise.resolve([] as Product[]),
    liveReleaseIndex(),
    listReleases(),
    listCategories(),
  ])
  const shapes = shapesFrom(categories, products)
  const pill = want.shape.length === 1 ? (shapes.find((s) => s.handle === want.shape[0]) ?? null) : null
  const upcoming = new Set(releases.filter((r) => r.phase === "upcoming").flatMap((r) => r.products.map((p) => p.id)))
  const stock = await getStock(products.map((p) => p.id))

  const items = catalogItems(products)
  const matchesQuery = (p: Product) => {
    if (!q) return true
    const item = items.find((i) => i.handle === p.handle)!
    const t = q.toLowerCase()
    return [item.title, item.shape ?? "", item.type, ...item.colors].some((f) => f.toLowerCase().includes(t))
  }
  const rank = (p: Product) => (p.collection?.handle === "core" ? 0 : live[p.id] ? 1 : 2)
  const visible = products
    .filter((p) => !want.shape.length || want.shape.includes(shapeOf(p)?.handle ?? ""))
    .filter(matchesQuery)
    .filter((p) => matches(p, stock, want))
    .sort((a, b) => {
      if (sort === "price-asc") return (price(a).amount ?? 0) - (price(b).amount ?? 0)
      if (sort === "price-desc") return (price(b).amount ?? 0) - (price(a).amount ?? 0)
      if (sort === "newest") return String(b.created_at).localeCompare(String(a.created_at))
      return rank(a) - rank(b)
    })

  const title = q ? `Search: "${q}"` : (pill?.name ?? "Hats")
  const subtitle = q ? `${visible.length} Results` : pill ? (pill.description ?? SHAPE_COPY[pill.handle] ?? null) : "Shop Our Full Range Of Hats"
  const scoped = want.shape.length ? products.filter((p) => want.shape.includes(shapeOf(p)?.handle ?? "")) : products
  const facets = {
    sizes: unique(scoped.flatMap((p) => optionGroups(p).filter((g) => /size/i.test(g.title)).flatMap((g) => g.values))),
    colors: unique(scoped.flatMap((p) => optionGroups(p).filter((g) => /colou?r/i.test(g.title)).flatMap((g) => g.values))),
    shapes: shapes.map((s) => ({ handle: s.handle, name: s.name })),
  }

  const grid = visible.length ? (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-[28.432px]">
      {visible.map((p, i) => (
        <ProductCard key={p.id} product={p} stock={stock} status={cardStatus(p, live, upcoming)} releaseId={live[p.id]?.id} preload={i < 2} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="font-body text-[15px]">No hats match those filters.</p>
      <ButtonLink href="/shop" variant="light">
        View all
      </ButtonLink>
    </div>
  )

  return (
    <div className="pb-[28.432px] lg:pb-[50.512px]">
      <div className="container-shop pt-[37.904px] text-center">
        <h1 className="font-heading text-[26px] uppercase leading-[39px]">{title}</h1>
        {subtitle && <p className="mt-1 font-body text-[13px] capitalize leading-[15px] tracking-[-0.1px] text-muted-sub">{subtitle}</p>}
      </div>
      <nav aria-label="Styles" className="scrollbar-none mt-[28.432px] flex gap-[9px] overflow-x-auto px-4 lg:flex-wrap lg:justify-center">
        <Pill href="/shop" active={!want.shape.length && !q}>
          View All
        </Pill>
        {shapes.map((s) => (
          <Pill key={s.handle} href={`/shop?shape=${s.handle}`} active={want.shape.length === 1 && want.shape[0] === s.handle}>
            {s.name}
          </Pill>
        ))}
      </nav>
      {/* 1220px with no side padding at desktop: 263 + 78 + 4 × 197.47 + 3 × 28.432 (SITE_SPEC §6.3). */}
      <div className="container-shop lg:px-0">
        <hr className="mt-[28.432px] border-tertiary" />
        <div className="py-4 lg:hidden">
          <MobileFilterBar facets={facets} count={visible.length} />
        </div>
        <div className="lg:grid lg:grid-cols-[263px_1fr] lg:gap-[78px] lg:pt-[28.432px]">
          <div className="hidden lg:block">
            <FilterSidebar facets={facets} />
          </div>
          {grid}
        </div>
      </div>
    </div>
  )
}

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      data-track="shape_pill"
      className={`inline-flex h-[35px] min-w-[85px] shrink-0 items-center justify-center rounded-tile border px-4 font-body text-[13px] capitalize tracking-[1.3px] ${
        active ? "border-black bg-black text-white" : "border-line-soft text-black hover:border-black"
      }`}
    >
      {children}
    </Link>
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
  const order = ["One Size", "S/M", "L/XL"]
  return [...new Set(xs)].sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return ia !== -1 && ib !== -1 ? ia - ib : ia !== -1 ? -1 : ib !== -1 ? 1 : a.localeCompare(b)
  })
}

function ShopSkeleton() {
  return (
    <div className="container-shop pt-[37.904px]" aria-busy>
      <div className="mx-auto h-[39px] w-40 animate-pulse bg-tile" />
      <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-[28.432px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse bg-tile" />
        ))}
      </div>
    </div>
  )
}
