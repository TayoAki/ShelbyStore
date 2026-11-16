import Image from "next/image"
import Link from "next/link"
import { colorThumbs, imagesFor } from "@/lib/product"
import type { Product } from "@/lib/types"

/** Tonal tile backgrounds per core colour (SITE_SPEC §6.1.5). */
const TILE: Record<string, { bg: string; ink: string }> = {
  "Washed Black": { bg: "#2a2a2a", ink: "#ffffff" },
  Navy: { bg: "#26314a", ink: "#ffffff" },
  Bone: { bg: "#e4ddcc", ink: "#000000" },
  Olive: { bg: "#5e6440", ink: "#ffffff" },
}

/** "Shop By Color" (SITE_SPEC §6.1.5): 3:4 tonal tiles, one per core colour. */
export function ShopByColor({ product }: { product: Product | null }) {
  if (!product) return null
  const colors = colorThumbs(product).map((c) => c.color)
  if (!colors.length) return null
  return (
    <section id="colors" className="bg-white py-[28.432px] lg:py-[50.512px]">
      <h2 className="px-[28px] type-section">Shop By Color</h2>
      <div className="scrollbar-none mt-10 flex snap-x gap-[14px] overflow-x-auto px-[28px] lg:grid lg:grid-cols-4 lg:gap-[15px] lg:overflow-visible">
        {colors.map((c) => {
          const tone = TILE[c] ?? { bg: "#f5f5f5", ink: "#000000" }
          const image = imagesFor(product, c)[0]
          return (
            <Link
              key={c}
              href={`/products/${product.handle}?color=${encodeURIComponent(c)}`}
              data-track="shop_by_color"
              className="relative block aspect-[3/4] w-[333px] shrink-0 snap-start overflow-hidden lg:w-auto"
              style={{ background: tone.bg }}
            >
              <span className="absolute inset-x-0 top-[12%] text-center font-heading text-[16px] uppercase leading-6 tracking-[4.8px]" style={{ color: tone.ink }}>
                {c}
              </span>
              {image && (
                <span className="absolute bottom-[10%] left-[10%] block aspect-square w-[80%]">
                  <Image src={image} alt={`The Everyday Cap in ${c}`} fill sizes="(min-width:1024px) 270px, 266px" className="cutout object-contain" />
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
