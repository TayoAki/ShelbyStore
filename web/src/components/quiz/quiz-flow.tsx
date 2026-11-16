"use client"

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { track } from "@/lib/analytics"
import { Digits } from "../digits"
import { prefersReducedMotion } from "@/lib/motion"
import { QUESTIONS, answersQuery, type Answers } from "@/lib/quiz"

/**
 * The colour and bundle finder: one panel with the step in digit slots, a
 * four-segment progress rule, the question as a panel title, keylined answer
 * rows and Back. Finishing goes to a stateless result URL.
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
    <div id="quiz" className="panel scroll-mt-28">
      <span className="panel-inner" aria-hidden />
      <div className="relative flex flex-col gap-6 p-[var(--panel-pad)]">
        <div className="flex items-center justify-between gap-4">
          <span className="label">Question</span>
          <span aria-live="polite" className="text-[2rem] leading-none">
            <Digits value={`${step + 1}/${QUESTIONS.length}`} cells label={`Question ${step + 1} of ${QUESTIONS.length}`} />
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step + 1} aria-label="Quiz progress">
          {QUESTIONS.map((x, i) => (
            <span key={x.key} className={`h-2.5 rounded-[2px] border-2 border-ink transition-colors duration-[420ms] ${i <= step ? "bg-ink" : "bg-paper"}`} />
          ))}
        </div>
        <fieldset
          key={q.key}
          className={`transition-[opacity,transform] ${phase === "in" ? "quiz-step-in" : "translate-y-3 opacity-0 duration-200"}`}
          disabled={leaving}
        >
          <legend className="w-full">
            <h2 className="panel-title">{q.question}</h2>
          </legend>
          <div className="mt-6 flex flex-col gap-2">
            {q.answers.map((a) => {
              const selected = answers[q.key] === a.value
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => answer(a.value)}
                  aria-pressed={selected}
                  data-track="quiz_answer"
                  className={`flex min-h-14 items-center justify-between gap-4 rounded-[4px] border-2 px-5 text-left font-label text-[1.0625rem] font-[700] tracking-[.04em] uppercase transition-colors duration-200 ${
                    selected ? "border-ink bg-ink text-white" : "border-ink/30 bg-paper hover:border-ink"
                  }`}
                >
                  <span>{a.label}</span>
                  <ArrowRight size={18} weight="bold" aria-hidden />
                </button>
              )
            })}
          </div>
        </fieldset>
        <div className="flex min-h-11 items-center justify-between">
          {step > 0 && !leaving ? (
            <button type="button" onClick={() => go(step - 1)} className="btn btn-outline-black btn-small" data-track="quiz_back">
              <ArrowLeft size={16} weight="bold" aria-hidden /> Back
            </button>
          ) : (
            <span />
          )}
          {leaving && (
            <p className="label" role="status">
              Finding your match…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
