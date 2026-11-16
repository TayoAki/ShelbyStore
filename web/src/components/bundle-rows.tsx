import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { capsIn } from "@/lib/rope"
import { price } from "@/lib/product"
import type { Product } from "@/lib/types"

const LEADS = ["Tour White", "Clubhouse Navy", "Pine", "Fescue"].map((c) => `/hats/rope-cap-${c.toLowerCase().replace(/\s+/g, "-")}-1.jpg`)

/**
 * The Pair and The Foursome rows (SITE_SPEC G.5.9): live prices and per-cap
 * figures; a bundle that isn't available is left out.
 */
export function BundleRows({ pair, foursome, trackPair = "pdp_offer", trackFoursome = "pdp_foursome" }: { pair: Product | null; foursome: Product | null; trackPair?: string; trackFoursome?: string }) {
  const rows = [
    pair && { p: pair, href: "/offer/the-pair", track: trackPair, title: "THE PAIR", sub: "Any two colors", images: LEADS.slice(1, 3) },
    foursome && { p: foursome, href: "/offer/the-pair#foursome", track: trackFoursome, title: "THE FOURSOME", sub: "Four caps", images: LEADS },
  ].filter(Boolean) as { p: Product; href: string; track: string; title: string; sub: string; images: string[] }[]
  if (!rows.length) return null
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => {
        const total = price(r.p).amount
        const each = total !== null ? total / capsIn(r.p) : null
        return (
          <Link key={r.title} href={r.href} data-track={r.track} className="flex items-center gap-3 rounded-2xl bg-natural-white-25 p-3 transition-colors hover:bg-natural-white">
            <span className={`grid size-14 shrink-0 overflow-hidden rounded-lg bg-white ${r.images.length === 4 ? "grid-cols-2" : "grid-cols-2"}`}>
              {r.images.map((src) => (
                <span key={src} className={`relative ${r.images.length === 4 ? "aspect-square" : "h-full"}`}>
                  <Image src={src} alt="" fill sizes="28px" className="object-contain" />
                </span>
              ))}
            </span>
            <span className="flex flex-col">
              <span className="text-xs leading-4 font-medium tracking-[.05em]">
                {r.title} · {formatMoney(total)}
              </span>
              <span className="text-xs leading-4 text-light-charcoal">
                {r.sub}, {formatMoney(each)} each.
              </span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
