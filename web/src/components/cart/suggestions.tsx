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
 * "Complete the look": the other core colourways as rows on the bag sheet, a
 * small die-cut window, the colour and price, and one-tap Add.
 */
export function Suggestions({ items }: { items: Suggestion[] }) {
  const { add, pending } = useAddToBag({ openDrawer: false })
  if (!items.length) return null
  return (
    <section className="mt-6 px-5">
      <h3 className="label mb-2">Complete the look</h3>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3 border-t-[1.5px] border-dashed border-[color:var(--color-crease)] py-3">
            <Link href={item.href} className="window relative block size-14 shrink-0 !rounded-[10px]" aria-label={`${item.title}${item.color ? `, ${item.color}` : ""}`}>
              {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-contain p-1" />}
              <span className="window-shade" aria-hidden />
            </Link>
            <p className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[1rem] font-semibold leading-6">{item.color ?? item.title}</span>
              <span className="figure text-[1.125rem]">{formatMoney(item.price, item.currency)}</span>
            </p>
            {item.variantId ? (
              <button
                type="button"
                className="btn btn-outline-black btn-small min-h-11"
                disabled={pending}
                data-track="cart_complete_look"
                aria-label={`Add ${item.color ?? item.title}, ${formatMoney(item.price, item.currency)}`}
                onClick={() => add({ productId: item.productId, variantId: item.variantId!, price: item.price, currency: item.currency, source: "complete_the_look" })}
              >
                Add
              </button>
            ) : (
              <Link href={item.href} className="btn btn-outline-black btn-small min-h-11" data-track="cart_complete_look">
                View
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
