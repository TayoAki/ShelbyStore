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
}

export function LineItem({ line, editable = true }: { line: Line; editable?: boolean }) {
  const [pending, startTransition] = useTransition()
  const set = (q: number) => startTransition(async () => void (await updateLineItem(line.id, q)))
  return (
    <li className={`grid grid-cols-[88px_1fr] gap-4 border-b border-line py-5 ${pending ? "opacity-60" : ""}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {line.thumbnail && <Image src={line.thumbnail} alt="" fill sizes="88px" className="object-cover" />}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-3">
          {line.handle ? (
            <Link href={`/products/${line.handle}`} className="text-[15px] font-medium hover:underline">
              {line.title}
            </Link>
          ) : (
            <span className="text-[15px] font-medium">{line.title}</span>
          )}
          <span className="font-mono text-[14px]">{formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
        </div>
        {line.variant && <p className="text-[13px] text-ink-muted">{line.variant}</p>}
        {editable ? (
          <div className="mt-2 flex items-center justify-between">
            <div className="inline-flex items-center rounded-[2px] border border-line">
              <button type="button" aria-label="Decrease quantity" className="flex h-11 w-11 items-center justify-center" onClick={() => set(line.quantity - 1)} disabled={pending}>
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-mono text-[14px]" aria-live="polite">
                {line.quantity}
              </span>
              <button type="button" aria-label="Increase quantity" className="flex h-11 w-11 items-center justify-center" onClick={() => set(line.quantity + 1)} disabled={pending || line.quantity >= 10}>
                <Plus size={14} />
              </button>
            </div>
            <button type="button" className="text-[13px] underline underline-offset-4 hover:text-ink-muted" onClick={() => set(0)} disabled={pending}>
              Remove
            </button>
          </div>
        ) : (
          <p className="text-[13px] text-ink-muted">Qty {line.quantity}</p>
        )}
      </div>
    </li>
  )
}
