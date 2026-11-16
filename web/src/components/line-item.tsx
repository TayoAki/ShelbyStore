"use client"

import { Minus, Plus } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useTransition } from "react"
import { updateLineItem } from "@/lib/actions/cart"
import { formatMoney } from "@/lib/format"

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
  /** Edition badge, e.g. "HOLE 2". */
  badge?: string | null
}

const editionLabel = (badge: string) => {
  const m = /^HOLE\s+(\d+)/i.exec(badge)
  return m ? `No. ${m[1].padStart(2, "0")}` : badge
}

/**
 * A bag line (SITE_SPEC v8 E.6.4): a 92×110 #F6F6F6 tile (120×144 on /cart),
 * the title in 14.4px/500, colour and size in 12.6px #646464, the price in
 * tabular figures, then Eastside's borderless stepper and a "Remove" micro
 * link. Lines fade up as they enter (M13).
 */
export function LineItem({ line, editable = true, size = "drawer" }: { line: Line; editable?: boolean; size?: "drawer" | "page" }) {
  const [pending, startTransition] = useTransition()
  const set = (q: number) => startTransition(async () => void (await updateLineItem(line.id, q)))
  const href = line.handle ? `/products/${line.handle}` : null
  const meta = [line.badge ? editionLabel(line.badge) : null, line.variant].filter(Boolean).join(" · ")
  const tile = size === "page" ? "w-[120px] h-[144px]" : "w-[92px] h-[110px]"
  return (
    <li className={`cart-line flex gap-4 border-b border-border py-4 transition-opacity ${pending ? "opacity-50" : ""}`}>
      <span className={`tile relative block shrink-0 ${tile}`}>
        {line.thumbnail && <Image src={line.thumbnail} alt="" fill sizes={size === "page" ? "120px" : "92px"} className="tile-photo object-contain" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {href ? (
              <Link href={href} className="text-[14.4px] leading-[19.73px] font-medium">
                {line.title}
              </Link>
            ) : (
              <span className="text-[14.4px] leading-[19.73px] font-medium">{line.title}</span>
            )}
            {meta && <p className="meta mt-0.5">{meta}</p>}
          </div>
          <span className="tabular shrink-0 text-[14.4px]">{formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          {editable ? (
            <div className="flex flex-col items-start">
              <div className="-ml-3 flex items-center">
                <button type="button" aria-label={`Decrease quantity of ${line.title}`} className="flex size-11 items-center justify-center disabled:opacity-40" disabled={pending} onClick={() => set(line.quantity - 1)}>
                  <Minus size={12} />
                </button>
                <span className="tabular min-w-4 text-center text-[14.4px]" aria-live="polite" aria-label={`Quantity ${line.quantity}`}>
                  {line.quantity}
                </span>
                <button type="button" aria-label={`Increase quantity of ${line.title}`} className="flex size-11 items-center justify-center disabled:opacity-40" disabled={pending} onClick={() => set(line.quantity + 1)}>
                  <Plus size={12} />
                </button>
              </div>
              <button type="button" className="micro -mt-1 min-h-6 underline underline-offset-2 hover:text-link-hover" disabled={pending} onClick={() => set(0)}>
                Remove
              </button>
            </div>
          ) : (
            <span className="meta">Qty {line.quantity}</span>
          )}
        </div>
      </div>
    </li>
  )
}
