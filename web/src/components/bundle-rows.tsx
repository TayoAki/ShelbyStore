import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { capsIn } from "@/lib/rope"
import { price } from "@/lib/product"
import type { Product } from "@/lib/types"
import { Digits } from "./digits"

const LEADS = ["Tour White", "Clubhouse Navy", "Pine", "Fescue"].map((c) => `/hats/rope-cap-${c.toLowerCase().replace(/\s+/g, "-")}-1.jpg`)

/**
 * The Pair and The Foursome as sleeves: a keylined strip with one small die-cut
 * window per cap, the live price and the per-cap figure. A bundle that isn't
 * available is left out.
 */
export function BundleRows({ pair, foursome, trackPair = "pdp_offer", trackFoursome = "pdp_foursome" }: { pair: Product | null; foursome: Product | null; trackPair?: string; trackFoursome?: string }) {
  const rows = [
    pair && { p: pair, href: "/offer/the-pair", track: trackPair, title: "The Pair", sub: "Any two colors", images: LEADS.slice(1, 3) },
    foursome && { p: foursome, href: "/offer/the-pair#foursome", track: trackFoursome, title: "The Foursome", sub: "Four caps", images: LEADS },
  ].filter(Boolean) as { p: Product; href: string; track: string; title: string; sub: string; images: string[] }[]
  if (!rows.length) return null
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => {
        const total = price(r.p).amount
        const each = total !== null ? total / capsIn(r.p) : null
        return (
          <Link key={r.title} href={r.href} data-track={r.track} className="group flex items-center gap-3 rounded-[4px] border-2 border-current bg-paper p-2.5 text-ink transition-colors hover:bg-wash">
            <span className="flex shrink-0 gap-1">
              {r.images.map((src) => (
                <span key={src} className="window relative block size-10 !rounded-[10px]">
                  <Image src={src} alt="" fill sizes="40px" className="object-contain p-0.5" />
                </span>
              ))}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="label">
                {r.title} · <Digits value={formatMoney(total)} />
              </span>
              <span className="text-[0.875rem] text-ink-2">
                {r.sub}, {formatMoney(each)} each
              </span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
