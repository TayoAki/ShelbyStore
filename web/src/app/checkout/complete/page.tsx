import type { Metadata } from "next"
import { Container } from "@/components/container"
import { CompleteAfterRedirect } from "@/components/complete-after-redirect"

export const metadata: Metadata = { title: "Finishing your order", robots: { index: false } }

/** Return URL for payment methods that redirect (bank redirects, some wallets). */
export default function CheckoutCompletePage() {
  return (
    <Container className="flex flex-col items-start gap-4 py-16">
      <h1 className="font-display text-section">Finishing your order…</h1>
      <CompleteAfterRedirect />
    </Container>
  )
}
