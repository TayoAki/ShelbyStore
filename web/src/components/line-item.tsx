"use client"

import { Minus, Plus, X } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useTransition } from "react"
import { updateLineItem } from "@/lib/actions/cart"
import { formatMoney } from "@/lib/format"
import { Badge } from "./ui/badge"

export type Line = {
  id: string
  title: string
  variant: string | null
  handle: string | null
  thumbnail: string | null
  quantity: number
  unitPrice: number
  currency: string
  productId?: string | null
  /** "Limited" for a product from a live drop. */
  badge?: string | null
}

/**
 * A bag line in Melin's slider-cart style (SITE_SPEC §6.7): white row, 128px
 * image, title, "Color / Size", a pill quantity stepper and a remove ×.
 */
export function LineItem({ line, editable = true }: { line: Line; editable?: boolean }) {
  const [pending, startTransition] = useTransition()
  const set = (q: number) => startTransition(async () => void (await updateLineItem(line.id, q)))
  const href = line.handle ? `/products/${line.handle}` : null
  const image = (
    <span className="relative block h-32 w-32 shrink-0 overflow-hidden rounded-addon bg-white">
      {line.thumbnail && <Image src={line.thumbnail} alt="" fill sizes="128px" className="object-contain" />}
    </span>
  )
  return (
    <li className={`relative flex gap-4 border-b border-line bg-white px-4 py-3 ${pending ? "opacity-60" : ""}`}>
      {href ? <Link href={href}>{image}</Link> : image}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[3px] pr-6">
        {href ? (
          <Link href={href} className="font-subheading text-[14.08px] leading-[21px] hover:underline">
            {line.title}
          </Link>
        ) : (
          <span className="font-subheading text-[14.08px] leading-[21px]">{line.title}</span>
        )}
        {line.variant && <p className="font-body text-[13px] leading-[19.5px] text-muted">{line.variant}</p>}
        {line.badge && (
          <span>
            <Badge small>{line.badge}</Badge>
          </span>
        )}
        <div className="mt-2 flex items-center justify-between gap-3">
          {editable ? (
            <div className="flex h-[34px] w-[114px] items-center justify-between rounded-[50px] border border-line bg-white px-1">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="-my-[5px] flex h-11 w-11 items-center justify-center"
                onClick={() => set(line.quantity - 1)}
                disabled={pending}
              >
                <Minus size={12} />
              </button>
              <span className="font-body text-[16px]" aria-live="polite">
                {line.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="-my-[5px] flex h-11 w-11 items-center justify-center"
                onClick={() => set(line.quantity + 1)}
                disabled={pending || line.quantity >= 10}
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <span className="font-body text-[13px] text-muted">Qty {line.quantity}</span>
          )}
          <span className="font-body text-[14px]">{formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
        </div>
      </div>
      {editable && (
        <button
          type="button"
          aria-label={`Remove ${line.title}`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center"
          onClick={() => set(0)}
          disabled={pending}
        >
          <X size={16} />
        </button>
      )}
    </li>
  )
}
