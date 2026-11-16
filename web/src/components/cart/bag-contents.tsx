import { Bag, CheckCircle } from "@phosphor-icons/react/dist/ssr"
import { cartLines } from "@/lib/cart-view"
import { retrieveCart } from "@/lib/data/cart"
import { getRegion, listCatalog, listOffers, listProducts, liveReleaseIndex } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { colorThumbs, imagesFor, imageUrl, isOneSize, offerOf, price, shapeOf, variantOptions, variantThumbs } from "@/lib/product"
import type { Cart, Product } from "@/lib/types"
import { LineItem } from "../line-item"
import { OfferRow } from "../offer/offer-row"
import { ButtonLink } from "../ui/button"
import { Suggestions, type Suggestion } from "./suggestions"

/** "Standard Shipping $6 · 30-Day Returns" (Melin's drawer slot for its free-shipping bar). */
export const DRAWER_POLICY = "Standard Shipping $6 · 30-Day Returns"

/**
 * The bag's lines, "Complete Your Look" and summary (SITE_SPEC §6.7). The same
 * server pieces fill the slider cart (`drawer`) and the /cart page (`page`).
 * Reads the cart cookie: render inside <Suspense>.
 */
export async function BagContents({ mode }: { mode: "drawer" | "page" }) {
  const cart = await retrieveCart()
  const region = await getRegion()
  const [catalog, products, offers, releases] = region
    ? await Promise.all([listCatalog(region.id), listProducts(region.id), listOffers(region.id), liveReleaseIndex()])
    : [[], [], [], {}]
  const limited = new Set(Object.keys(releases))
  const lines = cart
    ? cartLines(cart, variantThumbs(catalog)).map((l) => ({ ...l, badge: l.productId && limited.has(l.productId) ? "Limited" : null }))
    : []

  if (!cart || !lines.length) {
    return (
      <div className={`flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center ${mode === "page" ? "bg-white" : ""}`}>
        <Bag size={48} aria-hidden />
        <p className="font-heading text-[16px] leading-6">Your Bag Is Empty</p>
        <ButtonLink href="/products/everyday-cap" track="cart_empty_shop">
          Shop the Everyday Cap
        </ButtonLink>
      </div>
    )
  }

  const body = (
    <>
      <ul>
        {lines.map((l) => (
          <LineItem key={l.id} line={l} />
        ))}
      </ul>
      <CompleteYourLook cart={cart} products={products} offers={offers} />
    </>
  )
  const summary = <Summary cart={cart} />

  if (mode === "drawer") {
    return (
      <>
        <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
        <div className="shrink-0 border-t border-line bg-white p-4">{summary}</div>
      </>
    )
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_370px] lg:gap-[68px]">
      <div className="bg-tile">{body}</div>
      <div className="h-fit border border-line bg-white p-4">{summary}</div>
    </div>
  )
}

function Summary({ cart }: { cart: Cart }) {
  const subtotal = Number(cart.item_subtotal ?? cart.subtotal ?? 0)
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-body text-[14px]">
          <CheckCircle size={16} weight="fill" className="text-instock" aria-hidden />
          30-Day Returns
        </span>
        <span className="font-heading text-[12px] text-instock">INCLUDED</span>
      </div>
      <div className="mt-3 flex items-center justify-between font-heading text-[18px]">
        <span>Summary</span>
        <span>{formatMoney(subtotal, cart.currency_code)}</span>
      </div>
      <ButtonLink href="/checkout" variant="primary" size="checkout" block className="mt-3" track="cart_checkout">
        Checkout
      </ButtonLink>
      <p className="mt-[10px] text-center font-heading text-[10px] uppercase leading-[15px] tracking-[1px]">
        Standard shipping $6 - 30-day returns - secure checkout
      </p>
    </div>
  )
}

/**
 * The two-pack row when its single is in the bag, then up to three hats not in
 * the bag, other shapes first. One-size hats add in one tap.
 */
async function CompleteYourLook({ cart, products, offers }: { cart: Cart; products: Product[]; offers: Product[] }) {
  const inBag = new Set((cart.items ?? []).map((i) => i.product_id))
  const offer =
    offers.find((o) => {
      const single = products.find((p) => p.handle === offerOf(o)?.singleHandle)
      return single && inBag.has(single.id) && !inBag.has(o.id)
    }) ?? null
  const single = offer ? products.find((p) => p.handle === offerOf(offer)?.singleHandle) : null
  const offerPrice = offer ? price(offer).amount : null
  const singlePrice = single ? price(single).amount : null
  const saving = offerPrice !== null && singlePrice !== null ? singlePrice * 2 - offerPrice : null

  const bagShapes = new Set(products.filter((p) => inBag.has(p.id)).map((p) => shapeOf(p)?.handle))
  const candidates = products
    .filter((p) => !inBag.has(p.id))
    .sort((a, b) => Number(bagShapes.has(shapeOf(a)?.handle)) - Number(bagShapes.has(shapeOf(b)?.handle)))
    .slice(0, 3)
  const stock = await getStock(candidates.map((p) => p.id))
  const items: Suggestion[] = candidates.map((p) => suggestion(p, stock))
  if (!items.length && !offer) return null

  return (
    <section className="flex flex-col gap-4 px-4 py-6">
      <h3 className="font-subheading text-[16px] leading-6">Complete Your Look</h3>
      {offer && single && offerPrice !== null && (
        <OfferRow
          href={offerOf(offer)!.path}
          title={offer.title.replace(/^The Everyday Cap /, "The ")}
          subtitle="Any two colors"
          price={offerPrice}
          saving={saving}
          currency={cart.currency_code}
          image={imagesFor(single, colorThumbs(single)[0]?.color)[0] ?? null}
          track="cart_offer"
        />
      )}
      <Suggestions items={items} />
    </section>
  )
}

function suggestion(product: Product, stock: Record<string, number | null>): Suggestion {
  const colors = colorThumbs(product).map((c) => c.color)
  const p = price(product)
  const variant = isOneSize(product)
    ? [...(product.variants ?? [])]
        .sort((a, b) => colors.indexOf(variantOptions(a).Color ?? "") - colors.indexOf(variantOptions(b).Color ?? ""))
        .find((v) => stock[v.id] === null || (stock[v.id] ?? 0) > 0)
    : undefined
  const color = variant ? (variantOptions(variant).Color ?? null) : (colors[0] ?? null)
  return {
    productId: product.id,
    handle: product.handle,
    title: product.title,
    color,
    shape: shapeOf(product)?.name ?? null,
    image: imagesFor(product, color)[0] ?? imageUrl(product.thumbnail),
    price: p.amount,
    currency: p.currency,
    variantId: variant?.id ?? null,
  }
}

