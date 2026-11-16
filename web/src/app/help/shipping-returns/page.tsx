import type { Metadata } from "next"
import Link from "next/link"
import { Accordion } from "@/components/accordion"
import { POLICY } from "@/lib/policy"

export const metadata: Metadata = { title: "Shipping & returns" }

/** Help (SITE_SPEC v8 E.6.14): a collection-style header, the policy lines as accordions in a 680px column. */
export default function ShippingReturnsPage() {
  return (
    <>
      <header className="wrap pt-4 text-center">
        <nav aria-label="Breadcrumb" className="crumbs-coll">
          <Link href="/">Home</Link> / <span aria-current="page">Shipping &amp; returns</span>
        </nav>
        <h1 className="title-page mt-[13px]">Shipping &amp; returns</h1>
      </header>
      <div className="wrap mx-auto max-w-[780px] py-10 md:py-14">
        <div className="border-t border-border">
          <Accordion title="Shipping" open>
            <p>
              Standard shipping is free on orders of ${POLICY.freeShippingThreshold} or more, otherwise $6. Express is $15. {POLICY.dispatch}.
            </p>
          </Accordion>
          <Accordion title="Returns" open>
            <p>{POLICY.returns}: send it back within 30 days of delivery. Numbered editions follow the same 30-day returns.</p>
          </Accordion>
          <Accordion title="Custom orders">
            <p>
              Custom caps are made to your artwork, so they can&apos;t be returned unless they arrive faulty. Twenty-four caps or more, $40 a cap, 2–4 weeks after you approve the proof.{" "}
              <Link href="/custom" className="link">
                Custom orders
              </Link>
            </p>
          </Accordion>
        </div>
      </div>
    </>
  )
}
