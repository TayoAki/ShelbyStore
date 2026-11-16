import { CheckCircle } from "@phosphor-icons/react/dist/ssr"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"

/**
 * The free-shipping progress (G.6.8): only the real $85 threshold, which must
 * match the Medusa shipping-price rule. Fill scales from the left (M21 timing).
 */
export function FreeShipping({ subtotal, currency }: { subtotal: number; currency: string }) {
  const t = POLICY.freeShippingThreshold
  const left = Math.max(0, t - subtotal)
  return (
    <div className="px-5 py-3">
      <p className="flex items-center gap-1.5 text-xs leading-4">
        {left > 0 ? (
          <>Add {formatMoney(left, currency)} for free shipping.</>
        ) : (
          <>
            <CheckCircle size={16} weight="fill" className="text-golf-green" aria-hidden /> Free shipping unlocked.
          </>
        )}
      </p>
      <div className="mt-2 h-[7px] overflow-hidden rounded-[4px] bg-natural-white" role="progressbar" aria-valuemin={0} aria-valuemax={t} aria-valuenow={Math.min(subtotal, t)} aria-label="Progress to free shipping">
        <div className="h-full origin-left bg-golf-green transition-transform duration-600 ease-[var(--ease-power3-in-out)]" style={{ transform: `scaleX(${Math.min(subtotal / t, 1)})` }} />
      </div>
    </div>
  )
}
