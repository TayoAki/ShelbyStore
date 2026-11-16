import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { capsIn } from "@/lib/rope"
import { price } from "@/lib/product"
import type { Product } from "@/lib/types"

const LEADS = ["Tour White", "Clubhouse Navy", "Pine", "Fescue"].map((c) => `/hats/rope-cap-${c.toLowerCase().replace(/\s+/g, "-")}-1.jpg`)

/**
 * The Pair and The Foursome as two link rows: small #F6F6F6 tiles for the
 * caps, the kit name and live price, and the per-cap figure. A kit that isn't
 * available is left out.
 */
export function BundleRows({ pair, foursome, trackPair = "pdp_offer", trackFoursome = "pdp_foursome" }: { pair: Product | null; foursome: Product | null; trackPair?: string; trackFoursome?: string }) {
  const rows = [
    pair && { p: pair, href: "/offer/the-pair", track: trackPair, title: "The Pair", sub: "Any two colors", images: LEADS.slice(1, 3) },
    foursome && { p: foursome, href: "/offer/the-pair#foursome", track: trackFoursome, title: "The Foursome", sub: "Four caps", images: LEADS },
  ].filter(Boolean) as { p: Product; href: string; track: string; title: string; sub: string; images: string[] }[]
  if (!rows.length) return null
  return (
    <div className="flex flex-col border-t border-border">
      {rows.map((r) => {
        const total = price(r.p).amount
        const each = total !== null ? total / capsIn(r.p) : null
        return (
          <Link key={r.title} href={r.href} data-track={r.track} className="flex min-h-11 items-center gap-3 border-b border-border py-3">
            <span className="flex shrink-0 gap-1">
              {r.images.map((src) => (
                <span key={src} className="tile relative block h-12 w-10">
                  <Image src={src} alt="" fill sizes="40px" className="tile-photo object-contain" />
                </span>
              ))}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[14.4px] font-medium">
                {r.title} · <span className="tabular">{formatMoney(total)}</span>
              </span>
              <span className="meta">
                {r.sub}, {formatMoney(each)} a cap
              </span>
            </span>
            <span className="link shrink-0 text-[12.6px]">Shop</span>
          </Link>
        )
      })}
    </div>
  )
}
