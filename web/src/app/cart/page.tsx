import type { Metadata } from "next"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { LineItem } from "@/components/line-item"
import { ButtonLink } from "@/components/ui/button"
import { cartLines } from "@/lib/cart-view"
import { retrieveCart } from "@/lib/data/cart"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"

export const metadata: Metadata = { title: "Bag" }

export default function CartPage() {
  return (
    <Container className="py-8 lg:py-12">
      <h1 className="font-display text-section">Bag</h1>
      <Suspense fallback={<div className="mt-8 h-40 animate-pulse bg-surface" />}>
        <CartContent />
      </Suspense>
    </Container>
  )
}

async function CartContent() {
  const cart = await retrieveCart()
  const lines = cart ? cartLines(cart) : []
  if (!cart || !lines.length) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <p className="text-[17px]">Your bag is empty.</p>
        <ButtonLink href="/#core">Shop the core</ButtonLink>
      </div>
    )
  }
  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
      <ul className="border-t border-line">
        {lines.map((l) => (
          <LineItem key={l.id} line={l} />
        ))}
      </ul>
      <aside className="flex h-fit flex-col gap-4 bg-surface p-5 lg:sticky lg:top-28">
        <div className="flex justify-between text-[15px]">
          <span>Subtotal</span>
          <span className="font-mono">{formatMoney(Number(cart.item_subtotal ?? cart.subtotal ?? 0), cart.currency_code)}</span>
        </div>
        <p className="text-[13px] text-ink-muted">
          Shipping is chosen at checkout: {POLICY.shipping.toLowerCase()}. {POLICY.returns}.
        </p>
        <ButtonLink href="/checkout" block track="cart_checkout">
          Checkout
        </ButtonLink>
        <p className="text-center text-[12px] text-ink-muted">Guest checkout. No account needed.</p>
      </aside>
    </div>
  )
}
