import { Suspense } from "react"
import { getProduct, getRegion, listCatalog, listReleases } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { POLICY, STORE_TIMEZONE } from "@/lib/policy"
import { buildHoles, CORE_COLORS, holeDate, nextHole, ROPE_CAP, totalStock } from "@/lib/rope"
import { findVariant, price } from "@/lib/product"
import Link from "next/link"

type TickerItem = { text: string; href: string | null }

const POLICY_ITEMS: TickerItem[] = [
  { text: "FREE SHIPPING ON $85+", href: null },
  { text: POLICY.returns.toUpperCase(), href: null },
]

/**
 * The box's top flap: one static printed line of real facts (next hole, units
 * left on live editions, the core cap's colours in stock, then policy). Nothing
 * scrolls or loops; an item with no source is left out.
 */
export function AnnouncementBar() {
  return (
    <Suspense fallback={<FlapLine items={POLICY_ITEMS} />}>
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

  // Three facts at most: the next hole, a live edition's units left (else the
  // core cap in stock), and the shipping line. Upcoming editions live on The Card.
  const next = nextHole(holes)
  if (next) {
    const { day, time } = holeDate(next.date, STORE_TIMEZONE)
    items.push({ text: `HOLE ${next.hole} · ${next.name.toUpperCase()} · ${day} · ${time?.toUpperCase()}`, href: `/card/${next.handle}` })
  }
  const liveLeft = holes.find((x) => !x.core && x.status === "live" && x.size && x.left !== null)
  if (liveLeft) items.push({ text: `${liveLeft.name.toUpperCase()} · ${liveLeft.left} OF ${liveLeft.size} LEFT`, href: `/card/${liveLeft.handle}` })
  else if (core) {
    const inStock = CORE_COLORS.filter((c) => {
      const v = findVariant(core, { Color: c })
      const n = v ? stock[v.id] : undefined
      return n === null || (typeof n === "number" && n > 0)
    }).length
    items.push({ text: `THE ROPE CAP · ${formatMoney(price(core).amount)} · ${inStock} CORE COLORS IN STOCK`, href: `/products/${ROPE_CAP}` })
  }
  return <FlapLine items={[...items, POLICY_ITEMS[0]]} />
}

function FlapLine({ items }: { items: TickerItem[] }) {
  return (
    <div className="border-b-2 border-ink bg-ink text-white">
      <ul className="mx-auto flex h-9 max-w-[1440px] items-center justify-center gap-x-6 overflow-hidden px-4 label !text-[12px] whitespace-nowrap">
        {items.map((it, i) => (
          <li key={it.text} className={i === 0 ? "" : i === 1 ? "hidden sm:block" : "hidden lg:block"}>
            {it.href ? (
              <Link href={it.href} data-track="ticker_item" className="underline-offset-4 hover:underline">
                {it.text}
              </Link>
            ) : (
              it.text
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
