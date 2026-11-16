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

/** Order confirmation (v5 §6.8, G.6.9): never shows a specific edition number. */
export default function OrderPage(props: PageProps<"/order/[id]">) {
  return (
    <div className="mx-auto max-w-[760px] px-2.5 pb-16">
      <Suspense fallback={<div className="h-60 animate-pulse rounded-3xl bg-white" />}>
        <OrderContent params={props.params} />
      </Suspense>
    </div>
  )
}

async function OrderContent({ params }: { params: PageProps<"/order/[id]">["params"] }) {
  const { id } = await params
  const order = await sdk.store.order
    .retrieve(id, { fields: "id,display_id,email,total,currency_code,*items,*shipping_address" })
    .then((r) => r.order)
    .catch(() => null)
  if (!order) notFound()
  const region = await getRegion()
  const catalog = region ? await listCatalog(region.id) : []
  const thumbs = variantThumbs(catalog)
  const numbered = (order.items ?? []).some((i) => editionOf(catalog.find((p) => p.id === i.product_id))?.numberedInside)
  const a = order.shipping_address
  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 md:p-10">
      <p className="font-mono text-xs leading-4 tracking-[.1em]">ORDER CONFIRMED</p>
      <h1 className="font-display text-2xl leading-8 md:text-[30px] md:leading-9">Thanks{a?.first_name ? `, ${a.first_name}` : ""}.</h1>
      <p className="text-sm leading-5">
        Order #{order.display_id} is confirmed. We&apos;ll email tracking to {order.email} when it ships.
      </p>
      <ul className="-mx-5 border-t border-natural-white-60">
        {(order.items ?? []).map((i) => (
          <LineItem
            key={i.id}
            editable={false}
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
      <div className="flex w-full justify-between text-sm leading-5 font-medium">
        <span>Total</span>
        <span>{formatMoney(Number(order.total ?? 0), order.currency_code)}</span>
      </div>
      {a && (
        <p className="text-xs leading-4 text-light-charcoal">
          Shipping to {a.first_name} {a.last_name}, {a.address_1}
          {a.address_2 ? `, ${a.address_2}` : ""}, {a.city} {a.province} {a.postal_code}
        </p>
      )}
      {numbered && <p className="text-xs leading-4 text-light-charcoal">Your edition number is printed inside the cap.</p>}
      <ButtonLink href="/" className="w-fit" track="checkout_complete">
        KEEP SHOPPING
      </ButtonLink>
    </div>
  )
}
