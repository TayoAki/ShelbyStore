"use client"

import { Plus } from "@phosphor-icons/react"
import { useState, type ReactNode } from "react"

/** One FAQ row: a printed question, a plus that turns to a cross, the answer folding open on the shared beat. */
export function Accordion({ title, children, open = false, id }: { title: string; children: ReactNode; open?: boolean; id?: string }) {
  const [isOpen, setOpen] = useState(open)
  return (
    <div id={id} className="border-ink [&+&]:border-t-2">
      <button type="button" aria-expanded={isOpen} onClick={() => setOpen((o) => !o)} className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left font-label text-[1.0625rem] font-[700] tracking-[.03em] uppercase">
        {title}
        <Plus size={20} weight="bold" className={`shrink-0 transition-transform duration-[420ms] ease-[var(--ease-box)] ${isOpen ? "rotate-45" : ""}`} aria-hidden />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-[420ms] ease-[var(--ease-box)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-[1.0625rem] leading-7 text-ink-2">{children}</div>
        </div>
      </div>
    </div>
  )
}

/** The FAQ as one keylined block on a panel. */
export function Faq({ items, title = "Questions" }: { items: { q: string; a: ReactNode }[]; title?: string }) {
  return (
    <section aria-labelledby="faq-title" className="panel">
      <div className="relative flex flex-col gap-5 p-[var(--panel-pad)]">
        <h2 id="faq-title" className="panel-title">
          {title}
        </h2>
        <div className="border-2 border-ink">
          {items.map((i) => (
            <Accordion key={i.q} title={i.q}>
              {i.a}
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  )
}
