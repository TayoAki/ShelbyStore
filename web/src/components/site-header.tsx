"use client"

import { Bag, List, X } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import type { CatalogItem } from "@/lib/catalog-items"
import { useCartDrawer } from "./cart/drawer-context"
import { RecentlyViewedButton } from "./recently-viewed"
import { Search } from "./search"
import { Wordmark } from "./wordmark"

export type Tile = { label: string; href: string; image: string | null }
export type Panel = {
  key: "featured" | "shop" | "drops" | "explore"
  label: string
  tiles: Tile[]
  button: { label: string; href: string } | null
  /** data-track for the nav item and its tiles. */
  track: string
  /** Where the item goes when it has no panel (e.g. no drops right now). */
  href: string
}

const QUIZ = { label: "Fit Quiz", href: "/quiz", track: "nav_quiz" }

/**
 * Melin's header (SITE_SPEC §6.0.2–§6.0.7). Desktop: logo, centred nav with
 * #ededed mega menus over a black/80 overlay, tools (search, previously viewed,
 * bag). Mobile: 121px (logo row + search row) that condenses to 61px on scroll
 * down, and a full-screen tabbed menu.
 */
export function SiteHeader({ panels, catalog, bagBadge }: { panels: Panel[]; catalog: CatalogItem[]; bagBadge: ReactNode }) {
  const { open: openBag } = useCartDrawer()
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [tab, setTab] = useState<Panel["key"]>(panels[0]?.key ?? "shop")
  const [condensed, setCondensed] = useState(false)
  // Hover intent: open after 150ms, close after 120ms (SITE_SPEC §6.0.3).
  const [hover, setHover] = useState<{ key: string | null; delay: number; n: number } | null>(null)
  useEffect(() => {
    if (!hover) return
    const id = setTimeout(() => setOpenKey(hover.key), hover.delay)
    return () => clearTimeout(id)
  }, [hover])

  // Mobile: condense past 121px while scrolling down, expand on scroll up.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y <= 121) setCondensed(false)
      else if (y > last + 4) setCondensed(true)
      else if (y < last - 4) setCondensed(false)
      last = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Sticky bars on mobile sit under the header at its current height.
  useEffect(() => {
    document.documentElement.dataset.hdr = condensed ? "condensed" : "expanded"
  }, [condensed])

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

  const intent = (key: string | null, delay = 150) => setHover((h) => ({ key, delay, n: (h?.n ?? 0) + 1 }))
  const active = panels.find((p) => p.key === openKey && p.tiles.length) ?? null
  const close = () => setOpenKey(null)

  const bagButton = (
    <button type="button" aria-label="Open bag" onClick={openBag} className="relative flex h-6 w-6 items-center justify-center" data-track="nav_bag">
      <Bag size={24} />
      {bagBadge}
    </button>
  )

  const navItem = (p: Panel) => {
    const isOpen = openKey === p.key && p.tiles.length > 0
    const underline =
      "relative after:absolute after:bottom-[-1px] after:left-4 after:right-4 after:h-[3px] after:bg-primary after:opacity-0 hover:after:opacity-100"
    if (!p.tiles.length) {
      return (
        <Link key={p.key} href={p.href} data-track={p.track} onMouseEnter={() => intent(null, 0)} className={`type-nav flex h-[60px] items-center whitespace-nowrap px-4 ${underline}`}>
          {p.label}
        </Link>
      )
    }
    return (
      <button
        key={p.key}
        type="button"
        aria-expanded={isOpen}
        aria-controls={`mega-${p.key}`}
        data-track={p.track}
        onMouseEnter={() => intent(p.key)}
        onFocus={() => setOpenKey(p.key)}
        onClick={() => setOpenKey(isOpen ? null : p.key)}
        className={`type-nav flex h-[60px] items-center whitespace-nowrap px-4 ${underline} ${isOpen ? "after:opacity-100" : ""}`}
      >
        {p.label}
      </button>
    )
  }

  const order = ["featured", "shop", "drops"] as const
  const before = order.map((k) => panels.find((p) => p.key === k)).filter((p): p is Panel => !!p)
  const explore = panels.find((p) => p.key === "explore")

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line-header bg-white" onMouseLeave={() => intent(null, 120)}>
        {/* Desktop */}
        <div className="hidden h-[60px] items-center px-[60px] lg:flex">
          <div className="flex w-[155px] shrink-0 justify-start" onMouseEnter={() => intent(null, 0)}>
            <Wordmark />
          </div>
          <nav aria-label="Main" className="flex flex-1 justify-center">
            {before.map(navItem)}
            <Link href={QUIZ.href} data-track={QUIZ.track} onMouseEnter={() => intent(null, 0)} className="type-nav relative flex h-[60px] items-center whitespace-nowrap px-4 after:absolute after:bottom-[-1px] after:left-4 after:right-4 after:h-[3px] after:bg-primary after:opacity-0 hover:after:opacity-100">
              {QUIZ.label}
            </Link>
            {explore && navItem(explore)}
          </nav>
          <div className="flex shrink-0 items-center justify-end gap-[25px]" onMouseEnter={() => intent(null, 0)}>
            <Search catalog={catalog} variant="desktop" />
            <RecentlyViewedButton catalog={catalog} />
            {bagButton}
          </div>
        </div>
        {active && (
          <div
            id={`mega-${active.key}`}
            className="absolute inset-x-0 top-full hidden bg-mega pb-[39px] pt-[37px] transition-opacity duration-200 starting:opacity-0 lg:block"
            onClick={(e) => (e.target as HTMLElement).closest("a") && close()}
          >
            <div className="flex justify-center gap-[21px]">
              {active.tiles.map((t) => (
                <MegaTile key={t.href + t.label} tile={t} track={active.track} />
              ))}
            </div>
            {active.button && (
              <div className="mt-[39px] flex justify-center">
                <Link href={active.button.href} data-track={active.track} className="btn btn--light">
                  <span>{active.button.label}</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mobile */}
        <div className="lg:hidden">
          <div className="flex h-[61px] items-center px-4">
            <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="flex h-6 w-6 shrink-0 items-center justify-center">
              <List size={24} />
            </button>
            {condensed ? (
              <div className="mx-3 flex-1">
                <Search catalog={catalog} variant="mobile" />
              </div>
            ) : (
              <>
                <Wordmark size="mobile" className="ml-4" />
                <div className="ml-auto flex items-center gap-4">
                  <RecentlyViewedButton catalog={catalog} />
                </div>
              </>
            )}
            <div className={condensed ? "" : "ml-4"}>{bagButton}</div>
          </div>
          <div className={`overflow-hidden px-4 transition-[height,padding] duration-300 ease-in-out ${condensed ? "h-0 py-0" : "h-[60px] py-3"}`}>
            {!condensed && <Search catalog={catalog} variant="mobile" />}
          </div>
        </div>
      </header>

      {active && <div aria-hidden className="fixed inset-0 z-30 hidden bg-black/80 transition-opacity duration-200 starting:opacity-0 lg:block" onClick={close} />}

      {menuOpen && (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden">
          <div className="flex h-[61px] items-center px-4">
            <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="flex h-6 w-6 items-center justify-center">
              <X size={24} />
            </button>
            <Wordmark size="mobile" className="ml-4" />
            <div className="ml-auto flex items-center gap-4">
              <RecentlyViewedButton catalog={catalog} />
              <button
                type="button"
                aria-label="Open bag"
                onClick={() => {
                  setMenuOpen(false)
                  openBag()
                }}
                className="relative flex h-6 w-6 items-center justify-center"
              >
                <Bag size={24} />
                {bagBadge}
              </button>
            </div>
          </div>
          <div className="px-4 py-3">
            <Search catalog={catalog} variant="mobile" />
          </div>
          <div className="scrollbar-none flex h-[60px] items-stretch overflow-x-auto px-[10px]">
            {panels.map((p) => (
              <button
                key={p.key}
                type="button"
                aria-pressed={tab === p.key}
                onClick={() => setTab(p.key)}
                className="flex shrink-0 items-center pl-[6px] pr-[10px] font-heading text-[11.2px] uppercase leading-[16.8px] tracking-[2.8px]"
              >
                <span className={`relative py-1 ${tab === p.key ? "after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[3px] after:bg-black" : ""}`}>{p.label}</span>
              </button>
            ))}
            <Link
              href={QUIZ.href}
              data-track={QUIZ.track}
              onClick={() => setMenuOpen(false)}
              className="flex shrink-0 items-center pl-[6px] pr-[10px] font-heading text-[11.2px] uppercase leading-[16.8px] tracking-[2.8px]"
            >
              {QUIZ.label}
            </Link>
          </div>
          {panels
            .filter((p) => p.key === tab)
            .map((p) => (
              <div key={p.key} className="bg-mega px-4 py-6" onClick={(e) => (e.target as HTMLElement).closest("a") && setMenuOpen(false)}>
                {p.tiles.length ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                    {p.tiles.map((t) => (
                      <Link key={t.href + t.label} href={t.href} data-track={p.track} className="flex flex-col items-center">
                        <span className="relative block aspect-[4/3] w-full">
                          {t.image && <Image src={t.image} alt="" fill sizes="45vw" className="cutout object-contain" />}
                        </span>
                        <span className="mt-3 text-center font-heading text-[12px] uppercase leading-[18px] tracking-[0.4px]">{t.label}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-[13px]">Nothing here right now.</p>
                )}
                {(p.button ?? (!p.tiles.length ? { label: p.label, href: p.href } : null)) && (
                  <Link href={(p.button ?? { href: p.href }).href} data-track={p.track} className="btn btn--light mt-6 w-full">
                    <span>{(p.button ?? { label: p.label }).label}</span>
                  </Link>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  )
}

function MegaTile({ tile, track }: { tile: Tile; track: string }) {
  return (
    <Link href={tile.href} data-track={track} className="group flex w-[78px] flex-col items-center">
      <span className="relative block h-[78px] w-[78px]">
        {tile.image && <Image src={tile.image} alt="" fill sizes="78px" className="cutout object-contain transition-transform duration-200 group-hover:scale-105" />}
      </span>
      <span className="w-[99px] truncate text-center font-heading text-[13px] uppercase leading-[19.5px] tracking-[0.4px]">{tile.label}</span>
    </Link>
  )
}
