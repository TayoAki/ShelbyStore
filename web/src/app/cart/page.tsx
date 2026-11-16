import type { Metadata } from "next"
import { Suspense } from "react"
import { BagContents } from "@/components/cart/bag-contents"

export const metadata: Metadata = { title: "Your bag" }

/** /cart for direct visits and checkout back links (SITE_SPEC §6.7): the drawer's pieces on a page. */
export default function CartPage() {
  return (
    <div className="container-shop pb-[28.432px] pt-[37.904px] lg:pb-[50.512px]">
      <h1 className="mb-[28.432px] text-center font-heading text-[26px] uppercase leading-[39px]">Your Bag</h1>
      <Suspense fallback={<div className="h-40 animate-pulse bg-tile" />}>
        <BagContents mode="page" />
      </Suspense>
    </div>
  )
}
