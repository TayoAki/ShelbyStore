import { CaretDown } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { CheckoutForm } from "@/components/checkout-form"
import type { Line } from "@/components/line-item"
import { ButtonLink } from "@/components/ui/button"
import { listShippingOptions } from "@/lib/actions/checkout"
import { cartLines } from "@/lib/cart-view"
import { retrieveCart } from "@/lib/data/cart"
import { getRegion, listCatalog } from "@/lib/data/catalog"
import { formatMoney } from "@/lib/format"
import { variantThumbs } from "@/lib/product"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

/**
 * Checkout (SITE_SPEC v8 E.6.5): Shelby's own Stripe checkout in Eastside's
 * tokens. The "Bag • Details • Payment" crumbs, the form at 58% and the
 * summary at 42% on #F6F6F6 (a collapsible bar first on mobile).
 */
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="wrap h-80 pt-6" aria-busy />}>
      <CheckoutContent />
    </Suspense>
  )
}

async function CheckoutContent() {
  const cart = await retrieveCart()
  const lines = cart ? cartLines(cart, await lineThumbs()) : []
  if (!cart || !lines.length) {
    return (
      <div className="wrap flex flex-col items-center gap-5 py-20 text-center">
        <h1 className="title-page">Checkout</h1>
        <p className="text-[14.4px]">Your bag is empty.</p>
        <ButtonLink href="/products/rope-cap" variant="secondary">
          Shop the Rope Cap
        </ButtonLink>
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
  const step = address ? "Payment" : "Details"
  const summary = (
    <>
      <ul className="flex flex-col gap-4">
        {lines.map((l) => (
          <SummaryLine key={l.id} line={l} />
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-[14.4px]">
        <Row label="Subtotal" value={formatMoney(n(cart.item_subtotal ?? cart.subtotal), currency)} />
        <Row label="Shipping" value={cart.shipping_methods?.length ? formatMoney(n(cart.shipping_subtotal ?? cart.shipping_total), currency) : "Calculated at the next step"} />
        <Row label="Tax" value={formatMoney(n(cart.tax_total), currency)} />
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-[16px] font-medium">Total</span>
        <span className="tabular text-[21.6px] font-medium">{formatMoney(n(cart.total), currency)}</span>
      </div>
    </>
  )

  return (
    <div className="md:grid md:min-h-[calc(100dvh-106px)] md:grid-cols-[58fr_42fr]">
      {/* Mobile: the summary comes first, collapsed. */}
      <details className="group band-tile md:hidden">
        <summary className="wrap flex min-h-12 cursor-pointer list-none items-center justify-between text-[14.4px] [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-1">
            Show order summary <CaretDown size={14} aria-hidden className="transition-transform group-open:rotate-180" />
          </span>
          <span className="tabular font-medium">{formatMoney(n(cart.total), currency)}</span>
        </summary>
        <div className="wrap pb-6">{summary}</div>
      </details>
      <div className="wrap py-6 md:py-10 md:pr-12">
        <nav aria-label="Checkout steps" className="flex items-center gap-2 text-[12.6px] text-text-light">
          <Link href="/cart">Bag</Link>
          <span aria-hidden>•</span>
          <span className={step === "Details" ? "text-text" : ""} aria-current={step === "Details" ? "step" : undefined}>
            Details
          </span>
          <span aria-hidden>•</span>
          <span className={step === "Payment" ? "text-text" : ""} aria-current={step === "Payment" ? "step" : undefined}>
            Payment
          </span>
        </nav>
        <h1 className="title-page mt-4 mb-6">Checkout</h1>
        <CheckoutForm cartId={cart.id} total={n(cart.total)} currency={currency} address={address} options={options} selectedOption={selected} />
      </div>
      <aside className="band-tile hidden md:block">
        <div className="sticky top-[70px] p-8">
          <h2 className="sr-only">Order summary</h2>
          {summary}
        </div>
      </aside>
    </div>
  )
}

function SummaryLine({ line }: { line: Line }) {
  return (
    <li className="flex items-center gap-3">
      <span className="relative h-[77px] w-16 shrink-0 bg-white">
        {line.thumbnail && <Image src={line.thumbnail} alt="" fill sizes="64px" className="tile-photo object-contain" />}
        <span className="tabular absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-text-light px-1 text-[11px] font-bold text-white">{line.quantity}</span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14.4px] font-medium">{line.title}</span>
        {line.variant && <span className="meta">{line.variant}</span>}
      </span>
      <span className="tabular text-[14.4px]">{formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
    </li>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="tabular text-right">{value}</span>
    </div>
  )
}

/** Colour-correct bag thumbnails from the cached catalog. */
async function lineThumbs() {
  const region = await getRegion()
  return region ? variantThumbs(await listCatalog(region.id)) : {}
}
