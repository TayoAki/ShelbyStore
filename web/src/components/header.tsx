import { Suspense } from "react"
import { catalogItems } from "@/lib/catalog-items"
import { itemCount, retrieveCart } from "@/lib/data/cart"
import { getRegion, listCategories, listOffers, listProducts, listReleases } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { colorThumbs, imagesFor, imageUrl, offerOf } from "@/lib/product"
import { shapesFrom } from "@/lib/shapes"
import { SiteHeader, type Panel } from "./site-header"

/**
 * Builds the header's menus and search list from the cached catalog (SITE_SPEC
 * §6.0.2–§6.0.5); the client header does the interaction.
 */
export async function Header() {
  const region = await getRegion()
  const [releases, categories, products, offers, series] = await Promise.all([
    listReleases(),
    listCategories(),
    region ? listProducts(region.id) : Promise.resolve([]),
    region ? listOffers(region.id) : Promise.resolve([]),
    listSeries(),
  ])
  const shapes = shapesFrom(categories, products)
  const core = products.find((p) => p.collection?.handle === "core") ?? null
  const live = releases.find((r) => r.phase === "live") ?? null
  const liveProduct = live ? products.find((p) => live.products.some((lp) => lp.id === p.id)) : null
  const twoPack = offers[0] ?? null
  const lead = (p: (typeof products)[number]) => imagesFor(p, colorThumbs(p)[0]?.color)[0] ?? imageUrl(p.thumbnail)
  const dropTiles = [...releases.filter((r) => r.phase === "live"), ...releases.filter((r) => r.phase === "upcoming")].slice(0, 6)
  const story = series[0] ?? null

  const panels: Panel[] = [
    {
      key: "featured",
      label: "Featured",
      track: "nav_featured",
      href: "/shop",
      tiles: [
        ...(core ? [{ label: core.title.replace(/^The /, ""), href: `/products/${core.handle}`, image: lead(core) }] : []),
        ...(liveProduct ? [{ label: liveProduct.title.replace(/^The /, ""), href: `/products/${liveProduct.handle}`, image: lead(liveProduct) }] : []),
        ...(twoPack ? [{ label: "The Two-Pack", href: offerOf(twoPack)!.path, image: "/hats/everyday-cap-black-1.jpg" }] : []),
        { label: "Fit Quiz", href: "/quiz", image: "/hats/everyday-cap-black-3.jpg" },
      ],
      button: { label: "Shop Featured", href: "/shop" },
    },
    {
      key: "shop",
      label: "Shop",
      track: "nav_shape",
      href: "/shop",
      tiles: shapes.map((s) => ({ label: s.name, href: `/shop?shape=${s.handle}`, image: s.image })),
      button: { label: "Shop All", href: "/shop" },
    },
    {
      key: "drops",
      label: "Drops",
      track: "nav_drops",
      href: "/drops",
      tiles: dropTiles.map((r) => ({ label: r.title, href: `/drops/${r.handle}`, image: r.hero_image ?? r.products[0]?.thumbnail ?? null })),
      button: dropTiles.length ? { label: "All Drops", href: "/drops" } : null,
    },
    {
      key: "explore",
      label: "Explore",
      track: "nav_explore",
      href: "/fit-guide",
      tiles: [
        ...(story ? [{ label: story.title.replace(/^The /, ""), href: `/stories/${story.handle}`, image: "/hats/story-crush.jpg" }] : []),
        { label: "Fit Guide", href: "/fit-guide", image: "/hats/everyday-cap-black-3.jpg" },
        { label: "Why The Everyday Cap", href: "/reasons/everyday-cap", image: "/hats/everyday-cap-black-1.jpg" },
        { label: "Shipping & Returns", href: "/help/shipping-returns", image: "/hats/everyday-cap-black-2.jpg" },
      ],
      button: null,
    },
  ]

  return (
    <SiteHeader
      panels={panels}
      catalog={catalogItems(products)}
      bagBadge={
        <Suspense fallback={null}>
          <BagBadge />
        </Suspense>
      }
    />
  )
}

/** 16px black count badge on the bag icon; hidden at 0 (SITE_SPEC §6.0.2). */
async function BagBadge() {
  const count = itemCount(await retrieveCart())
  if (!count) return null
  return (
    <span className="absolute -right-[6px] -top-[6px] flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-[3px] font-heading text-[10px] leading-4 text-white">
      {count}
      <span className="sr-only"> items in bag</span>
    </span>
  )
}
