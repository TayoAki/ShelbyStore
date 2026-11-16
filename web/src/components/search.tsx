"use client"

import { MagnifyingGlass, X } from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import type { CatalogItem } from "@/lib/catalog-items"
import { MiniCard } from "./recently-viewed"

export function searchCatalog(catalog: CatalogItem[], term: string): CatalogItem[] {
  const q = term.trim().toLowerCase()
  if (!q) return []
  const words = q.split(/\s+/)
  return catalog.filter((i) => words.every((w) => i.terms.toLowerCase().includes(w) || i.meta.toLowerCase().includes(w)))
}

/**
 * Eastside's search popdown (SITE_SPEC v8 E.6.0.5): a 47px borderless input
 * with a leading magnifier (the submit) and a trailing "Clear", then the
 * results as product cards in a 4-column grid (2 on mobile).
 */
export function SearchPanel({ catalog, onNavigate, onClose }: { catalog: CatalogItem[]; onNavigate: () => void; onClose?: () => void }) {
  const [term, setTerm] = useState("")
  const results = useMemo(() => searchCatalog(catalog, term).slice(0, 8), [catalog, term])

  return (
    <div className="flex w-full flex-col">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="wrap flex h-[47px] items-center gap-2 border-b border-border">
        <button type="submit" aria-label="Search" className="-ml-3 flex size-11 shrink-0 items-center justify-center" data-track="search_submit">
          <MagnifyingGlass size={20} />
        </button>
        <input
          autoFocus
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search"
          aria-label="Search The Rope Cap"
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] font-medium tracking-[0.025em] outline-none placeholder:text-text-light md:text-[14.4px] [&::-webkit-search-cancel-button]:hidden"
        />
        {term && (
          <button type="button" className="micro min-h-11 px-2" onClick={() => setTerm("")}>
            Clear
          </button>
        )}
        {onClose && (
          <button type="button" aria-label="Close search" className="drawer-close -mr-3" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </form>
      {term.trim() && (
        <div className="wrap py-6">
          {results.length ? (
            <ul className="grid grid-cols-2 gap-x-[10px] gap-y-6 md:grid-cols-4">
              {results.map((r) => (
                <li key={r.key}>
                  <MiniCard item={r} track="search_result" onClick={onNavigate} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14.4px]">No caps match &ldquo;{term}&rdquo;.</p>
          )}
        </div>
      )}
    </div>
  )
}
