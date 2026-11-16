import type { Metadata } from "next"
import { CompleteAfterRedirect } from "@/components/complete-after-redirect"

export const metadata: Metadata = { title: "Finishing your order", robots: { index: false } }

/** Return URL for payment methods that redirect (bank redirects, some wallets). */
export default function CheckoutCompletePage() {
  return (
    <div className="mx-2.5 my-10 flex flex-col items-center gap-4 rounded-3xl bg-white px-5 py-16 text-center">
      <p className="font-mono text-xs leading-4 tracking-[.1em]">CHECKOUT</p>
      <h1 className="font-display text-2xl leading-8 md:text-[30px] md:leading-9">Finishing your order</h1>
      <CompleteAfterRedirect />
    </div>
  )
}
