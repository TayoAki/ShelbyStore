"use client"

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react"

/**
 * Eastside's `collections-tabs` (SITE_SPEC v8 E.5.5, E.6.1 §3): a rail title
 * with tabs that swap the rail below without navigation. Desktop: a 300px
 * left column (title, tabs stacked at a 12px gap) vertically centred on the
 * cards. Mobile: the title, then a sideways tab row, then the rail.
 * Arrow keys move between tabs (roving tabindex); Home and End jump to the ends.
 */
export function TabsRail({ id, title, tabs }: { id: string; title: string; tabs: { key: string; label: string; panel: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key)
  const list = useRef<HTMLDivElement>(null)
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = tabs.length - 1
    const to = e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % tabs.length : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i - 1 + tabs.length) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? last : -1
    if (to < 0) return
    e.preventDefault()
    setActive(tabs[to].key)
    ;(list.current?.children[to] as HTMLElement | undefined)?.focus()
  }
  return (
    <section aria-labelledby={`${id}-title`} className="py-10 md:py-16">
      <div className="md:grid md:grid-cols-[300px_minmax(0,1fr)] md:items-center">
        <div className="px-3 md:pr-10 md:pl-[50px]">
          <h2 id={`${id}-title`} className="display-lg">
            {title}
          </h2>
          <div ref={list} role="tablist" aria-label={title} className="mt-[11px] flex gap-2 overflow-x-auto pb-1 md:flex-col md:items-start md:gap-3 md:overflow-visible">
            {tabs.map((t, i) => (
              <button
                key={t.key}
                id={`${id}-tab-${t.key}`}
                type="button"
                role="tab"
                aria-selected={active === t.key}
                aria-controls={`${id}-panel-${t.key}`}
                tabIndex={active === t.key ? 0 : -1}
                onClick={() => setActive(t.key)}
                onKeyDown={(e) => onKey(e, i)}
                className="tab shrink-0"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 min-w-0 md:mt-0">
          {tabs.map((t) => (
            <div key={t.key} id={`${id}-panel-${t.key}`} role="tabpanel" aria-labelledby={`${id}-tab-${t.key}`} hidden={active !== t.key}>
              {t.panel}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
