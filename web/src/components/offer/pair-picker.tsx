"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState, type ReactNode } from "react"
import { useAddToBag } from "@/components/cart/use-add-to-bag"
import { useNotScrolledPast } from "@/lib/use-not-scrolled-past"
import { useFooterVisible } from "@/components/pdp/use-footer-visible"
import { SwatchFace } from "@/components/swatch"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { findVariant, price } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"

const lead = (c: string) => `/hats/rope-cap-${c.toLowerCase().replace(/\s+/g, "-")}-1.jpg`

/**
 * The Pair in Eastside's PDP layout (SITE_SPEC v8 E.6.10): the picked caps on
 * 5:6 #F6F6F6 tiles, and the buy column with the breadcrumb, the headline
 * (the `offer-headline` experiment), the shipping line, the price and per-cap
 * figure, two rows of 32px swatches ("Cap 1", "Cap 2"), the green Add button
 * and the policy lines. The sticky bar appears once the button scrolls away.
 */
export function PairPicker({
  pair,
  colors,
  single,
  stock,
  headline,
  initial,
  source = "offer",
  headingAs: Heading = "h1",
  crumbs,
}: {
  pair: Product
  colors: string[]
  single: number | null
  stock: VariantStock | null
  headline: string
  initial?: [string, string]
  source?: string
  headingAs?: "h1" | "h2"
  crumbs?: ReactNode
}) {
  const [first, setFirst] = useState(initial?.[0] ?? colors[0])
  const [second, setSecond] = useState(initial?.[1] ?? colors[2] ?? colors[1] ?? colors[0])
  const { add, pending, error } = useAddToBag()
  const variant = findVariant(pair, { "First cap": first, "Second cap": second })
  const n = variant && stock ? stock[variant.id] : undefined
  const soldOut = stock !== null && typeof n === "number" && n <= 0
  const p = price(pair, variant)
  const each = p.amount !== null ? p.amount / 2 : null
  const onAdd = (track: string) =>
    variant && !soldOut && add({ productId: pair.id, variantId: variant.id, price: p.amount, currency: p.currency, source, extra: { offer: pair.handle, first, second, cta: track } })

  const cta = useRef<HTMLDivElement>(null)
  const ctaOnScreen = useNotScrolledPast(cta)
  const footerOnScreen = useFooterVisible()
  const visible = ctaOnScreen || footerOnScreen

  return (
    <section aria-label="The Pair" className="pdp-grid wrap pt-4 lg:pt-6">
      <div className="pdp-gallery grid grid-cols-2 gap-1 self-start lg:sticky lg:top-[80px]">
        {[first, second].map((c, i) => (
          <div key={`${c}-${i}`} className="tile relative aspect-[5/6]">
            <Image key={c} src={lead(c)} alt={`Cap ${i + 1}: the Rope Cap in ${c}`} fill preload={i === 0} sizes="(min-width: 990px) 330px, 50vw" className="tile-photo animate-fade-in object-contain" />
          </div>
        ))}
      </div>
      <div className="pdp-side">
        <div className="pdp-head pt-4 lg:pt-0">
          {crumbs}
          <Heading className="title-product mt-2">{headline}</Heading>
          <p className="mt-2 text-[12.6px] md:text-[14.4px]">Free shipping on ${POLICY.freeShippingThreshold}+</p>
          <p className="mt-1 flex items-baseline gap-3">
            <span className="price">{formatMoney(p.amount, p.currency)}</span>
            <span className="meta">
              {formatMoney(each, p.currency)} a cap{single !== null ? ` · singles ${formatMoney(single, p.currency)}` : ""}
            </span>
          </p>
        </div>
        <div className="pdp-buy pt-4">
          <SwatchRow label="Cap 1" value={first} colors={colors} onPick={setFirst} />
          <SwatchRow label="Cap 2" value={second} colors={colors} onPick={setSecond} />
          <div ref={cta} className="mt-4">
            <button type="button" className="btn btn-green btn-atc" disabled={soldOut || pending || stock === null || !variant} onClick={() => onAdd("offer_add")} data-track="offer_add" aria-busy={pending || undefined}>
              {soldOut ? "Sold out" : pending ? "Adding…" : "Add the pair to bag"}
            </button>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <ul className="meta mt-4 flex flex-col gap-0.5">
            <li aria-live="polite">{stock === null ? "Checking stock…" : soldOut ? "That pair is sold out. Try another color." : `Both in stock · ${POLICY.dispatch.toLowerCase()}`}</li>
            <li>{formatMoney(p.amount)} clears the ${POLICY.freeShippingThreshold} line, so it ships free</li>
            <li>{POLICY.returns}, on the pair</li>
            <li>One size, {POLICY.oneSize}</li>
          </ul>
          <p className="mt-4 text-[14.4px]">
            <Link href="#foursome" className="link">
              Four caps? The Foursome
            </Link>
          </p>
        </div>
      </div>
      <StickyBar visible={!visible} label={`The Pair: ${first} + ${second} · ${formatMoney(p.amount, p.currency)}`}>
        <button type="button" tabIndex={visible ? -1 : 0} className="btn btn-green btn-sticky w-full md:w-auto md:!min-h-11 md:!text-[16px]" disabled={soldOut || pending || stock === null} onClick={() => onAdd("offer_sticky_add")} data-track="offer_sticky_add">
          Add the pair to bag
        </button>
      </StickyBar>
    </section>
  )
}

/** "Cap 1: Pine" over a row of 32px swatches in 44px hit areas. */
function SwatchRow({ label, value, colors, onPick }: { label: string; value: string; colors: string[]; onPick: (c: string) => void }) {
  return (
    <fieldset className="mb-3">
      <legend className="text-[14.4px]">
        {label}: <span className="font-medium">{value}</span>
      </legend>
      <div className="mt-1 -ml-1.5 flex flex-wrap" role="radiogroup" aria-label={label}>
        {colors.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={c === value} aria-label={c} onClick={() => onPick(c)} className="flex size-11 items-center justify-center">
            <SwatchFace name={c} size={32} selected={c === value} />
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/** E.6.3's sticky buy bar (M18): 78px white on desktop, #FCFCFC with a full-width button on mobile. */
export function StickyBar({ visible, label, children }: { visible: boolean; label: string; children: ReactNode }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[5500] border-t border-border bg-surface-sticky transition-[opacity,visibility] duration-300 md:bg-bg ${visible ? "visible opacity-100" : "invisible opacity-0"}`}
      aria-hidden={!visible}
    >
      <div className="wrap flex flex-col gap-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] md:h-[78px] md:flex-row md:items-center md:gap-4 md:py-0">
        <p className="min-w-0 truncate text-center text-[14.4px] md:flex-1 md:text-left">{label}</p>
        {children}
      </div>
    </div>
  )
}

/**
 * The Foursome (SITE_SPEC v8 E.6.10 §2): the same layout in a #F6F6F6 band.
 * Medusa sells it as "One of each" or "4 × <color>", so the picker is a mode
 * choice plus one swatch row rather than four free rows.
 */
export function FoursomePicker({
  foursome,
  colors,
  single,
  stock,
  initial,
  source = "offer",
}: {
  foursome: Product
  colors: string[]
  single: number | null
  stock: VariantStock | null
  /** A `Caps` value: "One of each" or "4 × <color>". */
  initial?: string
  source?: string
  /** Kept for older callers. */
  plain?: boolean
}) {
  const initialColor = initial?.startsWith("4 × ") ? initial.slice(4) : null
  const [mode, setMode] = useState<"one" | "each">(initialColor ? "one" : "each")
  const [color, setColor] = useState(initialColor && colors.includes(initialColor) ? initialColor : colors[0])
  const { add, pending, error } = useAddToBag()
  const value = mode === "each" ? "One of each" : `4 × ${color}`
  const variant = findVariant(foursome, { Caps: value })
  const n = variant && stock ? stock[variant.id] : undefined
  const soldOut = stock !== null && typeof n === "number" && n <= 0
  const p = price(foursome, variant)
  const caps = mode === "each" ? colors.slice(0, 4) : [color, color, color, color]
  return (
    <section id="foursome" aria-labelledby="foursome-title" className="band-tile scroll-mt-24 py-10 md:py-14">
      <div className="pdp-grid wrap">
        <div className="pdp-gallery grid grid-cols-2 gap-1 self-start">
          {caps.map((c, i) => (
            <div key={`${c}-${i}`} className="relative aspect-[5/6] bg-white">
              <Image key={c} src={lead(c)} alt={`Cap ${i + 1}: the Rope Cap in ${c}`} fill sizes="(min-width: 990px) 330px, 50vw" className="tile-photo animate-fade-in object-contain" />
            </div>
          ))}
        </div>
        <div className="pdp-side !static">
          <div className="pdp-head">
            <p className="eyebrow-sm">Four caps</p>
            <h2 id="foursome-title" className="title-product mt-1">
              The Foursome
            </h2>
            <p className="mt-2 text-[12.6px] md:text-[14.4px]">Free shipping on ${POLICY.freeShippingThreshold}+</p>
            <p className="mt-1 flex items-baseline gap-3">
              <span className="price">{formatMoney(p.amount, p.currency)}</span>
              <span className="meta">
                {formatMoney(p.amount !== null ? p.amount / 4 : null, p.currency)} a cap{single !== null ? ` · singles ${formatMoney(single, p.currency)}` : ""}
              </span>
            </p>
          </div>
          <div className="pdp-buy pt-4">
            <div role="tablist" aria-label="Foursome" className="flex gap-2">
              {(
                [
                  ["each", "One of each"],
                  ["one", "Four of one color"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className="tab">
                  {l}
                </button>
              ))}
            </div>
            {mode === "one" && (
              <div className="mt-3">
                <SwatchRow label="Color" value={color} colors={colors} onPick={setColor} />
              </div>
            )}
            <button
              type="button"
              className="btn btn-green btn-atc mt-4"
              disabled={soldOut || pending || stock === null || !variant}
              onClick={() => variant && add({ productId: foursome.id, variantId: variant.id, price: p.amount, currency: p.currency, source, extra: { offer: foursome.handle, caps: value } })}
              data-track="offer_foursome_add"
              aria-busy={pending || undefined}
            >
              {soldOut ? "Sold out" : pending ? "Adding…" : "Add the foursome to bag"}
            </button>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <ul className="meta mt-4 flex flex-col gap-0.5">
              <li>For the group trip, the outing or Father&apos;s Day</li>
              <li>Ships free · {POLICY.returns}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
