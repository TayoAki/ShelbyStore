"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import {
  colorThumbs,
  findVariant,
  imagesFor,
  oneSizeRange,
  optionGroups,
  price,
  productTypeOf,
  stockState,
  valueAvailability,
} from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"
import { useAddToBag } from "../cart/use-add-to-bag"
import { Perks, type Perk } from "../perks"
import { SwatchDot } from "../swatch"
import { Button } from "../ui/button"
import { useSelection } from "./selection"
import { SizeGuide, type SizeChart } from "./size-guide"

type Props = {
  product: Product
  /** null while live stock is still loading. */
  stock: VariantStock | null
  release: { id: string; title: string; handle: string } | null
  fitNotes: string | null
  sizeChart: SizeChart | null
  /** Preselected options, e.g. the quiz result's colour and size (only values the product has). */
  initialSelection?: Record<string, string>
  /** Where the add happened, sent with add_to_cart (pdp, story, listicle, quiz…). */
  source?: string
  showQuizLink?: boolean
  /** "Make It Two" card between size and the CTA (SITE_SPEC §6.4.9). */
  addOn?: ReactNode
  perks?: Perk[]
  /** Melin's sticky buy bar under the header once the CTA scrolls away (PDP and landing pages). */
  sticky?: boolean
  ctaTrack?: string
  stickyTrack?: string
}

/**
 * Melin's PDP buy box (SITE_SPEC §6.4.7–§6.4.13): colour swatches (driving the
 * gallery and ?color=), size, add-on, ADD TO CART, SKU and live stock, the fit
 * quiz link and the perks list. Every add opens the slider cart.
 */
export function BuyBox({
  product,
  stock,
  release,
  fitNotes,
  sizeChart,
  initialSelection,
  source = "pdp",
  showQuizLink = true,
  addOn,
  perks,
  sticky = false,
  ctaTrack = "add_to_cart",
  stickyTrack = "sticky_add_to_cart",
}: Props) {
  const groups = useMemo(() => optionGroups(product), [product])
  const sizeGroup = groups.find((g) => /size/i.test(g.title))
  const colorGroup = groups.find((g) => /colou?r/i.test(g.title))
  const otherGroups = groups.filter((g) => g !== sizeGroup && g !== colorGroup)
  const oneSize = !sizeGroup || sizeGroup.values.length <= 1

  const { color, setColor, shared } = useSelection()
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = Object.fromEntries(otherGroups.map((g) => [g.title, g.values[0]]))
    if (colorGroup) init[colorGroup.title] = color && colorGroup.values.includes(color) ? color : colorGroup.values[0]
    if (sizeGroup?.values.length === 1) init[sizeGroup.title] = sizeGroup.values[0]
    for (const [k, v] of Object.entries(initialSelection ?? {})) {
      if (groups.some((g) => g.title === k && g.values.includes(v))) init[k] = v
    }
    return init
  })
  const [added, setAdded] = useState(false)
  const [flash, setFlash] = useState(false)
  const { add, pending, error } = useAddToBag()

  const needsSize = !!sizeGroup && !selection[sizeGroup.title]
  const variant = needsSize ? undefined : findVariant(product, selection)
  const available = variant && stock ? stock[variant.id] : undefined
  const state = stock === null ? null : variant ? stockState(available) : null
  const p = price(product, variant)
  const sizeAvailability = sizeGroup && stock ? valueAvailability(product, stock, sizeGroup.title, selection) : {}
  const colorAvailability = colorGroup && stock ? valueAvailability(product, stock, colorGroup.title, selection) : {}
  const soldOut = state === "sold_out"
  const low = state === "low"
  const colorName = colorGroup ? selection[colorGroup.title] : null
  const sizeLabel = sizeGroup ? selection[sizeGroup.title] : undefined
  const thumb = imagesFor(product, colorName)[0] ?? null

  useEffect(() => {
    if (!added) return
    const id = setTimeout(() => setAdded(false), 1500)
    return () => clearTimeout(id)
  }, [added])

  const pickColor = (value: string) => {
    if (!colorGroup) return
    setSelection((s) => ({ ...s, [colorGroup.title]: value }))
    setColor(value)
    if (!shared) return
    const url = new URL(window.location.href)
    url.searchParams.set("color", value)
    window.history.replaceState(null, "", url)
  }

  const sizeRow = useRef<HTMLDivElement>(null)
  const askForSize = () => {
    sizeRow.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    setFlash(true)
    setTimeout(() => setFlash(false), 900)
  }

  const onAdd = () => {
    if (needsSize) return askForSize()
    if (!variant || soldOut) return
    add({ productId: product.id, variantId: variant.id, price: p.amount, currency: p.currency, releaseId: release?.id, source }, () => setAdded(true))
  }

  const ctaLabel = needsSize ? "Select a size" : soldOut ? "Sold out" : added ? "Added" : low ? "Add to cart - low inventory" : "Add to cart"

  // Sticky bar once the CTA has scrolled above the header (SITE_SPEC §6.4.15).
  const ctaRef = useRef<HTMLDivElement>(null)
  const [showBar, setShowBar] = useState(false)
  useEffect(() => {
    if (!sticky) return
    const el = ctaRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 61), { rootMargin: "-61px 0px 0px 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [sticky])

  return (
    <div className="flex flex-col">
      {colorGroup && (
        <fieldset>
          <legend className="mb-[10px] font-body text-[13px] leading-[19.5px]">
            Color: <span>{colorName}</span>
          </legend>
          <div className="grid grid-cols-7 gap-[9px]">
            {colorThumbs(product).map(({ color: value }) => {
              const out = colorAvailability[value] === "sold_out"
              return (
                <button
                  key={value}
                  type="button"
                  title={value}
                  aria-pressed={colorName === value}
                  aria-label={`${value}${out ? ", sold out" : ""}`}
                  aria-disabled={out || undefined}
                  onClick={() => pickColor(value)}
                  className="h-[42px] w-[42px]"
                >
                  <SwatchDot name={value} selected={colorName === value} soldOut={out} />
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {otherGroups.map((g) => (
        <fieldset key={g.id} className="mt-6">
          <legend className="mb-[10px] font-body text-[13px] leading-[19.5px]">
            {g.title}: {selection[g.title]}
          </legend>
          <div className="flex flex-wrap gap-[9.5px]">
            {g.values.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={selection[g.title] === v}
                onClick={() => setSelection((s) => ({ ...s, [g.title]: v }))}
                className={`h-12 min-w-[88px] rounded-button border px-4 font-body text-[14.08px] uppercase ${
                  selection[g.title] === v ? "border-black bg-black text-white" : "border-tertiary"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <div ref={sizeRow} className={`mt-6 transition-shadow ${flash ? "shadow-[0_0_0_2px_#000]" : ""}`}>
        <div className="mb-[10px] flex items-baseline justify-between">
          <span className="font-body text-[13px] leading-[19.5px]">Choose your Size</span>
          <SizeGuide fitNotes={fitNotes} chart={sizeChart} />
        </div>
        {oneSize ? (
          <>
            <div className="flex h-12 w-full items-center justify-center rounded-button border border-black bg-black font-body text-[14.08px] uppercase leading-[21.12px] text-white" aria-label="Size: one size">
              One Size
            </div>
            <p className="mt-2 font-body text-[13px] text-muted">{capitalize(oneSizeRange(product, POLICY.oneSize))}</p>
          </>
        ) : (
          sizeGroup && (
            <div className="grid gap-[9.5px]" style={{ gridTemplateColumns: `repeat(${sizeGroup.values.length}, minmax(0, 1fr))` }}>
              {sizeGroup.values.map((v) => {
                const s = sizeAvailability[v]
                const active = selection[sizeGroup.title] === v
                const out = s === "sold_out"
                const sv = findVariant(product, { ...selection, [sizeGroup.title]: v })
                const left = sv && stock ? stock[sv.id] : null
                return (
                  <button
                    key={v}
                    type="button"
                    disabled={out}
                    aria-pressed={active}
                    aria-label={`${v}${out ? ", sold out" : s === "low" ? `, only ${left} left` : ""}`}
                    onClick={() => setSelection((sel) => ({ ...sel, [sizeGroup.title]: v }))}
                    className={`relative flex h-12 flex-col items-center justify-center overflow-hidden rounded-button border font-body text-[14.08px] uppercase leading-[21.12px] ${
                      active ? "border-black bg-black text-white" : out ? "cursor-not-allowed border-tertiary bg-fill-disabled text-text-disabled" : "border-tertiary hover:border-black"
                    }`}
                  >
                    {v}
                    {s === "low" && left !== null && <span className="font-body text-[11px] leading-none">{left} Left</span>}
                    {out && <span aria-hidden className="absolute left-1/2 top-1/2 h-px w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] bg-text-disabled" />}
                  </button>
                )
              })}
            </div>
          )
        )}
      </div>

      {addOn && (
        <div className="mt-6">
          <h3 className="mb-3 font-heading text-[18px] uppercase">Make It Two</h3>
          {addOn}
        </div>
      )}

      <div ref={ctaRef} className="mt-5">
        <Button block size="atc" onClick={onAdd} disabled={soldOut || stock === null} loading={pending} track={ctaTrack}>
          {ctaLabel}
        </Button>
        {error && (
          <p role="alert" className="mt-2 font-body text-[13px] text-error">
            {error}
          </p>
        )}
      </div>

      <div className="mt-3" aria-live="polite">
        {variant?.sku && <p className="font-body text-[13px]">SKU: {variant.sku}</p>}
        <p className="mt-3 flex items-center gap-2 font-heading text-[14px] leading-[21px]">
          <span
            aria-hidden
            className={`h-[10px] w-[10px] shrink-0 rounded-full ${state === null ? "bg-tertiary" : soldOut ? "bg-text-disabled" : low ? "bg-black" : "bg-instock"}`}
          />
          {stock === null
            ? "Checking stock…"
            : needsSize
              ? "Pick a size to see stock"
              : soldOut
                ? `Sold out in ${[colorName, !oneSize && sizeLabel].filter(Boolean).join(" / ")}`
                : low
                  ? `Only ${available} left, ready to ship!`
                  : "In stock, ready to ship!"}
        </p>
        {release && <p className="mt-1 font-body text-[13px] text-muted">{POLICY.limitedRun}</p>}
      </div>

      {showQuizLink && (
        <Link href="/quiz" className="btn btn--micro mt-3 self-start" data-track="pdp_quiz">
          <span>Not sure? Take the 30-second fit quiz</span>
        </Link>
      )}

      {perks && perks.length > 0 && <Perks items={perks} />}

      {sticky && showBar && (
        <div className="fixed inset-x-0 top-[61px] z-30 h-20 bg-white shadow-sticky [html[data-hdr=expanded]_&]:top-[121px] lg:h-[97px] lg:[html[data-hdr=expanded]_&]:top-[61px]">
          <div className="container-shop flex h-full items-center justify-between gap-3">
            <div className="hidden min-w-0 lg:block">
              <p className="truncate font-body text-[18px] capitalize leading-[25px] tracking-[-0.38px]">{product.title}</p>
              <p className="font-body text-[13px] text-muted">{productTypeOf(product)}</p>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none lg:gap-4">
              <span className="relative h-14 w-14 shrink-0 lg:h-16 lg:w-16">{thumb && <Image src={thumb} alt="" fill sizes="64px" className="object-contain" />}</span>
              <span className="flex min-w-0 flex-col">
                <span className="font-body text-[16px] leading-[25px] lg:text-[18px]">{formatMoney(p.amount, p.currency)}</span>
                <span className="truncate font-body text-[12px] tracking-[0.8px] text-muted lg:text-[13px]">
                  {[colorName, !oneSize && sizeLabel].filter(Boolean).join(" / ")}
                </span>
              </span>
              <Button className="ml-auto shrink-0 lg:ml-0" onClick={onAdd} disabled={soldOut || stock === null} loading={pending} track={stickyTrack}>
                {needsSize ? "Select a size" : soldOut ? "Sold out" : "Add to cart"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
