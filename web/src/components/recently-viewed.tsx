"use client"

import { Eye } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useSyncExternalStore } from "react"
import type { CatalogItem } from "@/lib/catalog-items"
import { formatMoney } from "@/lib/format"
import { DrawerClose, SideDrawer } from "./cart/side-drawer"

/**
 * "Previously Viewed" (SITE_SPEC §6.0.4): the last 12
 * product handles in localStorage, local to this browser only. Storage can be
 * missing (private mode, previews), so every read and write is guarded.
 */
const KEY = "shelby.viewed"
const EVENT = "shelby:viewed"
const MAX = 12

let cacheRaw: string | null = null
let cacheList: string[] = []

function read(): string[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEY)
  } catch {
    raw = null
  }
  if (raw === cacheRaw) return cacheList
  cacheRaw = raw
  try {
    const parsed = raw ? JSON.parse(raw) : []
    cacheList = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX) : []
  } catch {
    cacheList = []
  }
  return cacheList
}

const EMPTY: string[] = []

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(EVENT, onChange)
  }
}

export function useViewed(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

/** Records a PDP view (renders nothing). */
export function RecordView({ handle }: { handle: string }) {
  useEffect(() => {
    try {
      const next = [handle, ...read().filter((h) => h !== handle)].slice(0, MAX)
      window.localStorage.setItem(KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(EVENT))
    } catch {
      /* storage unavailable: the feature simply stays empty */
    }
  }, [handle])
  return null
}

/** Unique items (one per product) for the viewed handles, newest first. */
export function viewedItems(catalog: CatalogItem[], handles: string[]): CatalogItem[] {
  return handles.map((h) => catalog.find((i) => i.handle === h)).filter((i): i is CatalogItem => !!i)
}

/** Eye icon with a count (hidden when empty); opens the Previously Viewed drawer. */
export function RecentlyViewedButton({ catalog }: { catalog: CatalogItem[] }) {
  const handles = useViewed()
  const items = viewedItems(catalog, handles)
  const [open, setOpen] = useState(false)
  if (!items.length) return null
  return (
    <>
      <button type="button" className="relative flex size-6 items-center justify-center" aria-label={`Previously viewed (${items.length})`} onClick={() => setOpen(true)} data-track="recently_viewed">
        <Eye size={24} />
        <CountBadge count={items.length} />
      </button>
      <ViewedDrawer open={open} onClose={() => setOpen(false)} items={items} />
    </>
  )
}

export function ViewedDrawer({ open, onClose, items }: { open: boolean; onClose: () => void; items: CatalogItem[] }) {
  return (
    <SideDrawer open={open} onClose={onClose} label="Previously viewed">
      <div className="flex items-center justify-between border-b border-natural-white px-5 py-4">
        <p className="text-xs leading-4 font-medium uppercase">Previously viewed ({items.length})</p>
        <DrawerClose onClose={onClose} />
      </div>
      <div className="grid flex-1 grid-cols-2 content-start gap-2.5 overflow-y-auto p-5">
        {items.map((i) => (
          <MiniCard key={i.key} item={i} track="recently_viewed" />
        ))}
      </div>
    </SideDrawer>
  )
}

/** Count badge on header icons (§6.0.2): hidden at 0, M32 fade. */
export function CountBadge({ count }: { count: number }) {
  return (
    <span
      aria-hidden
      className={`absolute top-2.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-black text-[9px] font-medium text-white transition-opacity duration-50 ease-[var(--ease-sine-in)] ${count ? "opacity-100" : "opacity-0"}`}
    >
      {count}
    </span>
  )
}

/** A small product card (no quick add) for drawers. */
export function MiniCard({ item, track }: { item: CatalogItem; track?: string }) {
  return (
    <Link href={item.href} data-track={track} className="group flex flex-col overflow-hidden rounded-2xl bg-white">
      <span className="relative aspect-square">
        {item.image && <Image src={item.image} alt="" fill sizes="200px" className="object-contain" />}
      </span>
      <span className="flex flex-col gap-0.5 p-3">
        <span className="text-xs leading-4 font-medium tracking-[.05em] uppercase">{item.title}</span>
        <span className="text-xs leading-4 text-light-charcoal">{item.meta}</span>
        <span className="text-xs leading-4 font-medium">{formatMoney(item.price, item.currency)}</span>
      </span>
    </Link>
  )
}
