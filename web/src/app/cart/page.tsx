import type { Metadata } from "next"
import { Suspense } from "react"
import { BagContents } from "@/components/cart/bag-contents"

export const metadata: Metadata = { title: "Your bag" }

/** /cart for direct visits and checkout back links (SITE_SPEC §6.7): the drawer's pieces on a page. */
export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-3 pt-6 md:px-6 md:pt-10">
      <h1 className="model mb-6">Your bag</h1>
      <Suspense fallback={<div className="panel h-40" />}>
        <BagContents mode="page" />
      </Suspense>
    </div>
  )
}
