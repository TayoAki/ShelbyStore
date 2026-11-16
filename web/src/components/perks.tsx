import { ArrowCounterClockwise, Drop, Package, Ruler, Truck } from "@phosphor-icons/react/dist/ssr"
import { POLICY } from "@/lib/policy"

export type Perk = { icon: "truck" | "returns" | "ruler" | "package" | "care"; title: string; detail: string }

const ICONS = { truck: Truck, returns: ArrowCounterClockwise, ruler: Ruler, package: Package, care: Drop }

/** Shelby's true perk rows in Melin's promo-row style (SITE_SPEC §6.4.13). */
export function Perks({ items }: { items: Perk[] }) {
  return (
    <ul className="mt-6">
      {items.map((p) => {
        const Icon = ICONS[p.icon]
        return (
          <li key={p.title} className="flex items-center gap-4 py-3">
            <Icon size={48} weight="light" aria-hidden className="shrink-0" />
            <span className="flex flex-col">
              <span className="font-subheading text-[14.08px] leading-[18.304px]">{p.title}</span>
              <span className="font-body text-[12px] leading-4">{p.detail}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export const SHIPPING_PERK: Perk = { icon: "truck", title: "Standard Shipping $6", detail: `${POLICY.dispatch}. Express $15.` }
export const RETURNS_PERK: Perk = { icon: "returns", title: "30-Day Returns", detail: "Send it back within 30 days of delivery." }
export const STOCK_PERK: Perk = { icon: "package", title: "Live Stock Counts", detail: "The count you see is what we have on the shelf." }
