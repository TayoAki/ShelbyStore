import Image from "next/image"
import { formatMoney } from "@/lib/format"
import { colorThumbs, imagesFor, imageUrl, price } from "@/lib/product"
import type { Product } from "@/lib/types"
import { ButtonLink } from "../ui/button"

/**
 * The offer card at the end of an article (SITE_SPEC §12.3): #f8f8f9, 24px
 * padding, image left (contain), title row and live price right, one primary
 * button and an optional "or get two" link.
 */
export function OfferCard({
  product,
  href,
  cta,
  track,
  second,
}: {
  product: Product
  href?: string
  cta: string
  track: string
  second?: { href: string; label: string; track: string } | null
}) {
  const p = price(product)
  const link = href ?? `/products/${product.handle}`
  const image = imagesFor(product, colorThumbs(product)[0]?.color)[0] ?? imageUrl(product.thumbnail)
  return (
    <div className="grid gap-6 bg-band p-6 sm:grid-cols-2">
      <span className="relative block aspect-square bg-white">
        {image && <Image src={image} alt={product.title} fill sizes="(min-width:640px) 300px, 100vw" className="object-contain" />}
      </span>
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline justify-between">
          <p className="pr-[10px] font-body text-[20px] uppercase leading-[25px]">{product.title}</p>
          <p className="font-body text-[18px] leading-[25px]">{formatMoney(p.amount, p.currency)}</p>
        </div>
        <ButtonLink href={link} size="atc" block className="mt-6" track={track}>
          {cta}
        </ButtonLink>
        {second && (
          <ButtonLink href={second.href} variant="link" className="mt-4 self-center" track={second.track}>
            {second.label}
          </ButtonLink>
        )}
      </div>
    </div>
  )
}
