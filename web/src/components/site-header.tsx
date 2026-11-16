"use client"

import { CaretCircleRight, CaretLeft, Handbag, List, MagnifyingGlass, X } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import type { CatalogItem } from "@/lib/catalog-items"
import { useCartDrawer } from "./cart/drawer-context"
import { RecentlyViewedButton, useViewed, viewedItems, ViewedDrawer } from "./recently-viewed"
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
 * Allbirds' floating header pill (SITE_SPEC §6.0.2–§6.0.7, G.6.1): a white
 * rounded bar hanging under the ticker, pinned while scrolling. Desktop: the
 * wordmark, SHOP · THE CARD · CUSTOM · QUIZ · EXPLORE with natural-white mega
 * panels that drop from the top (M17), and search / eye / bag icons. Mobile:
 * hamburger, centred wordmark, search and bag; the menu sheet scales down from
 * the top (M18) with sliding sub-panels (M18b).
 */
export function SiteHeader({ panels, catalog, bagBadge }: { panels: Panel[]; catalog: CatalogItem[]; bagBadge: ReactNode }) {
  const { open: openBag } = useCartDrawer()
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sub, setSub] = useState<Panel["key"] | null>(null)
  const [viewedOpen, setViewedOpen] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const viewed = viewedItems(catalog, useViewed())

  useEffect(() => {
    if (!openKey && !menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenKey(null)
        setMenuOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [openKey, menuOpen])

  useEffect(() => {
    document.documentElement.classList.toggle("scroll-locked", menuOpen)
  }, [menuOpen])

  const hoverOpen = (key: string | null, delay = 100) => {
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setOpenKey(key), delay)
  }
  const panel = panels.find((p) => p.key === openKey)
  const closeAll = () => {
    setOpenKey(null)
    setMenuOpen(false)
    setSub(null)
  }

  return (
    <>
      <Suspense fallback={null}>
        <OnNavigate run={closeAll} />
      </Suspense>
      <div className="sticky top-[var(--global-banner-height,32px)] z-[80] h-0">
        <div
          className="absolute inset-x-2.5 top-2.5 mx-auto max-w-[2560px] md:inset-x-5 md:top-5"
          onMouseLeave={() => openKey && openKey !== "search" && hoverOpen(null, 150)}
        >
          <div className="relative flex h-10 items-center justify-between overflow-hidden rounded-xl bg-white px-2.5 shadow md:h-12 md:px-5">
            {/* Mobile left: hamburger */}
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-md lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen((o) => !o)
                setSub(null)
                setOpenKey(null)
              }}
            >
              {menuOpen ? <X size={24} /> : <List size={24} />}
            </button>

            <Link
              href="/"
              aria-label="Shelby home"
              className="absolute inset-x-0 mx-auto w-fit font-display text-[20px] leading-6 font-semibold tracking-[-.02em] lowercase lg:static lg:mx-0 lg:text-[22px]"
            >
              shelby
            </Link>

            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {panels.slice(0, 2).map((p) => (
                  <NavButton key={p.key} panel={p} openKey={openKey} onHover={hoverOpen} onToggle={setOpenKey} />
                ))}
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      data-track={l.track}
                      onMouseEnter={() => hoverOpen(null)}
                      className={`text-xs leading-4 font-medium tracking-[.05em] uppercase transition-opacity duration-200 ease-[var(--ease-sine-in-out)] ${openKey ? "opacity-50 hover:opacity-100" : ""}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                {panels.slice(2).map((p) => (
                  <NavButton key={p.key} panel={p} openKey={openKey} onHover={hoverOpen} onToggle={setOpenKey} />
                ))}
              </ul>
            </nav>

            <ul className="flex items-center gap-2">
              <li>
                <button
                  type="button"
                  aria-label="Search"
                  aria-expanded={openKey === "search"}
                  className="flex size-6 items-center justify-center"
                  onClick={() => {
                    setMenuOpen(false)
                    setOpenKey((k) => (k === "search" ? null : "search"))
                  }}
                >
                  <MagnifyingGlass size={24} />
                </button>
              </li>
              <li className="hidden lg:block">
                <RecentlyViewedButton catalog={catalog} />
              </li>
              <li>
                <button type="button" aria-label="Bag" className="relative flex size-6 items-center justify-center" onClick={openBag}>
                  <Handbag size={24} />
                  {bagBadge}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop mega menu / search dropdown (M17–M17c) */}
      <div
        className={`fixed inset-0 z-[10] bg-black/30 transition-opacity ${openKey ? "opacity-100 duration-[240ms] ease-[var(--ease-sine-out)]" : "pointer-events-none opacity-0 duration-[240ms] ease-[var(--ease-sine-in)]"}`}
        aria-hidden
        onClick={() => setOpenKey(null)}
      />
      <div
        data-open={openKey ? "true" : undefined}
        className={`mega fixed inset-x-2.5 top-0 z-[70] mx-auto max-w-[2560px] pt-[calc(4.5rem+var(--global-banner-height,32px))] md:inset-x-5 md:pt-[calc(5rem+var(--global-banner-height,32px))] ${openKey ? "" : "pointer-events-none"}`}
        onMouseEnter={() => clearTimeout(hoverTimer.current)}
        onMouseLeave={() => openKey && openKey !== "search" && hoverOpen(null, 150)}
      >
        <div className="mega-bg absolute inset-x-[-50%] top-0 m-auto h-full w-screen origin-top rounded-b-xl bg-natural-white-60 shadow-lg" aria-hidden />
        <div className="mega-content relative z-30 pb-10">
          {openKey === "search" ? (
            <div className="pt-2">
              <SearchPanel catalog={catalog} onNavigate={() => setOpenKey(null)} />
            </div>
          ) : panel ? (
            <div key={panel.key} className="flex flex-col gap-8">
              <div className="mega-item flex h-10 items-center justify-center rounded-xl bg-natural-white text-xs leading-4 font-medium" style={{ ["--i" as string]: 0 }}>
                {panel.label}
              </div>
              <div className="flex justify-between gap-12 px-5">
                <div className="flex gap-12">
                  {panel.columns.map((c, i) => (
                    <div key={c.heading} className="mega-item flex flex-col" style={{ ["--i" as string]: i + 1 }}>
                      <p className="mb-4 text-xs leading-4 font-medium tracking-[.05em] uppercase">{c.heading}</p>
                      <ul className="flex flex-col gap-2">
                        {c.links.map((l) => (
                          <li key={l.href + l.label}>
                            <Link href={l.href} data-track={panel.track} onClick={() => setOpenKey(null)} className="text-sm leading-5 text-light-charcoal hover:underline">
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2.5">
                  {panel.cards.map((card, i) => (
                    <Link key={card.href + card.label} href={card.href} data-track={panel.track} onClick={() => setOpenKey(null)} className="mega-item w-[220px]" style={{ ["--i" as string]: panel.columns.length + i + 1 }}>
                      <span className="relative block aspect-square overflow-hidden rounded-2xl bg-white">
                        <Image src={card.image} alt="" fill sizes="220px" className={card.contain ? "object-contain" : "object-cover"} />
                      </span>
                      <span className="mt-2 block text-xs leading-4 font-medium tracking-[.05em] uppercase">{card.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile menu sheet (M18) */}
      <div
        data-open={menuOpen ? "true" : undefined}
        className={`mobile-menu fixed inset-x-0 top-[var(--global-banner-height,32px)] bottom-0 z-[60] origin-top overflow-hidden bg-natural-white-60 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div className="relative h-full overflow-y-auto px-5 pt-[74px] pb-56">
          <ul className={`flex flex-col transition-[transform,opacity] duration-[480ms] ease-[var(--ease-power3-in-out)] ${sub ? "-translate-x-full opacity-0" : ""}`}>
            {[
              ...panels.slice(0, 2).map((p) => ({ kind: "panel" as const, p })),
              ...LINKS.map((l) => ({ kind: "link" as const, l })),
              ...panels.slice(2).map((p) => ({ kind: "panel" as const, p })),
            ].map((row, i) => (
              <li key={row.kind === "panel" ? row.p.key : row.l.href} className="mobile-item" style={{ ["--i" as string]: i }}>
                {row.kind === "panel" ? (
                  <button type="button" onClick={() => setSub(row.p.key)} className="flex h-[45px] w-full items-center justify-between text-sm leading-[21px] font-medium tracking-[.05em] uppercase" data-track={row.p.track}>
                    {row.p.label}
                    <CaretCircleRight size={20} />
                  </button>
                ) : (
                  <Link href={row.l.href} data-track={row.l.track} onClick={closeAll} className="flex h-[45px] items-center text-sm leading-[21px] font-medium tracking-[.05em] uppercase">
                    {row.l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {panels.map((p) => (
            <div
              key={p.key}
              className={`absolute inset-x-5 top-[74px] transition-[transform,opacity] duration-[480ms] ease-[var(--ease-power3-in-out)] ${sub === p.key ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"}`}
            >
              <button type="button" onClick={() => setSub(null)} className="flex h-[35px] items-center gap-1 text-sm">
                <CaretLeft size={16} /> Back
              </button>
              {p.columns.map((c) => (
                <div key={c.heading} className="mt-4">
                  <p className="text-xs leading-4 font-medium tracking-[.05em]">{c.heading}</p>
                  <ul>
                    {c.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link href={l.href} data-track={p.track} onClick={closeAll} className="flex h-[35px] items-center text-sm capitalize">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mobile-item absolute inset-x-5 bottom-5 rounded-sm bg-white p-5" style={{ ["--i" as string]: 6 }}>
          <ul className="flex flex-col text-sm capitalize">
            {viewed.length > 0 && (
              <li>
                <button type="button" className="flex h-[35px] items-center" onClick={() => setViewedOpen(true)} data-track="recently_viewed">
                  Recently Viewed ({viewed.length})
                </button>
              </li>
            )}
            <li>
              <Link href="/fit-guide" onClick={closeAll} className="flex h-[35px] items-center">
                Fit Guide
              </Link>
            </li>
            <li>
              <Link href="/custom" onClick={closeAll} className="flex h-[35px] items-center" data-track="nav_custom">
                Custom Orders
              </Link>
            </li>
            <li>
              <Link href="/help/shipping-returns" onClick={closeAll} className="flex h-[35px] items-center">
                Shipping & Returns
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
        className={`flex items-center gap-1.5 text-xs leading-4 font-medium tracking-[.05em] uppercase transition-opacity duration-200 ease-[var(--ease-sine-in-out)] ${openKey && !active ? "opacity-50 hover:opacity-100" : ""}`}
      >
        {panel.label}
        {panel.dot && <span aria-label="(a hole is live)" className="size-1.5 rounded-full bg-black" />}
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
