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
 * "Complete the look" (v5 §6.7, G.6.8): other core colourways as mini cards on
 * a scroll-snap row, each with "ADD · $48".
 */
export function Suggestions({ items }: { items: Suggestion[] }) {
  const { add, pending } = useAddToBag({ openDrawer: false })
  if (!items.length) return null
  return (
    <section className="mt-6">
      <h3 className="label mb-3 px-5">Complete the look</h3>
      <ul className="scrollbar-hidden flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5">
        {items.map((item) => (
          <li key={item.key} className="w-[calc((100%-20px)/2.4)] shrink-0 snap-start">
            <div className="flex flex-col gap-2 rounded-[4px] border-2 border-ink bg-paper p-3">
              <Link href={item.href} className="window relative block aspect-square !rounded-[16px]">
                {item.image && <Image src={item.image} alt="" fill sizes="160px" className="object-contain" />}
              </Link>
              <p className="label">{item.color ?? item.title}</p>
              <p className="text-[0.875rem] leading-5">{formatMoney(item.price, item.currency)}</p>
              {item.variantId ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-small w-full"
                  disabled={pending}
                  data-track="cart_complete_look"
                  onClick={() => add({ productId: item.productId, variantId: item.variantId!, price: item.price, currency: item.currency, source: "complete_the_look" })}
                >
                  ADD · {formatMoney(item.price, item.currency)}
                </button>
              ) : (
                <Link href={item.href} className="btn btn-outline-black btn-small w-full" data-track="cart_complete_look">
                  VIEW
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
