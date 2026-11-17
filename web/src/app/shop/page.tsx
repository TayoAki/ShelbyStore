import type { Metadata } from "next"
import { SunwashedCapFeature } from "@/components/sunwashed-cap-feature"

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop the Shelby Sunwashed Rope Cap in Espresso and Ivory.",
}

export default function ShopPage() {
  return <SunwashedCapFeature />
}
