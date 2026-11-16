import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"

/**
 * Free-shipping progress (SITE_SPEC v8 E.5.10): the message, then Eastside's
 * 8px bar in green (M20). Only the real $85 threshold, which must match the
 * Medusa shipping-price rule.
 */
export function FreeShipping({ subtotal, currency, className = "" }: { subtotal: number; currency: string; className?: string }) {
  const t = POLICY.freeShippingThreshold
  const left = Math.max(0, t - subtotal)
  return (
    <div className={`py-3 ${className}`}>
      <p className="text-center text-[14.4px] leading-[19.73px]">
        {left > 0 ? (
          <>
            You&apos;re <strong className="tabular font-bold">{formatMoney(left, currency)}</strong> away from <strong className="font-bold">free shipping</strong>.
          </>
        ) : (
          <>
            You&apos;ve got <strong className="font-bold">free standard shipping</strong>.
          </>
        )}
      </p>
      <div className="progress mt-2" role="progressbar" aria-valuemin={0} aria-valuemax={t} aria-valuenow={Math.min(subtotal, t)} aria-label="Progress to free shipping">
        <span style={{ width: `${Math.min(subtotal / t, 1) * 100}%` }} />
      </div>
    </div>
  )
}
