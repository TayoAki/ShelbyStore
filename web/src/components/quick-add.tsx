"use client"

import { Bag, Plus } from "@phosphor-icons/react"
import { useState } from "react"
import { useAddToBag } from "./cart/use-add-to-bag"

export type QuickAddData = {
  productId: string
  price: number | null
  currency: string
  releaseId?: string
  /** One-size hats: the variant to add (first in-stock colour), or null when sold out. */
  oneSize: string | null
  /** Sized hats: size → variant (first colour in stock in that size), null = sold out. */
  sizes: { label: string; variantId: string | null }[] | null
}

/**
 * Card quick add (SITE_SPEC §6.2). Desktop: a "+ QUICK ADD" bar on hover (or a
 * S/M | L/XL row for sized hats). Mobile: a bag icon at the top-right. Both add
 * and open the drawer.
 */
export function QuickAdd({ data }: { data: QuickAddData }) {
  const { add, pending } = useAddToBag()
  const [pop, setPop] = useState(false)
  const addVariant = (variantId: string) =>
    add({ productId: data.productId, variantId, price: data.price, currency: data.currency, releaseId: data.releaseId, source: "quick_add" }, () => setPop(false))
  if (!data.oneSize && !data.sizes?.some((s) => s.variantId)) return null

  const sizeRow = (className: string) => (
    <span className={`flex ${className}`}>
      {data.sizes!.map((s, i) => (
        <button
          key={s.label}
          type="button"
          disabled={!s.variantId || pending}
          onClick={() => s.variantId && addVariant(s.variantId)}
          data-track="quick_add"
          className={`flex h-[39px] flex-1 items-center justify-center bg-white font-heading text-[11px] uppercase leading-[16.5px] tracking-[1.3px] ${
            i ? "border-l border-tertiary" : ""
          } ${s.variantId ? "hover:bg-black hover:text-white" : "cursor-not-allowed text-text-disabled line-through"}`}
        >
          {s.label}
        </button>
      ))}
    </span>
  )

  return (
    <>
      {/* Desktop bar */}
      <span className="pointer-events-auto absolute inset-x-4 bottom-2 hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 lg:block">
        {data.oneSize ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => addVariant(data.oneSize!)}
            data-track="quick_add"
            className="flex h-[39px] w-full items-center justify-center gap-2 border border-tertiary bg-white font-heading text-[11px] uppercase leading-[16.5px] tracking-[1.3px] hover:bg-black hover:text-white"
          >
            <Plus size={12} aria-hidden /> {pending ? "Adding…" : "Quick Add"}
          </button>
        ) : (
          sizeRow("border border-tertiary")
        )}
      </span>
      {/* Mobile icon */}
      <span className="pointer-events-auto absolute right-0 top-0 lg:hidden">
        <button
          type="button"
          aria-label="Quick add"
          disabled={pending}
          onClick={() => (data.oneSize ? addVariant(data.oneSize) : setPop((p) => !p))}
          data-track="quick_add"
          className="flex h-12 w-12 items-center justify-center"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-black bg-white">
            <Bag size={16} />
            <span className="absolute -right-1 -top-1 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-black text-white">
              <Plus size={9} weight="bold" />
            </span>
          </span>
        </button>
        {pop && data.sizes && <span className="absolute right-2 top-12 z-10 w-[120px] shadow-sticky">{sizeRow("border border-tertiary")}</span>}
      </span>
    </>
  )
}
