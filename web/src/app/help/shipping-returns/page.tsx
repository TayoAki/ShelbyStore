import type { Metadata } from "next"
import { POLICY } from "@/lib/policy"

export const metadata: Metadata = { title: "Shipping & returns" }

/** Policy page on the white article sheet (v5, G.6.15). */
export default function ShippingReturnsPage() {
  return (
    <article className="panel mx-auto mt-6 max-w-[1440px] px-[var(--panel-pad)] py-12 md:py-16">
      <div className="mx-auto max-w-[65ch]">
        <h1 className="model">Shipping &amp; returns</h1>
        <h2 className="panel-title mt-10 !text-[2rem]">Shipping</h2>
        <p className="mt-3 text-[1.125rem] leading-[1.7]">
          Standard shipping is free on orders of ${POLICY.freeShippingThreshold} or more, otherwise $6. Express is $15. {POLICY.dispatch}.
        </p>
        <h2 className="panel-title mt-8 !text-[2rem]">Returns</h2>
        <p className="mt-3 text-[1.125rem] leading-[1.7]">
          {POLICY.returns}: send it back within 30 days of delivery. Numbered editions follow the same 30-day returns.
        </p>
      </div>
    </article>
  )
}
