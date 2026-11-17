import { Suspense } from "react"
import { catalogItems } from "@/lib/catalog-items"
import { itemCount, retrieveCart } from "@/lib/data/cart"
import { getRegion, listCatalog } from "@/lib/data/catalog"
import { sunwashedCap } from "@/lib/sunwashed-cap"
import { CountBadge } from "./recently-viewed"
import { SiteHeader, type Panel, type StripTile } from "./site-header"

export const lead = (color: string) => `/hats/rope-cap-${color.toLowerCase().replace(/\s+/g, "-")}-1.jpg`

export async function Header() {
  const region = await getRegion()
  const catalog = region ? await listCatalog(region.id) : []
  const product = { label: sunwashedCap.title, href: sunwashedCap.href, image: sunwashedCap.image }
  const panels: Panel[] = [{
    key: "shop",
    label: "Shop",
    track: "nav_shop",
    columns: [{ heading: "Shop", links: [product, { label: "Shop all", href: "/shop" }] }],
    cards: [{ ...product, contain: true }],
  }]
  const strip: StripTile[] = [{ ...product, track: "sunwashed_cap" }]

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
