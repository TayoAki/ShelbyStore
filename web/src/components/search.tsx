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
 * The search body that folds down from the top flap: a keylined field with a
 * rotating placeholder, an inline Search button, up to 6 results.
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
          className="field !pr-28 !pl-10"
        />
        <button type="submit" className="btn btn-outline-black btn-small absolute top-1/2 right-1 -translate-y-1/2" data-track="search_submit">
          Search
        </button>
      </form>
      {term.trim() && (
        <div className="flex flex-col">
          {results.length ? (
            results.map((r) => (
              <Link key={r.key} href={r.href} onClick={onNavigate} data-track="search_result" className="flex min-h-16 items-center gap-4 border-b-2 border-dashed border-ink/25 py-2 last:border-b-0 hover:bg-board">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-[4px] border-2 border-ink bg-paper">
                  {r.image && <Image src={r.image} alt="" fill sizes="56px" className="object-contain" />}
                </span>
                <span className="flex flex-col">
                  <span className="label">{r.title}</span>
                  <span className="text-[0.9375rem] leading-5 text-ink-2">
                    {[r.meta, formatMoney(r.price, r.currency)].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </Link>
            ))
          ) : (
            <p className="text-[1rem]">No caps match &ldquo;{term}&rdquo;</p>
          )}
          {results.length > 0 && (
            <Link href="/shop" onClick={onNavigate} className="link mt-3 min-h-11 text-[1rem]">
              View all results
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
