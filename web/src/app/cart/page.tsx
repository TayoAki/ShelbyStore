import type { Metadata } from "next"
import { Suspense } from "react"
import { BagContents } from "@/components/cart/bag-contents"

export const metadata: Metadata = { title: "Your bag" }

/** /cart for direct visits and checkout back links (SITE_SPEC §6.7): the drawer's pieces on a page. */
export default function CartPage() {
  return (
    <div className="mx-auto max-w-[960px] px-2.5 pb-16">
      <h1 className="mb-6 px-2.5 font-display text-2xl leading-8 md:text-[30px] md:leading-9">Your bag</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white" />}>
        <BagContents mode="page" />
      </Suspense>
    </div>
  )
}
