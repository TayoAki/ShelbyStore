import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment, Suspense, type ReactNode } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { CROWN, FitScale } from "@/components/fit-scale"
import { Reveal } from "@/components/motion/reveal"
import { RopeBuyBlock } from "@/components/rope-buy-block"
import { Track } from "@/components/track"
import { liveStock, ropeCatalog } from "@/lib/data/rope"
import { formatMoney } from "@/lib/format"
import { findVariant, price } from "@/lib/product"
import { POLICY } from "@/lib/policy"
import { CORE_COLORS, crownCm, ROPE_CAP } from "@/lib/rope"

export const metadata: Metadata = {
  title: "Six things that make this rope cap different",
  description: "Every reason comes with the fact behind it, so you can check it on this page.",
}

type Reason = { key: string; title: string; image: string; images?: string[]; fact: ReactNode }

/**
 * The listicle (SITE_SPEC G.6.6): six numbered reasons, each with an image and
 * the fact behind it; a reason whose fact source is empty is dropped. CTAs
 * after reasons 3 and 6, then the buy block (the page's golf-green band).
 */
export default function ReasonsPage(props: PageProps<"/reasons/[handle]">) {
  return (
    <Suspense fallback={<div className="m-2.5 h-[60vh] animate-pulse rounded-[20px] bg-white" />}>
      <ReasonsContent params={props.params} />
    </Suspense>
  )
}

async function ReasonsContent({ params }: { params: PageProps<"/reasons/[handle]">["params"] }) {
  const { handle } = await params
  if (handle !== ROPE_CAP) notFound()
  const c = await ropeCatalog()
  const core = c.core
  if (!core) notFound()
  const details = ((core.metadata as { details?: Record<string, string> } | null)?.details ?? {}) as Record<string, string>
  const cm = crownCm(core)
  const candidates: (Reason | null)[] = [
    cm ? { key: "crown", title: "A crown that sits mid, not tall.", image: "/hats/rope-cap-pine-3.jpg", fact: <FitScale title="Crown height" steps={CROWN} value="Mid" note={`about ${cm} cm`} /> } : null,
    details.Fabric ? { key: "cotton", title: "Washed cotton, broken in on day one.", image: "/hats/rope-cap-tour-white-1.jpg", fact: details.Fabric } : null,
    details.Rope ? { key: "rope", title: "A rope worth looking at.", image: "/hats/rope-cap-tour-white-5.jpg", fact: details.Rope } : null,
    details.Closure
      ? { key: "strap", title: "A strap that adjusts without a plastic snap.", image: "/hats/rope-cap-tour-white-2.jpg", fact: `${details.Closure}. One size, ${POLICY.oneSize}.` }
      : null,
    {
      key: "stock",
      title: "Four colors that never run out.",
      image: "",
      images: CORE_COLORS.map((x) => `/hats/rope-cap-${x.toLowerCase().replace(/\s+/g, "-")}-1.jpg`),
      fact: (
        <Suspense fallback={<span className="text-light-charcoal">Checking stock…</span>}>
          <StockFact />
        </Suspense>
      ),
    },
    {
      key: "shipping",
      title: "Two ship free, and you get 30 days.",
      image: "/hats/rope-clubhouse.jpg",
      fact: `Free standard shipping on $${POLICY.freeShippingThreshold}+, so any two caps ship free. ${POLICY.returns}.`,
    },
  ]
  const reasons = candidates.filter((r): r is Reason => r !== null)

  return (
    <>
      <Track event="listicle_viewed" props={{ handle }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <section data-hero="" className="hero-in relative m-2.5 grid overflow-hidden rounded-[20px] bg-white md:grid-cols-2">
        <div className="relative aspect-square">
          <Image src="/hats/rope-cap-tour-white-1.jpg" alt="The Rope Cap in Tour White" fill preload sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
        </div>
        <div className="hero-in-content flex flex-col justify-center gap-4 p-6 pt-20 md:p-12">
          <p className="font-mono text-xs leading-5 tracking-[.1em]">6 REASONS · THE ROPE CAP</p>
          <h1 className="font-display text-2xl leading-8 md:text-[30px] md:leading-9">Six things that make this rope cap different</h1>
          <p className="text-sm leading-5 text-light-charcoal">Every reason comes with the fact behind it, so you can check it on this page.</p>
        </div>
      </section>
      <nav aria-label="Reasons" className="mx-2.5 my-10 flex flex-wrap justify-center gap-2">
        {reasons.map((r, i) => (
          <a key={r.key} href={`#reason-${i + 1}`} className="btn btn-outline-black btn-small">
            {String(i + 1).padStart(2, "0")} {r.key.toUpperCase()}
          </a>
        ))}
      </nav>
      {reasons.map((r, i) => (
        <Fragment key={r.key}>
          <Reveal id={`reason-${i + 1}`} aria-label={r.title} className={`mx-2.5 my-10 flex scroll-mt-28 flex-col md:flex-row ${i % 2 ? "md:flex-row-reverse" : ""}`}>
            <div className="relative aspect-[10/7] overflow-hidden rounded-xl bg-white md:min-w-[55vw]">
              {r.images ? (
                <div className="grid size-full grid-cols-4 items-center gap-2 p-4">
                  {r.images.map((src) => (
                    <span key={src} className="relative aspect-square">
                      <Image src={src} alt="" fill sizes="14vw" className="object-contain" />
                    </span>
                  ))}
                </div>
              ) : (
                <Image src={r.image} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className={r.image.includes("rope-cap-") ? "object-contain" : "object-cover"} />
              )}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl px-5 py-6 text-center md:px-10">
              <span className="badge font-mono">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-2xl leading-8">{r.title}</h2>
              <div className="w-full max-w-[360px] text-xs leading-4 text-light-charcoal">{r.fact}</div>
            </div>
          </Reveal>
          {(i === 2 || i === reasons.length - 1) && (
            <div className="my-10 flex justify-center">
              <Link href="#buy" className="btn btn-secondary" data-track={i === 2 ? "listicle_mid_cta" : "listicle_end_cta"}>
                SHOP THE ROPE CAP
              </Link>
            </div>
          )}
        </Fragment>
      ))}
      <section id="buy" aria-label="Buy" className="band-golf mx-2.5 my-10 scroll-mt-28 rounded-3xl p-2.5 md:p-10">
        <div className="mx-auto max-w-[547px] text-black">
          <RopeBuyBlock source="listicle" />
          <p className="mt-4 text-center">
            <Link href="/offer/the-pair" className="link text-sm !text-white" data-track="listicle_offer">
              Or two for {formatMoney(c.pair ? price(c.pair).amount : null)}
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}

async function StockFact() {
  const c = await ropeCatalog()
  const { stock } = await liveStock(c)
  return (
    <ul className="flex flex-col gap-1">
      {CORE_COLORS.map((col) => {
        const v = c.core ? findVariant(c.core, { Color: col }) : undefined
        const n = v ? stock[v.id] : undefined
        return (
          <li key={col} className="flex justify-between">
            <span>{col}</span>
            <span className={typeof n === "number" && n > 0 ? "text-green" : ""}>{typeof n === "number" ? `${n} in stock` : "In stock"}</span>
          </li>
        )
      })}
    </ul>
  )
}
