import { Baseball, Belt, Circle, Crown, Drop, Leaf, Spiral } from "@phosphor-icons/react/dist/ssr"
import Image from "next/image"
import { detailsOf, imagesFor } from "@/lib/product"
import type { Product } from "@/lib/types"

const ICONS: Record<string, typeof Circle> = { Crown, Brim: Baseball, Closure: Belt, Fabric: Leaf, Care: Drop, Knit: Spiral }

/**
 * "Details" band (Melin's "Technology & Features", SITE_SPEC §6.4.16 #1): three
 * photo cards (crown from the side shot, closure from the back, fabric from the
 * front), then every spec line as an icon tile.
 */
export function DetailsBand({ product, color }: { product: Product; color: string | null }) {
  const specs = detailsOf(product)
  if (!specs.length) return null
  const d = Object.fromEntries(specs)
  const photos = imagesFor(product, color)
  const cards = [
    { title: "Crown", body: d.Crown, image: photos[2] ?? photos[0] },
    { title: "Closure", body: d.Closure ?? d.Knit, image: photos[1] ?? photos[0] },
    { title: "Fabric", body: d.Fabric, image: photos[0] },
  ].filter((c) => c.body)
  return (
    <section className="bg-band py-[28.432px] lg:py-[50.512px]">
      <div className="container-shop">
        <h2 className="mb-[22.08px] type-section">Details</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {cards.map((c) => (
            <figure key={c.title}>
              <span className="relative block aspect-square bg-white">
                {c.image && <Image src={c.image} alt="" fill sizes="(min-width:1024px) 378px, 100vw" className="object-contain" />}
              </span>
              <figcaption className="mt-3">
                <span className="block font-heading text-[16px] uppercase">{c.title}</span>
                <span className="block font-body text-[14px] leading-[21px]">{c.body}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-5">
          {specs.map(([label, value]) => {
            const Icon = ICONS[label] ?? Circle
            return (
              <li key={label} className="flex flex-col gap-2">
                <Icon size={32} weight="light" aria-hidden />
                <span className="font-heading text-[12px] uppercase tracking-[1.3px]">{label}</span>
                <span className="font-body text-[13px] leading-[19.5px]">{value}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** Lifestyle photo per product for the "Gallery" band (SITE_SPEC §6.4.16 #2). */
export const LIFESTYLE: Record<string, string> = {
  "everyday-cap": "/hats/lifestyle-hero.jpg",
  "corduroy-cap": "/hats/lifestyle-corduroy.jpg",
  "bucket-hat": "/hats/lifestyle-bucket.jpg",
}
