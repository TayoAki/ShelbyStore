"use client"

import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { findVariant, LOW_STOCK, price } from "@/lib/product"
import { colorway } from "@/lib/swatches"
import type { Product, VariantStock } from "@/lib/types"
import { useAddToBag } from "../cart/use-add-to-bag"
import { useNotScrolledPast } from "@/lib/use-not-scrolled-past"
import { Digits } from "../digits"
import { SwatchFace, SwatchLink } from "../swatch"
import { useSelection } from "./selection"

export type LimitedSwatch = { name: string; href: string; caption: string | null; selected: boolean }

type Props = {
  product: Product
  /** null while live stock is loading. */
  stock: VariantStock | null
  /** In-page colourways (the core four, or the edition's one colour). */
  colors: string[]
  /** Chips that link to another product: editions (on the core PDP) or the core colours (on an edition PDP). */
  linked: { group: "CORE" | "LIMITED"; swatches: LimitedSwatch[] }
  ropeByColor: Record<string, string | null>
  edition: { hole: number; size: number | null; dateLabel: string | null; released: boolean } | null
  releaseId?: string | null
  crown: { value: string; note: string | null; structure: string } | null
  bundles: ReactNode
  /** h1 on the PDP; h2 where the page already has its own H1 (landing pages). */
  titleAs?: "h1" | "h2"
  /** `add_to_cart` source (pdp, quiz, story…); the sticky bar always reports "sticky". */
  source?: string
  /** Photos per colourway for the die-cut window; omit to render the panel without a window. */
  imagesByColor?: Record<string, string[]>
  fallbackImages?: string[]
  /** Hole number printed as the model number (No. 01 for the core cap). */
  modelNumber?: number
  /** Show the sticky add-to-bag strip once the main button leaves the viewport. */
  sticky?: boolean
  /** Tag printed at the panel's top right (CORE, or the edition stripe). */
  tag?: ReactNode
  /** Where the panel sits away from the PDP (home): link the model name and a "Full details" line to the PDP in the chosen colour. */
  details?: { href: string; titleTrack: string; linkTrack: string }
  /** A step-up link printed in the shipping line (home: The Pair). */
  pairLink?: { href: string; label: string; track: string }
}

/**
 * The box's front panel: the model number, a die-cut window onto the chosen
 * colourway, the model name, the spec line, the ink stripes that choose the
 * colour, then the price and Add to bag printed on the panel. Choosing a colour
 * re-inks the whole panel and swaps the window photo on one beat.
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
  imagesByColor,
  fallbackImages = [],
  modelNumber,
  sticky = true,
  tag,
  details,
  pairLink,
}: Props) {
  const { color, setColor, shared } = useSelection()
  const active = color && colors.includes(color) ? color : colors[0]
  const [showLinked, setShowLinked] = useState(false)
  const { add, pending, error } = useAddToBag()
  const variant = findVariant(product, { Color: active })
  const n = variant && stock ? stock[variant.id] : undefined
  const soldOut = stock !== null && typeof n === "number" && n <= 0
  const p = price(product, variant)
  const ink = colorway(active)
  const dark = ink.panelDark

  const images = (active && imagesByColor?.[active]?.length ? imagesByColor[active] : fallbackImages) ?? []
  const [shot, setShot] = useState(0)
  const [shotFor, setShotFor] = useState(active)
  if (shotFor !== active) {
    setShotFor(active)
    setShot(0)
  }
  const src = images[Math.min(shot, Math.max(0, images.length - 1))]

  const pick = (c: string) => {
    setColor(c)
    if (shared) {
      const url = new URL(window.location.href)
      url.searchParams.set("color", c)
      window.history.replaceState(null, "", url)
    }
  }
  const onStripeKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (i + d + colors.length) % colors.length
    pick(colors[next])
    const group = e.currentTarget.parentElement
    ;(group?.children[next] as HTMLElement | undefined)?.focus()
  }
  const onAdd = (track = "add_to_cart") => {
    if (!variant || soldOut) return
    add({ productId: product.id, variantId: variant.id, price: p.amount, currency: p.currency, releaseId: releaseId ?? undefined, source: track === "sticky_add_to_cart" ? "sticky" : source })
  }

  const cta = useRef<HTMLDivElement>(null)
  const ctaVisible = useNotScrolledPast(cta, sticky)

  const label = soldOut ? "Sold out" : "Add to bag"
  const spec = crown ? `${crown.value} crown${crown.note ? ` · ${crown.note.replace(/^about /, "")}` : ""} · One size` : "One size"
  const stockLine =
    stock === null ? (
      <span className="opacity-80">Checking stock…</span>
    ) : soldOut ? (
      <span>Sold out in {active}</span>
    ) : typeof n === "number" && n <= LOW_STOCK ? (
      <span className="font-semibold">
        Only <Digits value={n} /> left in {active}
      </span>
    ) : (
      <span>In stock · {POLICY.dispatch.toLowerCase()}</span>
    )

  const panelStyle = {
    "--panel-bg": ink.panel,
    "--panel-ink": ink.ink,
    "--panel-line": ink.edge,
    "--window-edge": ink.edge,
    "--btn-bg": dark ? ink.ink : "#14213D",
    "--btn-fg": dark ? ink.panel : "#FFFFFF",
    "--inner-crease": dark ? "#ffffff66" : "#14213d59",
  } as CSSProperties

  return (
    <section aria-label={`${product.title}, buy`} className={`panel overflow-hidden ${dark ? "ink-dark" : ""}`} style={panelStyle}>
      <div className="relative flex flex-col gap-4 p-[var(--panel-pad)]">
        {imagesByColor && src && (
          <div className="window h-[clamp(240px,calc(100svh-470px),440px)] w-full md:aspect-[5/4] md:h-auto lg:aspect-auto lg:h-[clamp(300px,calc(100svh-520px),540px)]">
            <Image key={src} src={src} alt={`${product.title} in ${active}, photo ${shot + 1} of ${images.length}`} fill preload sizes="(min-width: 1024px) 40vw, 92vw" className="animate-[fade-in_var(--beat)_var(--ease-box)_both] object-contain p-[6%]" />
            <span className="window-shade" aria-hidden />
            {images.length > 1 && (
              <div className="absolute inset-x-3 bottom-3 z-[2] flex items-center justify-between text-ink">
                <button type="button" className="btn btn-primary btn-icon-black !min-h-10 !min-w-10 bg-white" aria-label="Previous photo" onClick={() => setShot((s) => (s - 1 + images.length) % images.length)}>
                  <CaretLeft size={18} weight="bold" />
                </button>
                <span className="rounded-[2px] bg-white/90 px-2 py-1 text-[1rem]" aria-live="polite">
                  <Digits value={`${shot + 1}/${images.length}`} label={`Photo ${shot + 1} of ${images.length}`} />
                </span>
                <button type="button" className="btn btn-primary btn-icon-black !min-h-10 !min-w-10 bg-white" aria-label="Next photo" onClick={() => setShot((s) => (s + 1) % images.length)}>
                  <CaretRight size={18} weight="bold" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Title className="model">
            {details ? (
              <Link href={`${details.href}?color=${encodeURIComponent(active)}`} data-track={details.titleTrack} className="decoration-[3px] underline-offset-[6px] hover:underline">
                {product.title}
              </Link>
            ) : (
              product.title
            )}
          </Title>
          <p className="spec-line flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              {spec} · No. {String(modelNumber ?? edition?.hole ?? 1).padStart(2, "0")}
            </span>
            {tag ?? (edition ? <span className="badge-edition">Hole {edition.hole}{edition.size ? ` · ${edition.size} made` : ""}</span> : null)}
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="label mb-2 flex flex-wrap gap-x-2">
            <span>Color</span>
            <span aria-live="polite" className="normal-case tracking-normal font-[550] text-[0.9375rem]">
              {active}
              {ropeByColor[active] ? `, ${ropeByColor[active]!.toLowerCase()} rope` : ""}
            </span>
          </legend>
          <div role="radiogroup" aria-label="Color" className="flex gap-1.5">
            {colors.map((c, i) => {
              const w = colorway(c)
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
                  onKeyDown={(e) => onStripeKey(e, i)}
                  className="relative h-12 flex-1 rounded-[3px] transition-[box-shadow] duration-200"
                  style={{
                    background: w.crown,
                    boxShadow: on ? `0 0 0 2px ${ink.panel}, 0 0 0 5px ${ink.ink}` : `inset 0 0 0 1.5px ${dark ? "#ffffff59" : "#14213d40"}`,
                  }}
                >
                  <span className="absolute inset-x-0 top-[58%] h-[5px]" style={{ background: w.rope }} aria-hidden />
                </button>
              )
            })}
          </div>
          {linked.swatches.length > 0 && (
            <div className="mt-1">
              {linked.group === "LIMITED" ? (
                <button type="button" aria-expanded={showLinked} onClick={() => setShowLinked((o) => !o)} data-track="color_pill" className="label min-h-10 underline decoration-1 underline-offset-4">
                  {showLinked ? "Hide numbered editions" : `Numbered editions (${linked.swatches.length})`}
                </button>
              ) : (
                <p className="label min-h-8">Core colors</p>
              )}
              {(showLinked || linked.group === "CORE") && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {linked.swatches.map((s) => (
                    <SwatchLink key={s.name} name={s.name} href={s.href} caption={s.caption} track="pdp_edition_link" selected={s.selected} />
                  ))}
                </div>
              )}
            </div>
          )}
        </fieldset>

        <hr className="crease" />

        <div ref={cta} className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="text-[2.75rem] leading-none" aria-label={`Price ${formatMoney(p.amount, p.currency)}`}>
              <Digits value={formatMoney(p.amount, p.currency)} label={formatMoney(p.amount, p.currency)} />
            </span>
            <button
              type="button"
              className="btn btn-on-ink btn-atc flex-1"
              onClick={() => onAdd()}
              disabled={soldOut || pending || stock === null || !variant}
              data-track="add_to_cart"
              aria-busy={pending || undefined}
            >
              {pending ? "Adding…" : label}
            </button>
          </div>
          {error && (
            <p className="text-[0.9375rem] font-semibold" role="alert">
              {error}
            </p>
          )}
          <p className="text-[0.9375rem] leading-6">{stockLine}</p>
          <p className="text-[0.9375rem] leading-6 opacity-90">
            Any two caps ship free ($85+).{" "}
            {pairLink && (
              <>
                <Link href={pairLink.href} className="link font-semibold" data-track={pairLink.track}>
                  {pairLink.label}
                </Link>
                .{" "}
              </>
            )}
            {POLICY.returns}.
          </p>
          {edition && (
            <p className="text-[0.9375rem] leading-6">
              {edition.size ? (
                <>
                  Edition of <Digits value={edition.size} />
                </>
              ) : (
                "Numbered edition"
              )}
              {typeof n === "number" && edition.released ? (
                <>
                  {" "}
                  · <Digits value={n} /> left
                </>
              ) : null}
              . {POLICY.limitedRun}
            </p>
          )}
        </div>

        <p className="text-[0.9375rem] leading-6">
          One size, {POLICY.oneSize}.{" "}
          <Link href="/fit-guide" className="link font-semibold" data-track="fit_guide">
            Fit guide
          </Link>{" "}
          ·{" "}
          <Link href="/quiz" className="link" data-track="pdp_quiz">
            Not sure which color? Take the quiz
          </Link>
          {details && (
            <>
              {" "}
              ·{" "}
              <Link href={`${details.href}?color=${encodeURIComponent(active)}`} className="link" data-track={details.linkTrack}>
                Full details
              </Link>
            </>
          )}
        </p>

        {bundles}
      </div>

      {sticky && (
        <div
          className={`sheet fixed inset-x-0 bottom-0 z-[70] border-t-2 border-ink bg-paper text-ink ${ctaVisible ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
          aria-hidden={ctaVisible}
        >
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 md:px-6">
            <SwatchFace name={active} size={20} className="hidden sm:inline-block" />
            <p className="min-w-0 flex-1 truncate text-[0.9375rem]">
              <span className="font-semibold">{product.title}</span>, {active}
            </p>
            <span className="text-[1.75rem] leading-none">
              <Digits value={formatMoney(p.amount, p.currency)} />
            </span>
            <button type="button" tabIndex={ctaVisible ? -1 : 0} className="btn btn-secondary" onClick={() => onAdd("sticky_add_to_cart")} disabled={soldOut || pending || stock === null} data-track="sticky_add_to_cart">
              {label}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
