"use client"

import { Eye } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useSyncExternalStore } from "react"
import type { CatalogItem } from "@/lib/catalog-items"
import { formatMoney } from "@/lib/format"
import { DrawerClose, SideDrawer } from "./cart/side-drawer"

/**
 * "Previously Viewed" (Melin's eye icon, SITE_SPEC §6.0.4): the last 12
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

/** Eye icon with a count; opens the drawer. Hidden when nothing was viewed. */
export function RecentlyViewedButton({ catalog }: { catalog: CatalogItem[] }) {
  const viewed = useViewed()
  const [open, setOpen] = useState(false)
  const items = viewed.map((h) => catalog.find((c) => c.handle === h)).filter((c): c is CatalogItem => !!c)
  if (!items.length) return null
  return (
    <>
      <button
        type="button"
        aria-label={`Previously viewed (${items.length})`}
        data-track="recently_viewed"
        onClick={() => setOpen(true)}
        className="relative flex h-6 w-6 items-center justify-center"
      >
        <Eye size={24} />
        <CountBadge count={items.length} />
      </button>
      <SideDrawer open={open} onClose={() => setOpen(false)} label="Previously viewed" className="bg-white">
        <div className="flex h-[75px] shrink-0 items-center justify-between border-b border-line px-4">
          <div className="flex items-baseline gap-3">
            <h2 className="font-heading text-[16px] leading-6">Previously Viewed</h2>
            <span className="font-body text-[13px] text-muted">
              {items.length} {items.length === 1 ? "Product" : "Products"}
            </span>
          </div>
          <DrawerClose onClose={() => setOpen(false)} />
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-4 overflow-y-auto p-4">
          {items.map((item) => (
            <MiniCard key={item.handle} item={item} />
          ))}
        </div>
      </SideDrawer>
    </>
  )
}

export function CountBadge({ count }: { count: number }) {
  if (!count) return null
  return (
    <span className="absolute -right-[6px] -top-[6px] flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-[3px] font-heading text-[10px] leading-4 text-white">
      {count}
    </span>
  )
}

/** Product card without quick add, for the viewed drawer and carousel (SITE_SPEC §6.2). */
export function MiniCard({ item, track }: { item: CatalogItem; track?: string }) {
  return (
    <Link href={`/products/${item.handle}`} className="group flex flex-col" data-track={track}>
      <span className="relative block aspect-square border-b border-line-header bg-white pb-2">
        {item.image && <Image src={item.image} alt={item.title} fill sizes="(min-width:1024px) 220px, 45vw" className="object-contain" />}
      </span>
      <span className="mt-[7px] flex items-baseline justify-between gap-2">
        <span className="line-clamp-2 type-item">{item.title}</span>
        <span className="shrink-0 font-body text-[14px] leading-[21px] tracking-[0.4px]">{formatMoney(item.price, item.currency)}</span>
      </span>
      {item.colors[0] && <span className="font-body text-[12px] capitalize leading-[18px] tracking-[0.4px] text-muted-card">{item.colors[0]}</span>}
      <span className="font-body text-[12px] capitalize leading-[18px] tracking-[0.4px] text-muted-card">{item.type}</span>
    </Link>
  )
}

/** "Previously Viewed" band on the PDP (SITE_SPEC §6.4.16 #4), excluding the current product. */
export function ViewedCarousel({ catalog, exclude }: { catalog: CatalogItem[]; exclude: string }) {
  const viewed = useViewed()
  const items = viewed
    .filter((h) => h !== exclude)
    .map((h) => catalog.find((c) => c.handle === h))
    .filter((c): c is CatalogItem => !!c)
  if (!items.length) return null
  return (
    <section className="bg-band py-[28.432px] lg:py-[50.512px]">
      <div className="container-shop">
        <h2 className="mb-[22.08px] type-section">Previously Viewed</h2>
        <div className="scrollbar-none -mx-[21.328px] flex snap-x gap-4 overflow-x-auto px-[21.328px] lg:gap-[28.432px]">
          {items.map((item) => (
            <div key={item.handle} className="w-[calc((100%-32px)/2.2)] shrink-0 snap-start lg:w-[calc((100%-3*28.432px)/4)]">
              <MiniCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
