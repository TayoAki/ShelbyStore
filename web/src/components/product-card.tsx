"use client"

import { Handbag } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { formatMoney } from "@/lib/format"
import { findVariant, imagesFor, imageUrl, price } from "@/lib/product"
import { ropeName } from "@/lib/rope"
import type { Product, VariantStock } from "@/lib/types"
import { useAddToBag } from "./cart/use-add-to-bag"
import { Digits } from "./digits"
import { SwatchFace } from "./swatch"

export type CardBadge = "CORE" | "LIMITED" | "LOW STOCK" | "SOLD OUT" | `HOLE ${number}` | null

/**
 * One colourway as a unit on a keylined plate (the range printed on a box's
 * back): a die-cut window (hover shows the side angle), the tag, model name,
 * colour and rope, the price in digit slots, the ink chips that switch the
 * unit's colourway, and a plain Add button. Upcoming editions show the tee
 * sheet link instead.
 */
export function ProductCard({
  product,
  color,
  colors,
  stock,
  badge = null,
  upcomingHref = null,
  track = "quick_add",
  preload = false,
}: {
  product: Product
  color: string
  colors?: string[]
  stock?: VariantStock
  badge?: CardBadge
  upcomingHref?: string | null
  track?: string
  preload?: boolean
}) {
  const [active, setActive] = useState(color)
  const { add, pending } = useAddToBag()
  const gallery = imagesFor(product, active)
  const first = gallery[0] ?? imageUrl(product.thumbnail)
  const second = gallery[2] ?? gallery[1] ?? null
  const variant = findVariant(product, { Color: active })
  const n = variant && stock ? stock[variant.id] : undefined
  const soldOut = typeof n === "number" && n <= 0
  const p = price(product, variant)
  const rope = ropeName(product, active)
  const href = upcomingHref ?? `/products/${product.handle}?color=${encodeURIComponent(active)}`

  const multi = !!colors && colors.length > 1
  const onAdd = () => {
    if (!variant || soldOut) return
    add({ productId: product.id, variantId: variant.id, price: p.amount, currency: p.currency, source: "quick_add" })
  }

  return (
    <article className="group relative flex h-full flex-col gap-3 bg-paper p-3 md:p-4">
      <div className="relative">
        <Link href={href} className="window block aspect-square" aria-label={`${product.title}, ${active}`}>
          {first && <Image src={first} alt={`${product.title} in ${active}`} fill sizes="(min-width: 768px) 22vw, 45vw" className="object-contain p-[7%]" preload={preload} />}
          {second && <Image src={second} alt="" fill sizes="(min-width: 768px) 22vw, 45vw" className="object-contain p-[7%] opacity-0 md:group-hover:opacity-100" />}
          <span className="window-shade" aria-hidden />
        </Link>
      </div>
      <Link href={href} className="flex flex-col gap-0.5">
        {/* The core cap is one model in four inks, so its unit is named by the ink. */}
        <h3 className="font-model text-[1.375rem] leading-none font-[800] uppercase">{multi ? active : product.title}</h3>
        <p className="flex min-h-[1.5em] items-center gap-2 text-[0.9375rem] leading-6 text-ink-2">
          {(badge || soldOut) && <span className={`shrink-0 ${!soldOut && (badge === "LIMITED" || String(badge).startsWith("HOLE")) ? "badge-edition" : "badge"}`}>{soldOut ? "Sold out" : badge}</span>}
          <span className="truncate">
            {multi ? product.title : active}
            {rope ? `, ${rope.toLowerCase()} rope` : ""}
          </span>
        </p>
        <p className="text-[1.375rem] leading-none">
          <Digits value={formatMoney(p.amount, p.currency)} />
        </p>
      </Link>
      {colors && colors.length > 1 && (
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Color">
          {colors.slice(0, 5).map((c) => (
            <button key={c} type="button" role="radio" aria-checked={c === active} aria-label={c} onClick={() => setActive(c)} onMouseEnter={() => setActive(c)} className="flex size-8 items-center justify-center">
              <SwatchFace name={c} size={20} selected={c === active} />
            </button>
          ))}
        </div>
      )}
      <div className="mt-auto">
        {upcomingHref ? (
          <Link href={upcomingHref} className="btn btn-outline-black btn-small w-full" data-track="notify_me">
            Join the tee sheet
          </Link>
        ) : (
          <button type="button" className="btn btn-outline-black btn-small w-full" disabled={soldOut || pending || !variant} onClick={onAdd} data-track={track} aria-busy={pending || undefined}>
            <Handbag size={16} weight="bold" aria-hidden /> {soldOut ? "Sold out" : "Add"}
          </button>
        )}
      </div>
    </article>
  )
}
