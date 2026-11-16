"use client"

import { ArrowRight } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { track } from "@/lib/analytics"
import { prefersReducedMotion } from "@/lib/motion"
import { QUESTIONS, answersQuery, type Answers } from "@/lib/quiz"

/**
 * The colour and bundle finder (SITE_SPEC G.6.13 on v5 §6.13): a white card
 * with the mono header and step count, the golf-green progress fill (M21), the
 * question as the page's <h1>, 56px option rows (selected in golf green) and
 * "‹ Back". Steps change with M23. Finishing goes to a stateless result URL.
 */
export function QuizFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Answers>>({})
  const [phase, setPhase] = useState<"in" | "out">("in")
  const [leaving, setLeaving] = useState(false)
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

  return (
    <div id="quiz" className="mx-auto max-w-2xl scroll-mt-28 rounded-3xl bg-white p-6 md:p-10">
      <div className="flex items-center justify-between font-mono text-xs leading-4 tracking-[.1em]">
        <span>FIND YOUR COLOR · 30 SECONDS</span>
        <span aria-live="polite">
          {step + 1} OF {QUESTIONS.length}
        </span>
      </div>
      <div className="mt-4 h-[7px] w-full overflow-hidden rounded-[4px] bg-natural-white" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step + 1} aria-label="Quiz progress">
        <div className="h-full origin-left bg-golf-green transition-transform duration-600 ease-[var(--ease-power3-in-out)]" style={{ transform: `scaleX(${(step + 1) / QUESTIONS.length})` }} />
      </div>
      <fieldset
        key={q.key}
        className={`mt-8 transition-[opacity,transform] ${phase === "in" ? "quiz-step-in" : "translate-y-[10%] opacity-0 duration-200 ease-[var(--ease-sine-in)]"}`}
        disabled={leaving}
      >
        <legend className="w-full">
          <h1 className="font-display text-2xl leading-8 md:text-[30px] md:leading-9">{q.question}</h1>
        </legend>
        <div className="mt-6 flex flex-col gap-2.5">
          {q.answers.map((a) => {
            const selected = answers[q.key] === a.value
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => answer(a.value)}
                aria-pressed={selected}
                data-track="quiz_answer"
                className={`flex h-14 items-center justify-between rounded-xl border px-5 text-left text-sm leading-5 font-medium tracking-[.05em] uppercase transition-colors duration-200 ease-[var(--ease-sine-in-out)] ${
                  selected ? "border-golf-green bg-golf-green text-white" : "border-stroke bg-white hover:bg-light-charcoal-0.3"
                }`}
              >
                <span>{a.label}</span>
                <ArrowRight size={16} aria-hidden />
              </button>
            )
          })}
        </div>
      </fieldset>
      <div className="mt-5 flex min-h-4 items-center justify-between">
        {step > 0 && !leaving ? (
          <button type="button" onClick={() => go(step - 1)} className="link text-xs leading-4" data-track="quiz_back">
            ‹ Back
          </button>
        ) : (
          <span />
        )}
        {leaving && (
          <p className="text-xs leading-4 text-light-charcoal" role="status">
            Finding your match…
          </p>
        )}
      </div>
    </div>
  )
}
