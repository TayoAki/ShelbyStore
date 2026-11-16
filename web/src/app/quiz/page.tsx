import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { MaterialRing } from "@/components/material-ring"
import { QuizFlow } from "@/components/quiz/quiz-flow"

export const metadata: Metadata = {
  title: "Find your color",
  description: "Four questions, thirty seconds: the Rope Cap color, or the pair or foursome, that suits how you'll wear it.",
}

/**
 * The colour and bundle finder (SITE_SPEC G.6.13): the v5 ring band as the
 * entry hero ("START" jumps to the card), then the four-step card.
 */
export default function QuizPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <MaterialRing
        background="/hats/rope-lifestyle-hero.jpg"
        centre={
          <>
            <p className="font-mono text-xs leading-5 tracking-[.1em]">30 SECONDS · 4 QUESTIONS</p>
            <p className="font-display text-2xl leading-8 md:text-[30px] md:leading-9">Find your color</p>
            <Link href="#quiz" className="btn btn-primary" data-track="quiz_start">
              START
            </Link>
          </>
        }
        callouts={[
          { title: "Where you'll wear it", body: "The course, the range, everyday, or a gift." },
          { title: "What you reach for", body: "Light, dark, earthy, or something limited." },
          { title: "How many", body: "One cap, The Pair, or The Foursome." },
          { title: "Your crown", body: "Low, mid or tall, and how ours compares." },
        ]}
      />
      <div className="px-2.5 pb-10">
        <QuizFlow />
        <p className="mt-4 text-center">
          <Link href="/fit-guide" className="link text-xs leading-4" data-track="quiz_fit_guide">
            Rather measure? Read the fit guide
          </Link>
        </p>
      </div>
    </>
  )
}
