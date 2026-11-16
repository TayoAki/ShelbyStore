"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { findVariant, LOW_STOCK, price } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"
import { useAddToBag } from "../cart/use-add-to-bag"
import { FitScales } from "../fit-scale"
import { RopeRule } from "../rope-rule"
import { SwatchFace, SwatchLink } from "../swatch"
import { useSelection } from "./selection"

export type LimitedSwatch = { name: string; href: string; caption: string | null; selected: boolean }

type Props = {
  product: Product
  /** null while live stock is loading. */
  stock: VariantStock | null
  /** In-page colourways (the core four, or the edition's one colour). */
  colors: string[]
  /** Swatches that link to another product: editions (on the core PDP) or the core colours (on an edition PDP). */
  linked: { group: "CORE" | "LIMITED"; swatches: LimitedSwatch[] }
  ropeByColor: Record<string, string | null>
  edition: { hole: number; size: number | null; dateLabel: string | null; released: boolean } | null
  releaseId?: string | null
  crown: { value: string; note: string | null; structure: string } | null
  bundles: ReactNode
  /** h1 on the PDP; h2 where the page already has its own H1 (landing pages). */
  titleAs?: "h1" | "h2"
  /** `add_to_cart` source (pdp, quiz, story…); the sticky bar always reports "sticky". */
  source?: string
}

/**
 * Allbirds' PDP buy card (v5 §6.4.3, G.6.3): serif italic title, mono sub-line,
 * price + pill, rope rule, colour groups (ALL · CORE · LIMITED), one-size line,
 * crown-height scale, add to bag (or SOLD OUT), policy + stock + edition lines,
 * bundle rows and the quiz link. The sticky buy bar appears once the main CTA
 * leaves the viewport (M33).
 */
export function BuyCard({ product, stock, colors, linked, ropeByColor, edition, releaseId, crown, bundles, titleAs: Title = "h1", source = "pdp" }: Props) {
  const { color, setColor, shared } = useSelection()
  const active = color && colors.includes(color) ? color : colors[0]
  const [group, setGroup] = useState<"ALL" | "CORE" | "LIMITED">("ALL")
  const { add, pending, error } = useAddToBag()
  const variant = findVariant(product, { Color: active })
  const n = variant && stock ? stock[variant.id] : undefined
  const soldOut = stock !== null && typeof n === "number" && n <= 0
  const p = price(product, variant)
  const ownGroup = edition ? "LIMITED" : "CORE"

  const pick = (c: string) => {
    setColor(c)
    if (shared) {
      const url = new URL(window.location.href)
      url.searchParams.set("color", c)
      window.history.replaceState(null, "", url)
    }
  }
  const onAdd = (track = "add_to_cart") => {
    if (!variant || soldOut) return
    add({ productId: product.id, variantId: variant.id, price: p.amount, currency: p.currency, releaseId: releaseId ?? undefined, source: track === "sticky_add_to_cart" ? "sticky" : source })
  }

  const cta = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)
  useEffect(() => {
    const el = cta.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting || e.boundingClientRect.top > 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const label = soldOut ? "SOLD OUT" : `ADD TO BAG – ${formatMoney(p.amount, p.currency)}`
  const stockLine =
    stock === null ? (
      <span className="text-light-charcoal">Checking stock…</span>
    ) : soldOut ? (
      <span className="text-light-charcoal">● Sold out in {active}</span>
    ) : typeof n === "number" && n <= LOW_STOCK ? (
      <span className="text-red">● Only {n} left in {active}</span>
    ) : (
      <span className="text-green">● In stock · ships in 1–2 business days</span>
    )

  const showOwn = group === "ALL" || group === ownGroup
  const showLinked = (group === "ALL" || group === linked.group) && linked.swatches.length > 0

  return (
    <aside className="grid grid-cols-1 gap-6 rounded-xl bg-white p-5 max-md:mx-2.5 md:sticky md:top-[120px] md:self-start md:shadow-sm lg:p-6 xl:p-8" data-reveal="" data-in="true">
      <div className="flex flex-col gap-2">
        <Title className="font-serif text-2xl leading-8 italic md:text-[30px] md:leading-9">{product.title}</Title>
        <p className="font-mono text-xs leading-4 tracking-[.05em] text-light-charcoal uppercase md:text-sm md:leading-5">
          {edition
            ? `HOLE ${edition.hole} · LIMITED EDITION${edition.dateLabel ? ` · ${edition.released ? "RELEASED" : "RELEASES"} ${edition.dateLabel}` : ""}`
            : "ONE SIZE · CORE COLOR"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-7 font-medium tracking-[.05em]">{formatMoney(p.amount, p.currency)}</span>
          <span className="rounded-full bg-natural-white px-2 py-1 text-xs leading-4 font-medium tracking-[.05em] uppercase italic">+ ANY TWO SHIP FREE</span>
        </div>
        <RopeRule color={active} className="mt-2" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-1 rounded-full border border-black p-1 text-xs" role="tablist" aria-label="Color groups">
          {(["ALL", "CORE", "LIMITED"] as const).map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={group === g}
              onClick={() => setGroup(g)}
              data-track="color_pill"
              className={`flex-1 rounded-full px-3 py-1.5 font-medium tracking-[.025em] transition-colors duration-200 ${group === g ? "bg-golf-green text-white" : "hover:bg-black/10"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <p className="flex flex-wrap gap-2 text-xs leading-4 font-medium tracking-wider">
          <span className="font-mono">COLOR:</span>
          <span>{active}</span>
          <span className="font-normal text-light-charcoal capitalize">
            {edition ? `(Hole ${edition.hole}${edition.size ? `, edition of ${edition.size}` : ""})` : "(Core)"}
          </span>
        </p>
        {ropeByColor[active] && <p className="-mt-1 text-xs leading-4 text-light-charcoal">{ropeByColor[active]} rope</p>}
        <div className="flex flex-wrap items-start gap-2">
          {showOwn &&
            colors.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={c === active} aria-label={c} onClick={() => pick(c)} className="p-0.5">
                <SwatchFace name={c} selected={c === active} />
              </button>
            ))}
          {showLinked &&
            linked.swatches.map((s) => <SwatchLink key={s.name} name={s.name} href={s.href} caption={s.caption} track="pdp_edition_link" selected={s.selected} />)}
        </div>
      </div>

      <p className="text-xs leading-4 text-light-charcoal">
        One size · {POLICY.oneSize}.{" "}
        <Link href="/fit-guide" className="link text-xs" data-track="fit_guide">
          Fit guide
        </Link>
      </p>

      {crown && <FitScales crown={crown.value} structure={crown.structure} crownNote={crown.note} />}

      <div ref={cta} className="flex flex-col gap-3">
        <button type="button" className="btn btn-secondary btn-atc" onClick={() => onAdd()} disabled={soldOut || pending || stock === null || !variant} data-track="add_to_cart" aria-busy={pending || undefined}>
          {label}
        </button>
        {error && (
          <p className="text-xs text-red" role="alert">
            {error}
          </p>
        )}
        <p className="text-center text-xs leading-4">{POLICY.shipping}</p>
        <p className="text-xs leading-4">{stockLine}</p>
        {edition && (
          <>
            <p className="edition">
              {edition.size ? `EDITION OF ${edition.size}` : "NUMBERED EDITION"}
              {typeof n === "number" && edition.released ? ` · ${n} LEFT` : ""}
            </p>
            <p className="text-xs leading-4 text-light-charcoal">{POLICY.limitedRun}</p>
          </>
        )}
      </div>

      {bundles}

      <Link href="/quiz" className="link text-xs" data-track="pdp_quiz">
        Not sure which color? Take the 30-second quiz
      </Link>

      <div
        className={`fixed inset-x-0 bottom-0 z-[70] rounded-t-md bg-white px-7 py-5 shadow-xl transition-all duration-150 ease-in-out ${ctaVisible ? "pointer-events-none opacity-0" : "opacity-100"}`}
        aria-hidden={ctaVisible}
      >
        <p className="flex justify-center gap-2 text-sm leading-5">
          <span>
            {product.title}, {active}
          </span>
          <span>{formatMoney(p.amount, p.currency)}</span>
        </p>
        <button type="button" tabIndex={ctaVisible ? -1 : 0} className="btn btn-secondary btn-atc mt-3" onClick={() => onAdd("sticky_add_to_cart")} disabled={soldOut || pending || stock === null} data-track="sticky_add_to_cart">
          {label}
        </button>
      </div>
    </aside>
  )
}
