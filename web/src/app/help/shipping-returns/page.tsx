import type { Metadata } from "next"
import { Container } from "@/components/container"
import { POLICY } from "@/lib/policy"

export const metadata: Metadata = { title: "Shipping & returns" }

export default function ShippingReturnsPage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-12">
      <h1 className="font-display text-section">Shipping & returns</h1>
      <ul className="flex flex-col gap-3 text-[16px]">
        <li>{POLICY.shipping}.</li>
        <li>{POLICY.dispatch}.</li>
        <li>{POLICY.returns}.</li>
      </ul>
    </Container>
  )
}
