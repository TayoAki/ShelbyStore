import { ArrowCounterClockwise, Ruler, Sliders, Truck } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { POLICY } from "@/lib/policy"
import { Container } from "../container"

/** Fit help at the decision point (SITE_SPEC §6.1.6). Only claims what policy.ts states. */
export function FitStrip({ last = false }: { last?: boolean }) {
  const items = [
    { icon: Sliders, title: "One size, adjustable", body: `Strap and snap styles ${POLICY.oneSize.replace(/^fits/, "fit")}.` },
    { icon: Ruler, title: "Sized when it matters", body: `${POLICY.sized}, with a size chart.` },
    { icon: ArrowCounterClockwise, title: POLICY.returns, body: "Details on the shipping & returns page." },
    { icon: Truck, title: POLICY.dispatch, body: POLICY.shipping },
  ]
  return (
    <section className={`border-t border-line bg-surface py-10 lg:py-12 ${last ? "-mb-20" : "border-b"}`}>
      <Container className="flex flex-col gap-8">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <Icon size={24} aria-hidden className="mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="text-[15px] font-semibold">{title}</p>
                <p className="text-[14px] text-ink-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/fit-guide" className="text-eyebrow w-fit border-b border-ink pb-1 hover:text-ink-muted" data-track="fit_guide">
          Not sure? Read the fit guide →
        </Link>
      </Container>
    </section>
  )
}
