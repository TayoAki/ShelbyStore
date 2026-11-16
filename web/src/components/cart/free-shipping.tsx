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
      <p className="flex items-center gap-1.5 text-[0.875rem] leading-5">
        {left > 0 ? (
          <>Add {formatMoney(left, currency)} for free shipping.</>
        ) : (
          <>
            <CheckCircle size={16} weight="fill" className="text-ok" aria-hidden /> Free shipping unlocked.
          </>
        )}
      </p>
      <div className="mt-2 h-3 overflow-hidden rounded-[2px] border-2 border-ink bg-paper" role="progressbar" aria-valuemin={0} aria-valuemax={t} aria-valuenow={Math.min(subtotal, t)} aria-label="Progress to free shipping">
        <div className="h-full origin-left bg-ink transition-transform duration-[420ms] ease-[var(--ease-box)]" style={{ transform: `scaleX(${Math.min(subtotal / t, 1)})` }} />
      </div>
    </div>
  )
}
