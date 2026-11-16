"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { formatMoney } from "@/lib/format"
import { findVariant, imagesFor, imageUrl, price } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"
import { useAddToBag } from "./cart/use-add-to-bag"
import { SwatchFace } from "./swatch"

/** "HOLE 2" or "No. 02" (a numbered edition) shows as the tile badge; anything else shows nothing. */
export type CardBadge = string | null

function badgeText(badge: CardBadge): string | null {
  if (!badge) return null
  const hole = /^HOLE\s+(\d+)/i.exec(badge)
  if (hole) return `No. ${hole[1].padStart(2, "0")}${badge.includes("·") ? ` ·${badge.split("·").slice(1).join("·")}` : ""}`
  if (/^No\.\s/.test(badge)) return badge
  return null
}

/** "Pine Rope Cap" for a core colour, the product title for anything else. */
export function cardTitle(product: Product, color: string, multi: boolean) {
  return multi ? `${color} ${product.title.replace(/^The\s+/i, "")}` : product.title
}

/**
 * Eastside's product card (SITE_SPEC v8 E.5.2): a 5:6 #F6F6F6 tile, the next
 * angle on hover (M8), a "+ Quick add" bar that slides up from the bottom of
 * the tile (M9; static under it on touch), then the title, the price in
 * #646464 and a row of 20px colour dots. Badges: "No. 02" for a numbered
 * edition and "Sold out" at zero live stock, nothing else.
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
  linkTrack,
  quickAdd = true,
  sizes = "(min-width: 750px) 349px, 164px",
}: {
  product: Product
  color: string
  colors?: string[]
  stock?: VariantStock
  badge?: CardBadge
  upcomingHref?: string | null
  track?: string
  preload?: boolean
  /** data-track on the card's links (e.g. core_product, card_hole). */
  linkTrack?: string
  quickAdd?: boolean
  sizes?: string
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
  const href = upcomingHref ?? `/products/${product.handle}?color=${encodeURIComponent(active)}`
  const multi = !!colors && colors.length > 1
  const title = cardTitle(product, active, multi)
  const tag = soldOut ? null : badgeText(badge)

  const onAdd = () => {
    if (!variant || soldOut) return
    add({ productId: product.id, variantId: variant.id, price: p.amount, currency: p.currency, source: "quick_add" })
  }

  return (
    <article className="card flex h-full flex-col">
      <div className="tile">
        <Link href={href} className="relative block aspect-[5/6]" aria-label={title} data-track={linkTrack}>
          {first && <Image src={first} alt={`${title}`} fill sizes={sizes} className="tile-photo object-contain" preload={preload} />}
          {second && (
            <Image src={second} alt="" fill sizes={sizes} className="card-img-2 tile-photo object-contain" />
          )}
          {(tag || soldOut) && (
            <span className="absolute top-[5px] left-[5px] z-[3]">
              {soldOut ? <span className="badge badge-dark">Sold out</span> : <span className="badge">{tag}</span>}
            </span>
          )}
        </Link>
        {quickAdd &&
          (upcomingHref ? (
            <Link href={upcomingHref} className="quick-add micro flex h-10 items-center justify-center bg-white/90 text-text [@media(hover:none)]:h-11" data-track="notify_me">
              Join the tee sheet
            </Link>
          ) : (
            <button
              type="button"
              className="quick-add micro flex h-10 w-full items-center justify-center bg-white/90 text-text disabled:cursor-default disabled:text-text-light [@media(hover:none)]:h-11"
              disabled={soldOut || pending || !variant}
              onClick={onAdd}
              data-track={track}
              aria-busy={pending || undefined}
              aria-label={soldOut ? `${title}, sold out` : `Quick add ${title}`}
            >
              {soldOut ? "Sold out" : pending ? "Adding…" : "+ Quick add"}
            </button>
          ))}
      </div>
      <div className="flex flex-col px-2 pt-2 pb-0.5">
        <Link href={href} className="card-title" data-track={linkTrack}>
          {title}
        </Link>
        <p className="price-card mt-[5px]">{formatMoney(p.amount, p.currency)}</p>
        {multi && (
          <div className="mt-2.5 -ml-[5px] flex items-center" role="radiogroup" aria-label={`${product.title} color`}>
            {colors!.slice(0, 4).map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={c === active}
                aria-label={c}
                onClick={() => setActive(c)}
                onMouseEnter={() => setActive(c)}
                className="flex size-[30px] items-center justify-center"
              >
                <SwatchFace name={c} size={20} selected={c === active} />
              </button>
            ))}
            {colors!.length > 4 && <span className="micro text-text-light">+{colors!.length - 4}</span>}
          </div>
        )}
      </div>
    </article>
  )
}
