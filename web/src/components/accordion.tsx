import { Plus } from "@phosphor-icons/react/dist/ssr"
import type { ReactNode } from "react"

/**
 * Eastside's accordion row (SITE_SPEC v8 E.5.6): a native details/summary,
 * 18px/500 capitalised summary, a #F0F0F0 rule under each row, a plus that
 * turns 45° when open (M15). `tone="ink"` is the mobile footer version.
 */
export function Accordion({ title, children, open = false, id, tone = "light", className = "" }: { title: string; children: ReactNode; open?: boolean; id?: string; tone?: "light" | "ink"; className?: string }) {
  if (tone === "ink")
    return (
      <details id={id} open={open} className={`accordion !border-white/15 ${className}`}>
        <summary className="!min-h-11 !py-3 !text-[12.6px] !font-bold !uppercase !text-white">
          {title}
          <Plus size={16} className="icon-plus text-on-ink" aria-hidden />
        </summary>
        <div className="accordion-body">{children}</div>
      </details>
    )
  return (
    <details id={id} open={open} className={`accordion ${className}`}>
      <summary>
        {title}
        <Plus size={16} className="icon-plus" aria-hidden />
      </summary>
      <div className="accordion-body text-[14.4px] leading-[19.73px]">{children}</div>
    </details>
  )
}

/**
 * Eastside's collection FAQ block (E.6.2 §5): a Montserrat 26px heading over
 * accordion rows with Montserrat 16px questions.
 */
export function Faq({ items, title = "Frequently asked questions" }: { items: { q: string; a: ReactNode }[]; title?: string }) {
  return (
    <section aria-labelledby="faq-title" className="wrap mx-auto max-w-[1116px] py-12 md:py-16">
      <h2 id="faq-title" className="font-heading text-[26px] leading-[31.2px] font-bold">
        {title}
      </h2>
      <div className="mt-6 border-t border-border">
        {items.map((i) => (
          <details key={i.q} className="accordion">
            <summary className="faq-q !text-[16px] !normal-case">
              {i.q}
              <Plus size={16} className="icon-plus" aria-hidden />
            </summary>
            <div className="accordion-body text-[14.4px] leading-[19.73px]">{i.a}</div>
          </details>
        ))}
      </div>
    </section>
  )
}
