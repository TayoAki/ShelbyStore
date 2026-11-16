"use client"

import Image from "next/image"
import { useRef, useState, type CSSProperties } from "react"
import { useAddToBag } from "@/components/cart/use-add-to-bag"
import { useNotScrolledPast } from "@/lib/use-not-scrolled-past"
import { SLEEVE_INK } from "@/components/box/inks"
import { SwatchFace } from "@/components/swatch"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { findVariant, price } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"

const lead = (c: string) => `/hats/rope-cap-${c.toLowerCase().replace(/\s+/g, "-")}-1.jpg`

/**
 * The Pair as a two-window sleeve: two ink-chip pickers over the core colours,
 * the chosen caps side by side in their windows, live kit stock, the true
 * single-price anchor and Add the pair. Sticky strip once the button scrolls away.
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
}: {
  pair: Product
  colors: string[]
  single: number | null
  stock: VariantStock | null
  headline: string
  initial?: [string, string]
  source?: string
  headingAs?: "h1" | "h2"
}) {
  const [first, setFirst] = useState(initial?.[0] ?? colors[0])
  const [second, setSecond] = useState(initial?.[1] ?? colors[2] ?? colors[1] ?? colors[0])
  const { add, pending, error } = useAddToBag()
  const variant = findVariant(pair, { "First cap": first, "Second cap": second })
  const n = variant && stock ? stock[variant.id] : undefined
  const soldOut = stock !== null && typeof n === "number" && n <= 0
  const p = price(pair, variant)
  const anchor = single !== null ? single * 2 : null
  const saving = anchor !== null && p.amount !== null && anchor > p.amount ? anchor - p.amount : null
  const onAdd = (track: string) =>
    variant && !soldOut && add({ productId: pair.id, variantId: variant.id, price: p.amount, currency: p.currency, source, extra: { offer: pair.handle, first, second, cta: track } })

  const cta = useRef<HTMLDivElement>(null)
  const visible = useNotScrolledPast(cta)

  const picker = (label: string, value: string, set: (c: string) => void) => (
    <div className="flex flex-col gap-2">
      <p className="label flex gap-2">
        <span>{label}</span>
        <span>{value}</span>
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {colors.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={c === value} aria-label={c} onClick={() => set(c)} className="p-0.5">
            <SwatchFace name={c} selected={c === value} />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <section aria-label="The Pair" className="panel ink-dark" style={SLEEVE_INK.pair as CSSProperties}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-10">
        <div className="grid grid-cols-2 gap-2 self-start lg:sticky lg:top-24">
          {[first, second].map((c, i) => (
            <div key={`${c}-${i}`} className="window aspect-square">
              <Image src={lead(c)} alt={`Cap ${i + 1}: the Rope Cap in ${c}`} fill preload={i === 0} sizes="(min-width: 1024px) 26vw, 46vw" className="object-contain p-[8%]" />
              <span className="window-shade" aria-hidden />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Heading className="model !text-[clamp(2.75rem,2rem+3vw,4.5rem)]">{headline}</Heading>
            <p className="spec-line">The Pair · Core colors · 2 caps</p>
            <p className="text-[1.0625rem] leading-7">Pick any two colors{single !== null ? `. Singles stay ${formatMoney(single)}.` : "."}</p>
          </div>
          {picker("First cap:", first, setFirst)}
          {picker("Second cap:", second, setSecond)}
          <div ref={cta} className="flex flex-col gap-3 border-t-[1.5px] border-dashed border-[color:var(--inner-crease,var(--color-crease))] pt-5">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="figure text-[2.75rem]">{formatMoney(p.amount, p.currency)}</span>
              {saving !== null && (
                <>
                  <span className="figure text-[1.375rem] line-through opacity-75">{formatMoney(anchor, p.currency)}</span>
                  <span className="badge">Save {formatMoney(saving, p.currency)}</span>
                </>
              )}
            </p>
            <button type="button" className="btn btn-on-ink btn-atc" disabled={soldOut || pending || stock === null || !variant} onClick={() => onAdd("offer_add")} data-track="offer_add">
              {soldOut ? "Sold out" : `Add the pair · ${formatMoney(p.amount, p.currency)}`}
            </button>
            {error && <p className="text-[0.9375rem] font-semibold">{error}</p>}
            <p className="text-[0.9375rem] leading-6">
              {stock === null ? "Checking stock…" : soldOut ? "That pair is sold out. Try another color." : "Both in stock · ships in 1–2 business days"}
            </p>
            <p className="text-[0.9375rem] leading-6 opacity-90">{formatMoney(p.amount)} qualifies for free shipping · {POLICY.returns} on the pair</p>
          </div>
        </div>
      </div>
      <div className={`sheet fixed inset-x-0 bottom-0 z-[70] border-t-2 border-ink bg-paper px-4 py-3 ${visible ? "pointer-events-none translate-y-full opacity-0" : ""}`} aria-hidden={visible}>
        <p className="text-center text-[0.9375rem] leading-5">
          The Pair: {first} + {second} · {formatMoney(p.amount, p.currency)}
        </p>
        <button type="button" tabIndex={visible ? -1 : 0} className="btn btn-secondary btn-atc mt-3" disabled={soldOut || pending || stock === null} onClick={() => onAdd("offer_sticky_add")} data-track="offer_sticky_add">
          Add the pair · {formatMoney(p.amount, p.currency)}
        </button>
      </div>
    </section>
  )
}

/** The Foursome step-up: a four-window sleeve printed in pine (white when `plain`). */
export function FoursomePicker({
  foursome,
  colors,
  single,
  stock,
  initial,
  source = "offer",
  plain = false,
}: {
  foursome: Product
  colors: string[]
  single: number | null
  stock: VariantStock | null
  /** A `Caps` value: "One of each" or "4 × <color>". */
  initial?: string
  source?: string
  /** Printed white instead of pine (when the page spends its ink elsewhere). */
  plain?: boolean
}) {
  const initialColor = initial?.startsWith("4 × ") ? initial.slice(4) : null
  const [mode, setMode] = useState<"one" | "each">(initialColor ? "one" : "each")
  const [color, setColor] = useState(initialColor && colors.includes(initialColor) ? initialColor : colors[0])
  const { add, pending } = useAddToBag()
  const value = mode === "each" ? "One of each" : `4 × ${color}`
  const variant = findVariant(foursome, { Caps: value })
  const n = variant && stock ? stock[variant.id] : undefined
  const soldOut = stock !== null && typeof n === "number" && n <= 0
  const p = price(foursome, variant)
  const anchor = single !== null ? single * 4 : null
  const saving = anchor !== null && p.amount !== null && anchor > p.amount ? anchor - p.amount : null
  const ink = plain ? undefined : (SLEEVE_INK.four as CSSProperties)
  return (
    <section id="foursome" aria-label="The Foursome" className={`panel ${plain ? "" : "ink-dark"} scroll-mt-28`} style={ink}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-10">
        <div className="grid grid-cols-4 gap-2 self-start">
          {(mode === "each" ? colors : [color, color, color, color]).map((c, i) => (
            <span key={`${c}-${i}`} className="window relative aspect-square">
              <Image src={lead(c)} alt={`Cap ${i + 1}: the Rope Cap in ${c}`} fill sizes="(min-width: 1024px) 13vw, 22vw" className="object-contain p-[8%]" />
              <span className="window-shade" aria-hidden />
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <h2 className="model !text-[clamp(2.5rem,2rem+2.4vw,4rem)]">The Foursome</h2>
            <p className="spec-line">4 caps · {formatMoney(p.amount !== null ? p.amount / 4 : null)} a cap · ships free</p>
            <p className="text-[1.0625rem] leading-7">For the group trip, the outing or Father&apos;s Day.</p>
          </div>
          <div className="flex gap-6 border-b-2 border-current" role="tablist" aria-label="Foursome mode">
            {[
              ["one", "Four of one color"],
              ["each", "One of each"],
            ].map(([k, l]) => (
              <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k as "one" | "each")} className="tab-title -mb-[2px] min-h-11">
                {l}
              </button>
            ))}
          </div>
          {mode === "one" && (
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
              {colors.map((c) => (
                <button key={c} type="button" role="radio" aria-checked={c === color} aria-label={c} onClick={() => setColor(c)} className="p-0.5">
                  <SwatchFace name={c} selected={c === color} />
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 border-t-[1.5px] border-dashed border-[color:var(--inner-crease,var(--color-crease))] pt-5">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="figure text-[2.75rem]">{formatMoney(p.amount, p.currency)}</span>
              {saving !== null && (
                <>
                  <span className="figure text-[1.375rem] line-through opacity-75">{formatMoney(anchor, p.currency)}</span>
                  <span className="badge">Save {formatMoney(saving, p.currency)}</span>
                </>
              )}
            </p>
            <button
              type="button"
              className={`btn ${plain ? "btn-secondary" : "btn-on-ink"} btn-atc`}
              disabled={soldOut || pending || stock === null || !variant}
              onClick={() => variant && add({ productId: foursome.id, variantId: variant.id, price: p.amount, currency: p.currency, source, extra: { offer: foursome.handle, caps: value } })}
              data-track="offer_foursome_add"
            >
              {soldOut ? "Sold out" : `Add the foursome · ${formatMoney(p.amount, p.currency)}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
