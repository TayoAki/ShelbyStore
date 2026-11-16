import { CheckCircle } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { LineItem } from "@/components/line-item"
import { ButtonLink } from "@/components/ui/button"
import { getRegion, listCatalog } from "@/lib/data/catalog"
import { formatMoney } from "@/lib/format"
import { sdk } from "@/lib/medusa"
import { imageUrl, variantThumbs } from "@/lib/product"
import { editionOf } from "@/lib/rope"

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } }

/** Order confirmation (SITE_SPEC v8 E.6.5): a centred 680px column; never shows a specific edition number. */
export default function OrderPage(props: PageProps<"/order/[id]">) {
  return (
    <div className="wrap mx-auto max-w-[780px] py-12 md:py-16">
      <Suspense fallback={<div className="h-60 bg-tile" aria-busy />}>
        <OrderContent params={props.params} />
      </Suspense>
    </div>
  )
}

async function OrderContent({ params }: { params: PageProps<"/order/[id]">["params"] }) {
  const { id } = await params
  const order = await sdk.store.order
    .retrieve(id, { fields: "id,display_id,email,total,subtotal,item_subtotal,shipping_total,tax_total,currency_code,*items,*shipping_address" })
    .then((r) => r.order)
    .catch(() => null)
  if (!order) notFound()
  const region = await getRegion()
  const catalog = region ? await listCatalog(region.id) : []
  const thumbs = variantThumbs(catalog)
  const numbered = (order.items ?? []).some((i) => editionOf(catalog.find((p) => p.id === i.product_id))?.numberedInside)
  const a = order.shipping_address
  const n = (v: unknown) => Number(v ?? 0)
  return (
    <div className="mx-auto flex max-w-[680px] flex-col items-center gap-4 text-center">
      <CheckCircle size={40} weight="regular" className="text-green" aria-hidden />
      <h1 className="title-page">Thank you{a?.first_name ? `, ${a.first_name}` : ""}</h1>
      <p className="text-[14.4px]">
        Order <span className="tabular font-medium">#{order.display_id}</span> is confirmed. We&apos;ve emailed a receipt to {order.email}, and tracking follows when it ships.
      </p>
      <ul className="mt-4 w-full border-t border-border text-left">
        {(order.items ?? []).map((i) => (
          <LineItem
            key={i.id}
            editable={false}
            size="page"
            line={{
              id: i.id,
              title: i.product_title ?? i.title,
              variant: i.variant_title ?? null,
              handle: i.product_handle ?? null,
              thumbnail: (i.variant_id && thumbs[i.variant_id]) || imageUrl(i.thumbnail),
              quantity: i.quantity,
              unitPrice: Number(i.unit_price ?? 0),
              currency: order.currency_code,
            }}
          />
        ))}
      </ul>
      <table className="spec-table w-full text-left">
        <tbody>
          <tr>
            <th scope="row" className="font-normal">Subtotal</th>
            <td className="tabular text-right">{formatMoney(n(order.item_subtotal ?? order.subtotal), order.currency_code)}</td>
          </tr>
          <tr>
            <th scope="row" className="font-normal">Shipping</th>
            <td className="tabular text-right">{formatMoney(n(order.shipping_total), order.currency_code)}</td>
          </tr>
          <tr>
            <th scope="row" className="font-normal">Tax</th>
            <td className="tabular text-right">{formatMoney(n(order.tax_total), order.currency_code)}</td>
          </tr>
          <tr>
            <th scope="row" className="font-medium">Total</th>
            <td className="tabular text-right text-[18px] font-medium">{formatMoney(n(order.total), order.currency_code)}</td>
          </tr>
        </tbody>
      </table>
      {a && (
        <p className="meta">
          Shipping to {a.first_name} {a.last_name}, {a.address_1}
          {a.address_2 ? `, ${a.address_2}` : ""}, {a.city} {a.province} {a.postal_code}
        </p>
      )}
      {numbered && <p className="meta">Your cap&apos;s number is printed inside.</p>}
      <ButtonLink href="/" variant="outline" className="mt-2" track="checkout_complete">
        Keep Shopping
      </ButtonLink>
    </div>
  )
}
