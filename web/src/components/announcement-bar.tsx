import { Suspense } from "react"
import { getProduct, getRegion, listCatalog, listReleases } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { POLICY, STORE_TIMEZONE } from "@/lib/policy"
import { buildHoles, CORE_COLORS, holeDate, nextHole, ROPE_CAP, totalStock } from "@/lib/rope"
import { findVariant, price } from "@/lib/product"
import { Ticker, type TickerItem } from "./ticker"

const POLICY_ITEMS: TickerItem[] = [
  { text: "FREE SHIPPING ON $85+", href: null },
  { text: POLICY.returns.toUpperCase(), href: null },
]

/**
 * The leaderboard ticker (SITE_SPEC G.5.3), replacing the v5 announcement
 * crossfade. Real data only, in order: next hole, each live edition's units
 * left, each upcoming edition's size, the core cap's price and colours in
 * stock, then policy. An item with no source is left out.
 */
export function AnnouncementBar() {
  return (
    <Suspense fallback={<Ticker items={POLICY_ITEMS} />}>
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
  const items: TickerItem[] = []

  const next = nextHole(holes)
  if (next) {
    const { day, time } = holeDate(next.date, STORE_TIMEZONE)
    items.push({ text: `HOLE ${next.hole} · ${next.name.toUpperCase()} · ${day} · ${time?.toUpperCase()}`, href: `/card/${next.handle}` })
  }
  for (const h of holes.filter((x) => !x.core && x.status === "live" && x.size && x.left !== null))
    items.push({ text: `${h.name.toUpperCase()} · ${h.left} OF ${h.size} LEFT`, href: `/card/${h.handle}` })
  for (const h of holes.filter((x) => !x.core && x.status === "upcoming" && x.size))
    items.push({ text: `${h.name.toUpperCase()} · EDITION OF ${h.size}`, href: `/card/${h.handle}` })
  if (core) {
    const inStock = CORE_COLORS.filter((c) => {
      const v = findVariant(core, { Color: c })
      const n = v ? stock[v.id] : undefined
      return n === null || (typeof n === "number" && n > 0)
    }).length
    items.push({ text: `THE ROPE CAP · ${formatMoney(price(core).amount)} · ${inStock} CORE COLORS IN STOCK`, href: `/products/${ROPE_CAP}` })
  }
  return <Ticker items={[...items, ...POLICY_ITEMS]} />
}
