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
      <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
        <p className="panel-title !text-[1.75rem]">Previously viewed</p>
        <DrawerClose onClose={onClose} />
      </div>
      <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-5">
        {items.map((i) => (
          <MiniCard key={i.key} item={i} track="recently_viewed" />
        ))}
      </div>
    </SideDrawer>
  )
}

/** Count on header icons, printed in digit slots. */
export function CountBadge({ count }: { count: number }) {
  return (
    <span
      aria-hidden
      className="digits digits-cells ml-1 text-[13px]"
    >
      {String(count).split("").map((d, i) => (
        <span key={i}>{d}</span>
      ))}
    </span>
  )
}

/** A small product card (no quick add) for drawers. */
export function MiniCard({ item, track }: { item: CatalogItem; track?: string }) {
  return (
    <Link href={item.href} data-track={track} className="group flex flex-col overflow-hidden rounded-[4px] border-2 border-ink bg-paper">
      <span className="relative aspect-square border-b-2 border-ink">
        {item.image && <Image src={item.image} alt="" fill sizes="200px" className="object-contain" />}
      </span>
      <span className="flex flex-col gap-0.5 p-3">
        <span className="label">{item.title}</span>
        <span className="text-[0.9375rem] leading-5 text-ink-2">{item.meta}</span>
        <span className="text-[1rem] leading-6 font-semibold tabular-nums">{formatMoney(item.price, item.currency)}</span>
      </span>
    </Link>
  )
}
