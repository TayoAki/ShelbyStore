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

/**
 * A bag line (v5 §6.7, G.6.8): 85px rounded photo on natural white, uppercase
 * title, the variant ("Pine / One Size", "Navy + Pine", "4 × Pine"), a pill
 * quantity stepper, price and a Remove link.
 */
export function LineItem({ line, editable = true }: { line: Line; editable?: boolean }) {
  const [pending, startTransition] = useTransition()
  const set = (q: number) => startTransition(async () => void (await updateLineItem(line.id, q)))
  const href = line.handle ? `/products/${line.handle}` : null
  return (
    <li className={`flex gap-3 border-b border-natural-white-60 px-5 py-4 ${pending ? "opacity-60" : ""}`}>
      <span className="relative block size-[85px] shrink-0 overflow-hidden rounded-[20px] bg-natural-white-25">
        {line.thumbnail && <Image src={line.thumbnail} alt="" fill sizes="85px" className="object-contain" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          {href ? (
            <Link href={href} className="text-xs leading-4 font-medium tracking-[.05em] uppercase hover:underline">
              {line.title}
            </Link>
          ) : (
            <span className="text-xs leading-4 font-medium tracking-[.05em] uppercase">{line.title}</span>
          )}
          {line.badge && <span className="badge-edition edition shrink-0 !h-5 !px-2 !text-[10px]">{line.badge}</span>}
        </div>
        {line.variant && <p className="truncate text-xs leading-4 text-light-charcoal">{line.variant}</p>}
        <div className="mt-auto flex items-center justify-between gap-3">
          {editable ? (
            <div className="flex h-8 items-center rounded-full border border-stroke">
              <button type="button" aria-label="Decrease quantity" className="flex size-8 items-center justify-center" disabled={pending} onClick={() => set(line.quantity - 1)}>
                <Minus size={12} />
              </button>
              <span className="min-w-4 text-center text-xs leading-4 font-medium" aria-live="polite">
                {line.quantity}
              </span>
              <button type="button" aria-label="Increase quantity" className="flex size-8 items-center justify-center" disabled={pending} onClick={() => set(line.quantity + 1)}>
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <span className="text-xs leading-4 text-light-charcoal">Qty {line.quantity}</span>
          )}
          <span className="text-xs leading-4 font-medium">{formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
        </div>
        {editable && (
          <button type="button" className="link w-fit text-xs" disabled={pending} onClick={() => set(0)}>
            Remove
          </button>
        )}
      </div>
    </li>
  )
}
