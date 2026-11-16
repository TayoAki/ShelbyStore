import { ArrowRight } from "@phosphor-icons/react/dist/ssr"
import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"

/**
 * "Make It Two" card (Melin's "Popular Add Ons" add-on card, SITE_SPEC §6.4.9,
 * §6.7): #ececec fill, 1px #dddddd border, 8px radius, linking to the offer.
 */
export function OfferRow({
  href,
  title,
  subtitle,
  price,
  saving,
  currency,
  image,
  track,
}: {
  href: string
  title: string
  subtitle: string
  price: number
  saving: number | null
  currency: string
  image: string | null
  track: string
}) {
  return (
    <Link href={href} data-track={track} className="flex items-center gap-4 rounded-addon border border-line-addon bg-addon p-4 hover:border-black">
      <span className="relative h-[72px] w-[72px] shrink-0">
        {image && <Image src={image} alt="" fill sizes="72px" className="cutout object-contain" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-body text-[15px] leading-[22.5px]">{title}</span>
        <span className="font-body text-[13px] leading-[19.5px] text-muted">{subtitle}</span>
      </span>
      <span className="flex flex-col items-end">
        <span className="font-heading text-[16px] leading-6">{formatMoney(price, currency)}</span>
        {saving !== null && saving > 0 && <span className="font-body text-[12px] leading-[18px]">Save {formatMoney(saving, currency)}</span>}
      </span>
      <ArrowRight size={16} aria-hidden className="shrink-0" />
    </Link>
  )
}
