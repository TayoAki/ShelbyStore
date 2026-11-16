"use client"

import { CaretDown, CaretUp } from "@phosphor-icons/react"
import Link from "next/link"
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { findVariant, LOW_STOCK, price } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"
import { useNotScrolledPast } from "@/lib/use-not-scrolled-past"
import { Accordion } from "../accordion"
import { useAddToBag } from "../cart/use-add-to-bag"
import { CrownProfiles } from "../crown-profiles"
import { SwatchFace, SwatchLink } from "../swatch"
import { TeeSheetForm } from "../tee-sheet-form"
import { useSelection } from "./selection"
import { useFooterVisible } from "./use-footer-visible"

export type LimitedSwatch = { name: string; href: string; caption: string | null; selected: boolean }

type Props = {
  product: Product
  /** null while live stock is loading. */
  stock: VariantStock | null
  /** In-page colourways (the core four, or the edition's one colour). */
  colors: string[]
  /** Dots that link to another product: editions (on the core PDP) or the core colours (on an edition PDP). */
  linked: { group: "CORE" | "LIMITED"; swatches: LimitedSwatch[] }
  ropeByColor: Record<string, string | null>
  edition: { hole: number; size: number | null; dateLabel: string | null; released: boolean; name?: string; cardHref?: string | null } | null
  releaseId?: string | null
  crown: { value: string; note: string | null; structure: string } | null
  /** Extra kit rows under the policy lines (landing pages). */
  bundles: ReactNode
  /** h1 on the PDP; h2 where the page already has its own H1 (landing pages). */
  titleAs?: "h1" | "h2"
  /** `add_to_cart` source (pdp, quiz, story…); the sticky bar always reports "sticky". */
  source?: string
  /** Show the sticky add-to-bag bar once the main button leaves the viewport. */
  sticky?: boolean
  /** PDP breadcrumb. */
  crumbs?: ReactNode
  /** Link lines under the button: "The Pair is $88 — any two colors". */
  kitLinks?: { href: string; label: string; track: string }[]
  /** The tee sheet shown under a sold-out button. */
  next?: { handle: string; hole: number; name: string } | null
  /** Title override (landing pages: "Your color"). */
  heading?: string
  /** Hide the description and accordions (landing pages that already explain the cap). */
  compact?: boolean
  // Accepted for older callers; the v8 buy block shows photos in <Gallery>.
  imagesByColor?: Record<string, string[]>
  fallbackImages?: string[]
  modelNumber?: number
  tag?: ReactNode
}

const ORDER = ["Crown", "Panels", "Rope", "Brim", "Closure", "Fabric", "Sweatband", "Care"]

function range(cm: string | null | undefined): [number, number] | null {
  if (!cm) return null
  const nums = cm.split(/[–-]/).map((x) => Number.parseFloat(x.trim())).filter((n) => Number.isFinite(n))
  return nums.length ? [nums[0], nums[nums.length - 1]] : null
}

/**
 * Eastside's PDP buy block (SITE_SPEC v8 E.6.3): breadcrumb, title, the
 * shipping line and the green price (`pdp-head`), then the edition meta, the
 * colour picker, the green Add To Bag, the kit link, the policy lines, the
 * description with bold bullets and the Fit / Details / Shipping / Returns
 * accordions (`pdp-buy`). The sticky bar appears once the button scrolls away
 * (M18).
 */
export function BuyCard({
  product,
  stock,
  colors,
  linked,
  ropeByColor,
  edition,
  releaseId,
  crown,
  bundles,
  titleAs: Title = "h1",
  source = "pdp",
  sticky = true,
  crumbs,
  kitLinks = [],
  next = null,
  heading,
  compact = false,
}: Props) {
  const { color, setColor, shared } = useSelection()
  const active = color && colors.includes(color) ? color : colors[0]
  const { add, pending, error } = useAddToBag()
  const variant = findVariant(product, { Color: active })
  const n = variant && stock ? stock[variant.id] : undefined
  const soldOut = stock !== null && typeof n === "number" && n <= 0
  const p = price(product, variant)
  const [changing, setChanging] = useState(false)

  const pick = (c: string) => {
    setColor(c)
    if (shared) {
      const url = new URL(window.location.href)
      url.searchParams.set("color", c)
      window.history.replaceState(null, "", url)
    }
  }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!d) return
    e.preventDefault()
    const nextI = (i + d + colors.length) % colors.length
    pick(colors[nextI])
    ;(e.currentTarget.parentElement?.children[nextI] as HTMLElement | undefined)?.focus()
  }
  const onAdd = (track = "add_to_cart") => {
    if (!variant || soldOut) return
    add({ productId: product.id, variantId: variant.id, price: p.amount, currency: p.currency, releaseId: releaseId ?? undefined, source: track === "sticky_add_to_cart" ? "sticky" : source })
  }

  const cta = useRef<HTMLDivElement>(null)
  const footerVisible = useFooterVisible()
  const ctaVisible = useNotScrolledPast(cta, sticky) || footerVisible
  const label = soldOut ? "Sold out" : pending ? "Adding…" : "Add to bag"
  const rope = ropeByColor[active]
  const cm = crown?.note?.replace(/^about /, "").replace(/\s*cm$/, "") ?? null
  const profile = range(cm)
  const details = ((product.metadata as { details?: Record<string, string> } | null)?.details ?? {}) as Record<string, string>
  const rows = ORDER.filter((k) => details[k]).map((k) => [k, details[k]] as const)
  const bullets = [cm ? `Mid crown, about ${cm} cm` : null, "Five panels, garment-washed cotton", "Braided rope above the brim", "Adjustable strap, one size"].filter(Boolean) as string[]

  const stockLine =
    stock === null ? "Checking stock…" : soldOut ? `Sold out in ${active}` : typeof n === "number" && n <= LOW_STOCK ? `Only ${n} left in ${active}` : POLICY.dispatch
  const editionMeta = edition
    ? [edition.size ? `Edition of ${edition.size}` : "Numbered edition", typeof n === "number" && edition.released ? `${n} left` : null, edition.dateLabel ? `${edition.released ? "Released" : "Opens"} ${edition.dateLabel}` : null].filter(Boolean).join(" · ")
    : null

  return (
    <div className="pdp-side">
      <div className="pdp-head pt-4 lg:pt-0">
        {crumbs}
        <Title className="title-product mt-2">{heading ?? product.title}</Title>
        <p className="mt-2 text-[12.6px] md:text-[14.4px]">Free shipping on ${POLICY.freeShippingThreshold}+</p>
        <p className="price mt-1">{formatMoney(p.amount, p.currency)}</p>
      </div>

      <div className="pdp-buy pt-4">
        {edition && (
          <div className="mb-4">
            <p className="eyebrow-sm">
              Hole {String(edition.hole).padStart(2, "0")}
              {edition.name ? ` · ${edition.name}` : ""}
            </p>
            <p className="meta">{editionMeta}</p>
            {edition.cardHref && (
              <Link href={edition.cardHref} className="link text-[12.6px]" data-track="pdp_edition_link">
                See this hole on The Card
              </Link>
            )}
          </div>
        )}

        <fieldset>
          <legend className="text-[14.4px]">
            Color: <span className="font-medium">{active}</span>
            {rope ? <span className="text-text-light">, {rope.toLowerCase()} rope</span> : null}
          </legend>
          <div role="radiogroup" aria-label="Color" className="mt-1 -ml-1.5 flex flex-wrap items-center gap-x-1">
            {colors.map((c, i) => {
              const on = c === active
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${c}${ropeByColor[c] ? `, ${ropeByColor[c]} rope` : ""}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => pick(c)}
                  onKeyDown={(e) => onKey(e, i)}
                  data-track="color_pill"
                  className="group flex size-11 items-center justify-center"
                >
                  <SwatchFace name={c} size={32} selected={on} className="transition-shadow group-hover:shadow-[0_0_0_2px_#fff,0_0_0_3px_rgb(33_33_33/0.7)]" />
                </button>
              )
            })}
            {linked.swatches.length > 0 && (
              <>
                <span className="mx-2 h-8 w-px bg-border" aria-hidden />
                <span className="micro mr-1 text-text-light">{linked.group === "LIMITED" ? "Numbered" : "Core"}</span>
                {linked.swatches.map((s) => (
                  <SwatchLink key={s.name} name={s.name} href={s.href} caption={s.caption} track="pdp_edition_link" selected={s.selected} />
                ))}
              </>
            )}
          </div>
        </fieldset>

        <div ref={cta} className="mt-4">
          <button type="button" className="btn btn-green btn-atc" onClick={() => onAdd()} disabled={soldOut || pending || stock === null || !variant} data-track="add_to_cart" aria-busy={pending || undefined}>
            {label}
          </button>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          {soldOut && next && (
            <div className="mt-4">
              <TeeSheetForm releaseHandle={next.handle} hole={next.hole} name={next.name} />
            </div>
          )}
          {kitLinks.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14.4px]">
              {kitLinks.map((k) => (
                <Link key={k.href} href={k.href} className="link" data-track={k.track}>
                  {k.label}
                </Link>
              ))}
            </p>
          )}
        </div>

        <ul className="meta mt-4 flex flex-col gap-0.5">
          <li aria-live="polite">{stockLine}</li>
          <li>{POLICY.returns}</li>
          <li>One size, {POLICY.oneSize}</li>
          {edition && <li>{POLICY.limitedRun}</li>}
        </ul>

        {bundles && <div className="mt-4">{bundles}</div>}

        {!compact && (
          <>
            {product.description && <p className="mt-6 text-[14.4px] leading-[19.73px]">{product.description}</p>}
            <ul className="mt-3 list-disc pl-5 text-[14.4px] leading-[23px] font-bold">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <div className="mt-6 border-t border-border">
              <Accordion title="Fit">
                {profile && <CrownProfiles low={profile[0]} top={profile[1]} fallbackColor={active} />}
                <p className="mt-3">About {cm ?? "11–11.5"} cm from button to brim. One size, {POLICY.oneSize}.</p>
                <Link href="/fit-guide" className="link mt-2 inline-block" data-track="fit_guide">
                  Fit guide
                </Link>
              </Accordion>
              {rows.length > 0 && (
                <Accordion title="Details">
                  <table className="spec-table">
                    <tbody>
                      {rows.map(([k, v]) => (
                        <tr key={k}>
                          <th scope="row" className="w-[34%] font-medium">
                            {k}
                          </th>
                          <td>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Accordion>
              )}
              <Accordion title="Shipping">
                <p>{POLICY.shipping}</p>
              </Accordion>
              <Accordion title="Returns">
                <p>
                  {POLICY.returns}.{" "}
                  <Link href="/help/shipping-returns" className="link">
                    Shipping &amp; returns
                  </Link>
                </p>
              </Accordion>
            </div>
          </>
        )}

        <p className="mt-6 text-[14.4px]">
          Not sure?{" "}
          <Link href="/quiz" className="link" data-track="pdp_quiz">
            Take the quiz
          </Link>
        </p>
      </div>

      {sticky && (
        <div
          className={`fixed inset-x-0 bottom-0 z-[5500] border-t border-border bg-surface-sticky transition-[opacity,visibility] duration-300 md:bg-bg ${ctaVisible ? "invisible opacity-0" : "visible opacity-100"}`}
          aria-hidden={ctaVisible}
        >
          {/* Desktop */}
          <div className="wrap hidden h-[78px] items-center gap-4 md:flex">
            <p className="min-w-0 flex-1 truncate text-[14.4px]">
              {product.title} <span className="text-text-light">· {formatMoney(p.amount, p.currency)}</span>
            </p>
            {colors.length > 1 && (
              <label className="relative">
                <span className="sr-only">Color</span>
                <select value={active} onChange={(e) => pick(e.target.value)} tabIndex={ctaVisible ? -1 : 0} className="field !w-[220px] appearance-none !pr-9">
                  {colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <CaretDown size={14} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" aria-hidden />
              </label>
            )}
            <button type="button" tabIndex={ctaVisible ? -1 : 0} className="btn btn-green" onClick={() => onAdd("sticky_add_to_cart")} disabled={soldOut || pending || stock === null} data-track="sticky_add_to_cart">
              {soldOut ? "Sold out" : "Add To Bag"}
            </button>
          </div>
          {/* Mobile */}
          <div className="px-[14px] pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] md:hidden">
            {colors.length > 1 && (
              <>
                <button type="button" tabIndex={ctaVisible ? -1 : 0} aria-expanded={changing} className="flex h-10 w-full items-center justify-center gap-1 text-[14.4px]" onClick={() => setChanging((o) => !o)}>
                  Change Color {changing ? <CaretDown size={14} aria-hidden /> : <CaretUp size={14} aria-hidden />}
                </button>
                {changing && (
                  <div role="radiogroup" aria-label="Color" className="flex justify-center pb-2">
                    {colors.map((c) => (
                      <button key={c} type="button" role="radio" aria-checked={c === active} aria-label={c} onClick={() => pick(c)} className="flex size-11 items-center justify-center">
                        <SwatchFace name={c} size={32} selected={c === active} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <button type="button" tabIndex={ctaVisible ? -1 : 0} className="btn btn-green btn-sticky w-full" onClick={() => onAdd("sticky_add_to_cart")} disabled={soldOut || pending || stock === null} data-track="sticky_add_to_cart">
              {soldOut ? "Sold out" : "Add To Bag"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
