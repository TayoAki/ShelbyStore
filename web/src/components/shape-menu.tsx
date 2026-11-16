"use client"

import { CaretDown } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { formatMoney } from "@/lib/format"
import type { Shape } from "@/lib/shapes"

/**
 * Desktop "Shop" menu: one cut-out tile per shape (shape-first navigation,
 * SITE_SPEC §6.0). Opens on hover, focus or click; Escape and outside clicks
 * close it.
 */
export function ShapeMenu({ shapes }: { shapes: Shape[] }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const onClick = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [open])

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div ref={root} onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="shape-menu"
        onClick={() => setOpen((o) => !o)}
        className="text-eyebrow inline-flex h-10 items-center gap-1 text-ink hover:text-ink-muted"
      >
        Shop <CaretDown size={12} weight="bold" aria-hidden className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id="shape-menu"
        hidden={!open}
        // Close after following a link (the menu lives in the persistent header).
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false)
        }}
        className="absolute inset-x-0 top-full border-b border-line bg-page shadow-[var(--shadow-overlay)]"
      >
        <div className="mx-auto flex max-w-[1440px] gap-3 px-10 py-8">
          {shapes.map((s) => (
            <Link key={s.handle} href={`/shop?shape=${s.handle}`} className="group flex w-[220px] shrink-0 flex-col gap-2" data-track="nav_shape">
              <div className="relative aspect-[4/5] overflow-hidden bg-page">
                {s.image && <Image src={s.image} alt="" fill sizes="220px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />}
              </div>
              <span className="font-display text-[22px] leading-none">{s.name}</span>
              <span className="font-mono text-[12px] text-ink-muted">
                {s.count} {s.count === 1 ? "style" : "styles"}
                {s.from !== null && ` · from ${formatMoney(s.from, s.currency)}`}
              </span>
            </Link>
          ))}
          <div className="flex flex-1 flex-col justify-end gap-3 pl-6">
            <Link href="/shop" className="whitespace-nowrap font-display text-[28px] leading-none hover:text-ink-muted">
              Shop all hats →
            </Link>
            <Link href="/fit-guide" className="text-[14px] underline underline-offset-4 hover:text-ink-muted" data-track="fit_guide">
              Not sure about fit? Read the fit guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
