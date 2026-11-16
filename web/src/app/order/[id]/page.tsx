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

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } }

/** Order confirmation (SITE_SPEC §6.8). */
export default function OrderPage(props: PageProps<"/order/[id]">) {
  return (
    <div className="container-article py-[50.512px]">
      <Suspense fallback={<div className="h-60 animate-pulse bg-tile" />}>
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
  const thumbs = region ? variantThumbs(await listCatalog(region.id)) : {}
  const a = order.shipping_address
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <CheckCircle size={48} weight="fill" className="text-instock" aria-hidden />
      <h1 className="font-heading text-[26px] uppercase leading-[39px]">Thank You</h1>
      <p className="font-body text-[15px]">
        Order #{order.display_id} is confirmed. We&apos;ll email tracking to {order.email} when it ships.
      </p>
      <ul className="w-full bg-tile text-left">
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
      <div className="flex w-full justify-between font-heading text-[18px]">
        <span>Total</span>
        <span>{formatMoney(Number(order.total ?? 0), order.currency_code)}</span>
      </div>
      {a && (
        <p className="w-full text-left font-body text-[13px] text-muted">
          Shipping to {a.first_name} {a.last_name}, {a.address_1}
          {a.address_2 ? `, ${a.address_2}` : ""}, {a.city} {a.province} {a.postal_code}
        </p>
      )}
      <ButtonLink href="/" variant="light">
        Keep shopping
      </ButtonLink>
    </div>
  )
}
