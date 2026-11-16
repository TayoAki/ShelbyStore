import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { RopeBuyBlock } from "@/components/rope-buy-block"
import { lead } from "@/components/header"
import { KitCard } from "@/components/kit-card"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
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
 * The advertorial (SITE_SPEC v8 E.6.12): a labelled advertisement set in
 * Eastside's about-page type at a 680px measure, pull quotes in Monomakh with
 * a green rule, the Rope Cap in the PDP layout, the kit pack and the
 * disclosure.
 */
export default function AdvertorialPage(props: PageProps<"/read/[slug]">) {
  return (
    <Suspense fallback={<div className="h-[70vh]" aria-busy />}>
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
      <article className="wrap pt-10 pb-6 md:pt-14">
        <header className="mx-auto max-w-[900px] text-center">
          <p className="eyebrow-sm">Shelby Journal</p>
          <h1 className="title-feature mt-3 !text-[34px] md:!text-[52px]">{a.headline}</h1>
          <p className="body-long mx-auto mt-4 max-w-[680px]">{a.dek}</p>
          <p className="meta mt-4">
            Advertisement from Shelby · {a.kicker} · 4 min read · {date}
          </p>
        </header>
        <figure className="mx-auto mt-8 max-w-[680px]">
          <div className="relative aspect-[4/3] overflow-hidden bg-tile">
            <Image src={a.lead.src} alt={a.lead.alt} fill preload sizes="(min-width: 750px) 680px, 100vw" className="object-cover" />
          </div>
          <figcaption className="meta mt-2">{a.lead.caption}</figcaption>
        </figure>
        <div className="body-long mx-auto mt-10 max-w-[680px] [&>p]:mb-5">
          {a.blocks.map((b, i) => {
            if (b.kind === "p") return <p key={i}>{fill(b.text)}</p>
            if (b.kind === "h2")
              return (
                <h2 key={i} className="title-blog mt-10 mb-4">
                  {b.text}
                </h2>
              )
            if (b.kind === "figure")
              return (
                <figure key={i} className="my-8">
                  <div className="relative aspect-[4/3] overflow-hidden bg-tile">
                    <Image src={b.src} alt={b.alt} fill sizes="(min-width: 750px) 680px, 100vw" className={b.src.includes("rope-cap-") ? "tile-photo object-contain" : "object-cover"} />
                  </div>
                  <figcaption className="meta mt-2">{fill(b.caption)}</figcaption>
                </figure>
              )
            if (b.kind === "cta")
              return (
                <p key={i} className="my-8">
                  <ButtonLink href={b.to === "pdp" ? "/products/rope-cap" : "/offer/the-pair"} track={b.track}>
                    {b.label}
                  </ButtonLink>
                </p>
              )
            return (
              <Suspense key={i} fallback={null}>
                <ProofBlock stance={story?.stance ?? null} handle={story?.handle ?? null} />
              </Suspense>
            )
          })}
        </div>
      </article>

      <section aria-label="The Rope Cap">
        <RopeBuyBlock showBundles={false} source="advertorial" />
      </section>

      {(c.pair || c.foursome) && (
        <section aria-labelledby="offer-pack" className="wrap pb-12">
          <div className="band-tile mx-auto max-w-[900px] p-6 md:p-10">
            <h2 id="offer-pack" className="title-blog text-center">
              Or take two
            </h2>
            <ul className="mx-auto mt-6 grid max-w-[600px] grid-cols-2 gap-1">
              {c.pair && (
                <li>
                  <KitCard product={c.pair} title="The Pair" href="/offer/the-pair" image={lead("Clubhouse Navy")} hover={lead("Pine")} track="advertorial_offer_pack" sizes="(min-width: 750px) 300px, 45vw" />
                </li>
              )}
              {c.foursome && (
                <li>
                  <KitCard product={c.foursome} title="The Foursome" href="/offer/the-pair#foursome" image={lead("Fescue")} hover={lead("Tour White")} track="advertorial_offer_pack" sizes="(min-width: 750px) 300px, 45vw" />
                </li>
              )}
            </ul>
          </div>
        </section>
      )}
      <p className="meta wrap mx-auto max-w-[680px] pb-12 text-center">This is an advertisement from Shelby, the company that makes The Rope Cap.</p>
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
    <aside className="my-10 border-l-2 border-green pl-6">
      {stance && <p className="font-display text-[26px] leading-[1.15] md:text-[32px]">{stance}</p>}
      {inStock > 0 && <p className="meta mt-3">{inStock} of 4 core colors in stock today.</p>}
      {handle && (
        <Link href={`/stories/${handle}`} className="link mt-3 inline-block text-[14.4px]" data-track="advertorial_story">
          See The Crown Test
        </Link>
      )}
    </aside>
  )
}
