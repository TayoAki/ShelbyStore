"use client"

import { MagnifyingGlass } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { CatalogItem } from "@/lib/catalog-items"
import { formatMoney } from "@/lib/format"

const PLACEHOLDERS = ["Search", 'Search "navy"', 'Search "pine"', 'Search "pair"', 'Search "azalea"']

export function searchCatalog(catalog: CatalogItem[], term: string): CatalogItem[] {
  const q = term.trim().toLowerCase()
  if (!q) return []
  const words = q.split(/\s+/)
  return catalog.filter((i) => words.every((w) => i.terms.toLowerCase().includes(w) || i.meta.toLowerCase().includes(w)))
}

/**
 * The search dropdown body (SITE_SPEC §6.0.5, G.6.1): pill input with a
 * rotating placeholder, an inline SEARCH button, up to 6 results.
 */
export function SearchPanel({ catalog, onNavigate }: { catalog: CatalogItem[]; onNavigate: () => void }) {
  const [term, setTerm] = useState("")
  const [ph, setPh] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setPh((n) => (n + 1) % PLACEHOLDERS.length), 2000)
    return () => clearInterval(id)
  }, [])
  const results = useMemo(() => searchCatalog(catalog, term).slice(0, 6), [catalog, term])

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-5">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <MagnifyingGlass size={20} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" aria-hidden />
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={PLACEHOLDERS[ph]}
          aria-label="Search The Rope Cap"
          className="w-full rounded-full border border-black bg-white py-2.5 pr-24 pl-10 text-base"
        />
        <button type="submit" className="btn btn-outline-black btn-small absolute top-1/2 right-1 -translate-y-1/2" data-track="search_submit">
          SEARCH
        </button>
      </form>
      {term.trim() && (
        <div className="flex flex-col">
          {results.length ? (
            results.map((r) => (
              <Link key={r.key} href={r.href} onClick={onNavigate} data-track="search_result" className="flex items-center gap-4 rounded-xl p-2 hover:bg-natural-white-25">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white">
                  {r.image && <Image src={r.image} alt="" fill sizes="56px" className="object-contain" />}
                </span>
                <span className="flex flex-col">
                  <span className="text-xs leading-4 font-medium tracking-[.05em] uppercase">{r.title}</span>
                  <span className="text-xs leading-4 text-light-charcoal">
                    {[r.meta, formatMoney(r.price, r.currency)].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </Link>
            ))
          ) : (
            <p className="text-sm">No caps match &ldquo;{term}&rdquo;</p>
          )}
          {results.length > 0 && (
            <Link href="/shop" onClick={onNavigate} className="link mt-2 text-xs">
              View all results
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
