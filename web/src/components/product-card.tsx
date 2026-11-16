import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import {
  colorThumbs,
  imagesFor,
  imageUrl,
  isLowStock,
  isOneSize,
  price,
  sizeGroupOf,
  valueAvailability,
} from "@/lib/product"
import { swatchBackground } from "@/lib/swatches"
import type { Product, VariantStock } from "@/lib/types"
import { Badge } from "./ui/badge"

export type CardStatus = "core" | "live" | "past" | null

const MAX_DOTS = 4

/**
 * Product card (SITE_SPEC §6.2): 4:5 photo on the canvas, a status badge, title
 * and price, a colour row (dots + first colour name + "+N"), and a size strip
 * only for sized hats. No quick add.
 */
export function ProductCard({
  product,
  stock,
  status,
  releaseTitle,
  preload = false,
}: {
  product: Product
  stock?: VariantStock
  status: CardStatus
  releaseTitle?: string
  preload?: boolean
}) {
  const colors = colorThumbs(product).map((c) => c.color)
  // Lead with the first colour's photos; the hover image is that colour's second shot.
  const gallery = imagesFor(product, colors[0])
  const first = gallery[0] ?? imageUrl(product.thumbnail)
  const second = gallery.find((u) => u !== first)
  const p = price(product)
  const sizeGroup = sizeGroupOf(product)
  const low = isLowStock(product, stock)

  return (
    <Link href={`/products/${product.handle}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-page">
        {first ? (
          <>
            <Image src={first} alt={product.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" preload={preload} />
            {second && (
              <Image
                src={second}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="hidden object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block"
              />
            )}
          </>
        ) : (
          <div className="text-eyebrow flex h-full items-center justify-center bg-surface p-4 text-center text-ink-muted">{product.title}</div>
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {status === "core" && <Badge tone="core">Core</Badge>}
          {status === "live" && (
            <Badge tone="live" dot>
              Limited
            </Badge>
          )}
          {status === "past" && <Badge tone="past">{releaseTitle ? `From ${releaseTitle}` : "Last drop"}</Badge>}
          {low && <Badge tone="low">Low stock</Badge>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium leading-snug group-hover:underline lg:text-[15px]">{product.title}</h3>
          <span className="shrink-0 font-mono text-[13px]">{formatMoney(p.amount, p.currency)}</span>
        </div>
        {colors.length > 0 && (
          <p className="flex items-center gap-2 text-[12px] text-ink-muted">
            <span className="flex gap-1" aria-hidden>
              {colors.slice(0, MAX_DOTS).map((c) => (
                <span key={c} className="h-2.5 w-2.5 rounded-full ring-1 ring-ink/20" style={{ background: swatchBackground(c) }} />
              ))}
            </span>
            <span aria-label={`${colors.length} ${colors.length === 1 ? "colour" : "colours"}: ${colors.join(", ")}`}>
              {colors[0]}
              {colors.length > 1 && ` +${colors.length - 1}`}
            </span>
          </p>
        )}
        {sizeGroup && !isOneSize(product) && stock && (
          <SizeStrip product={product} stock={stock} sizeTitle={sizeGroup.title} sizes={sizeGroup.values} />
        )}
      </div>
    </Link>
  )
}

function SizeStrip({
  product,
  stock,
  sizeTitle,
  sizes,
}: {
  product: Product
  stock: VariantStock
  sizeTitle: string
  sizes: string[]
}) {
  // Availability per size across colours: a size is available if any colour has it.
  const availability = valueAvailability(product, stock, sizeTitle, {})
  const label = sizes
    .map((s) => `${s} ${availability[s] === "sold_out" ? "sold out" : availability[s] === "low" ? "low stock" : "available"}`)
    .join(", ")
  return (
    <p className="flex flex-wrap gap-x-2 font-mono text-[11px] tracking-[0.04em]" aria-label={`Sizes: ${label}`}>
      {sizes.map((s) => {
        const state = availability[s]
        return (
          <span key={s} className={state === "sold_out" ? "text-ink-faint line-through" : state === "low" ? "text-low" : "text-ink-muted"}>
            {s}
          </span>
        )
      })}
    </p>
  )
}
