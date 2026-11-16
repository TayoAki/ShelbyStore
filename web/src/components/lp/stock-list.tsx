import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { getStock } from "@/lib/data/stock"
import { colorOption, colorThumbs, stockState, variantOptions } from "@/lib/product"
import type { Product, VariantStock } from "@/lib/types"

/**
 * Live sellable stock per colour, one row each, read at request time. The
 * proof behind "every colour, in stock" (home core band, listicle reason 5,
 * offer proof; SITE_SPEC §6.1.3, §12).
 */
export function StockList({ product, track = "core_product" }: { product: Product; track?: string }) {
  return (
    <Suspense fallback={<Rows product={product} stock={null} track={track} />}>
      <LiveRows product={product} track={track} />
    </Suspense>
  )
}

async function LiveRows({ product, track }: { product: Product; track: string }) {
  const stock = await getStock([product.id])
  return <Rows product={product} stock={stock} track={track} />
}

function Rows({ product, stock, track }: { product: Product; stock: VariantStock | null; track: string }) {
  const colorTitle = colorOption(product)
  const thumbs = colorThumbs(product)
  return (
    <ul className="flex flex-col border-t border-line" aria-busy={stock === null || undefined}>
      {thumbs.map(({ color, image }) => {
        // Sum the colour's sizes (one row per colour; one-size caps have one variant each).
        const variants = (product.variants ?? []).filter((v) => colorTitle && variantOptions(v)[colorTitle] === color)
        const counts = stock ? variants.map((v) => stock[v.id]) : []
        const untracked = counts.some((n) => n === null)
        const available = counts.reduce<number>((sum, n) => sum + (typeof n === "number" ? n : 0), 0)
        const state = stock === null ? null : untracked ? "untracked" : stockState(available)
        return (
          <li key={color} className="border-b border-line">
            <Link
              href={`/products/${product.handle}?color=${encodeURIComponent(color)}`}
              className="flex items-center gap-4 py-3 hover:bg-surface-2/40"
              data-track={track}
            >
              <span className="relative h-12 w-10 shrink-0 overflow-hidden bg-page">
                {image && <Image src={image} alt="" fill sizes="40px" className="object-cover" />}
              </span>
              <span className="flex-1 text-[15px] font-medium">{color}</span>
              {state === null ? (
                <span className="h-4 w-24 animate-pulse rounded-[2px] bg-surface-2" aria-hidden />
              ) : (
                <span
                  className={`font-mono text-[13px] ${
                    state === "sold_out" ? "text-ink-muted" : state === "low" ? "text-low" : "text-ok"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                      state === "sold_out" ? "bg-ink-faint" : state === "low" ? "bg-low" : "bg-ok"
                    }`}
                  />
                  {state === "untracked"
                    ? "In stock"
                    : state === "sold_out"
                      ? "Restocking"
                      : state === "low"
                        ? `Only ${available} left`
                        : `${available} in stock`}
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
