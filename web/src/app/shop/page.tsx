import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Banner } from "@/components/banner"
import { ProductCard } from "@/components/product-card"
import { Track } from "@/components/track"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { formatMoney } from "@/lib/format"
import { colorThumbs, price } from "@/lib/product"
import { CORE_COLORS } from "@/lib/rope"
import type { VariantStock } from "@/lib/types"

export const metadata: Metadata = {
  title: "The Rope Cap",
  description: "One rope cap, four core colors and a numbered edition each season.",
}

const GROUPS = ["all", "core", "limited", "bundles"] as const
type Group = (typeof GROUPS)[number]

/**
 * The collection (v5 §6.3, G.6.4): one colourway card per core colour, then
 * live and upcoming editions, then the bundles band (the page's golf-green
 * band). The group control replaces the shape control; there is no filter
 * panel (one size, colours are the cards).
 */
export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <Suspense fallback={<div className="m-2.5 aspect-[4/1] animate-pulse rounded-2xl bg-white" />}>
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
      <Banner
        image="/hats/rope-lifestyle-hero.jpg"
        crumbs={[{ label: "Home", href: "/" }, { label: "The Rope Cap" }]}
        title="The Rope Cap"
        description={
          <>
            <p>One cap, four core colors, a numbered edition each season.</p>
            <p className="mt-1">
              4 core colors · {limited.length} limited
            </p>
          </>
        }
      />
      <div className="mx-auto mb-4 flex max-w-7xl items-center justify-between gap-2.5 px-2.5 lg:h-16 lg:rounded-full lg:bg-natural-white lg:px-4 lg:py-3">
        <div className="scrollbar-hidden flex gap-1 overflow-x-auto rounded-full border border-black p-1" role="tablist" aria-label="Groups">
          {GROUPS.map((g) => (
            <Link
              key={g}
              href={g === "all" ? "/shop" : `/shop?group=${g}`}
              role="tab"
              aria-selected={group === g}
              data-track="color_pill"
              className={`btn shrink-0 border-0 ${group === g ? "bg-golf-green text-white" : "bg-transparent text-black hover:bg-black/10"}`}
            >
              {g.toUpperCase()}
            </Link>
          ))}
        </div>
        <p className="hidden text-sm leading-5 text-gray-600 lg:block">Sort: Featured</p>
      </div>
      <Suspense fallback={<Grid c={c} group={group} stock={undefined} />}>
        <LiveGrid c={c} group={group} />
      </Suspense>
      {(group === "all" || group === "bundles") && <BundlesBand c={c} />}
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
    ...(showCore && c.core ? CORE_COLORS.map((color, i) => <ProductCard key={color} product={c.core!} color={color} colors={[...CORE_COLORS]} stock={stock} badge="CORE" preload={i < 2} />) : []),
    ...(showLimited
      ? c.editions.map((e) => {
          const h = c.holes.find((x) => x.productHandle === e.handle)
          return <ProductCard key={e.handle} product={e} color={colorThumbs(e)[0]?.color ?? e.title} stock={stock} badge={h ? `HOLE ${h.hole}` : "LIMITED"} />
        })
      : []),
  ]
  return (
    <div className="mx-auto grid max-w-7xl grid-flow-dense grid-cols-2 gap-2.5 px-2.5 md:grid-cols-4 lg:px-0">
      {cards}
      {showLimited &&
        upcoming.map((h) => (
          <Link key={h.hole} href={`/card/${h.handle}`} className="flex h-full flex-col overflow-hidden rounded-2xl bg-white" data-track="card_hole">
            <span className="relative block aspect-square">
              {h.image && <Image src={h.image} alt={`${h.name}, Hole ${h.hole}`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />}
              <span className="badge absolute top-2.5 left-2.5 md:top-5 md:left-5">HOLE {h.hole}</span>
            </span>
            <span className="flex flex-col gap-1 p-4">
              <span className="text-xs leading-4 font-medium tracking-[.05em] uppercase md:text-sm md:leading-5">The Rope Cap, {h.name}</span>
              <span className="text-xs leading-4 text-light-charcoal">{h.size ? `Edition of ${h.size}` : "Numbered edition"}</span>
              <span className="mt-2 text-xs leading-4 font-medium uppercase underline">Join the tee sheet</span>
            </span>
          </Link>
        ))}
      {!cards.length && !upcoming.length && (
        <div className="col-span-full flex flex-col items-center gap-5 rounded-2xl bg-white p-10 text-center">
          <p className="text-xl leading-7">Nothing here right now.</p>
          <Link href="/shop" className="btn btn-secondary">
            SHOP THE ROPE CAP
          </Link>
        </div>
      )}
    </div>
  )
}

function BundlesBand({ c }: { c: RopeCatalog }) {
  const items = [
    c.pair && { p: c.pair, caps: 2, title: "The Pair", href: "/offer/the-pair", cta: "SHOP THE PAIR", track: "home_pair", images: ["clubhouse-navy", "pine"] },
    c.foursome && { p: c.foursome, caps: 4, title: "The Foursome", href: "/offer/the-pair#foursome", cta: "SHOP THE FOURSOME", track: "home_foursome", images: ["tour-white", "clubhouse-navy", "pine", "fescue"] },
  ].filter(Boolean) as { p: NonNullable<RopeCatalog["pair"]>; caps: number; title: string; href: string; cta: string; track: string; images: string[] }[]
  if (!items.length) return null
  return (
    <section aria-label="Two or four" className="band-golf mx-2.5 my-10 rounded-3xl p-5 md:p-10">
      <h2 className="mb-6 font-display text-2xl leading-8">Two or four</h2>
      <div className="grid gap-2.5 md:grid-cols-2">
        {items.map((b) => {
          const total = price(b.p).amount
          return (
            <div key={b.title} className="flex flex-col gap-4 rounded-2xl bg-white p-5 text-black md:flex-row md:items-center">
              <div className={`grid shrink-0 overflow-hidden rounded-xl bg-white md:w-48 ${b.images.length === 4 ? "grid-cols-2" : "grid-cols-2"}`}>
                {b.images.map((s) => (
                  <span key={s} className="relative aspect-square">
                    <Image src={`/hats/rope-cap-${s}-1.jpg`} alt="" fill sizes="96px" className="object-contain" />
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-2xl leading-8 italic">{b.title}</h3>
                <p className="font-mono text-xs leading-5 tracking-[.1em]">
                  {formatMoney(total)} · {formatMoney(total !== null ? total / b.caps : null)} A CAP
                </p>
                <Link href={b.href} className="btn btn-secondary w-fit" data-track={b.track}>
                  {b.cta}
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
