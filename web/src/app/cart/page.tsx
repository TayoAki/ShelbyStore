import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { BagContents } from "@/components/cart/bag-contents"

export const metadata: Metadata = { title: "Your bag" }

/** /cart (SITE_SPEC v8 E.6.4): lines at 66%, a #F6F6F6 summary at 34%, then Complete the look. */
export default function CartPage() {
  return (
    <div className="wrap pt-4 pb-16">
      <header className="text-center">
        <nav aria-label="Breadcrumb" className="crumbs-coll">
          <Link href="/">Home</Link> / <span aria-current="page">Your bag</span>
        </nav>
        <h1 className="title-page mt-[13px] mb-8">Your bag</h1>
      </header>
      <Suspense fallback={<div className="h-40 bg-tile" aria-busy />}>
        <BagContents mode="page" />
      </Suspense>
    </div>
  )
}
