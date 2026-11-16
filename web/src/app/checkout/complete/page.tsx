import type { Metadata } from "next"
import { CompleteAfterRedirect } from "@/components/complete-after-redirect"

export const metadata: Metadata = { title: "Finishing your order", robots: { index: false } }

/** Return URL for payment methods that redirect (bank redirects, some wallets). */
export default function CheckoutCompletePage() {
  return (
    <div className="container-article flex flex-col items-center gap-4 py-[50.512px] text-center">
      <h1 className="font-heading text-[26px] uppercase leading-[39px]">Finishing Your Order</h1>
      <CompleteAfterRedirect />
    </div>
  )
}
