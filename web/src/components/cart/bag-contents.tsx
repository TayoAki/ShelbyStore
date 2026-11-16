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
import { FreeShipping } from "./free-shipping"
import { Suggestions, type Suggestion } from "./suggestions"

/** The drawer header's policy line (G.6.8). */
export const DRAWER_POLICY = POLICY.announcement

/**
 * The bag (v5 §6.7, G.6.8): free-shipping progress, lines, the bundle rows when
 * a single core Rope Cap is in the bag, other core colourways to add, and the
 * summary. The same pieces fill the drawer and /cart. Reads the cart cookie:
 * render inside <Suspense>.
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

  if (!cart || !lines.length) {
    return (
      <div className={`flex flex-1 flex-col justify-center py-16 ${mode === "page" ? "rounded-2xl bg-white" : ""}`}>
        <p className="mb-10 px-5 text-center text-xl leading-7">Your bag is empty.</p>
        <ul className="flex flex-col items-center gap-y-5 px-10">
          <li className="w-full">
            <ButtonLink href="/products/rope-cap" block track="cart_empty_shop">
              SHOP THE ROPE CAP
            </ButtonLink>
          </li>
          <li className="w-full">
            <ButtonLink href="/offer/the-pair" block>
              SHOP THE PAIR
            </ButtonLink>
          </li>
        </ul>
      </div>
    )
  }

  const subtotal = Number(cart.item_subtotal ?? cart.subtotal ?? 0)
  const body = (
    <>
      <FreeShipping subtotal={subtotal} currency={cart.currency_code} />
      <ul>
        {lines.map((l) => (
          <LineItem key={l.id} line={l} />
        ))}
      </ul>
      <Extras cart={cart} />
    </>
  )
  const summary = <Summary cart={cart} subtotal={subtotal} />

  if (mode === "drawer") {
    return (
      <>
        <div className="min-h-0 flex-1 overflow-y-auto pb-6">{body}</div>
        <div className="shrink-0 border-t border-natural-white-60 bg-white p-5">{summary}</div>
      </>
    )
  }
  return (
    <div className="gap-2.5 md:grid md:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-2xl bg-white pb-6">{body}</div>
      <div className="mt-2.5 h-fit rounded-2xl bg-white p-5 md:mt-0">{summary}</div>
    </div>
  )
}

function Summary({ cart, subtotal }: { cart: Cart; subtotal: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm leading-5 font-medium">
        <span>Subtotal</span>
        <span>{formatMoney(subtotal, cart.currency_code)}</span>
      </div>
      <p className="text-xs leading-4 text-light-charcoal">Shipping is chosen at checkout: free on $85+, otherwise standard $6 · express $15.</p>
      <ButtonLink href="/checkout" size="atc" className="mt-2" track="cart_checkout">
        CHECKOUT
      </ButtonLink>
      <p className="text-center text-xs leading-4">Guest checkout. No account needed.</p>
    </div>
  )
}

/** Bundle rows when a single core cap is in the bag, then the core colours not in the bag. */
async function Extras({ cart }: { cart: Cart }) {
  const c = await ropeCatalog()
  if (!c.core) return null
  const { stock } = await liveStock(c)
  const inBag = new Set((cart.items ?? []).map((i) => i.variant_id))
  const hasSingle = (cart.items ?? []).some((i) => i.product_id === c.core!.id)
  const items: Suggestion[] = CORE_COLORS.flatMap((color) => {
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
  return (
    <>
      {hasSingle && (
        <div className="mx-5 mt-4">
          <BundleRows pair={c.pair} foursome={c.foursome} trackPair="cart_offer" trackFoursome="cart_offer" />
        </div>
      )}
      <Suggestions items={items} />
    </>
  )
}
