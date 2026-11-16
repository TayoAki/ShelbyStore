"use client"

import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { useAddToBag } from "./use-add-to-bag"

export type Suggestion = {
  key: string
  productId: string
  href: string
  title: string
  color: string | null
  image: string | null
  price: number | null
  currency: string
  /** The in-stock variant to add in one tap. */
  variantId: string | null
}

/**
 * "Complete the look" (SITE_SPEC v8 E.6.4): Eastside's upsell column in the
 * flyout (200×240 tiles stacked), or a sideways rail of mini cards under the
 * lines on mobile and on /cart. Each has a `btn-kit` "Add".
 */
export function Suggestions({ items, layout = "column", className = "" }: { items: Suggestion[]; layout?: "column" | "rail"; className?: string }) {
  const { add, pending } = useAddToBag({ openDrawer: false })
  if (!items.length) return null
  const column = layout === "column"
  return (
    <section aria-label="Complete the look" className={className}>
      <h3 className={`font-heading text-[16px] leading-[19.2px] font-bold ${column ? "pt-2 pb-3 text-center" : "pb-3"}`}>Complete the look</h3>
      <ul className={column ? "flex flex-col gap-4" : "rail -mx-4 px-4 [grid-auto-columns:140px] md:[grid-auto-columns:200px]"}>
        {items.map((item) => {
          const name = item.color ? `${item.color} ${item.title.replace(/^The\s+/i, "")}` : item.title
          return (
            <li key={item.key} className="flex flex-col">
              <Link href={item.href} className="tile relative block aspect-[5/6]" aria-label={name}>
                {item.image && <Image src={item.image} alt="" fill sizes={column ? "200px" : "140px"} className="tile-photo object-contain" />}
              </Link>
              <p className="mt-2 text-[14.4px] leading-[19.73px]">{name}</p>
              <p className="tabular text-[14px] text-text">{formatMoney(item.price, item.currency)}</p>
              {item.variantId ? (
                <button
                  type="button"
                  className="btn btn-kit mt-2 w-full"
                  disabled={pending}
                  data-track="cart_complete_look"
                  aria-label={`Add ${name}, ${formatMoney(item.price, item.currency)}`}
                  onClick={() => add({ productId: item.productId, variantId: item.variantId!, price: item.price, currency: item.currency, source: "complete_the_look" })}
                >
                  Add
                </button>
              ) : (
                <Link href={item.href} className="btn btn-kit mt-2 w-full" data-track="cart_complete_look">
                  View
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
