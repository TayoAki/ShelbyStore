"use client"

import { ArrowCounterClockwise, Truck } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, useTransition } from "react"
import { addToCart } from "@/lib/actions/cart"
import { analyticsId, track } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { stockState } from "@/lib/product"
import type { VariantStock } from "@/lib/types"
import { Button } from "../ui/button"

export type PairColor = { color: string; image: string | null }
/** One kit variant: the two colours and its id. */
export type PairVariant = { id: string; first: string; second: string }

const FIRST = "First cap"
const SECOND = "Second cap"

/**
 * The two-pack buy box (SITE_SPEC §12.1.2): the two chosen caps side by side,
 * a picker per cap, live kit availability (each pair's stock is the real
 * stock of its two core colours), add-the-pair, and the terms right under it.
 * `children` is the server-rendered headline and price block.
 */
export function PairPicker({
  productId,
  colors,
  variants,
  stock,
  price,
  currency,
  children,
}: {
  productId: string
  colors: PairColor[]
  variants: PairVariant[]
  /** null while live stock loads. */
  stock: VariantStock | null
  price: number | null
  currency: string
  children: React.ReactNode
}) {
  const [first, setFirst] = useState(colors[0]?.color ?? "")
  const [second, setSecond] = useState(colors[2]?.color ?? colors[1]?.color ?? colors[0]?.color ?? "")
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const find = (a: string, b: string) => variants.find((v) => v.first === a && v.second === b)
  const variant = find(first, second)
  const available = variant && stock ? stock[variant.id] : undefined
  const state = stock === null ? null : variant ? stockState(available) : "sold_out"
  const soldOut = state === "sold_out"
  const imageOf = (c: string) => colors.find((x) => x.color === c)?.image ?? null

  const add = () => {
    if (!variant || soldOut) return
    setError(null)
    startTransition(async () => {
      const result = await addToCart({ variantId: variant.id, quantity: 1, analyticsId: analyticsId() })
      if (result.ok) {
        setAdded(true)
        track("add_to_cart", { product_id: productId, variant_id: variant.id, quantity: 1, price, currency, source: "offer" })
      } else {
        setError(result.error)
      }
    })
  }

  // Mobile sticky bar once the main CTA scrolls away.
  const ctaRef = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)
  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting || e.boundingClientRect.top > 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const label = soldOut ? "Sold out in this pair" : `Add the pair · ${formatMoney(price, currency)}`

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
      {/* The pair, side by side */}
      <div className="grid grid-cols-2 gap-2 lg:col-span-7">
        {[first, second].map((c, i) => (
          <figure key={`${i}-${c}`} className="flex flex-col gap-2">
            <div className="relative aspect-[4/5] overflow-hidden bg-paper">
              {imageOf(c) && (
                <Image src={imageOf(c)!} alt={`Everyday Cap in ${c}`} fill preload={i === 0} sizes="(min-width:1024px) 30vw, 50vw" className="object-cover" />
              )}
            </div>
            <figcaption className="font-mono text-[12px] text-ink-muted">
              {i === 0 ? "Cap 1" : "Cap 2"} · {c}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:col-span-5 lg:pt-2">
        {children}

        {[
          { title: FIRST, value: first, set: setFirst, pair: (c: string) => find(c, second) },
          { title: SECOND, value: second, set: setSecond, pair: (c: string) => find(first, c) },
        ].map((g) => (
          <fieldset key={g.title} className="flex flex-col">
            <legend className="mb-3 flex w-full items-baseline justify-between">
              <span className="text-eyebrow text-ink-muted">{g.title}</span>
              <span className="text-[14px] font-medium">{g.value}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {colors.map(({ color, image }) => {
                const v = g.pair(color)
                const out = stock !== null && (!v || stockState(stock[v.id]) === "sold_out")
                const active = g.value === color
                return (
                  <button
                    key={color}
                    type="button"
                    aria-pressed={active}
                    aria-label={`${g.title}: ${color}${out ? ", sold out with this pairing" : ""}`}
                    title={color}
                    onClick={() => {
                      setAdded(false)
                      g.set(color)
                    }}
                    className={`relative h-[60px] w-12 overflow-hidden rounded-[2px] bg-page transition-shadow duration-150 ${
                      active ? "ring-2 ring-ink ring-offset-2 ring-offset-page" : "ring-1 ring-line hover:ring-ink"
                    } ${out ? "opacity-40" : ""}`}
                  >
                    {image && <Image src={image} alt="" fill sizes="48px" className="object-cover" />}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

        <div aria-live="polite" className="min-h-5 text-[14px]">
          {stock === null && <span className="text-ink-muted">Checking stock…</span>}
          {state && state !== "sold_out" && (
            <span className={state === "low" ? "text-low" : "text-ok"}>
              ● {state === "low" ? `Only ${available} pairs left in ${first} + ${second}` : "Both in stock"}
              <span className="text-ink-muted"> · {POLICY.dispatch}</span>
            </span>
          )}
          {state === "sold_out" && <span className="text-ink-muted">This pairing is sold out right now. Try another colour.</span>}
        </div>

        <div ref={ctaRef} className="flex flex-col gap-3">
          <Button block size="lg" onClick={add} disabled={soldOut || stock === null} loading={pending} data-track="offer_add">
            {label}
          </Button>
          {added && (
            <p className="text-[14px]" role="status">
              Added.{" "}
              <Link href="/cart" className="font-medium underline underline-offset-4">
                View bag →
              </Link>
            </p>
          )}
          {error && (
            <p className="text-[14px] text-danger" role="alert">
              {error}
            </p>
          )}
        </div>

        <ul className="flex flex-col gap-2 text-[13px] text-ink-muted">
          <li className="flex items-center gap-2">
            <Truck size={18} aria-hidden /> {POLICY.shipping}
          </li>
          <li className="flex items-center gap-2">
            <ArrowCounterClockwise size={18} aria-hidden /> {POLICY.returns} on the pair
          </li>
        </ul>
      </div>

      {!ctaVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-page px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-[13px] text-ink-muted">
              {first} + {second}
            </p>
            <Button size="sm" onClick={add} disabled={soldOut || stock === null} loading={pending} data-track="offer_sticky_add">
              {soldOut ? "Sold out" : `Add the pair · ${formatMoney(price, currency)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
