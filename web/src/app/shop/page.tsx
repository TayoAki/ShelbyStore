import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Faq } from "@/components/accordion"
import { lead } from "@/components/header"
import { HoleCard } from "@/components/hole-card"
import { KitCard } from "@/components/kit-card"
import { ProductCard } from "@/components/product-card"
import { ShopBrowser, type ShopItem } from "@/components/shop/shop-browser"
import { Track } from "@/components/track"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { POLICY } from "@/lib/policy"
import { colorThumbs, price } from "@/lib/product"
import { CORE_COLORS, editionOf, type Hole } from "@/lib/rope"
import type { VariantStock } from "@/lib/types"

export const metadata: Metadata = {
  title: "Shop",
  description: "The Rope Cap in four core colors, the numbered holes, and the Pair and Foursome kits.",
}

const GROUPS = ["all", "core", "limited", "bundles"] as const
type Group = (typeof GROUPS)[number]
const GROUP_LABEL: Record<Group, string> = { all: "All", core: "Core", limited: "Numbered", bundles: "Kits" }
const COLORWAYS = ["Tour White", "Clubhouse Navy", "Pine", "Fescue", "Azalea", "Cypress", "Haar"]
const SIZES = "(min-width: 990px) 260px, 45vw"

/**
 * Eastside's collection page (SITE_SPEC v8 E.6.2): breadcrumb and title, the
 * filter bar, the sidebar and the 4-column grid (core colours, numbered
 * editions, holes without products, then the kits), and the FAQ.
 */
export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <>
      <header className="wrap pt-4 text-center">
        <nav aria-label="Breadcrumb" className="crumbs-coll">
          <Link href="/">Home</Link> / <span aria-current="page">Shop</span>
        </nav>
        <h1 className="title-page mt-[13px]">Shop</h1>
      </header>
      <Suspense fallback={<div className="mt-6 h-[62px] border-y border-border" />}>
        <ShopContent searchParams={props.searchParams} />
      </Suspense>
      <Faq
        items={[
          { q: "How does the Rope Cap fit?", a: `One size, ${POLICY.oneSize}, with an adjustable strap. The crown is mid height, about 11–11.5 cm, so it sits on your head rather than on top of it.` },
          { q: "What is a numbered hole?", a: `Each season adds a numbered color to The Card, one hole at a time. ${POLICY.limitedRun}` },
          { q: "How much is shipping?", a: POLICY.shipping },
          { q: "Can I return it?", a: `${POLICY.returns}.` },
        ]}
      />
    </>
  )
}

async function ShopContent({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const sp = await searchParams
  const group: Group = GROUPS.includes(sp.group as Group) ? (sp.group as Group) : "all"
  const c = await ropeCatalog()
  return (
    <>
      <Track event="collection_viewed" props={{ group }} />
      <Suspense fallback={<Browser c={c} group={group} stock={undefined} holes={c.holes} />}>
        <LiveBrowser c={c} group={group} />
      </Suspense>
    </>
  )
}

async function LiveBrowser({ c, group }: { c: RopeCatalog; group: Group }) {
  const { stock, holes } = await liveStock(c)
  return <Browser c={c} group={group} stock={stock} holes={holes} />
}

function Browser({ c, group, stock, holes }: { c: RopeCatalog; group: Group; stock: VariantStock | undefined; holes: Hole[] }) {
  const items: ShopItem[] = []
  let order = 0
  const showCore = group === "all" || group === "core"
  const showLimited = group === "all" || group === "limited"
  const showKits = group === "all" || group === "bundles"
  const dateOf = (h: Hole | undefined) => h?.date ?? null

  if (showCore && c.core)
    for (const color of CORE_COLORS)
      items.push({
        key: `core-${color}`,
        colors: [color],
        price: price(c.core).amount,
        date: null,
        order: order++,
        node: <ProductCard product={c.core} color={color} colors={[...CORE_COLORS]} stock={stock} preload={order < 3} linkTrack="core_product" sizes={SIZES} />,
      })
  if (showLimited) {
    for (const e of c.editions) {
      const h = holes.find((x) => x.hole === editionOf(e)?.hole)
      const color = colorThumbs(e)[0]?.color ?? e.title
      items.push({
        key: e.handle,
        colors: [color],
        price: price(e).amount,
        date: dateOf(h),
        order: order++,
        node: <ProductCard product={e} color={color} stock={stock} badge={h ? `HOLE ${h.hole}` : null} linkTrack="card_hole" sizes={SIZES} />,
      })
    }
    for (const h of holes.filter((x) => !x.core && !c.editions.some((e) => e.handle === x.productHandle)))
      items.push({ key: `hole-${h.hole}`, colors: COLORWAYS.includes(h.name) ? [h.name] : [], price: null, date: h.date, order: order++, node: <HoleCard hole={h} price={null} /> })
  }
  if (showKits) {
    if (c.pair)
      items.push({ key: "pair", colors: [...CORE_COLORS], price: price(c.pair).amount, date: null, order: order++, node: <KitCard product={c.pair} title="The Pair" href="/offer/the-pair" image={lead("Clubhouse Navy")} hover={lead("Pine")} track="home_pair" sizes={SIZES} /> })
    if (c.foursome)
      items.push({ key: "foursome", colors: [...CORE_COLORS], price: price(c.foursome).amount, date: null, order: order++, node: <KitCard product={c.foursome} title="The Foursome" href="/offer/the-pair#foursome" image={lead("Fescue")} hover={lead("Tour White")} track="home_foursome" sizes={SIZES} /> })
  }
  const colors = COLORWAYS.filter((col) => items.some((i) => i.colors.includes(col)))
  const groups = GROUPS.map((g) => ({ key: g, label: GROUP_LABEL[g], href: g === "all" ? "/shop" : `/shop?group=${g}` }))
  return <ShopBrowser items={items} groups={groups} group={group} colors={colors} />
}
