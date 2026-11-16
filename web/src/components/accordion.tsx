"use client"

import { Plus } from "@phosphor-icons/react"
import { useState, type ReactNode } from "react"

/** One FAQ / details row (v5 §6.10 FAQ): uppercase question, a Plus that turns 45° (M19). */
export function Accordion({ title, children, open = false, id }: { title: string; children: ReactNode; open?: boolean; id?: string }) {
  const [isOpen, setOpen] = useState(open)
  return (
    <div id={id} className="border-b border-natural-white-60 py-5">
      <button type="button" aria-expanded={isOpen} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 text-left text-sm leading-5 font-medium uppercase">
        {title}
        <Plus size={16} className={`shrink-0 transition-transform duration-300 ease-[var(--ease-power3-in-out)] ${isOpen ? "rotate-45" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-[var(--ease-power3-in-out)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="pt-3 text-sm leading-[22px] text-charcoal">{children}</div>
        </div>
      </div>
    </div>
  )
}

/** A white FAQ card of Accordion rows. */
export function Faq({ items, title = "Questions" }: { items: { q: string; a: ReactNode }[]; title?: string }) {
  return (
    <section aria-label={title} className="mx-2.5 my-10 rounded-3xl bg-white px-6 py-4 md:px-10">
      <h2 className="pt-4 font-mono text-xs leading-4 tracking-[.1em] uppercase">{title}</h2>
      {items.map((i) => (
        <Accordion key={i.q} title={i.q}>
          {i.a}
        </Accordion>
      ))}
    </section>
  )
}
