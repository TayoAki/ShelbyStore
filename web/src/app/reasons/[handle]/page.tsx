import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment, Suspense, type ReactNode } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { RopeBuyBlock } from "@/components/rope-buy-block"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
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
 * The listicle (SITE_SPEC v8 E.6.11): six reasons as alternating editorial
 * splits, each with the checkable fact behind it; a reason whose fact source
 * is empty is dropped. Calls to action after reasons 3 and 6, then the Rope
 * Cap in the PDP layout.
 */
export default function ReasonsPage(props: PageProps<"/reasons/[handle]">) {
  return (
    <Suspense fallback={<div className="h-[60vh]" aria-busy />}>
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
    cm
      ? {
          key: "crown",
          title: "A crown that sits mid, not tall.",
          image: "/hats/rope-cap-pine-3.jpg",
          fact: (
            <>
              About {cm} cm, against 12 cm on a high-crown rope cap.{" "}
              <Link href="/fit-guide" className="link">
                See it drawn to scale
              </Link>
            </>
          ),
        }
      : null,
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
        <Suspense fallback={<span className="text-text-light">Checking stock…</span>}>
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
      <header className="wrap pt-4 text-center">
        <nav aria-label="Breadcrumb" className="crumbs-coll">
          <Link href="/">Home</Link> / <span aria-current="page">Six reasons</span>
        </nav>
        <h1 className="title-page mt-[13px]">Six reasons</h1>
        <p className="mx-auto mt-3 max-w-[560px] text-[14.4px]">Six things that make this rope cap different. Every reason comes with the fact behind it, so you can check it on this page.</p>
      </header>

      <div className="mt-10">
        {reasons.map((r, i) => (
          <Fragment key={r.key}>
            <section id={`reason-${i + 1}`} aria-labelledby={`reason-${i + 1}-title`} className="grid scroll-mt-24 md:grid-cols-2">
              <div className={`relative aspect-square overflow-hidden bg-tile ${i % 2 ? "md:order-2" : ""}`}>
                {r.images ? (
                  <div className="grid size-full grid-cols-2 gap-1 p-1">
                    {r.images.map((src) => (
                      <span key={src} className="relative bg-white">
                        <Image src={src} alt="" fill sizes="25vw" className="tile-photo object-contain" />
                      </span>
                    ))}
                  </div>
                ) : (
                  <Image src={r.image} alt="" fill sizes="(min-width: 750px) 50vw, 100vw" className={r.image.includes("rope-cap-") ? "tile-photo object-contain" : "object-cover"} />
                )}
              </div>
              <div className={`flex items-center p-6 md:p-12 ${i % 2 ? "md:order-1 md:justify-end" : ""}`}>
                <div className="flex max-w-[520px] flex-col items-start">
                  <p className="eyebrow">Reason {String(i + 1).padStart(2, "0")}</p>
                  <h2 id={`reason-${i + 1}-title`} className="title-section mt-2 !text-[28px] md:!text-[38.4px]">
                    {r.title}
                  </h2>
                  <div className="body-long mt-3">{r.fact}</div>
                </div>
              </div>
            </section>
            {(i === 2 || i === reasons.length - 1) && (
              <div className="flex flex-col items-center gap-3 py-10">
                <ButtonLink href="#buy" track={i === 2 ? "listicle_mid_cta" : "listicle_end_cta"}>
                  Shop the Rope Cap
                </ButtonLink>
                {i === reasons.length - 1 && c.pair && (
                  <Link href="/offer/the-pair" className="link text-[14.4px]" data-track="listicle_offer">
                    Or get The Pair for {formatMoney(price(c.pair).amount)}
                  </Link>
                )}
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <section id="buy" aria-label="Buy" className="scroll-mt-24 border-t border-border">
        <RopeBuyBlock source="listicle" />
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
          <li key={col} className="flex justify-between gap-4 border-b border-border py-1.5">
            <span>{col}</span>
            <span className="tabular">{typeof n === "number" ? `${n} in stock` : "In stock"}</span>
          </li>
        )
      })}
    </ul>
  )
}
