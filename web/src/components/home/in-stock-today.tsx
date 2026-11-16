import Link from "next/link"
import { Suspense } from "react"
import { getStock } from "@/lib/data/stock"
import { colorOption, colorThumbs, stockState, variantOptions } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"
import { SwatchDot } from "../swatch"

/**
 * "In Stock Today" in Melin's "Featured In" slot (SITE_SPEC §6.1.6): live
 * sellable stock per core colour, read at request time.
 */
export function InStockToday({ product, title = "In Stock Today", track = "core_product" }: { product: Product | null; title?: string; track?: string }) {
  if (!product) return null
  return (
    <section id="stock" className="flex flex-col items-center gap-10 bg-tile px-4 py-10 text-center lg:min-h-[412px] lg:justify-center lg:gap-12">
      <div>
        <h2 className="font-heading text-[34px] uppercase leading-[51px] tracking-[2px]">{title}</h2>
        <p className="mt-3 type-micro text-muted">Live sellable stock for the {product.title.replace(/^The /, "")}. Updated every visit.</p>
      </div>
      <Suspense fallback={<Items product={product} stock={null} track={track} />}>
        <LiveItems product={product} track={track} />
      </Suspense>
    </section>
  )
}

async function LiveItems({ product, track }: { product: Product; track: string }) {
  return <Items product={product} stock={await getStock([product.id])} track={track} />
}

/** One centred item per colour: swatch, name, status dot and the count. */
export function Items({ product, stock, track }: { product: Product; stock: VariantStock | null; track: string }) {
  const title = colorOption(product)
  return (
    <ul className="grid grid-cols-2 gap-6 lg:flex lg:justify-center lg:gap-16">
      {colorThumbs(product).map(({ color }) => {
        const variants = (product.variants ?? []).filter((v) => title && variantOptions(v)[title] === color)
        const counts = stock ? variants.map((v) => stock[v.id]) : []
        const untracked = counts.some((n) => n === null)
        const available = counts.reduce<number>((s, n) => s + (typeof n === "number" ? n : 0), 0)
        const state = stock === null ? null : untracked ? "untracked" : stockState(available)
        return (
          <li key={color} className="lg:w-[220px]">
            <Link href={`/products/${product.handle}?color=${encodeURIComponent(color)}`} data-track={track} className="flex flex-col items-center">
              <SwatchDot name={color} />
              <span className="mt-3 font-heading text-[16px] uppercase tracking-[1.3px]">{color}</span>
              {state === null ? (
                <span className="mt-[6px] block h-[14px] w-24 animate-pulse bg-mega" aria-hidden />
              ) : (
                <span className="mt-[6px] flex items-center gap-2 font-body text-[14px] leading-[21px]">
                  <span
                    aria-hidden
                    className={`h-[10px] w-[10px] rounded-full ${state === "sold_out" ? "bg-text-disabled" : state === "low" ? "bg-black" : "bg-instock"}`}
                  />
                  {state === "untracked" ? "In stock" : state === "sold_out" ? "Restocking" : state === "low" ? `Only ${available} left` : `${available} in stock`}
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** The colour row alone, with live counts streamed in (offer proof, listicle reason). */
export function StockRow({ product, track }: { product: Product; track: string }) {
  return (
    <Suspense fallback={<Items product={product} stock={null} track={track} />}>
      <LiveItems product={product} track={track} />
    </Suspense>
  )
}
