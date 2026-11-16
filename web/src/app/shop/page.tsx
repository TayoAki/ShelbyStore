import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Sleeves } from "@/components/box/back-panel"
import { ProductCard } from "@/components/product-card"
import { Track } from "@/components/track"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { colorThumbs } from "@/lib/product"
import { CORE_COLORS } from "@/lib/rope"
import type { VariantStock } from "@/lib/types"

export const metadata: Metadata = {
  title: "The Rope Cap",
  description: "One rope cap, four core colors and a numbered edition each season.",
}

const GROUPS = ["all", "core", "limited", "bundles"] as const
type Group = (typeof GROUPS)[number]

/**
 * The range, printed like the model line-up on a box's back: the four core
 * colourways and the numbered editions as units on one keylined plate, the
 * printed group tabs, then the Pair and Foursome sleeves.
 */
export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 aspect-[4/1] max-w-[1440px] animate-pulse bg-wash" />}>
      <ShopContent searchParams={props.searchParams} />
    </Suspense>
  )
}

async function ShopContent({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const sp = await searchParams
  const group: Group = GROUPS.includes(sp.group as Group) ? (sp.group as Group) : "all"
  const c = await ropeCatalog()
  const limited = c.holes.filter((h) => !h.core && h.status !== "announced")
  return (
    <>
      <Track event="collection_viewed" props={{ group }} />
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-3 pt-6 md:px-6 md:pt-10">
        <nav aria-label="Breadcrumb" className="label !text-[12px] text-ink-2">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          / The Rope Cap
        </nav>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="model">The range</h1>
            <p className="max-w-[56ch] text-[1.125rem] leading-[1.6]">
              One cap in four core colors, always in stock, and {limited.length} numbered {limited.length === 1 ? "edition" : "editions"} on the season&apos;s dates.
            </p>
          </div>
          <div className="flex gap-6 border-b-2 border-ink" role="tablist" aria-label="Groups">
            {GROUPS.map((g) => (
              <Link
                key={g}
                href={g === "all" ? "/shop" : `/shop?group=${g}`}
                role="tab"
                aria-selected={group === g}
                data-track="color_pill"
                className="tab-title -mb-[2px] flex min-h-11 items-end"
              >
                {g === "limited" ? "Numbered" : g}
              </Link>
            ))}
          </div>
        </div>
        <Suspense fallback={<Grid c={c} group={group} stock={undefined} />}>
          <LiveGrid c={c} group={group} />
        </Suspense>
        {(group === "all" || group === "bundles") && <Sleeves pair={c.pair} foursome={c.foursome} />}
      </div>
    </>
  )
}

async function LiveGrid({ c, group }: { c: RopeCatalog; group: Group }) {
  const { stock } = await liveStock(c)
  return <Grid c={c} group={group} stock={stock} />
}

function Grid({ c, group, stock }: { c: RopeCatalog; group: Group; stock: VariantStock | undefined }) {
  if (group === "bundles") return null
  const showCore = group === "all" || group === "core"
  const showLimited = group === "all" || group === "limited"
  const upcoming = c.holes.filter((h) => !h.core && h.status === "upcoming")
  const cards = [
    ...(showCore && c.core ? CORE_COLORS.map((color, i) => <ProductCard key={color} product={c.core!} color={color} colors={[...CORE_COLORS]} stock={stock} preload={i < 2} />) : []),
    ...(showLimited
      ? c.editions.map((e) => {
          const h = c.holes.find((x) => x.productHandle === e.handle)
          return <ProductCard key={e.handle} product={e} color={colorThumbs(e)[0]?.color ?? e.title} stock={stock} badge={h ? `HOLE ${h.hole}` : "LIMITED"} />
        })
      : []),
  ]
  if (!cards.length && !(showLimited && upcoming.length))
    return (
      <div className="panel flex flex-col items-start gap-4 p-[var(--panel-pad)]">
        <p className="text-[1.125rem]">No numbered edition is on sale right now. The next one is on The Card.</p>
        <Link href="/card" className="btn btn-secondary">
          See The Card
        </Link>
      </div>
    )
  return (
    <div className="grid grid-cols-2 plate md:grid-cols-4">
      {cards}
      {showLimited &&
        upcoming.map((h) => (
          <Link key={h.hole} href={`/card/${h.handle}`} className="group flex h-full flex-col gap-3 bg-paper p-3 md:p-4" data-track="card_hole">
            <span className="window relative block aspect-square !rounded-[20px]">
              {h.image && <Image src={h.image} alt={`${h.name}, Hole ${h.hole}`} fill sizes="(min-width: 768px) 22vw, 45vw" className="object-contain p-[7%]" />}
              <span className="window-shade" aria-hidden />
              <span className="badge-edition absolute top-2 left-2 z-[2]">Hole {h.hole}</span>
            </span>
            <span className="font-model text-[1.375rem] leading-none font-[800] uppercase">{h.name}</span>
            <span className="text-[0.875rem] text-ink-2">{h.size ? `Edition of ${h.size}` : "Numbered edition"}</span>
            <span className="label mt-auto underline decoration-1 underline-offset-4 group-hover:decoration-2">Join the tee sheet</span>
          </Link>
        ))}
    </div>
  )
}
