import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { optionGroups, price, valueAvailability } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"
import { Badge } from "./ui/badge"

export type CardStatus = "core" | "live" | "past" | null

/**
 * 4:5 image, status badge, price and a SIZE STRIP showing availability, so
 * shoppers don't find out their size is gone only on the PDP (Baymard: 39%).
 * No quick add (SITE_SPEC §6.2).
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
  const images = (product.images ?? []).map((i) => i.url).filter(Boolean)
  const first = product.thumbnail ?? images[0]
  const second = images.find((u) => u !== first)
  const p = price(product)
  const sizeGroup = optionGroups(product).find((g) => /size/i.test(g.title))

  return (
    <Link href={`/products/${product.handle}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {first ? (
          <>
            <Image
              src={first}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
              preload={preload}
            />
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
          <div className="text-eyebrow flex h-full items-center justify-center p-4 text-center text-ink-muted">{product.title}</div>
        )}
        {status && (
          <div className="absolute left-2 top-2">
            {status === "core" && <Badge tone="core">Core</Badge>}
            {status === "live" && (
              <Badge tone="live" dot>
                Live drop
              </Badge>
            )}
            {status === "past" && <Badge tone="past">{releaseTitle ? `From ${releaseTitle}` : "Last drop"}</Badge>}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium leading-snug lg:text-[15px]">{product.title}</h3>
          <span className="shrink-0 font-mono text-[13px]">{formatMoney(p.amount, p.currency)}</span>
        </div>
        {sizeGroup && stock && <SizeStrip product={product} stock={stock} sizeTitle={sizeGroup.title} sizes={sizeGroup.values} />}
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
          <span
            key={s}
            className={
              state === "sold_out" ? "text-ink-faint line-through" : state === "low" ? "text-low" : "text-ink-muted"
            }
          >
            {s}
          </span>
        )
      })}
    </p>
  )
}
