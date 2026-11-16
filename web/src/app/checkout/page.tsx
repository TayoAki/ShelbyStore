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

/** Checkout in the Allbirds style (v5 §6.8, G.6.8): three white step cards left, the summary right (first on mobile). */
export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-2.5 pb-16">
      <h1 className="mb-6 px-2.5 font-display text-2xl leading-8 md:text-[30px] md:leading-9">Checkout</h1>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-white" />}>
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
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-white py-12 text-center">
        <p className="text-xl leading-7">Your bag is empty.</p>
        <ButtonLink href="/products/rope-cap">SHOP THE ROPE CAP</ButtonLink>
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
      <div className="mt-4 flex flex-col gap-2 border-t border-natural-white pt-4 text-sm leading-5">
        <Row label="Subtotal" value={formatMoney(n(cart.item_subtotal ?? cart.subtotal), currency)} />
        <Row label="Shipping" value={cart.shipping_methods?.length ? formatMoney(n(cart.shipping_subtotal ?? cart.shipping_total), currency) : "Choose at step 2"} />
        <Row label="Tax" value={formatMoney(n(cart.tax_total), currency)} />
      </div>
      <div className="mt-4 flex justify-between border-t border-natural-white pt-4 text-sm leading-5 font-medium">
        <span>Total</span>
        <span>{formatMoney(n(cart.total), currency)}</span>
      </div>
    </>
  )

  return (
    <div className="grid gap-2.5 md:grid-cols-[1fr_400px]">
      {/* Mobile: the summary comes first, collapsed. */}
      <details className="rounded-2xl bg-white md:hidden">
        <summary className="flex h-12 cursor-pointer items-center justify-between px-5 text-xs leading-4 font-medium tracking-[.05em] uppercase">
          Show order summary <span>{formatMoney(n(cart.total), currency)}</span>
        </summary>
        <div className="p-4">{summary}</div>
      </details>
      <CheckoutForm cartId={cart.id} total={n(cart.total)} currency={currency} address={address} options={options} selectedOption={selected} />
      <aside className="hidden h-fit rounded-2xl bg-white p-6 md:sticky md:top-[120px] md:block">{summary}</aside>
    </div>
  )
}

function SummaryLine({ line }: { line: Line }) {
  return (
    <li className="flex items-center gap-3">
      <span className="relative size-16 shrink-0 rounded-[20px] bg-natural-white-25">
        {line.thumbnail && <Image src={line.thumbnail} alt="" fill sizes="64px" className="rounded-[20px] object-contain" />}
        <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
          {line.quantity}
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs leading-4 font-medium tracking-[.05em] uppercase">{line.title}</span>
        {line.variant && <span className="text-xs leading-4 text-light-charcoal">{line.variant}</span>}
      </span>
      <span className="text-xs leading-4 font-medium">{formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
    </li>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

/** Colour-correct bag thumbnails from the cached catalog. */
async function lineThumbs() {
  const region = await getRegion()
  return region ? variantThumbs(await listCatalog(region.id)) : {}
}
