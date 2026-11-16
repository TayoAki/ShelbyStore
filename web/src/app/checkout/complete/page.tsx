import type { Metadata } from "next"
import { CompleteAfterRedirect } from "@/components/complete-after-redirect"

export const metadata: Metadata = { title: "Finishing your order", robots: { index: false } }

/** Return URL for payment methods that redirect (bank redirects, some wallets). */
export default function CheckoutCompletePage() {
  return (
    <div className="panel mx-3 mt-6 flex flex-col items-start gap-4 p-[var(--panel-pad)] md:mx-auto md:mt-10 md:max-w-[860px]">
      <h1 className="model">Finishing your order</h1>
      <CompleteAfterRedirect />
    </div>
  )
}
