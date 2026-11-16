import type { Metadata } from "next"
import { CompleteAfterRedirect } from "@/components/complete-after-redirect"

export const metadata: Metadata = { title: "Finishing your order", robots: { index: false } }

/** Return URL for payment methods that redirect (bank redirects, some wallets). */
export default function CheckoutCompletePage() {
  return (
    <div className="wrap mx-auto flex max-w-[680px] flex-col items-center gap-4 py-20 text-center">
      <h1 className="title-page">Finishing your order</h1>
      <CompleteAfterRedirect />
    </div>
  )
}
