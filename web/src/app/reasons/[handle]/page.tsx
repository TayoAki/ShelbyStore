import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment, Suspense, type ReactNode } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { Digits } from "@/components/digits"
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
 * The listicle: six numbered reasons printed as panels, each with a die-cut
 * window and the checkable fact behind it; a reason whose fact source is empty
 * is dropped. Calls to action after reasons 3 and 6, then the front panel.
 */
export default function ReasonsPage(props: PageProps<"/reasons/[handle]">) {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 h-[60vh] max-w-[1440px] animate-pulse bg-wash" />}>
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
              About <Digits value={cm} /> cm, against 12 cm on a high-crown rope cap.{" "}
              <Link href="/fit-guide" className="link font-semibold">
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
        <Suspense fallback={<span className="text-ink-2">Checking stock…</span>}>
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
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-3 md:gap-6 md:px-6 md:pt-6">
        <section className="panel overflow-hidden">
          <span className="panel-inner" aria-hidden />
          <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] md:grid-cols-2 md:items-center">
            <div className="window aspect-square">
              <Image src="/hats/rope-cap-tour-white-1.jpg" alt="The Rope Cap in Tour White" fill preload sizes="(min-width: 768px) 45vw, 92vw" className="object-contain p-[8%]" />
              <span className="window-shade" aria-hidden />
            </div>
            <div className="flex flex-col gap-5">
              <h1 className="model">Six things that make this rope cap different</h1>
              <p className="max-w-[48ch] text-[1.125rem] leading-[1.6] text-ink-2">Every reason comes with the fact behind it, so you can check it on this page.</p>
              <nav aria-label="Reasons">
                <ol className="grid grid-cols-2 plate sm:grid-cols-3">
                  {reasons.map((r, i) => (
                    <li key={r.key} className="bg-paper">
                      <a href={`#reason-${i + 1}`} className="flex min-h-12 items-center gap-2 px-3 hover:bg-wash">
                        <span className="text-[1.25rem] leading-none" aria-hidden>
                          <Digits value={String(i + 1).padStart(2, "0")} />
                        </span>
                        <span className="label">{r.key}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </section>

        {reasons.map((r, i) => (
          <Fragment key={r.key}>
            <section id={`reason-${i + 1}`} aria-labelledby={`reason-${i + 1}-title`} className="panel scroll-mt-28">
              <span className="panel-inner" aria-hidden />
              <div className={`relative grid gap-6 p-[var(--panel-pad)] md:grid-cols-2 md:items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="window aspect-[4/3]">
                  {r.images ? (
                    <div className="grid size-full grid-cols-4 items-center gap-2 p-4">
                      {r.images.map((src) => (
                        <span key={src} className="relative aspect-square">
                          <Image src={src} alt="" fill sizes="12vw" className="object-contain" />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <Image src={r.image} alt="" fill sizes="(min-width: 768px) 45vw, 92vw" className={r.image.includes("rope-cap-") ? "object-contain p-[8%]" : "object-cover"} />
                  )}
                  <span className="window-shade" aria-hidden />
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-[4rem] leading-none" aria-hidden>
                    <Digits value={String(i + 1).padStart(2, "0")} />
                  </span>
                  <h2 id={`reason-${i + 1}-title`} className="panel-title">
                    {r.title}
                  </h2>
                  <div className="max-w-[46ch] text-[1.125rem] leading-[1.6]">{r.fact}</div>
                </div>
              </div>
            </section>
            {(i === 2 || i === reasons.length - 1) && (
              <div className="flex justify-center">
                <Link href="#buy" className="btn btn-secondary btn-large" data-track={i === 2 ? "listicle_mid_cta" : "listicle_end_cta"}>
                  Shop the Rope Cap
                </Link>
              </div>
            )}
          </Fragment>
        ))}

        <section id="buy" aria-label="Buy" className="mx-auto w-full max-w-[640px] scroll-mt-28">
          <RopeBuyBlock source="listicle" />
          <p className="mt-4 text-center">
            <Link href="/offer/the-pair" className="link font-semibold" data-track="listicle_offer">
              Or two for {formatMoney(c.pair ? price(c.pair).amount : null)}
            </Link>
          </p>
        </section>
      </div>
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
          <li key={col} className="flex justify-between gap-4 border-b border-dashed border-crease py-1.5">
            <span>{col}</span>
            <span>{typeof n === "number" ? <><Digits value={n} /> in stock</> : "In stock"}</span>
          </li>
        )
      })}
    </ul>
  )
}
