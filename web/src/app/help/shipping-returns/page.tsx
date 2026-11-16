import type { Metadata } from "next"
import { POLICY } from "@/lib/policy"

export const metadata: Metadata = { title: "Shipping & returns" }

/** Policy page on the white article sheet (v5, G.6.15). */
export default function ShippingReturnsPage() {
  return (
    <article className="mx-2.5 rounded-3xl bg-white px-5 py-12 md:py-16">
      <div className="mx-auto max-w-[65ch]">
        <p className="eyebrow text-light-charcoal">HELP</p>
        <h1 className="mt-3 font-serif text-[30px] leading-[38px] md:text-[40px] md:leading-[48px]">Shipping &amp; returns</h1>
        <h2 className="mt-10 font-mono text-xs leading-4 tracking-[.1em] uppercase">Shipping</h2>
        <p className="mt-3 text-base leading-[26px] text-charcoal">
          Standard shipping is free on orders of ${POLICY.freeShippingThreshold} or more, otherwise $6. Express is $15. {POLICY.dispatch}.
        </p>
        <h2 className="mt-8 font-mono text-xs leading-4 tracking-[.1em] uppercase">Returns</h2>
        <p className="mt-3 text-base leading-[26px] text-charcoal">
          {POLICY.returns}: send it back within 30 days of delivery. Numbered editions follow the same 30-day returns.
        </p>
      </div>
    </article>
  )
}
