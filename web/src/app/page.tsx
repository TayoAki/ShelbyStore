import { Suspense } from "react"
import { Exposure } from "@/components/exposure"
import { SunwashedCapFeature } from "@/components/sunwashed-cap-feature"
import { getVariant } from "@/lib/experiments"

const EXPERIMENT = "sunwashed-cap-message"

async function HomepageFeature() {
  const variant = await getVariant(EXPERIMENT)
  return (
    <>
      <Exposure experiment={EXPERIMENT} variant={variant} />
      <SunwashedCapFeature birdieFirst={variant === "birdie"} />
    </>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<SunwashedCapFeature />}>
      <HomepageFeature />
    </Suspense>
  )
}
