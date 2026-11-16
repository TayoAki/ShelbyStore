import Link from "next/link"
import { formatMoney } from "@/lib/format"
import {
  colorOption,
  colorThumbs,
  imagesFor,
  imageUrl,
  isLowStock,
  isOneSize,
  price,
  productTypeOf,
  sizeGroupOf,
  variantOptions,
} from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"
import { CardImages } from "./card-images"
import { QuickAdd, type QuickAddData } from "./quick-add"
import { Badge } from "./ui/badge"

/** One badge, in priority order (SITE_SPEC §6.2). */
export type CardStatus = "limited" | "core" | "soon" | null

/** Card status from the release index and the core collection. */
export function cardStatus(product: Product, live: Record<string, unknown>, upcomingIds?: Set<string>): CardStatus {
  if (live[product.id]) return "limited"
  if (product.collection?.handle === "core") return "core"
  if (upcomingIds?.has(product.id)) return "soon"
  return null
}

/**
 * Melin's product card (SITE_SPEC §6.2): a 1:1 image on white with an 8px
 * bottom pad and 1px #e5e7eb line, an in-card carousel of the first colour,
 * hover image 2 and quick add, then title + price, colour, type and "+N Colors".
 */
export function ProductCard({
  product,
  stock,
  status,
  releaseId,
  preload = false,
  quickAdd = true,
  track,
}: {
  product: Product
  stock?: VariantStock
  status: CardStatus
  releaseId?: string
  preload?: boolean
  quickAdd?: boolean
  track?: string
}) {
  const colors = colorThumbs(product).map((c) => c.color)
  const gallery = imagesFor(product, colors[0])
  const images = gallery.length ? gallery : [imageUrl(product.thumbnail)].filter((x): x is string => !!x)
  const p = price(product)
  const low = isLowStock(product, stock)
  const badge = status === "limited" ? "Limited" : status === "core" ? "Core" : low ? "Low Stock" : status === "soon" ? "Coming Soon" : null

  return (
    <div className="group relative">
      <Link href={`/products/${product.handle}`} className="block" data-track={track}>
        <span className="relative block border-b border-line-header bg-white pb-2">
          <CardImages images={images} title={product.title} preload={preload} />
          {badge && (
            <span className="absolute left-[14.08px] top-[14.08px]">
              <Badge>{badge}</Badge>
            </span>
          )}
        </span>
        <span className="mt-[7px] flex items-baseline justify-between gap-2">
          <span className="line-clamp-2 type-item">{product.title}</span>
          <span className="shrink-0 font-body text-[14px] leading-[21px] tracking-[0.4px]">{formatMoney(p.amount, p.currency)}</span>
        </span>
        {colors[0] && <span className="block font-body text-[12px] capitalize leading-[18px] tracking-[0.4px] text-muted-card">{colors[0]}</span>}
        <span className="block font-body text-[12px] capitalize leading-[18px] tracking-[0.4px] text-muted-card">{productTypeOf(product)}</span>
        {colors.length > 1 && (
          <span className="block font-body text-[12px] capitalize leading-[18px] tracking-[0.4px] text-muted-card">+{colors.length - 1} Colors</span>
        )}
      </Link>
      {quickAdd && status !== "soon" && (
        <span className="pointer-events-none absolute inset-x-0 top-0 aspect-square">
          <QuickAdd data={quickAddData(product, stock, releaseId)} />
        </span>
      )}
    </div>
  )
}

/** First in-stock variant per size (sized) or overall (one size), in colour order. */
export function quickAddData(product: Product, stock: VariantStock | undefined, releaseId?: string): QuickAddData {
  const p = price(product)
  const colorTitle = colorOption(product)
  const colors = colorThumbs(product).map((c) => c.color)
  const inStock = (id: string) => !stock || stock[id] === null || (stock[id] ?? 0) > 0
  const ordered = [...(product.variants ?? [])].sort(
    (a, b) => colors.indexOf(colorTitle ? (variantOptions(a)[colorTitle] ?? "") : "") - colors.indexOf(colorTitle ? (variantOptions(b)[colorTitle] ?? "") : "")
  )
  const base = { productId: product.id, price: p.amount, currency: p.currency, releaseId }
  if (isOneSize(product)) {
    return { ...base, oneSize: ordered.find((v) => inStock(v.id))?.id ?? null, sizes: null }
  }
  const group = sizeGroupOf(product)!
  return {
    ...base,
    oneSize: null,
    sizes: group.values.map((label) => ({
      label,
      variantId: ordered.find((v) => variantOptions(v)[group.title] === label && inStock(v.id))?.id ?? null,
    })),
  }
}
