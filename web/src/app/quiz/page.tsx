import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { QuizFlow } from "@/components/quiz/quiz-flow"

export const metadata: Metadata = {
  title: "Find your color",
  description: "Four questions, thirty seconds: the Rope Cap color, or the pair or foursome, that suits how you'll wear it.",
}

/** The colour and bundle finder (SITE_SPEC v8 E.6.13): a collection-style header, then the quiz. */
export default function QuizPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <header className="wrap pt-4 text-center">
        <nav aria-label="Breadcrumb" className="crumbs-coll">
          <Link href="/">Home</Link> / <span aria-current="page">Quiz</span>
        </nav>
        <h1 className="title-page mt-[13px]">Find your color</h1>
      </header>
      <div className="wrap py-10">
        <QuizFlow />
        <p className="mt-8 text-center text-[14.4px]">
          <Link href="/fit-guide" className="link" data-track="quiz_fit_guide">
            Read the fit guide
          </Link>
        </p>
      </div>
    </>
  )
}
