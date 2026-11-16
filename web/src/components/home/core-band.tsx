import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { colorOption, colorThumbs, imagesFor, imageUrl, isOneSize, oneSizeRange, price, stockState, variantOptions } from "@/lib/product"
import { POLICY } from "@/lib/policy"
import type { Product, VariantStock } from "@/lib/types"
import { Container } from "../container"
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
          <Suspense fallback={<Rows product={product} stock={null} />}>
            <LiveRows product={product} />
          </Suspense>
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

async function LiveRows({ product }: { product: Product }) {
  const stock = await getStock([product.id])
  return <Rows product={product} stock={stock} />
}

function Rows({ product, stock }: { product: Product; stock: VariantStock | null }) {
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
              data-track="core_product"
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
