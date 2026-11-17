"use client"

import { ArrowLeft, ArrowRight, Eye, Handbag, List, MagnifyingGlass } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import type { CatalogItem } from "@/lib/catalog-items"
import { useCartDrawer } from "./cart/drawer-context"
import { DrawerHead, SideDrawer } from "./cart/side-drawer"
import { useViewed, viewedItems, ViewedDrawer } from "./recently-viewed"
import { SearchPanel } from "./search"

export type Panel = {
  key: "shop" | "card" | "explore"
  label: string
  track: string
  columns: { heading: string; links: { label: string; href: string }[] }[]
  cards: { label: string; href: string; image: string; contain: boolean }[]
}

export type StripTile = { label: string; href: string; image: string; track: string }

const LINKS = [
  { label: "Custom", href: "/custom", track: "nav_custom" },
]

const ICON = "flex size-11 items-center justify-center text-text transition-colors duration-250 hover:text-link-hover"

/**
 * Eastside's header (SITE_SPEC v8 E.6.0.2–E.6.0.5). Desktop: the wordmark at
 * the left, the nav in the centre (Shop, The Card and Explore open full-width
 * mega menus on a 120ms hover intent; Custom and Quiz are links), and the eye,
 * search and bag at the right. Mobile: menu and search, the centred wordmark,
 * the eye and bag. Sticky (M6); the announcement bar scrolls away above it.
 */
export function SiteHeader({ panels, strip, catalog, bagBadge }: { panels: Panel[]; strip: StripTile[]; catalog: CatalogItem[]; bagBadge: ReactNode }) {
  const { open: openBag } = useCartDrawer()
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sub, setSub] = useState<Panel["key"] | null>(null)
  const [viewedOpen, setViewedOpen] = useState(false)
  const viewed = viewedItems(catalog, useViewed())
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!openKey) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenKey(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openKey])

  const hoverOpen = (key: string | null, delay = 120) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpenKey(key), delay)
  }
  const closeAll = () => {
    clearTimeout(timer.current)
    setOpenKey(null)
    setMenuOpen(false)
    setSub(null)
  }
  const toggleSearch = () => {
    clearTimeout(timer.current)
    setMenuOpen(false)
    setOpenKey((k) => (k === "search" ? null : "search"))
  }
  const subPanel = panels.find((p) => p.key === sub)

  return (
    <>
      <Suspense fallback={null}>
        <OnNavigate run={closeAll} />
      </Suspense>
      <header className="site-header">
        {/* Desktop */}
        <div className="wrap hidden h-[70px] grid-cols-[1fr_auto_1fr] items-center md:grid">
          <Link href="/" aria-label="Shelby home" className="display-mark flex h-[60px] w-fit items-center !text-text hover:!text-text">
            Shelby
          </Link>
          <nav aria-label="Main">
            <ul className="flex items-center">
              {panels.map((p) => (
                <li
                  key={p.key}
                  onMouseEnter={() => hoverOpen(p.key)}
                  onMouseLeave={() => hoverOpen(null)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenKey((k) => (k === p.key ? null : k))
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={openKey === p.key}
                    aria-controls={`mega-${p.key}`}
                    data-track={p.track}
                    onClick={() => {
                      clearTimeout(timer.current)
                      setOpenKey((k) => (k === p.key ? null : p.key))
                    }}
                    className="navlink nav-label h-[60px]"
                  >
                    <span className="navtext">{p.label}</span>
                  </button>
                  <Mega panel={p} open={openKey === p.key} onNavigate={closeAll} />
                </li>
              ))}
              {LINKS.map((l) => (
                <li key={l.href} onMouseEnter={() => hoverOpen(null)}>
                  <Link href={l.href} data-track={l.track} className="navlink nav-label h-[60px]">
                    <span className="navtext">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center justify-end">
            <button type="button" aria-label="Recently viewed" className={ICON} onClick={() => setViewedOpen(true)} data-track="recently_viewed">
              <Eye size={22} />
            </button>
            <button type="button" aria-label="Search" aria-expanded={openKey === "search"} className={ICON} onClick={toggleSearch}>
              <MagnifyingGlass size={22} />
            </button>
            <button type="button" onClick={openBag} aria-label="Open bag" className={`${ICON} relative -mr-2.5`}>
              <Handbag size={22} />
              {bagBadge}
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center px-1 md:hidden">
          <div className="flex items-center">
            <button type="button" className={ICON} aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <List size={22} />
            </button>
            <button type="button" aria-label="Search" aria-expanded={openKey === "search"} className={ICON} onClick={toggleSearch}>
              <MagnifyingGlass size={22} />
            </button>
          </div>
          <Link href="/" aria-label="Shelby home" className="display-mark flex h-11 items-center !text-text">
            Shelby
          </Link>
          <div className="flex items-center justify-end">
            <button type="button" aria-label="Recently viewed" className={ICON} onClick={() => setViewedOpen(true)} data-track="recently_viewed">
              <Eye size={22} />
            </button>
            <button type="button" onClick={openBag} aria-label="Open bag" className={`${ICON} relative`}>
              <Handbag size={22} />
              {bagBadge}
            </button>
          </div>
        </div>

        {openKey === "search" && (
          <div className="absolute inset-x-0 top-full z-10 max-h-[calc(100dvh-72px)] overflow-y-auto border-b border-border bg-bg">
            <SearchPanel catalog={catalog} onNavigate={closeAll} onClose={() => setOpenKey(null)} />
          </div>
        )}
      </header>

      {/* Mobile menu (E.6.0.4): a left drawer of 50px rows; parents slide in a sub-level. */}
      <SideDrawer open={menuOpen} onClose={closeAll} label="Menu" side="left">
        <DrawerHead onClose={closeAll} closeFirst />
        <div className="min-h-0 flex-1 overflow-y-auto">
          {subPanel ? (
            <div key={subPanel.key} className="menu-sub">
              <button type="button" className="menu-row w-full justify-start gap-2" onClick={() => setSub(null)}>
                <ArrowLeft size={18} aria-hidden /> Back
              </button>
              {subPanel.columns.map((c) => (
                <div key={c.heading}>
                  <p className="nav-label px-[15px] pt-5 pb-2 text-text-light">{c.heading}</p>
                  <ul>
                    {c.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link href={l.href} data-track={subPanel.track} className="menu-row">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <>
              <ul>
                {panels.map((p) => (
                  <li key={p.key}>
                    <button type="button" className="menu-row w-full" data-track={p.track} onClick={() => setSub(p.key)}>
                      {p.label}
                      <ArrowRight size={18} aria-hidden />
                    </button>
                  </li>
                ))}
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} data-track={l.track} className="menu-row">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="menu-row w-full"
                    data-track="recently_viewed"
                    onClick={() => {
                      setMenuOpen(false)
                      setViewedOpen(true)
                    }}
                  >
                    Recently viewed
                  </button>
                </li>
              </ul>
              <ul className="rail px-[14px] py-5 [grid-auto-columns:79px]" aria-label="Shop by color">
                {strip.map((t) => (
                  <li key={t.label}>
                    <Link href={t.href} data-track={t.track} className="flex flex-col items-center">
                      <span className="tile relative block size-[79px]">
                        <Image src={t.image} alt="" fill sizes="79px" className="tile-photo object-contain" />
                      </span>
                      <span className="mt-[7px] text-center text-[12.25px] leading-[15.93px] uppercase">{t.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </SideDrawer>
      <ViewedDrawer open={viewedOpen} onClose={() => setViewedOpen(false)} items={viewed} />
    </>
  )
}

/** A full-width mega-menu panel (E.6.0.3, M5): link columns at the left, feature cards at the right. */
function Mega({ panel, open, onNavigate }: { panel: Panel; open: boolean; onNavigate: () => void }) {
  const starts = panel.columns.map((_, i) => panel.columns.slice(0, i).reduce((n, c) => n + c.links.length, 0))
  return (
    <div id={`mega-${panel.key}`} className="mega" data-open={open} aria-hidden={!open}>
      <div className="flex justify-between gap-10 px-[72px] py-8">
        <div className="flex gap-16">
          {panel.columns.map((c, ci) => (
            <div key={c.heading} className="min-w-[160px] py-[30px]">
              <p className="nav-label leading-[25px] text-text">{c.heading}</p>
              <ul>
                {c.links.map((l, li) => {
                  const row = starts[ci] + li + 1
                  return (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        data-track={panel.track}
                        onClick={onNavigate}
                        tabIndex={open ? undefined : -1}
                        className="mega-link nav-sub leading-[25px]"
                        style={open ? { transitionDelay: `${row * 0.02}s, ${row * 0.02}s, 0s` } : undefined}
                      >
                        {l.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        {panel.cards.length > 0 && (
          <div className="flex gap-4 py-[30px]">
            {panel.cards.map((card) => (
              <Link key={card.href + card.label} href={card.href} data-track={panel.track} onClick={onNavigate} tabIndex={open ? undefined : -1} className="block w-[244px]">
                <span className={`relative block h-[176px] w-[244px] overflow-hidden ${card.contain ? "bg-tile" : ""}`}>
                  <Image src={card.image} alt="" fill sizes="244px" className={`mega-img ${card.contain ? "tile-photo object-contain" : "object-cover"}`} />
                </span>
                <span className="nav-label mt-2.5 block">{card.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
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
