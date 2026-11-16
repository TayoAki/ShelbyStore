import { Plus } from "@phosphor-icons/react/dist/ssr"
import type { ReactNode } from "react"

/**
 * Melin's PDP accordion (SITE_SPEC §6.4.18): 1px #e4e4e4 borders, a 48px
 * summary in heading 14px UPPERCASE with a Plus that turns 45° when open.
 */
export function Accordion({ title, children, open = false, id }: { title: string; children: ReactNode; open?: boolean; id?: string }) {
  return (
    <details id={id} open={open} className="group border-y border-line [&+&]:-mt-px">
      <summary className="flex h-12 cursor-pointer items-center justify-between font-heading text-[14px] uppercase tracking-[1.3px]">
        {title}
        <Plus size={14} aria-hidden className="transition-transform duration-150 group-open:rotate-45" />
      </summary>
      <div className="pb-4 font-body text-[14px] leading-[21px]">{children}</div>
    </details>
  )
}
