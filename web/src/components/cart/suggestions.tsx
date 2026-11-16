"use client"

import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { formatMoney } from "@/lib/format"
import { Button } from "../ui/button"
import { useAddToBag } from "./use-add-to-bag"

export type Suggestion = {
  productId: string
  handle: string
  title: string
  color: string | null
  shape: string | null
  image: string | null
  price: number | null
  currency: string
  /** The first in-stock variant for a one-size hat; null means "choose a size" on the PDP. */
  variantId: string | null
}

/**
 * "Complete Your Look" (Melin's "Complete Your Kit", SITE_SPEC §6.7): one card
 * visible with arrows, bordered #cccccc cards on the tile colour, "ADD" for
 * one-size hats.
 */
export function Suggestions({ items }: { items: Suggestion[] }) {
  const track = useRef<HTMLDivElement>(null)
  const go = (dir: number) => {
    const el = track.current
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" })
  }
  if (!items.length) return null
  return (
    <div className="relative">
      <div ref={track} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto">
        {items.map((s) => (
          <div key={s.productId} className="w-full shrink-0 snap-center px-6">
            <Card item={s} />
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <>
          <button type="button" aria-label="Previous" onClick={() => go(-1)} className="absolute left-0 top-1/2 flex h-8 w-6 -translate-y-1/2 items-center justify-center">
            <CaretLeft size={16} />
          </button>
          <button type="button" aria-label="Next" onClick={() => go(1)} className="absolute right-0 top-1/2 flex h-8 w-6 -translate-y-1/2 items-center justify-center">
            <CaretRight size={16} />
          </button>
        </>
      )}
    </div>
  )
}

function Card({ item }: { item: Suggestion }) {
  const { add, pending, error } = useAddToBag({ openDrawer: true })
  return (
    <div className="flex flex-col gap-3 rounded-offer border border-line-offer bg-tile p-[15px]">
      <div className="flex gap-3">
        <Link href={`/products/${item.handle}`} className="relative h-[72px] w-[72px] shrink-0 bg-white">
          {item.image && <Image src={item.image} alt={item.title} fill sizes="72px" className="object-contain" />}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/products/${item.handle}`} className="font-body text-[14.08px] leading-[21px] hover:underline">
            {item.title}
          </Link>
          {item.color && <span className="font-body text-[12px] leading-[18px] text-muted">{item.color}</span>}
          {item.shape && <span className="font-body text-[12px] leading-[18px]">{item.shape}</span>}
        </div>
        <span className="font-body text-[14px]">{formatMoney(item.price, item.currency)}</span>
      </div>
      <div className="flex justify-end">
        {item.variantId ? (
          <Button
            size="small"
            className="w-1/2"
            loading={pending}
            track="cart_complete_look"
            onClick={() =>
              add({ productId: item.productId, variantId: item.variantId!, price: item.price, currency: item.currency, source: "complete_the_look" })
            }
          >
            Add
          </Button>
        ) : (
          <Link href={`/products/${item.handle}`} data-track="cart_complete_look" className="btn btn--light btn--small w-1/2">
            <span>Choose size</span>
          </Link>
        )}
      </div>
      {error && (
        <p role="alert" className="font-body text-[12px] text-error">
          {error}
        </p>
      )}
    </div>
  )
}
