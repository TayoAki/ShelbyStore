"use client"

import { Eye } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useSyncExternalStore } from "react"
import type { CatalogItem } from "@/lib/catalog-items"
import { formatMoney } from "@/lib/format"
import { DrawerHead, SideDrawer } from "./cart/side-drawer"

/**
 * "Recently viewed" (SITE_SPEC v8 E.6.0.7): the last 12
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
      <button type="button" className="flex size-11 items-center justify-center" aria-label={`Recently viewed (${items.length})`} onClick={() => setOpen(true)} data-track="recently_viewed">
        <Eye size={22} />
      </button>
      <ViewedDrawer open={open} onClose={() => setOpen(false)} items={items} />
    </>
  )
}

export function ViewedDrawer({ open, onClose, items }: { open: boolean; onClose: () => void; items: CatalogItem[] }) {
  return (
    <SideDrawer open={open} onClose={onClose} label="Recently viewed" narrow>
      <DrawerHead onClose={onClose}>
        <h2 className="label !text-[14.4px]">Recently viewed</h2>
      </DrawerHead>
      {items.length ? (
        <div className="grid flex-1 grid-cols-2 content-start gap-x-1 gap-y-5 overflow-y-auto p-4">
          {items.map((i) => (
            <MiniCard key={i.key} item={i} track="recently_viewed" />
          ))}
        </div>
      ) : (
        <p className="p-4 text-[14.4px]">Caps you look at will show here, on this device only.</p>
      )}
    </SideDrawer>
  )
}

/** The bag count: an 11px/700 white number in a 16px green circle at the icon's top right. */
export function CountBadge({ count }: { count: number }) {
  return (
    <span aria-hidden className="tabular absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-green px-1 text-[11px] leading-none font-bold text-white">
      {count}
    </span>
  )
}

/** An E.5.2 card without quick add, for drawers and search results. */
export function MiniCard({ item, track, onClick }: { item: CatalogItem; track?: string; onClick?: () => void }) {
  return (
    <Link href={item.href} data-track={track} onClick={onClick} className="card flex flex-col">
      <span className="tile relative block aspect-[5/6]">
        {item.image && <Image src={item.image} alt="" fill sizes="(min-width: 750px) 260px, 45vw" className="tile-photo object-contain" />}
        {item.image2 && <Image src={item.image2} alt="" fill sizes="(min-width: 750px) 260px, 45vw" className="card-img-2 tile-photo object-contain" />}
      </span>
      <span className="flex flex-col px-2 pt-2 pb-0.5">
        <span className="card-title">{item.title}</span>
        {item.meta && <span className="meta">{item.meta}</span>}
        <span className="price-card mt-[5px]">{formatMoney(item.price, item.currency)}</span>
      </span>
    </Link>
  )
}
