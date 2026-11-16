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
import { SwatchFace } from "./swatch"

export type CardBadge = "CORE" | "LIMITED" | "LOW STOCK" | "SOLD OUT" | `HOLE ${number}` | null

/**
 * Allbirds' master product card as a colourway card (SITE_SPEC §6.2, G.6.4):
 * white rounded card, square image (hover = the colour's side shot, M8),
 * badge, title, "Colour · Rope" line, price, crown+rope swatches that switch
 * the card's colourway, and the quick-add row that flips in on hover (M10).
 * `upcoming` editions show the tee sheet link instead of add to bag.
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

  const onAdd = () => {
    if (!variant || soldOut) return
    add({ productId: product.id, variantId: variant.id, price: p.amount, currency: p.currency, source: "quick_add" })
  }

  return (
    <article className="ab-qa-card group relative flex h-full flex-col rounded-2xl bg-white transition-all duration-300 ease-in-out max-sm:min-h-86">
      <div className="relative z-10 aspect-square">
        <Link href={href} className="absolute inset-0 overflow-hidden rounded-t-2xl" aria-label={`${product.title}, ${active}`}>
          {first && <Image src={first} alt={`${product.title} in ${active}`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" preload={preload} />}
          {second && (
            <Image src={second} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover opacity-0 transition-opacity duration-150 ease-in-out md:group-hover:opacity-100" />
          )}
        </Link>
        {(badge || soldOut) && (
          <div className="pointer-events-none absolute inset-x-2.5 top-2.5 z-20 flex justify-between md:inset-x-5 md:top-5">
            <span className="badge">{soldOut ? "SOLD OUT" : badge}</span>
          </div>
        )}
      </div>
      <div className="relative p-4">
        <Link href={href} className="flex flex-col gap-1">
          <h3 className="text-xs leading-4 font-medium tracking-[.05em] uppercase md:truncate md:text-sm md:leading-5">{product.title}</h3>
          <p className="qa-meta min-h-[1.5em] truncate text-xs leading-4 tracking-[.05em] md:text-sm md:leading-5">
            {active}
            {rope ? ` · ${rope} rope` : ""}
          </p>
          <p className="qa-meta text-xs leading-4 font-medium tracking-[.05em]">{formatMoney(p.amount, p.currency)}</p>
        </Link>
        {colors && colors.length > 1 && (
          <div className="mt-2.5 flex items-center gap-1" role="radiogroup" aria-label="Color">
            {colors.slice(0, 5).map((c) => (
              <button key={c} type="button" role="radio" aria-checked={c === active} aria-label={c} onClick={() => setActive(c)} onMouseEnter={() => setActive(c)} className="p-0.5">
                <SwatchFace name={c} size={20} selected={c === active} />
              </button>
            ))}
            {colors.length > 5 && <span className="text-sm leading-[14px] font-medium underline">+{colors.length - 5}</span>}
          </div>
        )}
        {/* Desktop quick add (M10 flip) */}
        <div className="ab-qa-flip absolute top-10 right-4 left-4 z-[2] hidden h-[42px] items-center gap-1.5 md:flex">
          {upcomingHref ? (
            <Link href={upcomingHref} className="btn btn-outline-black btn-small" data-track="notify_me">
              JOIN THE TEE SHEET
            </Link>
          ) : (
            <button type="button" className="btn btn-secondary btn-small" disabled={soldOut || pending || !variant} onClick={onAdd} data-track={track}>
              {soldOut ? "SOLD OUT" : `ADD TO BAG · ${formatMoney(p.amount, p.currency)}`}
            </button>
          )}
        </div>
        {/* Mobile quick add row */}
        <div className="mt-2 flex items-center justify-between md:hidden">
          <span className="text-xs leading-4 text-light-charcoal">One size</span>
          {upcomingHref ? (
            <Link href={upcomingHref} className="text-xs leading-4 font-medium uppercase underline">
              Tee sheet
            </Link>
          ) : (
            <button type="button" onClick={onAdd} disabled={soldOut || pending || !variant} className="flex items-center gap-1 text-xs leading-4 font-medium uppercase disabled:opacity-40" data-track={track}>
              <Handbag size={16} /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
