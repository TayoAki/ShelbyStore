"use client"

import { CaretDown, CaretUp, SlidersHorizontal, X } from "@phosphor-icons/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { SwatchDot } from "./swatch"

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low To High" },
  { value: "price-desc", label: "Price: High To Low" },
  { value: "newest", label: "Newest" },
] as const

type Facets = { sizes: string[]; colors: string[]; shapes: { handle: string; name: string }[] }
type Key = "size" | "color" | "shape"

/** Comma-separated (and repeated) multi-select params, e.g. ?size=S/M,L/XL. */
export function readList(params: URLSearchParams, key: string): string[] {
  return params
    .getAll(key)
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean)
}

function useFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const go = (next: URLSearchParams) => startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }))
  const selected = { size: readList(params, "size"), color: readList(params, "color"), shape: readList(params, "shape") }
  const toggle = (key: Key, value: string) => {
    const next = new URLSearchParams(params)
    const list = selected[key]
    const values = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    next.delete(key)
    if (values.length) next.set(key, values.join(","))
    go(next)
  }
  const sort = params.get("sort") ?? "featured"
  const setSort = (value: string) => {
    const next = new URLSearchParams(params)
    if (value === "featured") next.delete("sort")
    else next.set("sort", value)
    go(next)
  }
  const clear = () => {
    const next = new URLSearchParams()
    if (params.get("q")) next.set("q", params.get("q")!)
    go(next)
  }
  return { selected, toggle, sort, setSort, clear, pending }
}

/** Desktop sidebar (SITE_SPEC §6.3): the sort pill, then Size, Color and Shape accordions. */
export function FilterSidebar({ facets }: { facets: Facets }) {
  const f = useFilters()
  return (
    <aside className="flex flex-col gap-8" aria-busy={f.pending || undefined}>
      <SortControl value={f.sort} onChange={f.setSort} />
      <FacetGroups facets={facets} f={f} />
    </aside>
  )
}

function SortControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const label = SORTS.find((s) => s.value === value)?.label ?? "Featured"
  return (
    <label className="relative flex h-[34px] w-[189px] items-center rounded-sort border border-tertiary pl-3 pr-3 font-system text-[14.08px]">
      <span className="text-muted">Sort By</span>
      <span className="mx-1 text-muted">|</span>
      <span className="flex-1 truncate">{label}</span>
      <CaretDown size={12} aria-hidden />
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Sort by" className="absolute inset-0 cursor-pointer opacity-0">
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function FacetGroups({ facets, f }: { facets: Facets; f: ReturnType<typeof useFilters> }) {
  return (
    <div className="flex flex-col">
      {facets.sizes.length > 0 && (
        <Facet title="Size">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => {
              const on = f.selected.size.includes(s)
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => f.toggle("size", s)}
                  className={`flex h-[45px] min-w-[45px] items-center justify-center rounded-button border px-1 text-center font-body text-[12px] leading-[14px] ${
                    on ? "border-black bg-black text-white" : "border-tertiary hover:border-black"
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </Facet>
      )}
      {facets.colors.length > 0 && (
        <Facet title="Color">
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {facets.colors.map((c) => {
              const on = f.selected.color.includes(c)
              return (
                <button key={c} type="button" aria-pressed={on} onClick={() => f.toggle("color", c)} className="flex flex-col items-center gap-1">
                  <SwatchDot name={c} size={32} selected={on} />
                  <span className="text-center font-body text-[12px] leading-[18px]">{c}</span>
                </button>
              )
            })}
          </div>
        </Facet>
      )}
      {facets.shapes.length > 0 && (
        <Facet title="Shape">
          <ul className="flex flex-col gap-3">
            {facets.shapes.map((s) => {
              const on = f.selected.shape.includes(s.handle)
              return (
                <li key={s.handle}>
                  <label className="flex cursor-pointer items-center gap-3 font-body text-[14px]">
                    <input type="checkbox" checked={on} onChange={() => f.toggle("shape", s.handle)} className="peer sr-only" />
                    <span
                      aria-hidden
                      className={`flex h-4 w-4 items-center justify-center rounded-[2px] border border-black peer-focus-visible:outline peer-focus-visible:outline-2 ${on ? "bg-black" : "bg-white"}`}
                    >
                      {on && (
                        <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" aria-hidden>
                          <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                      )}
                    </span>
                    {s.name}
                  </label>
                </li>
              )
            })}
          </ul>
        </Facet>
      )}
    </div>
  )
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-tertiary">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-10 w-full items-center justify-between font-heading text-[14px] uppercase tracking-[1.4px]">
        {title}
        {open ? <CaretUp size={14} /> : <CaretDown size={14} />}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

/** Mobile: a "Filter + Sort" pill and the result count, opening a full-screen drawer. */
export function MobileFilterBar({ facets, count }: { facets: Facets; count: number }) {
  const f = useFilters()
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center justify-between lg:hidden">
      <button type="button" onClick={() => setOpen(true)} className="btn btn--action px-4">
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={14} aria-hidden /> Filter + Sort
        </span>
      </button>
      <span className="font-body text-[13px] text-muted">
        {count} {count === 1 ? "Result" : "Results"}
      </span>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Filter and sort" className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex h-14 shrink-0 items-center justify-between bg-tile px-4">
            <h2 className="font-heading text-[14px] uppercase tracking-[1.4px]">Filter + Sort</h2>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <fieldset className="mb-4 border-b border-tertiary pb-4">
              <legend className="mb-2 font-heading text-[14px] uppercase tracking-[1.4px]">Sort</legend>
              {SORTS.map((s) => (
                <label key={s.value} className="flex h-10 items-center gap-3 font-body text-[14px]">
                  <input type="radio" name="sort" checked={f.sort === s.value} onChange={() => f.setSort(s.value)} className="accent-black" />
                  {s.label}
                </label>
              ))}
            </fieldset>
            <FacetGroups facets={facets} f={f} />
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-tertiary p-4">
            <button type="button" className="btn btn--light" onClick={f.clear}>
              <span>Clear</span>
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setOpen(false)}>
              <span>View {count} Results</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
