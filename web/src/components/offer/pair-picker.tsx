"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useAddToBag } from "@/components/cart/use-add-to-bag"
import { RopeRule } from "@/components/rope-rule"
import { Digits } from "@/components/digits"
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
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = cta.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting || e.boundingClientRect.top > 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

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
      <RopeRule color={value} />
    </div>
  )

  return (
    <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="panel grid grid-cols-2 gap-3 p-[var(--panel-pad)]">
        {[first, second].map((c, i) => (
          <figure key={`${c}-${i}`} className="window aspect-square md:aspect-[7/8]">
            <Image src={lead(c)} alt={`The Rope Cap in ${c}`} fill preload={i === 0} sizes="(min-width: 768px) 25vw, 50vw" className="object-contain p-[8%]" />
            <figcaption className="label absolute bottom-3 left-3 z-[2] rounded-[2px] bg-paper px-1.5 py-0.5">
              Cap {i + 1} · {c}
            </figcaption>
          </figure>
        ))}
      </div>
      <aside className="panel grid gap-6 p-[var(--panel-pad)] lg:sticky lg:top-24">
        <div className="flex flex-col gap-2">
          <Heading className="model !text-[clamp(2.75rem,2rem+3vw,4.5rem)]">{headline}</Heading>
          <p className="spec-line">The Pair · Core colors</p>
          <div className="flex items-center gap-2">
            <span className="text-[2.75rem] leading-none"><Digits value={formatMoney(p.amount, p.currency)} /></span>
            {saving !== null && (
              <>
                <span className="text-[1.375rem] leading-none line-through opacity-75">{formatMoney(anchor, p.currency)}</span>
                <span className="badge">Save {formatMoney(saving, p.currency)}</span>
              </>
            )}
          </div>
          <p className="text-[1rem] leading-6 text-ink-2">Pick any two colors{single !== null ? `. Singles stay ${formatMoney(single)}.` : "."}</p>
        </div>
        {picker("FIRST CAP:", first, setFirst)}
        {picker("SECOND CAP:", second, setSecond)}
        <div ref={cta} className="flex flex-col gap-3">
          <button type="button" className="btn btn-secondary btn-atc" disabled={soldOut || pending || stock === null || !variant} onClick={() => onAdd("offer_add")} data-track="offer_add">
            {soldOut ? "Sold out" : `Add the pair · ${formatMoney(p.amount, p.currency)}`}
          </button>
          {error && <p className="text-[0.875rem] text-red">{error}</p>}
          <p className="text-[0.9375rem] leading-6">
            {stock === null ? (
              <span className="text-light-charcoal">Checking stock…</span>
            ) : soldOut ? (
              <span>That pair is sold out. Try another color.</span>
            ) : (
              <span className="text-ok">Both in stock · ships in 1–2 business days</span>
            )}
          </p>
          <p className="text-[0.9375rem] leading-6">{formatMoney(p.amount)} qualifies for free shipping · {POLICY.returns} on the pair</p>
        </div>
      </aside>
      <div className={`sheet fixed inset-x-0 bottom-0 z-[70] border-t-2 border-ink bg-paper px-4 py-3 ${visible ? "pointer-events-none translate-y-full opacity-0" : ""}`} aria-hidden={visible}>
        <p className="text-center text-sm leading-5">
          The Pair: {first} + {second} · {formatMoney(p.amount, p.currency)}
        </p>
        <button type="button" tabIndex={visible ? -1 : 0} className="btn btn-secondary btn-atc mt-3" disabled={soldOut || pending || stock === null} onClick={() => onAdd("offer_sticky_add")} data-track="offer_sticky_add">
          Add the pair · {formatMoney(p.amount, p.currency)}
        </button>
      </div>
    </div>
  )
}

/** The Foursome step-up (G.6.5, the offer page's golf-green band). */
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
  /** White card instead of the golf-green band (when the page spends its band elsewhere). */
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
  return (
    <section id="foursome" aria-label="The Foursome" className={`panel ${plain ? "" : "ink-dark"} grid scroll-mt-28 gap-8 p-[var(--panel-pad)] md:grid-cols-2`} style={plain ? undefined : ({ "--panel-bg": "#1E3B2F", "--panel-ink": "#F1ECE0", "--panel-line": "#10241B" } as React.CSSProperties)}>
      <div className="grid grid-cols-2 gap-2">
        {(mode === "each" ? colors : [color, color, color, color]).map((c, i) => (
          <span key={`${c}-${i}`} className="window relative aspect-square !rounded-[18px]">
            <Image src={lead(c)} alt="" fill sizes="(min-width: 768px) 20vw, 45vw" className="object-contain p-[8%]" />
          </span>
        ))}
      </div>
      <div className="flex flex-col justify-center gap-4">
        <h2 className="panel-title">Four caps, {formatMoney(p.amount !== null ? p.amount / 4 : null)} each.</h2>
        <p className="text-[1.0625rem] leading-7">For the group trip, the outing or Father&apos;s Day.</p>
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
        <p className="flex items-center gap-2">
          <span className="text-[2.5rem] leading-none"><Digits value={formatMoney(p.amount, p.currency)} /></span>
          {saving !== null && (
            <>
              <span className="line-through opacity-65">{formatMoney(anchor, p.currency)}</span>
              <span className="badge">Save {formatMoney(saving, p.currency)}</span>
            </>
          )}
        </p>
        <button
          type="button"
          className={`btn ${plain ? "btn-secondary" : "btn-on-ink"} btn-atc`} style={plain ? undefined : ({ "--btn-bg": "#F1ECE0", "--btn-fg": "#1E3B2F" } as React.CSSProperties)}
          disabled={soldOut || pending || stock === null || !variant}
          onClick={() => variant && add({ productId: foursome.id, variantId: variant.id, price: p.amount, currency: p.currency, source, extra: { offer: foursome.handle, caps: value } })}
          data-track="offer_foursome_add"
        >
          {soldOut ? "Sold out" : `Add the foursome · ${formatMoney(p.amount, p.currency)}`}
        </button>
      </div>
    </section>
  )
}
