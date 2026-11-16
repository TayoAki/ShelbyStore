import { Suspense } from "react"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { colorThumbs, imagesFor, imageUrl, meta, price, sizeChartOf } from "@/lib/product"
import type { Product } from "@/lib/types"
import { BuyBox } from "../pdp/buy-box"
import { SelectedImage, SelectionProvider } from "../pdp/selection"
import { RETURNS_PERK, SHIPPING_PERK } from "../perks"

/**
 * The offer block at the end of a landing page's argument (SITE_SPEC §6.9 #4,
 * §12.0): a #f8f8f9 block with the product photo (following the picked colour)
 * and the PDP buy box at small scale, so the decision happens on the page.
 */
export function ProductOffer({
  product,
  id = "offer",
  initialSelection,
  source,
  ctaTrack = "add_to_cart",
  showQuizLink = false,
  footer,
}: {
  product: Product
  id?: string
  initialSelection?: Record<string, string>
  source?: string
  ctaTrack?: string
  showQuizLink?: boolean
  footer?: React.ReactNode
}) {
  const p = price(product)
  const thumbs = colorThumbs(product)
  const initialColor = initialSelection?.Color ?? thumbs[0]?.color ?? null
  const lead = imagesFor(product, initialColor)[0] ?? imageUrl(product.thumbnail)
  const byColor = Object.fromEntries(thumbs.map((t) => [t.color, imagesFor(product, t.color)[0] ?? lead ?? ""]))
  const props = {
    product,
    release: null,
    fitNotes: meta(product, "fit_notes"),
    sizeChart: sizeChartOf(product),
    initialSelection,
    source,
    showQuizLink,
    ctaTrack,
    perks: [SHIPPING_PERK, RETURNS_PERK],
  }
  return (
    <SelectionProvider initialColor={initialColor} syncUrl={false}>
      <section id={id} className="scroll-mt-[130px] bg-band p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative aspect-square bg-white">
            <SelectedImage byColor={byColor} fallback={lead} alt={product.title} sizes="(min-width:1024px) 312px, 100vw" />
          </div>
          <div className="flex flex-col">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="pr-[10px] font-body text-[20px] uppercase leading-[25px]">{product.title}</h2>
              <span className="font-body text-[18px] leading-[25px]">{formatMoney(p.amount, p.currency)}</span>
            </div>
            <Suspense fallback={<BuyBox {...props} stock={null} />}>
              <LiveBuyBox {...props} />
            </Suspense>
            {footer}
          </div>
        </div>
      </section>
    </SelectionProvider>
  )
}

async function LiveBuyBox(props: Omit<Parameters<typeof BuyBox>[0], "stock">) {
  const stock = await getStock([props.product.id])
  return <BuyBox {...props} stock={stock} />
}
