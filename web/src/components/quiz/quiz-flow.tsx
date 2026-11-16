"use client"

import { ArrowLeft } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { track } from "@/lib/analytics"
import { prefersReducedMotion } from "@/lib/motion"
import { QUESTIONS, answersQuery, type Answers } from "@/lib/quiz"

/**
 * The colour and bundle finder (SITE_SPEC v8 E.6.13): a start state, then a
 * progress bar with "2 of 4", the question in Monomakh (not uppercased), the
 * answers as full-width tab buttons and a Back link. Finishing goes to a
 * stateless result URL.
 */
export function QuizFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Answers>>({})
  const [phase, setPhase] = useState<"in" | "out">("in")
  const [leaving, setLeaving] = useState(false)
  const [begun, setBegun] = useState(false)
  const started = useRef(false)
  const q = QUESTIONS[step]

  useEffect(() => {
    if (started.current) return
    started.current = true
    track("quiz_started", {})
  }, [])

  const go = (next: number) => {
    if (prefersReducedMotion()) {
      setStep(next)
      return
    }
    setPhase("out")
    setTimeout(() => {
      setStep(next)
      setPhase("in")
    }, 200)
  }

  const answer = (value: string) => {
    if (phase === "out" || leaving) return
    const next = { ...answers, [q.key]: value } as Partial<Answers>
    setAnswers(next)
    track("quiz_answered", { step: step + 1, question: q.key, answer: value })
    if (step < QUESTIONS.length - 1) {
      go(step + 1)
      return
    }
    setLeaving(true)
    router.push(`/quiz/result?${answersQuery(next as Answers)}`)
  }

  if (!begun)
    return (
      <div id="quiz" className="mx-auto flex max-w-[560px] scroll-mt-24 flex-col items-center gap-5 text-center">
        <p className="text-[14.4px] leading-[19.73px]">Four questions, about thirty seconds: where you&apos;ll wear it, what you reach for, how many, and how high you like a crown.</p>
        <button type="button" className="btn btn-green" data-track="quiz_start" onClick={() => setBegun(true)}>
          Start the Quiz
        </button>
      </div>
    )

  return (
    <div id="quiz" className="mx-auto flex max-w-[560px] scroll-mt-24 flex-col gap-6">
      <div>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step + 1} aria-label="Quiz progress">
          <span style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
        <p className="meta mt-2 text-center" aria-live="polite">
          {step + 1} of {QUESTIONS.length}
        </p>
      </div>
      <fieldset key={q.key} className={`transition-opacity duration-200 ${phase === "in" ? "animate-fade-in" : "opacity-0"}`} disabled={leaving}>
        <legend className="w-full text-center">
          <h2 className="display-md normal-case">{q.question}</h2>
        </legend>
        <div className="mt-6 flex flex-col gap-3">
          {q.answers.map((a) => {
            const selected = answers[q.key] === a.value
            return (
              <button key={a.value} type="button" onClick={() => answer(a.value)} aria-pressed={selected} data-track="quiz_answer" className="tab w-full !min-h-12 justify-center !text-[16px] !tracking-normal">
                {a.label}
              </button>
            )
          })}
        </div>
      </fieldset>
      <div className="flex min-h-11 items-center justify-between">
        {step > 0 && !leaving ? (
          <button type="button" onClick={() => go(step - 1)} className="link inline-flex min-h-11 items-center gap-1 text-[14.4px]" data-track="quiz_back">
            <ArrowLeft size={14} aria-hidden /> Back
          </button>
        ) : (
          <span />
        )}
        {leaving && (
          <p className="meta" role="status">
            Finding your match…
          </p>
        )}
      </div>
    </div>
  )
}
