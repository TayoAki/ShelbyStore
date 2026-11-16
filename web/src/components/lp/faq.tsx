import { Accordion } from "../accordion"

/** Questions at the decision point, as PDP accordions (SITE_SPEC §6.4.18, §12.1). */
export function Faq({ items, title = "Questions" }: { items: { q: string; a: React.ReactNode }[]; title?: string }) {
  if (!items.length) return null
  return (
    <div>
      <h2 className="mb-[22.08px] type-section">{title}</h2>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <Accordion key={item.q} title={item.q} open={i === 0}>
            {item.a}
          </Accordion>
        ))}
      </div>
    </div>
  )
}
