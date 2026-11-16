"use client"

import { ArrowLeft } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { track } from "@/lib/analytics"
import { QUESTIONS, answersQuery, type Answers } from "@/lib/quiz"

/**
 * One question per screen, a progress bar, Back, and big answer buttons
 * (SITE_SPEC §12.4). Finishing goes to a stateless, shareable result URL.
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[13px]">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 underline-offset-4 hover:underline" data-track="quiz_back">
              <ArrowLeft size={16} aria-hidden /> Back
            </button>
          ) : (
            <span />
          )}
          <span className="font-mono text-ink-muted">
            {step + 1} of {QUESTIONS.length}
          </span>
        </div>
        <div className="grid h-1.5 gap-1" style={{ gridTemplateColumns: `repeat(${QUESTIONS.length}, 1fr)` }} aria-hidden>
          {QUESTIONS.map((x, i) => (
            <span key={x.key} className={`rounded-[1px] ${i <= step ? "bg-ink" : "bg-surface-2"}`} />
          ))}
        </div>
      </div>

      <fieldset className="flex flex-col gap-4" disabled={leaving}>
        <legend className="mb-4 flex flex-col gap-2">
          <span className="font-display text-[34px] leading-[0.95] lg:text-[48px]">{q.title}</span>
          {"hint" in q && q.hint && <span className="text-[15px] text-ink-muted">{q.hint}</span>}
        </legend>
        {q.answers.map((a) => {
          const picked = answers[q.key] === a.value
          return (
            <button
              key={a.value}
              type="button"
              onClick={() => answer(a.value)}
              aria-pressed={picked}
              className={`flex min-h-14 items-center justify-between rounded-[2px] border px-5 text-left text-[16px] font-medium transition-colors duration-150 ${
                picked ? "border-ink bg-ink text-page" : "border-ink-faint bg-paper hover:border-ink"
              }`}
              data-track="quiz_answer"
            >
              {a.label}
              <span aria-hidden className="text-[18px]">→</span>
            </button>
          )
        })}
      </fieldset>
      {leaving && <p className="text-[14px] text-ink-muted" role="status">Finding your match…</p>}
    </div>
  )
}
