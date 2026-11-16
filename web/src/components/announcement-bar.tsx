import { Suspense } from "react"
import { getProduct, getRegion, listCatalog, listReleases } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { buildHoles, CORE_COLORS, nextHole, pad2, ROPE_CAP, totalStock } from "@/lib/rope"
import { findVariant, price } from "@/lib/product"
import { shortDate } from "./hole-card"
import { Ticker, type TickerItem } from "./ticker"

const POLICY_ITEM: TickerItem = { text: POLICY.announcement, href: null }

/**
 * Eastside's announcement bar (SITE_SPEC v8 E.6.0.1): 36px black, one real
 * fact at a time, cross-fading every 5s with a pause control. The facts come
 * from live data only: the shipping and returns line, the live hole and its
 * units left (else the core colours in stock), and the next hole's date.
 */
export function AnnouncementBar() {
  return (
    <Suspense fallback={<Ticker items={[POLICY_ITEM]} />}>
      <LiveTicker />
    </Suspense>
  )
}

async function LiveTicker() {
  const region = await getRegion()
  const [releases, catalog, core] = await Promise.all([
    listReleases(),
    region ? listCatalog(region.id) : Promise.resolve([]),
    region ? getProduct(ROPE_CAP, region.id) : Promise.resolve(null),
  ])
  const live = catalog.filter((p) => releases.some((r) => r.phase === "live" && r.products.some((x) => x.id === p.id)))
  const stock = await getStock([...new Set([...(core ? [core.id] : []), ...live.map((p) => p.id)])])
  const stockByHandle = Object.fromEntries(live.map((p) => [p.handle, totalStock(p, stock)]))
  const holes = buildHoles(releases, stockByHandle)
  const items: TickerItem[] = [POLICY_ITEM]

  const liveHole = holes.find((x) => !x.core && x.status === "live")
  if (liveHole) {
    const left = liveHole.size && liveHole.left !== null ? ` · ${liveHole.left} of ${liveHole.size} left` : ""
    items.push({ text: `Hole ${pad2(liveHole.hole)} ${liveHole.name} is out now${left}`, href: liveHole.productHandle ? `/products/${liveHole.productHandle}` : `/card/${liveHole.handle}` })
  } else if (core) {
    const inStock = CORE_COLORS.filter((c) => {
      const v = findVariant(core, { Color: c })
      const n = v ? stock[v.id] : undefined
      return n === null || (typeof n === "number" && n > 0)
    }).length
    items.push({ text: `The Rope Cap · ${formatMoney(price(core).amount)} · ${inStock} core colors in stock`, href: `/products/${ROPE_CAP}` })
  }
  const next = nextHole(holes)
  if (next?.handle) {
    const d = shortDate(next.date)
    items.push({ text: `Hole ${pad2(next.hole)} ${next.name} ${d ? `opens ${d}` : "is next"}`, href: `/card/${next.handle}` })
  }
  return <Ticker items={items} />
}
