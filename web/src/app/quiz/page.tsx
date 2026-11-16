import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { ContinuityBanner } from "@/components/continuity-banner"
import { QuizFlow } from "@/components/quiz/quiz-flow"

export const metadata: Metadata = {
  title: "Find your hat",
  description: "Four questions about how you wear a hat, one match: the style, colour and size that fit you.",
}

/** The fit quiz (SITE_SPEC §12.4): four questions, then a personal match. */
export default function QuizPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <Container className="grid gap-10 py-8 lg:grid-cols-[5fr_7fr] lg:gap-16 lg:py-16">
        <div className="flex flex-col gap-4">
          <p className="text-eyebrow text-accent-ink">Fit quiz · 30 seconds</p>
          <h1 className="font-display text-section">Find your hat</h1>
          <p className="max-w-md text-[16px] leading-relaxed text-ink-muted">
            Four questions about how you wear a hat. We&apos;ll match you to one style, a colour that&apos;s in stock and, for sized
            hats, a size.
          </p>
          <p className="text-[13px] text-ink-muted">
            Rather measure?{" "}
            <Link href="/fit-guide" className="underline underline-offset-4" data-track="quiz_fit_guide">
              Read the fit guide
            </Link>
            .
          </p>
        </div>
        <QuizFlow />
      </Container>
    </>
  )
}
