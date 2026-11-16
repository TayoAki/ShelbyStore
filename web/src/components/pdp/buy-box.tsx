"use client"

import { ArrowCounterClockwise, Truck } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { addToCart } from "@/lib/actions/cart"
import { analyticsId, track } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { colorThumbs, findVariant, oneSizeRange, optionGroups, price, stockState, valueAvailability } from "@/lib/product"
import { swatchBackground } from "@/lib/swatches"
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
 * Colour → size → CTA → reassurance (SITE_SPEC §6.4). Colour is picked with
 * image swatches that also drive the gallery and the ?color= URL. One-size hats
 * show the fit range and a fit-guide link instead of size buttons; sized hats
 * show S/M and L/XL with live availability.
 */
export function BuyBox({ product, stock, release, fitNotes, modelInfo, sizeChart }: Props) {
  const groups = useMemo(() => optionGroups(product), [product])
  const sizeGroup = groups.find((g) => /size/i.test(g.title))
  const colorGroup = groups.find((g) => /colou?r/i.test(g.title))
  const otherGroups = groups.filter((g) => g !== sizeGroup && g !== colorGroup)
  const oneSize = !sizeGroup || sizeGroup.values.length <= 1
  const thumbs = useMemo(() => colorThumbs(product), [product])
  const isCore = product.collection?.handle === "core"

  const { color, setColor, shared } = useSelection()
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = Object.fromEntries(otherGroups.map((g) => [g.title, g.values[0]]))
    if (colorGroup) init[colorGroup.title] = color && colorGroup.values.includes(color) ? color : colorGroup.values[0]
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
  const colorAvailability = colorGroup && stock ? valueAvailability(product, stock, colorGroup.title, selection) : {}
  const soldOut = state === "sold_out"

  const pickColor = (value: string) => {
    if (!colorGroup) return
    setAdded(false)
    setSelection((s) => ({ ...s, [colorGroup.title]: value }))
    setColor(value)
    if (!shared) return
    // Every colour gets a shareable, attributable URL (SITE_SPEC §6.4.5).
    const url = new URL(window.location.href)
    url.searchParams.set("color", value)
    window.history.replaceState(null, "", url)
  }

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

  const ctaLabel = needsSize ? "Select a size" : soldOut ? "Sold out" : `Add to bag · ${formatMoney(p.amount, p.currency)}`
  const sizeLabel = sizeGroup ? selection[sizeGroup.title] : undefined

  // Pinned mobile buy bar once the main CTA scrolls away (7/11 apparel sites, both hat stores).
  const ctaRef = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)
  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting || entry.boundingClientRect.top > 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {colorGroup && (
        <fieldset className="flex flex-col">
          <legend className="mb-3 flex w-full items-baseline justify-between">
            <span className="text-eyebrow text-ink-muted">{release ? "Limited" : isCore ? "Core colours" : "Colour"}</span>
            <span className="text-[14px] font-medium">{selection[colorGroup.title]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {thumbs.map(({ color: value, image }) => {
              const active = selection[colorGroup.title] === value
              const out = colorAvailability[value] === "sold_out"
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${value}${out ? ", sold out" : ""}`}
                  title={value}
                  onClick={() => pickColor(value)}
                  className={`relative h-[60px] w-12 overflow-hidden rounded-[2px] bg-page transition-shadow duration-150 ${
                    active ? "ring-2 ring-ink ring-offset-2 ring-offset-page" : "ring-1 ring-line hover:ring-ink"
                  } ${out ? "opacity-50" : ""}`}
                >
                  {image ? (
                    <Image src={image} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-2 rounded-full" style={{ background: swatchBackground(value) }} />
                  )}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {otherGroups.map((g) => (
        <fieldset key={g.id} className="flex flex-col">
          <legend className="mb-3 flex w-full items-baseline justify-between">
            <span className="text-eyebrow text-ink-muted">{g.title}</span>
            <span className="text-[14px]">{selection[g.title]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {g.values.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={selection[g.title] === v}
                onClick={() => {
                  setAdded(false)
                  setSelection((s) => ({ ...s, [g.title]: v }))
                }}
                className={`h-11 min-w-[88px] rounded-[2px] border px-4 text-[14px] transition-colors duration-150 ${
                  selection[g.title] === v ? "border-ink bg-ink text-page" : "border-line hover:border-ink"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      {oneSize ? (
        <div className="flex items-center justify-between gap-3 border-y border-line py-3">
          <p className="text-[14px]">
            <span className="font-semibold">One size</span>
            <span className="text-ink-muted"> · {oneSizeRange(product, POLICY.oneSize)}</span>
          </p>
          <Link href={`/fit-guide#${product.handle}`} className="shrink-0 text-[13px] underline underline-offset-4 hover:text-ink-muted" data-track="fit_guide">
            Fit guide
          </Link>
        </div>
      ) : (
        sizeGroup && (
          <fieldset className="flex flex-col">
            <legend className="mb-3 flex w-full items-baseline justify-between gap-3">
              <span className="text-eyebrow text-ink-muted">Size</span>
              <span className="flex items-baseline gap-4">
                <SizeGuide fitNotes={fitNotes} modelInfo={modelInfo} chart={sizeChart} />
                <Link href={`/fit-guide#${product.handle}`} className="text-[13px] underline underline-offset-4 hover:text-ink-muted" data-track="fit_guide">
                  Fit guide
                </Link>
              </span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-[2px] border text-[14px] font-medium transition-colors duration-150 ${
                      active
                        ? "border-ink bg-ink text-page"
                        : out
                          ? "cursor-not-allowed border-line text-ink-faint line-through"
                          : "border-ink-faint hover:border-ink"
                    }`}
                  >
                    {v}
                    {s === "low" && left !== null && (
                      <span className={`font-mono text-[10px] leading-none ${active ? "text-page/80" : "text-low"}`}>{left} left</span>
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      )}

      <div aria-live="polite" className="min-h-5 text-[14px]">
        {stock === null && <span className="text-ink-muted">Checking stock…</span>}
        {state && state !== "sold_out" && (
          <span className={state === "low" ? "text-low" : "text-ok"}>
            ● {state === "low" ? `Only ${available} left${sizeLabel && !oneSize ? ` in ${sizeLabel}` : ""}` : "In stock"}
            <span className="text-ink-muted"> · {POLICY.dispatch}</span>
          </span>
        )}
        {state === "sold_out" && (
          <span className="text-ink-muted">
            Sold out{colorGroup ? ` in ${selection[colorGroup.title]}` : ""}
            {sizeLabel && !oneSize ? ` · ${sizeLabel}` : ""}
          </span>
        )}
      </div>

      <div ref={ctaRef} className="flex flex-col gap-3">
        {release && <p className="text-[13px] font-medium text-accent-ink">{POLICY.limitedRun}</p>}
        <Button block size="lg" onClick={add} disabled={needsSize || soldOut || stock === null} loading={pending} data-track="add_to_cart">
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

      {!ctaVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-page px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">{product.title}</p>
              <p className="truncate text-[12px] text-ink-muted">
                {needsSize ? "Select a size" : [colorGroup && selection[colorGroup.title], !oneSize && sizeLabel].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Button
              data-track="sticky_add_to_cart"
              size="sm"
              onClick={() => (needsSize ? ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }) : add())}
              disabled={soldOut || stock === null}
              loading={pending}
            >
              {needsSize ? "Select size" : soldOut ? "Sold out" : `Add · ${formatMoney(p.amount, p.currency)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
