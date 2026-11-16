import { Suspense } from "react"
import { catalogItems } from "@/lib/catalog-items"
import { itemCount, retrieveCart } from "@/lib/data/cart"
import { getRegion, listCatalog, listReleases } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { formatMoney } from "@/lib/format"
import { price } from "@/lib/product"
import { buildHoles, CORE_COLORS, holeDate, nextHole } from "@/lib/rope"
import { SiteHeader, type Panel } from "./site-header"

const lead = (color: string) => `/hats/rope-cap-${color.toLowerCase().replace(/\s+/g, "-")}-1.jpg`

/**
 * Builds the header's menus and search index from the cached catalog
 * (SITE_SPEC §6.0.2–§6.0.5, G.6.1). SHOP · THE CARD · CUSTOM · QUIZ · EXPLORE.
 */
export async function Header() {
  const region = await getRegion()
  const [releases, catalog, series] = await Promise.all([
    listReleases(),
    region ? listCatalog(region.id) : Promise.resolve([]),
    listSeries(),
  ])
  const holes = buildHoles(releases)
  const editions = holes.filter((h) => !h.core && (h.status === "live" || h.status === "upcoming"))
  const pair = catalog.find((p) => p.handle === "the-pair")
  const foursome = catalog.find((p) => p.handle === "the-foursome")
  const next = nextHole(holes)
  const liveHoles = holes.filter((h) => h.status === "live")
  const story = series[0] ?? null

  const panels: Panel[] = [
    {
      key: "shop",
      label: "Shop",
      track: "nav_shop",
      columns: [
        { heading: "CORE COLORS", links: CORE_COLORS.map((c) => ({ label: c, href: `/products/rope-cap?color=${encodeURIComponent(c)}` })) },
        ...(editions.length
          ? [
              {
                heading: "LIMITED",
                links: editions.map((h) => ({
                  label: `${h.name} · ${h.status === "live" ? "Live" : (holeDate(h.date).day ?? "").replace(/ \d{4}$/, "")}`,
                  href: h.productHandle ? `/products/${h.productHandle}` : `/card/${h.handle}`,
                })),
              },
            ]
          : []),
        {
          heading: "BUNDLES",
          links: [
            ...(pair ? [{ label: `The Pair · ${formatMoney(price(pair).amount)}`, href: "/offer/the-pair" }] : []),
            ...(foursome ? [{ label: `The Foursome · ${formatMoney(price(foursome).amount)}`, href: "/offer/the-pair#foursome" }] : []),
          ],
        },
      ],
      cards: [
        { label: "The Rope Cap", href: "/products/rope-cap", image: lead("Tour White"), contain: true },
        ...(pair ? [{ label: "The Pair", href: "/offer/the-pair", image: lead("Pine"), contain: true }] : []),
        { label: "Shop All", href: "/shop", image: "/hats/rope-lifestyle-hero.jpg", contain: false },
      ],
    },
    {
      key: "card",
      label: "The Card",
      track: "nav_drops",
      dot: liveHoles.some((h) => !h.core),
      columns: [
        { heading: "NOW", links: liveHoles.map((h) => ({ label: `Hole ${h.hole}: ${h.name}`, href: h.productHandle ? `/products/${h.productHandle}` : `/card/${h.handle}` })) },
        ...(next ? [{ heading: "NEXT", links: [{ label: `Hole ${next.hole}: ${next.name} · ${holeDate(next.date).day ?? ""}`, href: `/card/${next.handle}` }] }] : []),
        { heading: "THE CARD", links: [{ label: "All six holes", href: "/card" }] },
      ],
      cards: holes
        .filter((h) => h.image && h.handle)
        .slice(0, 3)
        .map((h) => ({ label: `Hole ${h.hole}: ${h.name}`, href: `/card/${h.handle}`, image: h.image!, contain: true })),
    },
    {
      key: "explore",
      label: "Explore",
      track: "nav_explore",
      columns: [
        {
          heading: "EXPLORE",
          links: [
            ...(story ? [{ label: story.title, href: `/stories/${story.handle}` }] : []),
            { label: "Fit Guide", href: "/fit-guide" },
            { label: "Why The Rope Cap", href: "/reasons/rope-cap" },
            { label: "Custom Orders", href: "/custom" },
            { label: "Shipping & Returns", href: "/help/shipping-returns" },
          ],
        },
      ],
      cards: [{ label: story?.title ?? "The Crown Test", href: story ? `/stories/${story.handle}` : "/fit-guide", image: "/hats/rope-brim.jpg", contain: false }],
    },
  ]

  return (
    <SiteHeader
      panels={panels}
      catalog={catalogItems(catalog)}
      bagBadge={
        <Suspense fallback={null}>
          <BagBadge />
        </Suspense>
      }
    />
  )
}

/** Bag count in a digit slot; hidden at 0. */
async function BagBadge() {
  const count = itemCount(await retrieveCart())
  if (!count) return null
  return (
    <span className="digits digits-cells text-[13px]">
      {[...String(count)].map((d, i) => (
        <span key={i}>{d}</span>
      ))}
      <span className="sr-only"> items in bag</span>
    </span>
  )
}
