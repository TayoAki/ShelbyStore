import { Handbag } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { Suspense } from "react"
import { listReleases } from "@/lib/data/catalog"
import { itemCount, retrieveCart } from "@/lib/data/cart"
import { Container } from "./container"
import { Wordmark } from "./wordmark"

/**
 * Sticky header with VISIBLE links (Core · Drops · Shop). With three destinations,
 * hiding them in a hamburger costs discoverability (NN/g, SITE_SPEC §6.0).
 */
export async function Header() {
  const releases = await listReleases()
  const live = releases.some((r) => r.phase === "live")

  const links = (
    <>
      <NavLink href="/#core">Core</NavLink>
      <NavLink href="/drops">
        Drops
        {live && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" aria-label="A drop is live" />}
      </NavLink>
      <NavLink href="/shop">Shop</NavLink>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page">
      <Container>
        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center lg:h-16">
          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {links}
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
      <nav aria-label="Main" className="scrollbar-none flex h-10 items-center justify-center gap-8 overflow-x-auto border-t border-line lg:hidden">
        {links}
      </nav>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-eyebrow inline-flex h-10 items-center text-ink hover:text-ink-muted">
      {children}
    </Link>
  )
}

async function BagCount() {
  const count = itemCount(await retrieveCart())
  if (!count) return null
  return (
    <span className="absolute right-0 top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 font-mono text-[10px] text-white">
      {count}
      <span className="sr-only"> items in bag</span>
    </span>
  )
}
