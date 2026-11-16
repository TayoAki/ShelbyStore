import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { colorThumbs, imagesFor, imageUrl, isOneSize, oneSizeRange, price } from "@/lib/product"
import { POLICY } from "@/lib/policy"
import type { Product } from "@/lib/types"
import { Container } from "../container"
import { StockList } from "../lp/stock-list"
import { ButtonLink } from "../ui/button"

/**
 * The storefront stance and its proof (Tuan Le playbook, SITE_SPEC §6.1.3):
 * "Every core colour, in stock. We show you the count." Live counts per
 * colour, read at request time.
 */
export function CoreBand({ products }: { products: Product[] }) {
  const product = products[0]
  if (!product) return null
  const thumbs = colorThumbs(product)
  const lead = imagesFor(product, thumbs[0]?.color)[0] ?? imageUrl(product.thumbnail)
  const p = price(product)

  return (
    <section id="core" className="scroll-mt-28 bg-surface py-12 lg:py-20">
      <Container className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Link href={`/products/${product.handle}`} className="group relative aspect-[4/5] overflow-hidden bg-page" data-track="core_product">
          {lead && <Image src={lead} alt={product.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />}
        </Link>
        <div className="flex flex-col gap-6 lg:pt-4">
          <div className="flex flex-col gap-3">
            <p className="text-eyebrow text-ink-muted">The core</p>
            <h2 className="font-display text-section">Every colour. In stock.</h2>
            <p className="max-w-lg text-[15px] text-ink-muted lg:text-base">
              The cap we never let run out. Here&apos;s today&apos;s count.
            </p>
          </div>
          <StockList product={product} />
          <div className="flex flex-col gap-4 border-t border-line pt-5">
            <p className="text-[14px]">
              <span className="font-medium">{product.title}</span>
              <span className="font-mono"> · {formatMoney(p.amount, p.currency)}</span>
              {isOneSize(product) && <span className="text-ink-muted"> · One size, {oneSizeRange(product, POLICY.oneSize)}</span>}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={`/products/${product.handle}`} track="core_product">
                Shop the {product.title.replace(/^The /, "")}
              </ButtonLink>
              <Link href={`/fit-guide#${product.handle}`} className="text-[14px] underline underline-offset-4 hover:text-ink-muted" data-track="fit_guide">
                How it fits
              </Link>
            </div>
            <p className="text-[12px] text-ink-muted">Counts are live sellable stock. If a colour runs low, it says so here first.</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
