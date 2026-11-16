import type { Metadata } from "next"
import { POLICY } from "@/lib/policy"

export const metadata: Metadata = { title: "Shipping & returns" }

/** Policy page in Melin's article style (SITE_SPEC §6.6 article layout). */
export default function ShippingReturnsPage() {
  return (
    <article className="container-article py-[50.512px]">
      <p className="article-meta opacity-60">Customer Service</p>
      <h1 className="mt-3 article-h1">Shipping &amp; Returns</h1>
      <h2 className="article-h2">Shipping</h2>
      <p className="article-p">{POLICY.shipping}. {POLICY.dispatch}.</p>
      <h2 className="article-h2">Returns</h2>
      <p className="article-p">{POLICY.returns}: send it back within 30 days of delivery.</p>
    </article>
  )
}
