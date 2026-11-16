import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { LineItem } from "@/components/line-item"
import { ButtonLink } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import { getRegion, listCatalog } from "@/lib/data/catalog"
import { imageUrl, variantThumbs } from "@/lib/product"
import { sdk } from "@/lib/medusa"

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } }

export default function OrderPage(props: PageProps<"/order/[id]">) {
  return (
    <Container className="py-12 lg:py-16">
      <Suspense fallback={<div className="h-60 animate-pulse bg-surface" />}>
        <OrderContent params={props.params} />
      </Suspense>
    </Container>
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
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-eyebrow text-ok">● Order #{order.display_id} confirmed</p>
        <h1 className="font-display text-section">Thanks. Your order is in.</h1>
        <p className="text-[15px] text-ink-muted">A confirmation goes to {order.email}.</p>
      </div>
      <ul className="border-t border-line">
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
      <div className="flex justify-between text-[16px] font-semibold">
        <span>Total</span>
        <span className="font-mono">{formatMoney(Number(order.total ?? 0), order.currency_code)}</span>
      </div>
      {a && (
        <div className="text-[14px] text-ink-muted">
          <p className="text-eyebrow mb-1">Shipping to</p>
          <p>
            {a.first_name} {a.last_name}, {a.address_1}
            {a.address_2 ? `, ${a.address_2}` : ""}, {a.city} {a.province} {a.postal_code}
          </p>
        </div>
      )}
      <ButtonLink href="/">Keep shopping</ButtonLink>
    </div>
  )
}
