import Image from "next/image"
import Link from "next/link"
import type { Shape } from "@/lib/shapes"

/**
 * "Browse By Style" (SITE_SPEC §6.1.2): #f5f5f5 tiles with the shape's lead
 * photo as a cut-out and the shape name, then "Shop All".
 */
export function BrowseByStyle({ shapes, shopAllImage }: { shapes: Shape[]; shopAllImage: string | null }) {
  if (!shapes.length) return null
  const tiles = [
    ...shapes.map((s) => ({ label: s.name, href: `/shop?shape=${s.handle}`, image: s.image })),
    { label: "Shop All", href: "/shop", image: shopAllImage },
  ]
  return (
    <section id="shapes" className="bg-white pb-[28.432px] pt-[28.432px] lg:h-[311px] lg:pb-0 lg:pt-[50px]">
      <h2 className="px-[21px] type-section">Browse By Style</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:mt-[28.4px] lg:flex lg:justify-center lg:gap-[12px]">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            data-track="shape_tile"
            className="group flex flex-col items-center rounded-tile bg-tile p-[21px] pb-[9px] lg:h-[153px] lg:w-[133px]"
          >
            <span className="relative block aspect-square w-full lg:h-[91px] lg:w-[91px]">
              {t.image && <Image src={t.image} alt="" fill sizes="(min-width:1024px) 91px, 45vw" className="cutout object-contain transition-transform duration-200 group-hover:scale-105" />}
            </span>
            <span className="mt-3 w-full truncate text-center font-heading text-[13px] uppercase leading-[19.5px] tracking-[0.4px]">{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
