/** Questions a buyer plausibly has at the decision point (SITE_SPEC §12.1.6). */
export function Faq({ items, title = "Questions" }: { items: { q: string; a: React.ReactNode }[]; title?: string }) {
  if (!items.length) return null
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-section">{title}</h2>
      <div className="border-t border-line">
        {items.map((item, i) => (
          <details key={item.q} open={i === 0} className="group border-b border-line">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[16px] font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden className="text-xl leading-none transition-transform duration-150 group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="pb-5 text-[15px] leading-relaxed text-ink-muted">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  )
}
