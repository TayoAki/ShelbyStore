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

/** Order confirmation (Operate): one panel; never shows a specific edition number. */
export default function OrderPage(props: PageProps<"/order/[id]">) {
  return (
    <div className="mx-auto max-w-[860px] px-3 pt-6 md:px-6 md:pt-10">
      <Suspense fallback={<div className="panel h-60" />}>
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
    <div className="panel flex flex-col gap-6 p-[var(--panel-pad)]">
      <h1 className="model">Thanks{a?.first_name ? `, ${a.first_name}` : ""}.</h1>
      <p className="text-[1.125rem] leading-[1.6]">
        Order <span className="font-semibold tabular-nums">#{order.display_id}</span> is confirmed. We&apos;ll email tracking to {order.email} when it ships.
      </p>
      <ul className="border-t-2 border-ink">
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
      <div className="flex w-full items-baseline justify-between border-t-2 border-ink pt-4">
        <span className="label">Total</span>
        <span className="font-model text-[2rem] leading-none font-[800] tabular-nums">{formatMoney(Number(order.total ?? 0), order.currency_code)}</span>
      </div>
      {a && (
        <p className="text-[1rem] leading-6 text-ink-2">
          Shipping to {a.first_name} {a.last_name}, {a.address_1}
          {a.address_2 ? `, ${a.address_2}` : ""}, {a.city} {a.province} {a.postal_code}
        </p>
      )}
      {numbered && <p className="text-[1rem] leading-6 text-ink-2">Your edition number is printed inside the cap.</p>}
      <ButtonLink href="/" className="w-fit" track="checkout_complete">
        Keep shopping
      </ButtonLink>
    </div>
  )
}
