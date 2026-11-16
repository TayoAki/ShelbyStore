"use client"

import { ArrowRight } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { track } from "@/lib/analytics"
import { QUESTIONS, answersQuery, type Answers } from "@/lib/quiz"

/**
 * Melin's fit-finder flow (SITE_SPEC §12.4): progress dashes, the question as
 * the page's <h1>, a column of large outline answers, and Back. Finishing goes
 * to a stateless, shareable result URL.
 */
export function QuizFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Answers>>({})
  const [leaving, setLeaving] = useState(false)
  const q = QUESTIONS[step]

  useEffect(() => {
    track("quiz_started", {})
  }, [])

  const answer = (value: string) => {
    const next = { ...answers, [q.key]: value } as Partial<Answers>
    setAnswers(next)
    track("quiz_answered", { step: step + 1, question: q.key, answer: value })
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
      return
    }
    setLeaving(true)
    router.push(`/quiz/result?${answersQuery(next as Answers)}`)
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-2" aria-hidden>
          {QUESTIONS.map((x, i) => (
            <span key={x.key} className={`h-1 flex-1 ${i <= step ? "bg-black" : "bg-tertiary"}`} />
          ))}
        </div>
        <span className="font-body text-[12px] text-muted">
          {step + 1} of {QUESTIONS.length}
        </span>
      </div>
      <fieldset className="mt-8" disabled={leaving}>
        <legend className="w-full">
          <h1 className="font-heading text-[26px] leading-[33.8px]">{q.title}</h1>
          {"hint" in q && q.hint && <p className="mt-2 font-body text-[13px] text-muted">{q.hint}</p>}
        </legend>
        <div className="mt-6 flex flex-col gap-3">
          {q.answers.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => answer(a.value)}
              aria-pressed={answers[q.key] === a.value}
              data-track="quiz_answer"
              className="btn btn--light btn--large w-full !justify-between !px-5"
            >
              <span className="font-heading text-[14px] uppercase tracking-[1.3px]">{a.label}</span>
              <ArrowRight size={16} aria-hidden />
            </button>
          ))}
        </div>
      </fieldset>
      {step > 0 && (
        <button type="button" onClick={() => setStep(step - 1)} className="btn btn--micro mt-4" data-track="quiz_back">
          <span>Back</span>
        </button>
      )}
      {leaving && (
        <p className="mt-4 font-body text-[13px] text-muted" role="status">
          Finding your match…
        </p>
      )}
    </div>
  )
}
