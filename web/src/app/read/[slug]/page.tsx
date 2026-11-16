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
 * The advertorial (Read): a labelled advertisement printed on one panel at a
 * reading measure, in Shelby's voice, ending with the front panel and the
 * disclosure.
 */
export default function AdvertorialPage(props: PageProps<"/read/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 h-[70vh] max-w-[1440px] animate-pulse bg-wash" />}>
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
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-4 md:gap-6 md:px-6 md:pt-8">
        <article className="panel">
          <span className="panel-inner" aria-hidden />
          <div className="relative mx-auto flex max-w-[70ch] flex-col px-[var(--panel-pad)] py-10 md:py-16">
            <p>
              <span className="badge">Advertisement · From Shelby</span>
            </p>
            <h1 className="model mt-5 !text-[clamp(2.75rem,1.9rem+3.6vw,5rem)]">{a.headline}</h1>
            <p className="mt-5 text-[1.25rem] leading-[1.55] text-ink-2">{a.dek}</p>
            <p className="label mt-5 text-ink-2">By Shelby · {a.kicker} · 4 min read · {date}</p>
            <figure className="mt-8">
              <div className="window aspect-[16/9]">
                <Image src={a.lead.src} alt={a.lead.alt} fill preload sizes="(min-width: 768px) 70ch, 92vw" className="object-cover" />
                <span className="window-shade" aria-hidden />
              </div>
              <figcaption className="mt-2 text-[0.9375rem] leading-6 text-ink-2">{a.lead.caption}</figcaption>
            </figure>
            <div className="mt-10 text-[1.125rem] leading-[1.75] [&>p]:mb-6">
              {a.blocks.map((b, i) => {
                if (b.kind === "p") return <p key={i}>{fill(b.text)}</p>
                if (b.kind === "h2")
                  return (
                    <h2 key={i} className="panel-title mt-12 mb-5 !text-[2.25rem]">
                      {b.text}
                    </h2>
                  )
                if (b.kind === "figure")
                  return (
                    <figure key={i} className="my-10">
                      <div className="window aspect-[3/2]">
                        <Image src={b.src} alt={b.alt} fill sizes="(min-width: 768px) 70ch, 92vw" className={b.src.includes("rope-cap-") ? "object-contain p-[6%]" : "object-cover"} />
                        <span className="window-shade" aria-hidden />
                      </div>
                      <figcaption className="mt-2 text-[0.9375rem] leading-6 text-ink-2">{fill(b.caption)}</figcaption>
                    </figure>
                  )
                if (b.kind === "cta")
                  return (
                    <p key={i} className="my-10">
                      <Link href={b.to === "pdp" ? "/products/rope-cap" : "/offer/the-pair"} className="btn btn-secondary btn-large" data-track={b.track}>
                        {b.label}
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
        <section aria-label="The offer" className="mx-auto w-full max-w-[640px]">
          <RopeBuyBlock showBundles={false} source="advertorial" />
          <p className="mt-4 text-center">
            <Link href="/offer/the-pair" className="link font-semibold" data-track="advertorial_offer_pack">
              Or two for {tokens.pair_price}
            </Link>
          </p>
        </section>
        <p className="mx-auto max-w-[65ch] px-5 text-center text-[0.9375rem] leading-6 text-ink-2">This is an advertisement from Shelby, the company that makes The Rope Cap.</p>
      </div>
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
    <aside className="my-10 rounded-[4px] border-2 border-ink p-6">
      {stance && <p className="text-[1.375rem] leading-[1.45] font-semibold">{stance}</p>}
      {inStock > 0 && <p className="mt-3 text-[1rem] leading-6">{inStock} of 4 core colors in stock today.</p>}
      {handle && (
        <Link href={`/stories/${handle}`} className="link mt-3 inline-block font-semibold" data-track="advertorial_story">
          See The Crown Test
        </Link>
      )}
    </aside>
  )
}
