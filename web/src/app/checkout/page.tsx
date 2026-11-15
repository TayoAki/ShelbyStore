import type { Metadata } from "next"
import { Suspense } from "react"
import { CheckoutForm } from "@/components/checkout-form"
import { Container } from "@/components/container"
import { LineItem } from "@/components/line-item"
import { ButtonLink } from "@/components/ui/button"
import { listShippingOptions } from "@/lib/actions/checkout"
import { cartLines } from "@/lib/cart-view"
import { retrieveCart } from "@/lib/data/cart"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

export default function CheckoutPage() {
  return (
    <Container className="py-8 lg:py-12">
      <h1 className="font-display text-section">Checkout</h1>
      <Suspense fallback={<div className="mt-8 h-80 animate-pulse bg-surface" />}>
        <CheckoutContent />
      </Suspense>
    </Container>
  )
}

async function CheckoutContent() {
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
  const a = cart.shipping_address
  const address =
    cart.email && a?.address_1
      ? {
          email: cart.email,
          first_name: a.first_name ?? "",
          last_name: a.last_name ?? "",
          address_1: a.address_1 ?? "",
          address_2: a.address_2 ?? "",
          city: a.city ?? "",
          province: a.province ?? "",
          postal_code: a.postal_code ?? "",
        }
      : null
  const options = address ? await listShippingOptions() : []
  const selected = cart.shipping_methods?.[0]?.shipping_option_id ?? null
  const currency = cart.currency_code
  const n = (v: unknown) => Number(v ?? 0)

  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
      <CheckoutForm
        cartId={cart.id}
        total={n(cart.total)}
        currency={currency}
        address={address}
        options={options}
        selectedOption={selected}
      />
      {/* Total always visible (Baymard: 12% abandon when they can't see it). */}
      <aside className="flex h-fit flex-col gap-3 bg-surface p-5 lg:sticky lg:top-28">
        <p className="text-eyebrow text-ink-muted">Order summary</p>
        <ul>
          {lines.map((l) => (
            <LineItem key={l.id} line={l} editable={false} />
          ))}
        </ul>
        <Row label="Subtotal" value={formatMoney(n(cart.item_subtotal ?? cart.subtotal), currency)} />
        <Row label="Shipping" value={cart.shipping_methods?.length ? formatMoney(n(cart.shipping_subtotal ?? cart.shipping_total), currency) : "Choose at step 2"} />
        <Row label="Tax" value={formatMoney(n(cart.tax_total), currency)} />
        <div className="border-t border-line pt-3">
          <Row label="Total" value={formatMoney(n(cart.total), currency)} strong />
        </div>
        <p className="text-[12px] text-ink-muted">{POLICY.returns}. {POLICY.dispatch}.</p>
      </aside>
    </div>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-[16px] font-semibold" : "text-[14px]"}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
