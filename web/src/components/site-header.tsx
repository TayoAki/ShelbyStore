"use client"

import { CaretDown, Eye, Handbag, List, MagnifyingGlass, X } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import type { CatalogItem } from "@/lib/catalog-items"
import { useCartDrawer } from "./cart/drawer-context"
import { useViewed, viewedItems, ViewedDrawer } from "./recently-viewed"
import { SearchPanel } from "./search"

export type Panel = {
  key: "shop" | "card" | "explore"
  label: string
  track: string
  dot?: boolean
  columns: { heading: string; links: { label: string; href: string }[] }[]
  cards: { label: string; href: string; image: string; contain: boolean }[]
}

const LINKS = [
  { label: "Custom", href: "/custom", track: "nav_custom" },
  { label: "Quiz", href: "/quiz", track: "nav_quiz" },
]

/**
 * The box's top flap: a printed white strip with the wordmark set like the
 * brand on a ball box, the nav as printed links, and the bag with its count in
 * a digit slot. Menus fold down from the flap as keylined board panels on the
 * shared beat. Mobile: menu, wordmark, search and bag.
 */
export function SiteHeader({ panels, catalog, bagBadge }: { panels: Panel[]; catalog: CatalogItem[]; bagBadge: ReactNode }) {
  const { open: openBag } = useCartDrawer()
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [viewedOpen, setViewedOpen] = useState(false)
  const viewed = viewedItems(catalog, useViewed())
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    document.documentElement.classList.toggle("scroll-locked", menuOpen)
    return () => document.documentElement.classList.remove("scroll-locked")
  }, [menuOpen])
  useEffect(() => {
    if (!openKey && !menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpenKey(null)
      setMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openKey, menuOpen])

  const hoverOpen = (key: string | null, delay = 120) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpenKey(key), delay)
  }
  const closeAll = () => {
    setOpenKey(null)
    setMenuOpen(false)
  }
  const panel = panels.find((p) => p.key === openKey)

  return (
    <>
      <Suspense fallback={null}>
        <OnNavigate run={closeAll} />
      </Suspense>
      <header className="sticky top-0 z-[80] border-b-2 border-ink bg-paper" onMouseLeave={() => openKey && openKey !== "search" && hoverOpen(null, 180)}>
        <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-3 md:px-6">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex size-11 items-center justify-center lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen((o) => !o)
                setOpenKey(null)
              }}
            >
              {menuOpen ? <X size={26} weight="bold" /> : <List size={26} weight="bold" />}
            </button>
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {panels.slice(0, 2).map((p) => (
                  <NavButton key={p.key} panel={p} openKey={openKey} onHover={hoverOpen} onToggle={setOpenKey} />
                ))}
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} data-track={l.track} className="label !text-[14px] decoration-2 underline-offset-[6px] hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {panels.slice(2).map((p) => (
                  <NavButton key={p.key} panel={p} openKey={openKey} onHover={hoverOpen} onToggle={setOpenKey} />
                ))}
              </ul>
            </nav>
          </div>

          <Link href="/" aria-label="Shelby home" className="font-model text-[2rem] leading-none font-[850] tracking-[.06em] uppercase md:text-[2.25rem]">
            Shelby
          </Link>

          <div className="flex items-center justify-end gap-1 md:gap-2">
            <button
              type="button"
              aria-label="Search"
              aria-expanded={openKey === "search"}
              className="flex size-11 items-center justify-center"
              onClick={() => {
                setMenuOpen(false)
                setOpenKey((k) => (k === "search" ? null : "search"))
              }}
            >
              <MagnifyingGlass size={24} weight="bold" />
            </button>
            {viewed.length > 0 && (
              <button type="button" aria-label="Recently viewed" className="hidden size-11 items-center justify-center md:flex" onClick={() => setViewedOpen(true)} data-track="recently_viewed">
                <Eye size={24} weight="bold" />
              </button>
            )}
            <button type="button" onClick={openBag} aria-label="Open bag" className="flex h-11 items-center gap-2 px-1.5">
              <Handbag size={24} weight="bold" />
              <span className="label hidden !text-[14px] md:inline">Bag</span>
              {bagBadge}
            </button>
          </div>
        </div>

        {/* Desktop flap panels and search fold down from the header on the shared beat. */}
        <div
          className={`sheet absolute inset-x-0 top-full origin-top border-b-2 border-ink bg-paper ${openKey ? "visible scale-y-100 opacity-100" : "invisible scale-y-95 opacity-0"}`}
          onMouseEnter={() => clearTimeout(timer.current)}
        >
          {openKey === "search" ? (
            <div className="py-8">
              <SearchPanel catalog={catalog} onNavigate={closeAll} />
            </div>
          ) : panel ? (
            <div className="mx-auto grid max-w-[1440px] grid-cols-[repeat(3,minmax(0,1fr))_auto] gap-10 px-6 py-8">
              {panel.columns.map((c) => (
                <div key={c.heading}>
                  <p className="label border-b-2 border-ink pb-2">{c.heading}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {c.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link href={l.href} data-track={panel.track} onClick={closeAll} className="text-[1.0625rem] hover:underline">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="col-start-4 row-start-1 flex gap-4">
                {panel.cards.map((card) => (
                  <Link key={card.href + card.label} href={card.href} data-track={panel.track} onClick={closeAll} className="group w-[168px]">
                    <span className="window block aspect-square">
                      <Image src={card.image} alt="" fill sizes="168px" className={card.contain ? "object-contain p-3" : "object-cover"} />
                    </span>
                    <span className="label mt-2 block group-hover:underline">{card.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {/* Mobile menu: the flap opens to a full board sheet. */}
      <div
        className={`sheet fixed inset-x-0 top-0 bottom-0 z-[79] overflow-y-auto bg-paper pt-[124px] lg:hidden ${menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"}`}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col gap-8 px-5 pb-12">
          {panels.map((p) => (
            <section key={p.key}>
              <h2 className="panel-title !text-[2.5rem]">{p.label}</h2>
              <div className="mt-3 flex flex-col gap-5">
                {p.columns.map((c) => (
                  <div key={c.heading}>
                    <p className="label border-b-2 border-ink pb-1.5">{c.heading}</p>
                    <ul className="mt-1">
                      {c.links.map((l) => (
                        <li key={l.href + l.label}>
                          <Link href={l.href} data-track={p.track} tabIndex={menuOpen ? 0 : -1} onClick={closeAll} className="flex min-h-11 items-center text-[1.0625rem]">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
          <ul className="flex flex-col border-t-2 border-ink pt-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} data-track={l.track} tabIndex={menuOpen ? 0 : -1} onClick={closeAll} className="label flex min-h-11 items-center !text-[15px]">
                  {l.label}
                </Link>
              </li>
            ))}
            {viewed.length > 0 && (
              <li>
                <button type="button" tabIndex={menuOpen ? 0 : -1} className="label flex min-h-11 items-center !text-[15px]" onClick={() => setViewedOpen(true)} data-track="recently_viewed">
                  Recently viewed
                </button>
              </li>
            )}
            <li>
              <Link href="/help/shipping-returns" tabIndex={menuOpen ? 0 : -1} onClick={closeAll} className="label flex min-h-11 items-center !text-[15px]">
                Shipping & returns
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <ViewedDrawer open={viewedOpen} onClose={() => setViewedOpen(false)} items={viewed} />
    </>
  )
}

function NavButton({
  panel,
  openKey,
  onHover,
  onToggle,
}: {
  panel: Panel
  openKey: string | null
  onHover: (key: string | null, delay?: number) => void
  onToggle: (fn: (k: string | null) => string | null) => void
}) {
  const active = openKey === panel.key
  return (
    <li>
      <button
        type="button"
        aria-expanded={active}
        data-track={panel.track}
        onMouseEnter={() => onHover(panel.key)}
        onFocus={() => onHover(panel.key, 0)}
        onClick={() => onToggle((k) => (k === panel.key ? null : panel.key))}
        className={`label flex items-center gap-1 !text-[14px] decoration-2 underline-offset-[6px] ${active ? "underline" : "hover:underline"}`}
      >
        {panel.label}
        {panel.dot && <span aria-label="(a hole is live)" className="size-2 bg-stripe" />}
        <CaretDown size={12} weight="bold" aria-hidden className={`transition-transform duration-200 ${active ? "rotate-180" : ""}`} />
      </button>
    </li>
  )
}

/**
 * Calls `run` when the path changes. Reading the pathname is request data, so
 * it lives in its own Suspense boundary and the header shell stays static.
 */
function OnNavigate({ run }: { run: () => void }) {
  const pathname = usePathname()
  const latest = useRef(run)
  const first = useRef(true)
  useEffect(() => {
    latest.current = run
  })
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    latest.current()
  }, [pathname])
  return null
}
