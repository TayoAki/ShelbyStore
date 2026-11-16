import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { colorThumbs, imagesFor, imageUrl, meta, price } from "@/lib/product"
import type { Product } from "@/lib/types"
import { ButtonLink } from "../ui/button"

/**
 * A compact product offer for the end of an article or a result (SITE_SPEC
 * §12.3, §12.4): photo, title, live price, one button, and an optional
 * second offer (the two-pack).
 */
export function OfferCard({
  product,
  href,
  cta,
  track,
  second,
}: {
  product: Product
  /** Defaults to the product page. */
  href?: string
  cta: string
  track: string
  second?: { href: string; label: string; track: string } | null
}) {
  const p = price(product)
  const link = href ?? `/products/${product.handle}`
  const image = imagesFor(product, colorThumbs(product)[0]?.color)[0] ?? imageUrl(product.thumbnail)
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4 bg-paper p-4 sm:grid-cols-[140px_1fr] sm:gap-6 sm:p-6">
      <Link href={link} className="relative aspect-[4/5] overflow-hidden bg-page" data-track={track}>
        {image && <Image src={image} alt={product.title} fill sizes="140px" className="object-cover" />}
      </Link>
      <div className="flex flex-col justify-center gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-display text-[22px] leading-none sm:text-[28px]">{product.title}</p>
          <p className="font-mono text-[14px]">{formatMoney(p.amount, p.currency)}</p>
          {meta(product, "promise") && <p className="text-[14px] text-ink-muted">{meta(product, "promise")}</p>}
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-5">
          <ButtonLink href={link} size="sm" track={track}>
            {cta}
          </ButtonLink>
          {second && (
            <Link href={second.href} className="text-[14px] underline underline-offset-4 hover:text-ink-muted" data-track={second.track}>
              {second.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
