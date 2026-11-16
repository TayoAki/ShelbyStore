"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useAddToBag } from "@/components/cart/use-add-to-bag"
import { RopeRule } from "@/components/rope-rule"
import { SwatchFace } from "@/components/swatch"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { findVariant, price } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"

const lead = (c: string) => `/hats/rope-cap-${c.toLowerCase().replace(/\s+/g, "-")}-1.jpg`

/**
 * The Pair (G.6.5): two colour pickers over the core colours, the chosen caps
 * side by side, a rope rule under each picker, live kit stock, the true $96
 * anchor and "ADD THE PAIR – $88". Sticky bar once the CTA scrolls away.
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
      <p className="flex gap-2 text-xs leading-4 font-medium tracking-wider">
        <span className="font-mono">{label}</span>
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
    <div className="relative md:mx-5 md:grid md:grid-cols-[1fr_45vw] md:items-start md:gap-5 xl:grid-cols-[1fr_38vw]">
      <div className="mx-2.5 grid grid-cols-2 gap-2 md:mx-0">
        {[first, second].map((c, i) => (
          <figure key={`${c}-${i}`} className="relative aspect-square overflow-hidden rounded-2xl bg-white md:aspect-[7/8]">
            <Image src={lead(c)} alt={`The Rope Cap in ${c}`} fill preload={i === 0} sizes="(min-width: 768px) 25vw, 50vw" className="object-contain" />
            <figcaption className="absolute bottom-3 left-3 font-mono text-xs tracking-[.05em] text-light-charcoal uppercase">
              Cap {i + 1} · {c}
            </figcaption>
          </figure>
        ))}
      </div>
      <aside className="mt-4 grid gap-6 rounded-xl bg-white p-5 max-md:mx-2.5 md:sticky md:top-[120px] md:mt-0 md:shadow-sm lg:p-6 xl:p-8">
        <div className="flex flex-col gap-2">
          <Heading className="font-serif text-2xl leading-8 italic md:text-[30px] md:leading-9">{headline}</Heading>
          <p className="font-mono text-xs leading-4 tracking-[.05em] text-light-charcoal uppercase md:text-sm md:leading-5">THE PAIR · CORE COLORS</p>
          <div className="flex items-center gap-2">
            <span className="text-lg leading-7 font-medium tracking-[.05em]">{formatMoney(p.amount, p.currency)}</span>
            {saving !== null && (
              <>
                <span className="text-lg leading-7 line-through opacity-65">{formatMoney(anchor, p.currency)}</span>
                <span className="rounded-full bg-natural-white px-2 py-1 text-xs leading-4 font-medium tracking-[.05em] italic">SAVE {formatMoney(saving, p.currency)}</span>
              </>
            )}
          </div>
          <p className="text-xs leading-4 text-light-charcoal">Pick any two colors{single !== null ? `. Singles stay ${formatMoney(single)}.` : "."}</p>
        </div>
        {picker("FIRST CAP:", first, setFirst)}
        {picker("SECOND CAP:", second, setSecond)}
        <div ref={cta} className="flex flex-col gap-3">
          <button type="button" className="btn btn-secondary btn-atc" disabled={soldOut || pending || stock === null || !variant} onClick={() => onAdd("offer_add")} data-track="offer_add">
            {soldOut ? "SOLD OUT" : `ADD THE PAIR – ${formatMoney(p.amount, p.currency)}`}
          </button>
          {error && <p className="text-xs text-red">{error}</p>}
          <p className="text-xs leading-4">
            {stock === null ? (
              <span className="text-light-charcoal">Checking stock…</span>
            ) : soldOut ? (
              <span className="text-light-charcoal">● That pair is sold out. Try another color.</span>
            ) : (
              <span className="text-green">● Both in stock · ships in 1–2 business days</span>
            )}
          </p>
          <p className="text-xs leading-4">{formatMoney(p.amount)} qualifies for free shipping · {POLICY.returns} on the pair</p>
        </div>
      </aside>
      <div className={`fixed inset-x-0 bottom-0 z-[70] rounded-t-md bg-white px-7 py-5 shadow-xl transition-all duration-150 ease-in-out ${visible ? "pointer-events-none opacity-0" : ""}`} aria-hidden={visible}>
        <p className="text-center text-sm leading-5">
          The Pair: {first} + {second} · {formatMoney(p.amount, p.currency)}
        </p>
        <button type="button" tabIndex={visible ? -1 : 0} className="btn btn-secondary btn-atc mt-3" disabled={soldOut || pending || stock === null} onClick={() => onAdd("offer_sticky_add")} data-track="offer_sticky_add">
          ADD THE PAIR – {formatMoney(p.amount, p.currency)}
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
    <section id="foursome" aria-label="The Foursome" className={`${plain ? "bg-white text-black" : "band-golf"} mx-2.5 my-10 grid scroll-mt-28 gap-8 rounded-3xl p-5 md:grid-cols-2 md:p-10`}>
      <div className={`grid grid-cols-2 gap-2 rounded-2xl p-3 ${plain ? "bg-natural-white-25" : "bg-white"}`}>
        {(mode === "each" ? colors : [color, color, color, color]).map((c, i) => (
          <span key={`${c}-${i}`} className="relative aspect-square">
            <Image src={lead(c)} alt="" fill sizes="(min-width: 768px) 20vw, 45vw" className="object-contain" />
          </span>
        ))}
      </div>
      <div className="flex flex-col justify-center gap-4">
        <p className={`kicker ${plain ? "text-golf-green" : "text-golf-tint"}`}>For the group trip, the outing or Father&apos;s Day.</p>
        <h2 className="font-display text-[30px] leading-9">Four caps, {formatMoney(p.amount !== null ? p.amount / 4 : null)} each.</h2>
        <div className={`flex gap-1 rounded-full border p-1 text-xs ${plain ? "border-black" : "border-white"}`} role="tablist" aria-label="Foursome mode">
          {[
            ["one", "FOUR OF ONE COLOR"],
            ["each", "ONE OF EACH"],
          ].map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k as "one" | "each")} className={`flex-1 rounded-full px-3 py-1.5 font-medium transition-colors duration-200 ${mode === k ? (plain ? "bg-black text-white" : "bg-white text-golf-green") : plain ? "hover:bg-black/5" : "hover:bg-white/10"}`}>
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
          <span className="text-lg leading-7 font-medium">{formatMoney(p.amount, p.currency)}</span>
          {saving !== null && (
            <>
              <span className="line-through opacity-65">{formatMoney(anchor, p.currency)}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium italic ${plain ? "bg-natural-white" : "bg-white/15"}`}>SAVE {formatMoney(saving, p.currency)}</span>
            </>
          )}
        </p>
        <button
          type="button"
          className={`btn ${plain ? "btn-secondary" : "btn-primary"} btn-atc`}
          disabled={soldOut || pending || stock === null || !variant}
          onClick={() => variant && add({ productId: foursome.id, variantId: variant.id, price: p.amount, currency: p.currency, source, extra: { offer: foursome.handle, caps: value } })}
          data-track="offer_foursome_add"
        >
          {soldOut ? "SOLD OUT" : `ADD THE FOURSOME – ${formatMoney(p.amount, p.currency)}`}
        </button>
      </div>
    </section>
  )
}
