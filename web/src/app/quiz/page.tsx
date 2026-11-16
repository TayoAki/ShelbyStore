import { Ruler } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { QuizFlow } from "@/components/quiz/quiz-flow"

export const metadata: Metadata = {
  title: "Find your fit",
  description: "Four questions about how you wear a hat, one match: the style, color and size that fit you.",
}

/** The fit quiz, derived from Melin's fit finder (SITE_SPEC §12.4). */
export default function QuizPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <div className="lg:grid lg:grid-cols-[1fr_2fr]">
        <div className="bg-[linear-gradient(180deg,#ececec_0%,#ffffff_100%)] px-4 py-6 lg:sticky lg:top-[61px] lg:min-h-[calc(100vh-61px)] lg:self-start lg:px-[51px] lg:py-[50.512px]">
          <h2 className="font-heading text-[26px] leading-[33.8px]">Find Your Fit</h2>
          <p className="mt-3 font-body text-[13px] leading-[19.5px]">
            Four questions about how you wear a hat. We&apos;ll match you to one style, a color that&apos;s in stock and, for sized hats, a size.
          </p>
          <span className="mt-6 hidden h-24 w-24 items-center justify-center rounded-full border-2 border-black lg:flex" aria-hidden>
            <Ruler size={40} />
          </span>
          <Link href="/fit-guide" className="btn btn--micro mt-4" data-track="quiz_fit_guide">
            <span>Rather measure? Read the fit guide</span>
          </Link>
        </div>
        <div className="mx-auto w-full max-w-[560px] px-4 py-[28.432px] lg:px-0 lg:pt-[50.512px]">
          <QuizFlow />
        </div>
      </div>
    </>
  )
}
