"use client"

import { Plus } from "@phosphor-icons/react"
import { useState, type ReactNode } from "react"

/** A footer column: heading + links on desktop, an accordion on mobile (M19). */
export function FooterColumn({ heading, children }: { heading: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/20 md:border-0">
      <p className="mb-8 hidden font-mono text-xs leading-4 tracking-[.05em] uppercase md:block">{heading}</p>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 font-mono text-xs leading-4 tracking-[.05em] uppercase md:hidden">
        {heading}
        <Plus size={16} className={`transition-transform duration-300 ease-[var(--ease-power3-in-out)] ${open ? "rotate-45" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-[var(--ease-power3-in-out)] md:block ${open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden md:overflow-visible">{children}</div>
      </div>
    </div>
  )
}
