import { Suspense } from "react"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { colorThumbs, imagesFor, imageUrl, meta, modelInfoOf, price, sizeChartOf } from "@/lib/product"
import type { Product } from "@/lib/types"
import { Container } from "../container"
import { BuyBox } from "../pdp/buy-box"
import { SelectedImage, SelectionProvider } from "../pdp/selection"

/**
 * The offer block every landing page ends its argument with (SITE_SPEC §12.0):
 * the product photo for the picked colour, title, live price, promise, and a
 * working buy box with live stock, so the decision happens on the page.
 */
export function ProductOffer({
  product,
  id = "offer",
  eyebrow = "The core · always in stock",
  initialSelection,
  source,
  showQuizLink = true,
  footer,
}: {
  product: Product
  id?: string
  eyebrow?: string
  initialSelection?: Record<string, string>
  source?: string
  showQuizLink?: boolean
  /** Extra line under the buy box, e.g. the two-pack link. */
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
    modelInfo: modelInfoOf(product),
    sizeChart: sizeChartOf(product),
    initialSelection,
    source,
    showQuizLink,
  }
  return (
    <SelectionProvider initialColor={initialColor} syncUrl={false}>
      <section id={id} className="scroll-mt-28 bg-surface py-12 lg:py-20">
        <Container className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden bg-page">
            <SelectedImage byColor={byColor} fallback={lead} alt={product.title} sizes="(min-width:1024px) 45vw, 100vw" />
          </div>
          <div className="flex flex-col gap-6 lg:pt-6">
            <div className="flex flex-col gap-2">
              <p className="text-eyebrow text-ink-muted">{eyebrow}</p>
              <h2 className="font-display text-[32px] leading-[0.95] lg:text-[44px]">{product.title}</h2>
              <p className="font-mono text-[15px]">{formatMoney(p.amount, p.currency)}</p>
              {meta(product, "promise") && <p className="text-[16px] italic text-ink-muted">“{meta(product, "promise")}”</p>}
            </div>
            <Suspense fallback={<BuyBox {...props} stock={null} />}>
              <LiveBuyBox {...props} />
            </Suspense>
            {footer}
          </div>
        </Container>
      </section>
    </SelectionProvider>
  )
}

async function LiveBuyBox(props: Omit<Parameters<typeof BuyBox>[0], "stock">) {
  const stock = await getStock([props.product.id])
  return <BuyBox {...props} stock={stock} />
}
