import type { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"
import { CheckoutForm } from "@/components/checkout-form"
import { ButtonLink } from "@/components/ui/button"
import { listShippingOptions } from "@/lib/actions/checkout"
import { cartLines } from "@/lib/cart-view"
import { retrieveCart } from "@/lib/data/cart"
import { getRegion, listCatalog } from "@/lib/data/catalog"
import { formatMoney } from "@/lib/format"
import { variantThumbs } from "@/lib/product"
import type { Line } from "@/components/line-item"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

/** Checkout (Operate): three numbered steps printed on one panel, the summary panel right (first on mobile, collapsed). */
export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-3 pt-6 md:px-6 md:pt-10">
      <h1 className="model mb-6">Checkout</h1>
      <Suspense fallback={<div className="panel h-80" />}>
        <CheckoutContent />
      </Suspense>
    </div>
  )
}

async function CheckoutContent() {
  const cart = await retrieveCart()
  const lines = cart ? cartLines(cart, await lineThumbs()) : []
  if (!cart || !lines.length) {
    return (
      <div className="panel flex flex-col items-start gap-5 p-[var(--panel-pad)]">
        <p className="panel-title">Your bag is empty.</p>
        <ButtonLink href="/products/rope-cap">Shop the Rope Cap</ButtonLink>
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
  const summary = (
    <>
      <ul className="flex flex-col gap-4">
        {lines.map((l) => (
          <SummaryLine key={l.id} line={l} />
        ))}
      </ul>
      <div className="mt-4 flex flex-col gap-2 border-t-2 border-dashed border-ink/40 pt-4 text-[1rem] leading-6">
        <Row label="Subtotal" value={formatMoney(n(cart.item_subtotal ?? cart.subtotal), currency)} />
        <Row label="Shipping" value={cart.shipping_methods?.length ? formatMoney(n(cart.shipping_subtotal ?? cart.shipping_total), currency) : "Choose at step 2"} />
        <Row label="Tax" value={formatMoney(n(cart.tax_total), currency)} />
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t-2 border-ink pt-4">
        <span className="label">Total</span>
        <span className="font-model text-[2rem] leading-none font-[800] tabular-nums">{formatMoney(n(cart.total), currency)}</span>
      </div>
    </>
  )

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_400px] md:gap-6">
      {/* Mobile: the summary comes first, collapsed. */}
      <details className="panel md:hidden">
        <summary className="label flex min-h-12 cursor-pointer items-center justify-between px-5">
          Show order summary <span>{formatMoney(n(cart.total), currency)}</span>
        </summary>
        <div className="border-t-2 border-ink p-5">{summary}</div>
      </details>
      <CheckoutForm cartId={cart.id} total={n(cart.total)} currency={currency} address={address} options={options} selectedOption={selected} />
      <aside className="panel hidden h-fit p-6 md:sticky md:top-[96px] md:block">
        <h2 className="label mb-4">Order summary</h2>
        {summary}
      </aside>
    </div>
  )
}

function SummaryLine({ line }: { line: Line }) {
  return (
    <li className="flex items-center gap-3">
      <span className="relative size-16 shrink-0 rounded-[4px] border-2 border-ink bg-paper">
        {line.thumbnail && <Image src={line.thumbnail} alt="" fill sizes="64px" className="object-contain p-1" />}
        <span className="absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-[3px] border-2 border-ink bg-paper px-1 text-[0.8125rem] font-bold">
          {line.quantity}
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="label">{line.title}</span>
        {line.variant && <span className="text-[0.9375rem] leading-5 text-ink-2">{line.variant}</span>}
      </span>
      <span className="text-[1rem] leading-5 font-semibold tabular-nums">{formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
    </li>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-2">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

/** Colour-correct bag thumbnails from the cached catalog. */
async function lineThumbs() {
  const region = await getRegion()
  return region ? variantThumbs(await listCatalog(region.id)) : {}
}
