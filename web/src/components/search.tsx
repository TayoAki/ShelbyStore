"use client"

import { MagnifyingGlass } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { track } from "@/lib/analytics"
import type { CatalogItem } from "@/lib/catalog-items"
import { formatMoney } from "@/lib/format"

const PLACEHOLDERS = ["Search", 'Search "cap"', 'Search "beanie"', 'Search "trucker"', 'Search "olive"']

/** Case-insensitive match on title, shape and colour names. */
export function searchCatalog(catalog: CatalogItem[], term: string): CatalogItem[] {
  const q = term.trim().toLowerCase()
  if (!q) return []
  return catalog.filter((c) =>
    [c.title, c.shape ?? "", c.type, ...c.colors].some((field) => field.toLowerCase().includes(q))
  )
}

/**
 * Header search (SITE_SPEC §6.0.5): a pill input whose placeholder rotates
 * every 2s, filtering the catalog client-side. Enter goes to /shop?q=.
 * `desktop`: 197px block, 153×30 input, results 420px right-aligned.
 * `mobile`: full-width 36px pill, results full width under the header.
 */
export function Search({ catalog, variant }: { catalog: CatalogItem[]; variant: "desktop" | "mobile" }) {
  const router = useRouter()
  const [term, setTerm] = useState("")
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [tick, setTick] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const results = useMemo(() => searchCatalog(catalog, term).slice(0, 6), [catalog, term])

  useEffect(() => {
    if (focused || term) return
    const id = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(id)
  }, [focused, term])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const submit = () => {
    const q = term.trim()
    if (!q) return
    track("search_submit", { term: q })
    setOpen(false)
    router.push(`/shop?q=${encodeURIComponent(q)}`)
  }

  const desktop = variant === "desktop"
  return (
    <div ref={root} className={desktop ? "relative flex w-[197px] justify-end" : "w-full"}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className={`relative ${desktop ? "w-[153px]" : "w-full"}`}
      >
        <MagnifyingGlass
          size={desktop ? 12 : 14}
          aria-hidden
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-black ${desktop ? "left-[10px]" : "left-3"}`}
        />
        <input
          type="search"
          value={term}
          aria-label="Search hats"
          placeholder={PLACEHOLDERS[tick % PLACEHOLDERS.length]}
          onChange={(e) => {
            setTerm(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            setFocused(true)
            setOpen(true)
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className={`w-full rounded-full bg-band font-system text-black placeholder:text-black/60 focus:outline focus:outline-1 focus:outline-black [&::-webkit-search-cancel-button]:hidden ${
            desktop ? "h-[30px] py-[6px] pl-[28px] pr-[6px] text-[12px] leading-[18px]" : "h-9 pl-8 pr-3 text-[16px] leading-6"
          }`}
        />
      </form>
      {open && term.trim() && (
        <div
          className={`z-50 bg-white p-4 shadow-sticky ${
            desktop ? "absolute right-0 top-[calc(100%+15px)] w-[420px]" : "absolute inset-x-0 top-full"
          }`}
        >
          {results.length ? (
            <ul className="flex flex-col gap-2">
              {results.map((r) => (
                <li key={r.handle}>
                  <Link
                    href={`/products/${r.handle}`}
                    data-track="search_result"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 hover:bg-band"
                  >
                    <span className="relative h-14 w-14 shrink-0 bg-white">
                      {r.image && <Image src={r.image} alt="" fill sizes="56px" className="object-contain" />}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-heading text-[14px] leading-[21px]">{r.title}</span>
                      <span className="font-body text-[12px] leading-[18px] text-muted-card">
                        {r.colors.length} {r.colors.length === 1 ? "Color" : "Colors"} · {formatMoney(r.price, r.currency)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body text-[13px]">No hats match &ldquo;{term.trim()}&rdquo;</p>
          )}
          <Link
            href={`/shop?q=${encodeURIComponent(term.trim())}`}
            onClick={() => setOpen(false)}
            data-track="search_submit"
            className="btn btn--link mt-3"
          >
            <span>View All Results</span>
          </Link>
        </div>
      )}
    </div>
  )
}
