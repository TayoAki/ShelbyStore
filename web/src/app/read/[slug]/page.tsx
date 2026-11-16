import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { RopeBuyBlock } from "@/components/rope-buy-block"
import { Track } from "@/components/track"
import { listSeries } from "@/lib/data/content"
import { liveStock, ropeCatalog } from "@/lib/data/rope"
import { formatMoney } from "@/lib/format"
import { getAdvertorial } from "@/lib/landing/advertorials"
import { POLICY } from "@/lib/policy"
import { findVariant, price } from "@/lib/product"
import { CORE_COLORS, crownCm } from "@/lib/rope"

export async function generateMetadata({ params }: PageProps<"/read/[slug]">): Promise<Metadata> {
  const a = getAdvertorial((await params).slug)
  return a ? { title: a.headline, description: a.dek } : { title: "Not found" }
}

/**
 * The advertorial (SITE_SPEC G.6.12): a labelled advertisement on the white
 * article sheet, in Shelby's voice, ending with the offer card (the page's
 * golf-green band) and the disclosure.
 */
export default function AdvertorialPage(props: PageProps<"/read/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-2.5 h-[70vh] animate-pulse rounded-3xl bg-white" />}>
      <AdvertorialContent params={props.params} />
    </Suspense>
  )
}

async function AdvertorialContent({ params }: { params: PageProps<"/read/[slug]">["params"] }) {
  const a = getAdvertorial((await params).slug)
  if (!a) notFound()
  const [c, series] = await Promise.all([ropeCatalog(), listSeries()])
  if (!c.core) notFound()
  const story = series[0] ?? null
  const tokens: Record<string, string> = {
    crown: crownCm(c.core) ?? "11–11.5",
    range: POLICY.oneSize.replace("fits ", ""),
    price: formatMoney(price(c.core).amount),
    pair_price: formatMoney(c.pair ? price(c.pair).amount : null),
    returns: POLICY.returns,
  }
  const fill = (t: string) => t.replace(/\{(\w+)\}/g, (_, k: string) => tokens[k] ?? "")
  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(a.published)).toUpperCase()

  return (
    <>
      <Track event="advertorial_viewed" props={{ slug: a.slug }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <p className="mb-2.5 flex justify-center">
        <span className="badge font-mono">ADVERTISEMENT · FROM SHELBY</span>
      </p>
      <article className="mx-2.5 rounded-3xl bg-white px-5 py-10 md:px-10">
        <div className="mx-auto max-w-[65ch]">
          <p className="font-mono text-xs leading-4 tracking-[.1em]">{a.kicker}</p>
          <h1 className="mt-3 font-serif text-[30px] leading-[38px] tracking-[-.005em] md:text-[40px] md:leading-[48px]">{a.headline}</h1>
          <p className="mt-4 text-lg leading-7 text-charcoal">{a.dek}</p>
          <p className="mt-4 font-mono text-xs leading-4 text-light-charcoal">BY SHELBY · 4 MIN READ · {date}</p>
          <figure className="mt-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
              <Image src={a.lead.src} alt={a.lead.alt} fill preload sizes="(min-width: 768px) 65ch, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-2 text-xs leading-4 text-neutral-800">{a.lead.caption}</figcaption>
          </figure>
          <div className="mt-8 text-base leading-[26px] text-charcoal [&>p]:mb-5">
            {a.blocks.map((b, i) => {
              if (b.kind === "p") return <p key={i}>{fill(b.text)}</p>
              if (b.kind === "h2")
                return (
                  <h2 key={i} className="mt-10 mb-4 font-display text-2xl leading-8 text-black">
                    {b.text}
                  </h2>
                )
              if (b.kind === "figure")
                return (
                  <figure key={i} className="my-8">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-white">
                      <Image src={b.src} alt={b.alt} fill sizes="(min-width: 768px) 65ch, 100vw" className={b.src.includes("rope-cap-") ? "object-contain" : "object-cover"} />
                    </div>
                    <figcaption className="mt-2 text-xs leading-4 text-neutral-800">{fill(b.caption)}</figcaption>
                  </figure>
                )
              if (b.kind === "cta")
                return (
                  <p key={i} className="my-8">
                    <Link href={b.to === "pdp" ? "/products/rope-cap" : "/offer/the-pair"} className="btn btn-primary !border-black" data-track={b.track}>
                      {b.label.toUpperCase()}
                    </Link>
                  </p>
                )
              return (
                <Suspense key={i} fallback={null}>
                  <ProofBlock stance={story?.stance ?? null} handle={story?.handle ?? null} />
                </Suspense>
              )
            })}
          </div>
        </div>
      </article>
      <section aria-label="The offer" className="band-golf mx-2.5 my-10 rounded-3xl p-2.5 md:p-10">
        <div className="mx-auto max-w-[547px] text-black">
          <RopeBuyBlock showBundles={false} source="advertorial" />
          <p className="mt-4 text-center">
            <Link href="/offer/the-pair" className="link text-sm !text-white" data-track="advertorial_offer_pack">
              Or two for {tokens.pair_price}
            </Link>
          </p>
        </div>
      </section>
      <p className="mx-auto mb-10 max-w-[65ch] px-5 text-center text-xs leading-4 text-light-charcoal">This is an advertisement from Shelby, the company that makes The Rope Cap.</p>
    </>
  )
}

async function ProofBlock({ stance, handle }: { stance: string | null; handle: string | null }) {
  const c = await ropeCatalog()
  const { stock } = await liveStock(c)
  const inStock = c.core
    ? CORE_COLORS.filter((col) => {
        const v = findVariant(c.core!, { Color: col })
        const n = v ? stock[v.id] : undefined
        return n === null || (typeof n === "number" && n > 0)
      }).length
    : 0
  if (!stance && !inStock) return null
  return (
    <aside className="my-8 rounded-2xl bg-natural-white-25 p-6">
      {stance && <p className="font-serif text-xl leading-7 text-black italic">{stance}</p>}
      {inStock > 0 && <p className="mt-3 text-sm leading-5">{inStock} of 4 core colors in stock today.</p>}
      {handle && (
        <Link href={`/stories/${handle}`} className="link mt-3 inline-block text-sm" data-track="advertorial_story">
          See The Crown Test
        </Link>
      )}
    </aside>
  )
}
