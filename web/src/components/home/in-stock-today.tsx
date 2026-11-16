import Link from "next/link"
import { Suspense } from "react"
import { getStock } from "@/lib/data/stock"
import { findVariant, LOW_STOCK } from "@/lib/product"
import { CORE_COLORS } from "@/lib/rope"
import type { Product } from "@/lib/types"
import { Reveal } from "../motion/reveal"
import { SwatchFace } from "../swatch"

/**
 * "In stock today" (v5 §6.1.6): the four core colourways with their crown +
 * rope swatches and live sellable stock (streams in; skeleton while loading).
 */
export function InStockToday({ product }: { product: Product | null }) {
  if (!product) return null
  return (
    <Reveal id="stock" aria-label="In stock today" className="mt-10">
      <div className="flex items-center justify-between px-5">
        <h2 className="tab-title" data-selected="">
          IN STOCK TODAY
        </h2>
        <p className="hidden text-xs leading-4 text-light-charcoal md:block">Live sellable stock. Updated every visit.</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 p-2.5 md:grid-cols-4">
        {CORE_COLORS.map((c) => (
          <Link key={c} href={`/products/rope-cap?color=${encodeURIComponent(c)}`} data-track="core_product" className="flex flex-col gap-4 rounded-2xl bg-white px-5 pt-8 pb-6 md:p-8">
            <SwatchFace name={c} />
            <p className="eyebrow">{c}</p>
            <Suspense fallback={<span className="h-3.5 w-24 animate-pulse rounded bg-natural-white" />}>
              <Count product={product} color={c} />
            </Suspense>
          </Link>
        ))}
      </div>
    </Reveal>
  )
}

async function Count({ product, color }: { product: Product; color: string }) {
  const stock = await getStock([product.id])
  const v = findVariant(product, { Color: color })
  const n = v ? stock[v.id] : undefined
  if (n === null) return <p className="text-sm leading-[21px]">In stock</p>
  if (!n) return <p className="text-sm leading-[21px] text-light-charcoal">● Restocking</p>
  return n <= LOW_STOCK ? (
    <p className="text-sm leading-[21px] text-red">● Only {n} left</p>
  ) : (
    <p className="text-sm leading-[21px] text-green">● {n} in stock</p>
  )
}
