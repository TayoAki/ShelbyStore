import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Container } from "@/components/container"
import { FitScales } from "@/components/fit-scale"
import { getRegion, listCategories, listProducts } from "@/lib/data/catalog"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"
import { colorThumbs, fitProfileOf, imagesFor, isOneSize, meta, oneSizeRange, price, shapeOf } from "@/lib/product"
import { SHAPE_COPY, shapesFrom } from "@/lib/shapes"
import type { Product } from "@/lib/types"

export const metadata: Metadata = {
  title: "Fit guide",
  description: "How Shelby hats fit: one size adjustable from 21.5 to 23.75 in, sized styles in S/M and L/XL, crown height and structure for every style.",
}

const SIZE_TABLE = [
  { size: "One size (adjustable)", inches: "21.5–23.75", cm: "55–60", fitted: "6⅞–7½" },
  { size: "S/M", inches: "21.5–22.5", cm: "55–57", fitted: "6⅞–7⅛" },
  { size: "L/XL", inches: "22.75–23.75", cm: "58–60", fitted: "7¼–7½" },
]

/**
 * Fit guide (SITE_SPEC §6.5): the one-size range in plain words, how to measure,
 * one size table, and a card per style built from published products and
 * their metadata.fit_profile. Every PDP links here (#handle).
 */
export default async function FitGuidePage() {
  const region = await getRegion()
  const [products, categories] = await Promise.all([region ? listProducts(region.id) : Promise.resolve([]), listCategories()])
  const shapes = shapesFrom(categories, products)

  return (
    <>
      <section className="border-b border-line">
        <Container className="flex flex-col gap-4 py-10 lg:py-16">
          <p className="text-eyebrow text-ink-muted">Fit guide</p>
          <h1 className="font-display text-hero">How it fits</h1>
          <p className="max-w-2xl text-[17px] leading-relaxed lg:text-[19px]">
            Most Shelby hats are one size: the adjustable strap or snap fits heads from 21.5 to 23.75 in (55–60 cm).{" "}
            {POLICY.sized}.
          </p>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex min-w-0 flex-col gap-5">
            <h2 className="font-display text-[28px] leading-none lg:text-[40px]">How to measure</h2>
            <ol className="flex flex-col gap-4">
              {[
                "Wrap a soft tape measure around your head, just above the ears and about a finger's width above your eyebrows.",
                "Keep it level and snug, not tight. Read the number where the tape meets.",
                "Between two sizes? Size up. For one-size hats, any reading in the range fits.",
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="font-mono text-[13px] text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[15px] leading-relaxed lg:text-base">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <h2 className="font-display text-[28px] leading-none lg:text-[40px]">Sizes</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[14px]">
                <caption className="sr-only">Hat sizes by head circumference</caption>
                <thead>
                  <tr className="text-eyebrow text-ink-muted">
                    <th scope="col" className="border-b border-ink py-2 pr-3 text-left font-medium">Size</th>
                    <th scope="col" className="border-b border-ink py-2 pr-3 text-left font-medium">Inches</th>
                    <th scope="col" className="border-b border-ink py-2 pr-3 text-left font-medium">Cm</th>
                    <th scope="col" className="border-b border-ink py-2 text-left font-medium">Fitted size</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {SIZE_TABLE.map((r) => (
                    <tr key={r.size} className="border-b border-line">
                      <th scope="row" className="py-3 pr-3 text-left font-sans font-semibold">{r.size}</th>
                      <td className="py-3 pr-3">{r.inches}</td>
                      <td className="py-3 pr-3">{r.cm}</td>
                      <td className="py-3">{r.fitted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-ink-muted">Head circumference. Ranges are for the hat, not a fit promise for every head shape.</p>
          </div>
        </Container>
      </section>

      {/* Last band: sits flush on the footer. */}
      <section className="-mb-20 bg-surface py-12 lg:py-16">
        <Container className="flex flex-col gap-12">
          <h2 className="font-display text-section">By style</h2>
          {shapes.map((shape) => {
            const items = products.filter((p) => shapeOf(p)?.handle === shape.handle)
            return (
              <div key={shape.handle} id={shape.handle} className="flex scroll-mt-28 flex-col gap-6">
                <div className="flex flex-col gap-2 border-b border-ink pb-3">
                  <h3 className="font-display text-[28px] leading-none lg:text-[36px]">{shape.name}</h3>
                  {(shape.description ?? SHAPE_COPY[shape.handle]) && (
                    <p className="max-w-2xl text-[15px] text-ink-muted">{shape.description ?? SHAPE_COPY[shape.handle]}</p>
                  )}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <StyleCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )
          })}
        </Container>
      </section>
    </>
  )
}

function StyleCard({ product }: { product: Product }) {
  const profile = fitProfileOf(product)
  const image = imagesFor(product, colorThumbs(product)[0]?.color)[0]
  const p = price(product)
  const notes = meta(product, "fit_notes")
  return (
    <article id={product.handle} className="flex scroll-mt-28 flex-col gap-4 bg-page p-4">
      <div className="grid grid-cols-[96px_1fr] gap-4">
        <div className="relative aspect-[4/5] overflow-hidden bg-page">
          {image && <Image src={image} alt="" fill sizes="96px" className="object-cover" />}
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-[17px] font-semibold leading-tight">{product.title}</h4>
          <p className="font-mono text-[13px]">{formatMoney(p.amount, p.currency)}</p>
          <p className="text-[13px] text-ink-muted">
            {!isOneSize(product) ? "Sized · S/M and L/XL" : profile ? `One size · ${oneSizeRange(product, POLICY.oneSize)}` : "One size · stretch knit"}
          </p>
        </div>
      </div>
      {profile && <FitScales profile={profile} compact />}
      {notes && <p className="text-[14px] leading-relaxed">{notes}</p>}
      <Link href={`/products/${product.handle}`} className="text-eyebrow mt-auto w-fit border-b border-ink pb-1 hover:text-ink-muted">
        Shop the {product.title.replace(/^The /, "")} →
      </Link>
    </article>
  )
}
