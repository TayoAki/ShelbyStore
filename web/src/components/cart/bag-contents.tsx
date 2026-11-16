import Image from "next/image"
import Link from "next/link"
import { cartLines } from "@/lib/cart-view"
import { retrieveCart } from "@/lib/data/cart"
import { liveStock, ropeCatalog } from "@/lib/data/rope"
import { getRegion, listCatalog } from "@/lib/data/catalog"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { findVariant, imagesFor, price, variantThumbs } from "@/lib/product"
import { CORE_COLORS, editionOf } from "@/lib/rope"
import type { Cart } from "@/lib/types"
import { BundleRows } from "../bundle-rows"
import { LineItem } from "../line-item"
import { ButtonLink } from "../ui/button"
import { CartHead } from "./cart-drawer"
import { FreeShipping } from "./free-shipping"
import { Suggestions, type Suggestion } from "./suggestions"

/** The flyout's policy line (G.6.8). */
export const DRAWER_POLICY = POLICY.announcement

/**
 * The bag (SITE_SPEC v8 E.6.4). In the flyout: Eastside's "Complete the look"
 * column on the left (desktop), and the bag on the right: head, free-shipping
 * progress, lines, the Pair and Foursome rows when a single core cap is in the
 * bag, and a pinned foot. On /cart: lines at 66%, a #F6F6F6 summary at 34%,
 * then the suggestions as a rail. Reads the cart cookie: render inside <Suspense>.
 */
export async function BagContents({ mode }: { mode: "drawer" | "page" }) {
  const cart = await retrieveCart()
  const region = await getRegion()
  const catalog = region ? await listCatalog(region.id) : []
  const holeOf = new Map(catalog.map((p) => [p.id, editionOf(p)?.hole ?? null]))
  const lines = cart
    ? cartLines(cart, variantThumbs(catalog)).map((l) => {
        const hole = l.productId ? holeOf.get(l.productId) : null
        return { ...l, badge: hole && hole > 1 ? `HOLE ${hole}` : null }
      })
    : []
  const count = lines.reduce((n, l) => n + l.quantity, 0)

  if (!cart || !lines.length) {
    const empty = <Empty />
    if (mode === "page") return empty
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <CartHead count={0} />
        <div className="min-h-0 flex-1 overflow-y-auto px-4">{empty}</div>
      </div>
    )
  }

  const subtotal = Number(cart.item_subtotal ?? cart.subtotal ?? 0)
  const { suggestions, bundles } = await extras(cart)

  if (mode === "drawer") {
    return (
      <div className="flex min-h-0 flex-1">
        {suggestions.length > 0 && (
          <aside className="hidden w-[220px] shrink-0 overflow-y-auto border-r border-border p-2.5 md:block">
            <Suggestions items={suggestions} layout="column" />
          </aside>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <CartHead count={count} />
          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <FreeShipping subtotal={subtotal} currency={cart.currency_code} />
            <ul>
              {lines.map((l) => (
                <LineItem key={l.id} line={l} />
              ))}
            </ul>
            {bundles}
            <Suggestions items={suggestions} layout="rail" className="py-6 md:hidden" />
          </div>
          <div className="shrink-0 border-t border-border p-4">
            <Summary cart={cart} subtotal={subtotal} />
            <ButtonLink href="/cart" variant="outline" block className="mt-2">
              View bag
            </ButtonLink>
            <p className="note mt-2 text-center">Taxes calculated at checkout.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,66fr)_minmax(0,34fr)]">
        <div>
          <ul className="border-t border-border">
            {lines.map((l) => (
              <LineItem key={l.id} line={l} size="page" />
            ))}
          </ul>
          {bundles && <div className="mt-6">{bundles}</div>}
        </div>
        <div className="band-tile p-6 md:sticky md:top-[94px]">
          <FreeShipping subtotal={subtotal} currency={cart.currency_code} className="!pt-0" />
          <Summary cart={cart} subtotal={subtotal} estimate />
          <p className="note mt-2 text-center">Taxes calculated at checkout.</p>
          <ul className="meta mt-4 flex flex-col gap-1 border-t border-white pt-4">
            <li>{POLICY.shipping}</li>
            <li>{POLICY.returns}</li>
          </ul>
        </div>
      </div>
      <Suggestions items={suggestions} layout="rail" className="mt-12" />
    </>
  )
}

function Summary({ cart, subtotal, estimate = false }: { cart: Cart; subtotal: number; estimate?: boolean }) {
  const free = subtotal >= POLICY.freeShippingThreshold
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="label">Subtotal</span>
        <span className="tabular text-[21.6px] leading-none font-medium">{formatMoney(subtotal, cart.currency_code)}</span>
      </div>
      {estimate && (
        <div className="flex items-baseline justify-between text-[14.4px]">
          <span>Shipping</span>
          <span className="tabular">{free ? "Free" : "From $6.00"}</span>
        </div>
      )}
      <p className="meta">{DRAWER_POLICY}</p>
      <ButtonLink href="/checkout" variant="black" size="checkout" className="mt-1" track="cart_checkout">
        Checkout
      </ButtonLink>
    </div>
  )
}

/** The empty bag: a line, the charcoal button, and the four colours as mini cards. */
function Empty() {
  const colors = CORE_COLORS.map((c) => ({ c, src: `/hats/rope-cap-${c.toLowerCase().replace(/\s+/g, "-")}-1.jpg` }))
  return (
    <div className="flex flex-col items-center gap-5 py-12 text-center">
      <p className="text-[14.4px]">Your bag is empty.</p>
      <ButtonLink href="/products/rope-cap" variant="secondary" track="cart_empty_shop">
        Shop the Rope Cap
      </ButtonLink>
      <ul className="mt-4 grid w-full max-w-[560px] grid-cols-2 gap-1 text-left sm:grid-cols-4">
        {colors.map(({ c, src }) => (
          <li key={c}>
            <Link href={`/products/rope-cap?color=${encodeURIComponent(c)}`} className="block">
              <span className="tile relative block aspect-[5/6]">
                <Image src={src} alt="" fill sizes="140px" className="tile-photo object-contain" />
              </span>
              <span className="card-title mt-2 block px-1">{c}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The core colours not in the bag, and the kit rows when a single core cap is in the bag. */
async function extras(cart: Cart): Promise<{ suggestions: Suggestion[]; bundles: React.ReactNode }> {
  const c = await ropeCatalog()
  if (!c.core) return { suggestions: [], bundles: null }
  const { stock } = await liveStock(c)
  const inBag = new Set((cart.items ?? []).map((i) => i.variant_id))
  const hasSingle = (cart.items ?? []).some((i) => i.product_id === c.core!.id)
  const suggestions: Suggestion[] = CORE_COLORS.flatMap((color) => {
    const v = findVariant(c.core!, { Color: color })
    if (!v || inBag.has(v.id)) return []
    const n = stock[v.id]
    const available = n === null || (typeof n === "number" && n > 0)
    const p = price(c.core!, v)
    return [
      {
        key: color,
        productId: c.core!.id,
        href: `/products/rope-cap?color=${encodeURIComponent(color)}`,
        title: c.core!.title,
        color,
        image: imagesFor(c.core!, color)[0] ?? null,
        price: p.amount,
        currency: p.currency,
        variantId: available ? v.id : null,
      },
    ]
  })
  const bundles = hasSingle ? <BundleRows pair={c.pair} foursome={c.foursome} trackPair="cart_offer" trackFoursome="cart_offer" /> : null
  return { suggestions, bundles }
}
