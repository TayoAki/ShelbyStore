import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { optionGroups, price, stockState, variantOptions } from "@/lib/product"
import type { Product } from "@/lib/types"
import { Container } from "../container"

/**
 * The storefront stance and its proof (Tuan Le playbook): "Every core size, in
 * stock. We show you the count." Live per-size counts, read at request time.
 */
export function CoreBand({ products }: { products: Product[] }) {
  if (!products.length) return null
  return (
    <section id="core" className="scroll-mt-28 py-12 lg:py-24">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <p className="text-eyebrow text-ink-muted">The core</p>
          <h2 className="font-display text-section">Every size. In stock.</h2>
          <p className="max-w-lg text-[15px] text-ink-muted lg:text-base">
            The tee we never let run out. Here&apos;s today&apos;s count.
          </p>
        </div>
        {products.map((product) => (
          <CoreProduct key={product.id} product={product} />
        ))}
      </Container>
    </section>
  )
}

function CoreProduct({ product }: { product: Product }) {
  const p = price(product)
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      <Link href={`/products/${product.handle}`} className="group flex flex-col gap-3">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          {product.thumbnail && (
            <Image src={product.thumbnail} alt={product.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-medium group-hover:underline">{product.title}</span>
          <span className="font-mono text-[13px]">{formatMoney(p.amount, p.currency)}</span>
        </div>
      </Link>
      <div className="flex flex-col gap-4 lg:pt-2">
        <p className="text-eyebrow text-ink-muted">Today&apos;s count · live</p>
        <Suspense fallback={<CountSkeleton product={product} />}>
          <CoreCount product={product} />
        </Suspense>
        <p className="text-[13px] text-ink-muted">
          Counts are live sellable stock. If a size ever runs low, it says so here first.
        </p>
      </div>
    </div>
  )
}

async function CoreCount({ product }: { product: Product }) {
  const stock = await getStock([product.id])
  const groups = optionGroups(product)
  const size = groups.find((g) => /size/i.test(g.title))
  const color = groups.find((g) => /colou?r/i.test(g.title))
  if (!size) return null
  const rows = color ? color.values : [""]

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] border-collapse font-mono text-[13px]">
        <caption className="sr-only">Units in stock for {product.title} by colour and size</caption>
        <thead>
          <tr>
            <th scope="col" className="text-eyebrow w-24 pb-2 text-left font-medium text-ink-muted">
              {color ? "Colour" : ""}
            </th>
            {size.values.map((s) => (
              <th key={s} scope="col" className="text-eyebrow pb-2 text-left font-medium text-ink-muted">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c || "all"} className="border-t border-line">
              <th scope="row" className="py-3 pr-2 text-left font-sans text-[14px] font-medium">
                {c}
              </th>
              {size.values.map((s) => {
                const variant = (product.variants ?? []).find((v) => {
                  const o = variantOptions(v)
                  return o[size.title] === s && (!color || o[color.title] === c)
                })
                const available = variant ? stock[variant.id] : undefined
                const state = stockState(available)
                return (
                  <td key={s} className="py-3 pr-2">
                    <span
                      className={
                        state === "sold_out" ? "text-ink-faint" : state === "low" ? "text-low" : "text-ink"
                      }
                    >
                      <span
                        aria-hidden
                        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                          state === "sold_out" ? "bg-ink-faint" : state === "low" ? "bg-low" : "bg-ok"
                        }`}
                      />
                      {state === "untracked" ? "✓" : state === "sold_out" ? "Restocking" : available}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CountSkeleton({ product }: { product: Product }) {
  const size = optionGroups(product).find((g) => /size/i.test(g.title))
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {[0, 1].map((r) => (
        <div key={r} className="flex gap-3 border-t border-line pt-3">
          {(size?.values ?? [1, 2, 3, 4]).map((s) => (
            <div key={String(s)} className="h-5 flex-1 animate-pulse rounded-[2px] bg-surface-2" />
          ))}
        </div>
      ))}
    </div>
  )
}
