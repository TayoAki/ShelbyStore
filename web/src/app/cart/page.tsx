import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { LineItem } from "@/components/line-item"
import { QuickAdd } from "@/components/quick-add"
import { ButtonLink } from "@/components/ui/button"
import { cartLines } from "@/lib/cart-view"
import { retrieveCart } from "@/lib/data/cart"
import { getRegion, listProducts } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { colorThumbs, imagesFor, imageUrl, isOneSize, price, shapeOf, variantOptions, variantThumbs } from "@/lib/product"
import type { Cart, Product } from "@/lib/types"

export const metadata: Metadata = { title: "Bag" }

export default function CartPage() {
  return (
    <Container className="py-8 lg:py-12">
      <h1 className="font-display text-section">Bag</h1>
      <Suspense fallback={<div className="mt-8 h-40 animate-pulse bg-surface" />}>
        <CartContent />
      </Suspense>
    </Container>
  )
}

async function CartContent() {
  const cart = await retrieveCart()
  const lines = cart ? cartLines(cart, await lineThumbs()) : []
  if (!cart || !lines.length) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <p className="text-[17px]">Your bag is empty.</p>
        <ButtonLink href="/products/everyday-cap">Shop the Everyday Cap</ButtonLink>
      </div>
    )
  }
  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
      <div className="flex flex-col gap-10">
        <ul className="border-t border-line">
          {lines.map((l) => (
            <LineItem key={l.id} line={l} />
          ))}
        </ul>
        <CompleteTheLook cart={cart} />
      </div>
      <aside className="flex h-fit flex-col gap-4 bg-paper p-5 lg:sticky lg:top-28">
        <div className="flex justify-between text-[15px]">
          <span>Subtotal</span>
          <span className="font-mono">{formatMoney(Number(cart.item_subtotal ?? cart.subtotal ?? 0), cart.currency_code)}</span>
        </div>
        <p className="text-[13px] text-ink-muted">
          Shipping is chosen at checkout: {POLICY.shipping.toLowerCase()}. {POLICY.returns}.
        </p>
        <ButtonLink href="/checkout" block track="cart_checkout">
          Checkout
        </ButtonLink>
        <p className="text-center text-[12px] text-ink-muted">Guest checkout. No account needed.</p>
      </aside>
    </div>
  )
}

/**
 * A second hat for the bag (SITE_SPEC §6.7): up to two hats not already in
 * it, other shapes first. One-size hats add in one tap; sized hats link to
 * their page to choose a size.
 */
async function CompleteTheLook({ cart }: { cart: Cart }) {
  const region = await getRegion()
  if (!region) return null
  const products = await listProducts(region.id)
  const inBag = new Set((cart.items ?? []).map((i) => i.product_id))
  const bagShapes = new Set(products.filter((p) => inBag.has(p.id)).map((p) => shapeOf(p)?.handle))
  const candidates = products
    .filter((p) => !inBag.has(p.id))
    .sort((a, b) => Number(bagShapes.has(shapeOf(a)?.handle)) - Number(bagShapes.has(shapeOf(b)?.handle)))
    .slice(0, 2)
  if (!candidates.length) return null
  const stock = await getStock(candidates.map((p) => p.id))

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-[26px] leading-none lg:text-[32px]">Complete the look</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {candidates.map((p) => (
          <Suggestion key={p.id} product={p} stock={stock} />
        ))}
      </ul>
    </section>
  )
}

function Suggestion({ product, stock }: { product: Product; stock: Record<string, number | null> }) {
  const colors = colorThumbs(product).map((c) => c.color)
  const image = imagesFor(product, colors[0])[0] ?? imageUrl(product.thumbnail)
  const p = price(product)
  // First in-stock variant, in colour order, for the one-tap add.
  const variant = isOneSize(product)
    ? [...(product.variants ?? [])]
        .sort((a, b) => colors.indexOf(variantOptions(a).Color ?? "") - colors.indexOf(variantOptions(b).Color ?? ""))
        .find((v) => stock[v.id] === null || (stock[v.id] ?? 0) > 0)
    : undefined
  const colour = variant ? variantOptions(variant).Color : null
  return (
    <li className="grid grid-cols-[72px_1fr] gap-3 bg-paper p-3">
      <Link href={`/products/${product.handle}`} className="relative aspect-[4/5] overflow-hidden bg-page">
        {image && <Image src={image} alt={product.title} fill sizes="72px" className="object-cover" />}
      </Link>
      <div className="flex flex-col justify-between gap-2">
        <div>
          <Link href={`/products/${product.handle}`} className="text-[14px] font-medium hover:underline">
            {product.title}
          </Link>
          <p className="text-[12px] text-ink-muted">{colour ?? (isOneSize(product) ? "One size" : "S/M · L/XL")}</p>
        </div>
        {variant ? (
          <QuickAdd productId={product.id} variantId={variant.id} label={`Add · ${formatMoney(p.amount, p.currency)}`} price={p.amount} currency={p.currency} />
        ) : (
          <ButtonLink href={`/products/${product.handle}`} size="sm" variant="secondary" track="cart_complete_look">
            Choose size
          </ButtonLink>
        )}
      </div>
    </li>
  )
}

/** Colour-correct bag thumbnails from the cached catalog. */
async function lineThumbs() {
  const region = await getRegion()
  return region ? variantThumbs(await listProducts(region.id)) : {}
}
