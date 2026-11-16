import { Suspense } from "react"
import { catalogItems } from "@/lib/catalog-items"
import { itemCount, retrieveCart } from "@/lib/data/cart"
import { getRegion, listCatalog, listReleases } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { buildHoles, CORE_COLORS, nextHole, pad2 } from "@/lib/rope"
import { CountBadge } from "./recently-viewed"
import { SiteHeader, type Panel, type StripTile } from "./site-header"

export const lead = (color: string) => `/hats/rope-cap-${color.toLowerCase().replace(/\s+/g, "-")}-1.jpg`

/**
 * Builds the header's mega-menu panels, the mobile colour strip and the
 * search index from the cached catalog (SITE_SPEC v8 E.6.0.2–E.6.0.5).
 * SHOP · THE CARD · EXPLORE · CUSTOM · QUIZ.
 */
export async function Header() {
  const region = await getRegion()
  const [releases, catalog, series] = await Promise.all([
    listReleases(),
    region ? listCatalog(region.id) : Promise.resolve([]),
    listSeries(),
  ])
  const holes = buildHoles(releases)
  const pair = catalog.find((p) => p.handle === "the-pair")
  const foursome = catalog.find((p) => p.handle === "the-foursome")
  const next = nextHole(holes)
  const liveHoles = holes.filter((h) => h.status === "live" && !h.core)
  const story = series[0] ?? null
  const holeHref = (h: (typeof holes)[number]) => (h.productHandle ? `/products/${h.productHandle}` : h.handle ? `/card/${h.handle}` : "/card")

  const panels: Panel[] = [
    {
      key: "shop",
      label: "Shop",
      track: "nav_shop",
      columns: [
        {
          heading: "Shop",
          links: [
            { label: "The Rope Cap", href: "/products/rope-cap" },
            ...(pair ? [{ label: "The Pair", href: "/offer/the-pair" }] : []),
            ...(foursome ? [{ label: "The Foursome", href: "/offer/the-pair#foursome" }] : []),
            { label: "Numbered editions", href: "/shop?group=limited" },
            { label: "Shop all", href: "/shop" },
          ],
        },
        { heading: "Colors", links: CORE_COLORS.map((c) => ({ label: c, href: `/products/rope-cap?color=${encodeURIComponent(c)}` })) },
      ],
      cards: [
        { label: "The Rope Cap", href: "/products/rope-cap", image: lead("Tour White"), contain: true },
        ...(pair ? [{ label: "The Pair", href: "/offer/the-pair", image: lead("Pine"), contain: true }] : []),
      ],
    },
    {
      key: "card",
      label: "The Card",
      track: "nav_drops",
      columns: [
        ...(liveHoles.length ? [{ heading: "Now", links: liveHoles.map((h) => ({ label: `No. ${pad2(h.hole)} ${h.name}`, href: holeHref(h) })) }] : []),
        ...(next ? [{ heading: "Next", links: [{ label: `No. ${pad2(next.hole)} ${next.name}`, href: `/card/${next.handle}` }] }] : []),
        { heading: "All six holes", links: [{ label: "The Card", href: "/card" }, ...holes.filter((h) => h.status === "announced").map((h) => ({ label: `No. ${pad2(h.hole)} ${h.name}`, href: "/card" }))] },
      ],
      cards: [...liveHoles.slice(0, 1), ...(next ? [next] : [])]
        .filter((h) => h.image)
        .map((h) => ({ label: `No. ${pad2(h.hole)} ${h.name}`, href: h === next ? `/card/${h.handle}` : holeHref(h), image: h.image!, contain: true })),
    },
    {
      key: "explore",
      label: "Explore",
      track: "nav_explore",
      columns: [
        {
          heading: "Explore",
          links: [
            ...(story ? [{ label: story.title, href: `/stories/${story.handle}` }] : []),
            { label: "Why the Rope Cap", href: "/reasons/rope-cap" },
            { label: "Fit guide", href: "/fit-guide" },
            { label: "The quiz", href: "/quiz" },
          ],
        },
        {
          heading: "Help",
          links: [
            { label: "Shipping & returns", href: "/help/shipping-returns" },
            { label: "Custom orders", href: "/custom" },
          ],
        },
      ],
      cards: story ? [{ label: story.title, href: `/stories/${story.handle}`, image: "/hats/story-crush.jpg", contain: false }] : [],
    },
  ]

  const live = liveHoles[0] ?? null
  const strip: StripTile[] = [
    ...CORE_COLORS.map((c) => ({ label: c === "Clubhouse Navy" ? "Navy" : c, href: `/products/rope-cap?color=${encodeURIComponent(c)}`, image: lead(c), track: "shop_by_color" })),
    { label: "Holes", href: "/card", image: live?.image ?? lead("Pine"), track: "home_scorecard" },
    ...(pair ? [{ label: "Pair", href: "/offer/the-pair", image: lead("Pine"), track: "home_pair" }] : []),
  ]

  return (
    <SiteHeader
      panels={panels}
      strip={strip}
      catalog={catalogItems(catalog)}
      bagBadge={
        <Suspense fallback={null}>
          <BagBadge />
        </Suspense>
      }
    />
  )
}

/** The bag count in its 16px green circle; nothing at 0. */
async function BagBadge() {
  const count = itemCount(await retrieveCart())
  if (!count) return null
  return (
    <>
      <CountBadge count={count} />
      <span className="sr-only">, {count} items</span>
    </>
  )
}
