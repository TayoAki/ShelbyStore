"use client"

import Image from "next/image"
import { useState } from "react"
import { formatMoney } from "@/lib/format"
import { stockState } from "@/lib/product"
import type { VariantStock } from "@/lib/types"
import { useAddToBag } from "../cart/use-add-to-bag"
import { Perks, type Perk } from "../perks"
import { SwatchDot } from "../swatch"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

export type PairColor = { color: string; images: string[] }
/** One kit variant: the two colours and its id. */
export type PairVariant = { id: string; first: string; second: string }

/**
 * The two-pack's above-the-fold block in Melin's PDP layout (SITE_SPEC
 * §12.1.2): the two chosen caps side by side (front, then side), two swatch
 * groups, the one-size block, ADD THE PAIR, kit stock, perks, and Melin's
 * sticky bar on mobile.
 */
export function PairPicker({
  productId,
  colors,
  variants,
  stock,
  price,
  compareAt,
  saving,
  currency,
  headline,
  typeLine,
  description,
  oneSizeLine,
  perks,
}: {
  productId: string
  colors: PairColor[]
  variants: PairVariant[]
  /** null while live stock loads. */
  stock: VariantStock | null
  price: number | null
  compareAt: number | null
  saving: number | null
  currency: string
  headline: string
  typeLine: string
  description: string
  oneSizeLine: string
  perks: Perk[]
}) {
  const [first, setFirst] = useState(colors[0]?.color ?? "")
  const [second, setSecond] = useState(colors[2]?.color ?? colors[1]?.color ?? colors[0]?.color ?? "")
  const [added, setAdded] = useState(false)
  const { add, pending, error } = useAddToBag()
  const find = (a: string, b: string) => variants.find((v) => v.first === a && v.second === b)
  const variant = find(first, second)
  const available = variant && stock ? stock[variant.id] : undefined
  const state = stock === null ? null : variant ? stockState(available) : "sold_out"
  const soldOut = state === "sold_out"
  const low = state === "low"
  const imgs = (c: string) => colors.find((x) => x.color === c)?.images ?? []
  const money = (n: number | null) => formatMoney(n, currency)
  const showSaving = saving !== null && saving > 0

  const onAdd = () => {
    if (!variant || soldOut) return
    setAdded(false)
    add({ productId, variantId: variant.id, price, currency, source: "offer" }, () => setAdded(true))
  }
  const label = soldOut ? "Sold out in this pair" : added ? "Added" : `Add the pair - ${money(price)}${low ? " - low inventory" : ""}`

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,740px)_370px] lg:justify-between lg:gap-[68px]">
      <div className="grid grid-cols-2 gap-4">
        {[first, second].map((c, i) => (
          <figure key={`f-${i}`}>
            <span className="relative block aspect-square bg-white">
              {imgs(c)[0] && <Image src={imgs(c)[0]} alt={`Everyday Cap in ${c}`} fill preload={i === 0} sizes="(min-width:1024px) 362px, 50vw" className="object-contain" />}
            </span>
            <figcaption className="mt-2 font-body text-[12px] text-muted">
              Cap {i + 1} · {c}
            </figcaption>
          </figure>
        ))}
        {[first, second].map((c, i) => (
          <span key={`s-${i}`} className="relative hidden aspect-square bg-white lg:block">
            {(imgs(c)[2] ?? imgs(c)[0]) && <Image src={imgs(c)[2] ?? imgs(c)[0]} alt={`Everyday Cap in ${c}, side`} fill sizes="362px" className="object-contain" />}
          </span>
        ))}
      </div>

      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h1 className="pr-[10px] font-body text-[20px] uppercase leading-[25px]">{headline}</h1>
          <span className="flex shrink-0 flex-col items-end">
            <span className="font-body text-[18px] leading-[25px]">{money(price)}</span>
            {showSaving && (
              <s className="font-body text-[14px] text-muted" aria-label={`Two singles cost ${money(compareAt)}`}>
                {money(compareAt)}
              </s>
            )}
          </span>
        </div>
        <p className="mt-[2px] font-body text-[15px] leading-[19.5px] text-muted">{typeLine}</p>
        {showSaving && (
          <span className="mt-3">
            <Badge>Save {money(saving)}</Badge>
          </span>
        )}
        <p className="mt-3 font-system text-[16px] leading-6">{description}</p>
        <hr className="my-5 border-tertiary" />

        {[
          { title: "First Cap", value: first, set: setFirst, pair: (c: string) => find(c, second) },
          { title: "Second Cap", value: second, set: setSecond, pair: (c: string) => find(first, c) },
        ].map((g, gi) => (
          <fieldset key={g.title} className={gi ? "mt-6" : ""}>
            <legend className="mb-[10px] font-body text-[13px] leading-[19.5px]">
              {g.title}: {g.value}
            </legend>
            <div className="grid grid-cols-7 gap-[9px]">
              {colors.map(({ color }) => {
                const v = g.pair(color)
                const out = stock !== null && (!v || stockState(stock[v.id]) === "sold_out")
                return (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    aria-pressed={g.value === color}
                    aria-label={`${g.title}: ${color}${out ? ", sold out with this pairing" : ""}`}
                    onClick={() => {
                      setAdded(false)
                      g.set(color)
                    }}
                    className="h-[42px] w-[42px]"
                  >
                    <SwatchDot name={color} selected={g.value === color} soldOut={out} />
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

        <div className="mt-6">
          <p className="mb-[10px] font-body text-[13px] leading-[19.5px]">Size</p>
          <div className="flex h-12 items-center justify-center rounded-button border border-black bg-black font-body text-[14.08px] uppercase text-white">One Size</div>
          <p className="mt-2 font-body text-[13px] text-muted">{oneSizeLine}</p>
        </div>

        <div id="offer-cta" className="mt-5">
          <Button block size="atc" onClick={onAdd} disabled={soldOut || stock === null} loading={pending} track="offer_add">
            {label}
          </Button>
          {error && (
            <p role="alert" className="mt-2 font-body text-[13px] text-error">
              {error}
            </p>
          )}
        </div>
        <p className="mt-3 flex items-center gap-2 font-heading text-[14px] leading-[21px]" aria-live="polite">
          <span aria-hidden className={`h-[10px] w-[10px] rounded-full ${state === null ? "bg-tertiary" : soldOut ? "bg-text-disabled" : low ? "bg-black" : "bg-instock"}`} />
          {stock === null
            ? "Checking stock…"
            : soldOut
              ? "This pairing is sold out right now. Try another color."
              : low
                ? `Only ${available} pairs left, ready to ship!`
                : "Both in stock, ready to ship!"}
        </p>
        <Perks items={perks} />
      </div>
    </div>
  )
}
