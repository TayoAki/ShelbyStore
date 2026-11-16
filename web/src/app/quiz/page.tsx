import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { QuizFlow } from "@/components/quiz/quiz-flow"

export const metadata: Metadata = {
  title: "Find your color",
  description: "Four questions, thirty seconds: the Rope Cap color, or the pair or foursome, that suits how you'll wear it.",
}

/**
 * The colour and bundle finder: one printed panel, four questions answered on
 * it in turn, then the match.
 */
export default function QuizPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <div className="mx-auto flex max-w-[960px] flex-col gap-6 px-3 pt-6 pb-4 md:px-6 md:pt-10">
        <div className="flex flex-col gap-3">
          <h1 className="model">Find your color</h1>
          <p className="max-w-[56ch] text-[1.125rem] leading-[1.6]">Four questions, about thirty seconds: where you&apos;ll wear it, what you reach for, how many, and how high you like a crown.</p>
          <Link href="#quiz" className="sr-only focus:not-sr-only" data-track="quiz_start">
            Start the quiz
          </Link>
        </div>
        <QuizFlow />
        <p>
          <Link href="/fit-guide" className="link" data-track="quiz_fit_guide">
            Rather measure? Read the fit guide
          </Link>
        </p>
      </div>
    </>
  )
}
