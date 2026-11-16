"use client"

import { ArrowCounterClockwise, Truck } from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { addToCart } from "@/lib/actions/cart"
import { analyticsId, track } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { findVariant, optionGroups, price, stockState, valueAvailability } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"
import { Button } from "../ui/button"
import { useSelection } from "./selection"
import { SizeGuide, type SizeChart } from "./size-guide"

type Props = {
  product: Product
  /** null while live stock is still loading. */
  stock: VariantStock | null
  release: { id: string; title: string; handle: string } | null
  fitNotes: string | null
  modelInfo: string | null
  sizeChart: SizeChart | null
}

/**
 * Colour → size → CTA → reassurance, the skeleton 11/11 studied stores share.
 * Size buttons show live availability; the CTA reads "Select a size" until one
 * is chosen; reassurance sits directly under it (SITE_SPEC §6.4).
 */
export function BuyBox({ product, stock, release, fitNotes, modelInfo, sizeChart }: Props) {
  const groups = useMemo(() => optionGroups(product), [product])
  const sizeGroup = groups.find((g) => /size/i.test(g.title))
  const otherGroups = groups.filter((g) => g !== sizeGroup)

  const { color, setColor } = useSelection()
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = Object.fromEntries(
      otherGroups.map((g) => [g.title, /colou?r/i.test(g.title) && color && g.values.includes(color) ? color : g.values[0]])
    )
    // One-size hats need no size pick.
    if (sizeGroup?.values.length === 1) init[sizeGroup.title] = sizeGroup.values[0]
    return init
  })
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const needsSize = !!sizeGroup && !selection[sizeGroup.title]
  const variant = needsSize ? undefined : findVariant(product, selection)
  const available = variant && stock ? stock[variant.id] : undefined
  const state = stock === null ? null : variant ? stockState(available) : null
  const p = price(product, variant)
  const sizeAvailability = sizeGroup && stock ? valueAvailability(product, stock, sizeGroup.title, selection) : {}
  const soldOut = state === "sold_out"

  const add = () => {
    if (!variant || soldOut) return
    setError(null)
    startTransition(async () => {
      const result = await addToCart({ variantId: variant.id, quantity: 1, releaseId: release?.id, analyticsId: analyticsId() })
      if (result.ok) {
        setAdded(true)
        track("add_to_cart", {
          product_id: product.id,
          variant_id: variant.id,
          quantity: 1,
          price: p.amount,
          currency: p.currency,
          release_id: release?.id,
        })
      } else {
        setError(result.error)
      }
    })
  }

  const ctaLabel = needsSize
    ? "Select a size"
    : soldOut
      ? "Sold out"
      : `Add to bag · ${formatMoney(p.amount, p.currency)}`

  // Pinned mobile buy bar once the main CTA scrolls away (7/11 studied sites).
  const ctaRef = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)
  const stickyEnabled = true
  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting || entry.boundingClientRect.top > 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {otherGroups.map((g) => (
        <fieldset key={g.id} className="flex flex-col gap-3">
          <legend className="mb-3 flex w-full items-baseline justify-between">
            <span className="text-eyebrow text-ink-muted">
              {release ? "Limited" : /colou?r/i.test(g.title) ? "Core colours" : g.title}
            </span>
            <span className="text-[13px]">{selection[g.title]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {g.values.map((v) => {
              const active = selection[g.title] === v
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setAdded(false)
                    setSelection((s) => ({ ...s, [g.title]: v }))
                    if (/colou?r/i.test(g.title)) setColor(v)
                  }}
                  className={`h-11 min-w-[88px] rounded-[2px] border px-4 text-[14px] transition-colors duration-150 ${
                    active ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                  }`}
                >
                  {v}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}

      {sizeGroup && (
        <fieldset className="flex flex-col">
          <legend className="mb-3 flex w-full items-baseline justify-between">
            <span className="text-eyebrow text-ink-muted">Size</span>
            <SizeGuide fitNotes={fitNotes} modelInfo={modelInfo} chart={sizeChart} />
          </legend>
          <div className="grid grid-cols-5 gap-2">
            {sizeGroup.values.map((v) => {
              const s = sizeAvailability[v]
              const active = selection[sizeGroup.title] === v
              const out = s === "sold_out"
              const sizeVariant = findVariant(product, { ...selection, [sizeGroup.title]: v })
              const left = sizeVariant && stock ? stock[sizeVariant.id] : null
              return (
                <button
                  key={v}
                  type="button"
                  disabled={out}
                  aria-pressed={active}
                  aria-label={`${v}${out ? ", sold out" : s === "low" ? `, only ${left} left` : ""}`}
                  onClick={() => {
                    setAdded(false)
                    setSelection((sel) => ({ ...sel, [sizeGroup.title]: v }))
                  }}
                  className={`relative flex h-12 flex-col items-center justify-center rounded-[2px] border text-[14px] transition-colors duration-150 ${
                    active
                      ? "border-ink bg-ink text-white"
                      : out
                        ? "cursor-not-allowed border-line text-ink-faint line-through"
                        : "border-line hover:border-ink"
                  }`}
                >
                  {v}
                  {s === "low" && left !== null && (
                    <span className={`font-mono text-[10px] leading-none ${active ? "text-white/80" : "text-low"}`}>{left} left</span>
                  )}
                </button>
              )
            })}
          </div>
          {modelInfo && <p className="mt-3 text-[13px] text-ink-muted">{modelInfo}</p>}
        </fieldset>
      )}

      <div aria-live="polite" className="min-h-5 text-[14px]">
        {stock === null && <span className="text-ink-muted">Checking stock…</span>}
        {state && state !== "sold_out" && (
          <span className={state === "low" ? "text-low" : "text-ok"}>
            ● {state === "low" ? `Only ${available} left in ${selection[sizeGroup?.title ?? ""] ?? "this size"}` : "In stock"}
            <span className="text-ink-muted"> · {POLICY.dispatch}</span>
          </span>
        )}
        {state === "sold_out" && <span className="text-ink-muted">Sold out in {selection[sizeGroup?.title ?? ""]}</span>}
        {release && <p className="mt-1 text-[13px] text-ink-muted">{POLICY.limitedRun}</p>}
      </div>

      <div ref={ctaRef} className="flex flex-col gap-3">
        <Button block onClick={add} disabled={needsSize || soldOut || stock === null} loading={pending} data-track="add_to_cart">
          {ctaLabel}
        </Button>
        {added && (
          <p className="text-[14px]" role="status">
            Added.{" "}
            <Link href="/cart" className="font-medium underline underline-offset-4">
              View bag →
            </Link>
          </p>
        )}
        {error && (
          <p className="text-[14px] text-danger" role="alert">
            {error}
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-2 text-[13px] text-ink-muted">
        <li className="flex items-center gap-2">
          <Truck size={18} aria-hidden /> {POLICY.shipping}
        </li>
        <li className="flex items-center gap-2">
          <ArrowCounterClockwise size={18} aria-hidden /> {POLICY.returns}
        </li>
      </ul>

      {stickyEnabled && !ctaVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-page px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">{product.title}</p>
              <p className="text-[12px] text-ink-muted">
                {needsSize ? "Select a size" : `${Object.values(selection).join(" · ")}`}
              </p>
            </div>
            <Button
              data-track="sticky_add_to_cart"
              size="sm"
              onClick={() => (needsSize ? ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }) : add())}
              disabled={soldOut || stock === null}
              loading={pending}
            >
              {needsSize ? "Select size" : soldOut ? "Sold out" : "Add to bag"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
