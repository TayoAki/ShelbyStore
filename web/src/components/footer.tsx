import Link from "next/link"
import { getRegion, listCategories, listProducts } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { POLICY } from "@/lib/policy"
import { shapesFrom } from "@/lib/shapes"
import { Container } from "./container"
import { Wordmark } from "./wordmark"

/** Ink footer: shapes, help (with the fit guide) and the active story (SITE_SPEC §6.0). */
export async function Footer() {
  const region = await getRegion()
  const [categories, products, series] = await Promise.all([
    listCategories(),
    region ? listProducts(region.id) : Promise.resolve([]),
    listSeries(),
  ])
  const shapes = shapesFrom(categories, products)
  const columns: { title: string; links: [string, string][] }[] = [
    {
      title: "Shop",
      links: [["All hats", "/shop"], ...shapes.map((s) => [s.name, `/shop?shape=${s.handle}`] as [string, string]), ["Drops", "/drops"]],
    },
    {
      title: "Help",
      links: [["Fit guide", "/fit-guide"], ["Fit quiz", "/quiz"], ["Shipping & returns", "/help/shipping-returns"], ["Your bag", "/cart"]],
    },
    {
      title: "Shelby",
      links: [
        ...series.slice(0, 2).map((s) => [s.title, `/stories/${s.handle}`] as [string, string]),
        ["Why the Everyday Cap", "/reasons/everyday-cap"],
      ],
    },
  ]
  return (
    <footer className="mt-20 bg-ink py-16 text-page">
      <Container className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Wordmark />
          <p className="text-[14px] text-ink-inverse-muted">Hats. The core, always. Drops, often.</p>
          <p className="text-eyebrow text-ink-inverse-muted">{POLICY.announcement}</p>
        </div>
        {columns
          .filter((c) => c.links.length)
          .map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="text-eyebrow text-ink-inverse-muted">{col.title}</p>
              {col.links.map(([label, href]) => (
                <Link key={href} href={href} className="text-[15px] hover:text-ink-inverse-muted">
                  {label}
                </Link>
              ))}
            </div>
          ))}
      </Container>
      <Container className="mt-14 flex items-end justify-between gap-6 border-t border-white/15 pt-6">
        <p className="text-[12px] text-ink-inverse-muted">© Shelby</p>
        <p className="font-mono text-[12px] text-ink-inverse-muted">{POLICY.dispatch}</p>
      </Container>
    </footer>
  )
}
