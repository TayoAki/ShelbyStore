import { Minus, Plus } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { getRegion, listCategories, listOffers, listProducts } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { offerOf } from "@/lib/product"
import { shapesFrom } from "@/lib/shapes"

/**
 * Black footer (SITE_SPEC §6.0.8): three link groups (two-column sub-grid past
 * four links) and the legal row. Mobile: the groups become accordions.
 */
export async function Footer() {
  const region = await getRegion()
  const [categories, products, offers, series] = await Promise.all([
    listCategories(),
    region ? listProducts(region.id) : Promise.resolve([]),
    region ? listOffers(region.id) : Promise.resolve([]),
    listSeries(),
  ])
  const shapes = shapesFrom(categories, products)
  const twoPack = offers[0]
  const groups: { title: string; links: [string, string][] }[] = [
    {
      title: "Get Shelby",
      links: [
        ["Shop All", "/shop"],
        ...shapes.map((s) => [s.name, `/shop?shape=${s.handle}`] as [string, string]),
        ["Drops", "/drops"],
        ...(twoPack ? [["The Two-Pack", offerOf(twoPack)!.path] as [string, string]] : []),
      ],
    },
    {
      title: "Customer Service",
      links: [
        ["Shipping & Returns", "/help/shipping-returns"],
        ["Fit Guide", "/fit-guide"],
        ["Fit Quiz", "/quiz"],
        ["Your Bag", "/cart"],
      ],
    },
    {
      title: "Our Company",
      links: [...series.slice(0, 1).map((s) => [s.title, `/stories/${s.handle}`] as [string, string]), ["Why The Everyday Cap", "/reasons/everyday-cap"]],
    },
  ]
  return (
    <footer className="bg-primary px-[28.432px] pb-[28.432px] pt-[28.432px] text-white lg:px-24 lg:pt-[52px]">
      {/* Desktop */}
      <div className="hidden gap-20 lg:flex">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="mb-[18px] font-subheading text-[22px] leading-6">{g.title}</h2>
            <ul className={g.links.length > 4 ? "grid grid-cols-[167px_167px]" : "flex flex-col"}>
              {g.links.map(([label, href]) => (
                <li key={href} className="pr-[11.6px] pt-[10px]">
                  <Link href={href} className="font-body text-[13px] leading-6 hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Mobile */}
      <div className="lg:hidden">
        {groups.map((g) => (
          <details key={g.title} className="group border-b border-white/20 py-[18px]">
            <summary className="flex cursor-pointer items-center justify-between font-subheading text-[22px] leading-6">
              {g.title}
              <Plus size={16} className="group-open:hidden" aria-hidden />
              <Minus size={16} className="hidden group-open:block" aria-hidden />
            </summary>
            <ul className="mt-2 flex flex-col">
              {g.links.map(([label, href]) => (
                <li key={href} className="pt-[10px]">
                  <Link href={href} className="font-body text-[13px] leading-6">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
      <p className="mt-16 text-center font-body text-[11px] leading-[16.5px] lg:text-right">
        © 2026 Shelby. All Rights Reserved. <span aria-hidden>|</span>{" "}
        <Link href="/help/shipping-returns" className="hover:underline">
          Shipping &amp; Returns
        </Link>
      </p>
    </footer>
  )
}
