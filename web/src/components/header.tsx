import { Handbag } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { Suspense } from "react"
import { getRegion, listCategories, listProducts, listReleases } from "@/lib/data/catalog"
import { itemCount, retrieveCart } from "@/lib/data/cart"
import { listSeries } from "@/lib/data/content"
import { shapesFrom } from "@/lib/shapes"
import { Container } from "./container"
import { ShapeMenu } from "./shape-menu"
import { Wordmark } from "./wordmark"

/**
 * Sticky header (SITE_SPEC §6.0). Desktop: Shop ▾ (shape tiles) · Drops · Fit
 * guide · Stories. Mobile: a visible, scrollable row of shapes and links instead
 * of a hamburger (NN/g: hidden navigation costs discoverability).
 */
export async function Header() {
  const region = await getRegion()
  const [releases, categories, products, series] = await Promise.all([
    listReleases(),
    listCategories(),
    region ? listProducts(region.id) : Promise.resolve([]),
    listSeries(),
  ])
  const live = releases.some((r) => r.phase === "live")
  const shapes = shapesFrom(categories, products)
  const story = series[0] ?? null

  const liveDot = live && (
    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" aria-label="A drop is live" />
  )

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page">
      <Container>
        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center lg:h-16">
          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            <ShapeMenu shapes={shapes} />
            <NavLink href="/drops">
              Drops
              {liveDot}
            </NavLink>
            <NavLink href="/fit-guide">Fit guide</NavLink>
            {story && <NavLink href={`/stories/${story.handle}`}>Stories</NavLink>}
          </nav>
          <span className="lg:hidden" />
          <Wordmark />
          <div className="flex justify-end">
            <Link href="/cart" className="relative -mr-2 inline-flex h-11 items-center gap-2 px-2 text-sm font-medium">
              <Handbag size={22} weight="regular" aria-hidden />
              <span className="sr-only lg:not-sr-only">Bag</span>
              <Suspense fallback={null}>
                <BagCount />
              </Suspense>
            </Link>
          </div>
        </div>
      </Container>
      <nav aria-label="Shapes" className="scrollbar-none flex h-10 items-center gap-6 overflow-x-auto border-t border-line px-4 lg:hidden">
        <NavLink href="/shop">All hats</NavLink>
        {shapes.map((s) => (
          <NavLink key={s.handle} href={`/shop?shape=${s.handle}`} track="nav_shape">
            {s.name}
          </NavLink>
        ))}
        <NavLink href="/drops">
          Drops
          {liveDot}
        </NavLink>
        <NavLink href="/fit-guide">Fit guide</NavLink>
      </nav>
    </header>
  )
}

function NavLink({ href, children, track }: { href: string; children: React.ReactNode; track?: string }) {
  return (
    <Link href={href} data-track={track} className="text-eyebrow inline-flex h-10 shrink-0 items-center text-ink hover:text-ink-muted">
      {children}
    </Link>
  )
}

async function BagCount() {
  const count = itemCount(await retrieveCart())
  if (!count) return null
  return (
    <span className="absolute right-0 top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 font-mono text-[10px] text-page lg:static">
      {count}
      <span className="sr-only"> items in bag</span>
    </span>
  )
}
