"use client"

import { CaretDown, Minus, Plus, Sliders } from "@phosphor-icons/react"
import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import { SideDrawer, DrawerHead } from "../cart/side-drawer"
import { SwatchFace } from "../swatch"

export type ShopItem = { key: string; colors: string[]; price: number | null; date: string | null; order: number; node: ReactNode }
type Sort = "featured" | "price-asc" | "price-desc" | "date"

const SORTS: { key: Sort; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price, low to high" },
  { key: "price-desc", label: "Price, high to low" },
  { key: "date", label: "Release date" },
]

/**
 * Eastside's collection body (SITE_SPEC v8 E.6.2 §2–4): the filter bar
 * ("Hide filters" and "Sort by"), a 206px sidebar with the Group options
 * (today's `?group=` links, `color_pill`) and Color checkboxes that filter the
 * list client-side, and the 4-column grid (2 on mobile). On mobile the
 * sidebar opens as a left drawer.
 */
export function ShopBrowser({ items, groups, group, colors }: { items: ShopItem[]; groups: { key: string; label: string; href: string }[]; group: string; colors: string[] }) {
  const [open, setOpen] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [sort, setSort] = useState<Sort>("featured")
  const [sortOpen, setSortOpen] = useState(false)
  const [picked, setPicked] = useState<string[]>([])

  const shown = useMemo(() => {
    const list = items.filter((i) => !picked.length || i.colors.some((c) => picked.includes(c)))
    const by: Record<Sort, (a: ShopItem, b: ShopItem) => number> = {
      featured: (a, b) => a.order - b.order,
      "price-asc": (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      "price-desc": (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
      date: (a, b) => (b.date ?? "").localeCompare(a.date ?? ""),
    }
    return list.slice().sort(by[sort])
  }, [items, picked, sort])

  const toggle = (c: string) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))
  const filters = <Filters groups={groups} group={group} colors={colors} picked={picked} toggle={toggle} />

  return (
    <>
      <div className="mt-6 flex h-14 items-center justify-between border-y border-border md:h-[62px]">
        <button
          type="button"
          className="flex h-full items-center gap-2 px-4 text-[14.4px] uppercase md:px-[50px]"
          aria-expanded={open}
          onClick={() => {
            if (window.matchMedia("(min-width: 750px)").matches) setOpen((o) => !o)
            else setDrawer(true)
          }}
        >
          <Sliders size={14} aria-hidden />
          <span className="md:hidden">Filters</span>
          <span className="hidden md:inline">{open ? "Hide filters" : "Show filters"}</span>
          <CaretDown size={12} aria-hidden className={`hidden transition-transform duration-300 ease-[var(--ease-theme)] md:inline ${open ? "rotate-180" : ""}`} />
        </button>
        <div className="relative h-full">
          <button type="button" aria-expanded={sortOpen} aria-haspopup="listbox" className="flex h-full items-center gap-2 px-4 text-[14.4px] uppercase md:px-[50px]" onClick={() => setSortOpen((o) => !o)}>
            Sort by <CaretDown size={12} aria-hidden className={`transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          {sortOpen && (
            <ul role="listbox" aria-label="Sort by" className="absolute top-full right-4 z-20 w-56 border border-border bg-bg py-2 shadow-[var(--shadow-drawer)] md:right-[50px]">
              {SORTS.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sort === s.key}
                    className={`flex min-h-11 w-full items-center px-4 text-left text-[14.4px] hover:bg-bg-brighter ${sort === s.key ? "font-medium" : ""}`}
                    onClick={() => {
                      setSort(s.key)
                      setSortOpen(false)
                    }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={`mt-6 md:grid md:items-start ${open ? "md:grid-cols-[206px_minmax(0,1fr)] md:gap-16 md:pl-[50px]" : ""}`}>
        {open && <aside className="hidden md:block">{filters}</aside>}
        <div className="px-[10px] md:px-0 md:pr-[50px]">
          {shown.length ? (
            <ul className={`grid grid-cols-2 gap-x-[10px] gap-y-8 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] lg:grid-cols-4 ${open ? "" : "md:pl-[50px]"}`}>
              {shown.map((i) => (
                <li key={i.key}>{i.node}</li>
              ))}
            </ul>
          ) : (
            <p className="py-12 text-center text-[14.4px]">
              Nothing in that color here.{" "}
              <button type="button" className="link" onClick={() => setPicked([])}>
                Clear filters
              </button>
            </p>
          )}
        </div>
      </div>

      <SideDrawer open={drawer} onClose={() => setDrawer(false)} label="Filters" side="left">
        <DrawerHead onClose={() => setDrawer(false)}>
          <h2 className="label !text-[14.4px]">Filters</h2>
        </DrawerHead>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{filters}</div>
        <div className="border-t border-border p-4">
          <button type="button" className="btn btn-charcoal btn-block" onClick={() => setDrawer(false)}>
            Show {shown.length} {shown.length === 1 ? "result" : "results"}
          </button>
        </div>
      </SideDrawer>
    </>
  )
}

function Filters({ groups, group, colors, picked, toggle }: { groups: { key: string; label: string; href: string }[]; group: string; colors: string[]; picked: string[]; toggle: (c: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <FilterGroup title="Group">
        <ul>
          {groups.map((g) => (
            <li key={g.key}>
              <Link href={g.href} data-track="color_pill" aria-current={group === g.key ? "true" : undefined} className="flex min-h-8 items-center gap-1.5 text-[12px] [@media(pointer:coarse)]:min-h-11">
                <span className={`flex size-4 items-center justify-center rounded-[2px] border ${group === g.key ? "border-green bg-green" : "border-field-border"}`} aria-hidden>
                  {group === g.key && (
                    <svg viewBox="0 0 10 10" className="size-2.5 text-white">
                      <path d="M1.5 5.2 4 7.5 8.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  )}
                </span>
                {g.label}
              </Link>
            </li>
          ))}
        </ul>
      </FilterGroup>
      <FilterGroup title="Color">
        <ul>
          {colors.map((c) => (
            <li key={c}>
              <label className="flex min-h-8 cursor-pointer items-center gap-1.5 text-[12px] [@media(pointer:coarse)]:min-h-11">
                <input type="checkbox" className="check" checked={picked.includes(c)} onChange={() => toggle(c)} />
                <SwatchFace name={c} size={12} />
                {c}
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex min-h-11 w-full items-center justify-between text-[14.4px] font-medium uppercase">
        {title}
        {open ? <Minus size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
      </button>
      {open && children}
    </div>
  )
}
