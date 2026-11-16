import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { price } from "@/lib/product"
import { capsIn } from "@/lib/rope"
import type { Product } from "@/lib/types"

/** The Pair or The Foursome as an E.5.2 card (no quick add: a kit needs its colours picked on the offer page). */
export function KitCard({ product, title, href, image, hover, track, sizes = "(min-width: 750px) 349px, 164px" }: { product: Product; title: string; href: string; image: string; hover?: string; track: string; sizes?: string }) {
  const total = price(product).amount
  const each = total !== null ? total / capsIn(product) : null
  return (
    <Link href={href} data-track={track} className="card flex flex-col">
      <span className="tile relative block aspect-[5/6]">
        <Image src={image} alt="" fill sizes={sizes} className="tile-photo object-contain" />
        {hover && <Image src={hover} alt="" fill sizes={sizes} className="card-img-2 tile-photo object-contain" />}
      </span>
      <span className="flex flex-col px-2 pt-2 pb-0.5">
        <span className="card-title">{title}</span>
        <span className="price-card mt-[5px]">
          {formatMoney(total)} · {formatMoney(each)} a cap
        </span>
      </span>
    </Link>
  )
}
