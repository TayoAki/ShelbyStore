import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { SidePanel } from "@/components/box/side-panel"
import { Digits } from "@/components/digits"
import { ropeCatalog } from "@/lib/data/rope"

export const metadata: Metadata = {
  title: "Fit guide",
  description: "One size. The strap fits 21.5–23.75 in (55–60 cm). The crown sits mid, about 11–11.5 cm.",
}

const STEPS = [
  "Wrap a soft tape around your head, just above the ears and about a finger above your eyebrows.",
  "Keep it level and snug, not tight. Read where the tape meets.",
  "Between 21.5 and 23.75 in (55–60 cm)? The strap covers you. Outside that range, use the 30-day returns.",
]

/**
 * Fit guide (Read, in the box's vocabulary): the crown drawn to true size with
 * the printed spec (the side panel), how to measure as numbered steps on one
 * plate, the size table, and the way into the quiz.
 */
export default function FitGuidePage() {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-6 md:gap-6 md:px-6 md:pt-10">
      <nav aria-label="Breadcrumb" className="label !text-[12px] text-ink-2">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / Fit guide
      </nav>
      <div className="flex flex-col gap-3">
        <h1 className="model">How it fits</h1>
        <p className="max-w-[60ch] text-[1.125rem] leading-[1.6]">One size. The strap fits 21.5–23.75 in (55–60 cm). The crown sits mid, about 11–11.5 cm.</p>
      </div>
      <Suspense fallback={<div className="panel h-96" />}>
        <FitSpec />
      </Suspense>
      <section aria-labelledby="measure-title" className="panel">
        <span className="panel-inner" aria-hidden />
        <div className="relative grid grid-cols-[minmax(0,1fr)] gap-10 p-[var(--panel-pad)] lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 id="measure-title" className="panel-title">
              How to measure
            </h2>
            <ol className="flex flex-col border-2 border-ink">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-4 border-ink p-4 [&+&]:border-t-2">
                  <span className="text-[2.25rem] leading-none" aria-hidden>
                    <Digits value={String(i + 1).padStart(2, "0")} />
                  </span>
                  <span className="text-[1.0625rem] leading-7">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="panel-title">Size</h2>
            <table className="scorecard">
              <thead>
                <tr>
                  {["Size", "Inches", "Centimetres", "Fitted"].map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">One size</th>
                  <td>21.5–23.75</td>
                  <td>55–60</td>
                  <td>6⅞–7½</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[1rem] leading-6 text-ink-2">Outside that range? Use the 30-day returns.</p>
          </div>
        </div>
      </section>
      <section aria-labelledby="quiz-title" className="panel ink-dark" style={{ "--panel-bg": "#1E3B2F", "--panel-ink": "#F1ECE0", "--panel-line": "#10241B" } as React.CSSProperties}>
        <span className="panel-inner" aria-hidden />
        <div className="relative flex flex-col items-start gap-5 p-[var(--panel-pad)] md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <h2 id="quiz-title" className="panel-title">
              Find your color
            </h2>
            <p className="max-w-[48ch] text-[1.125rem] leading-[1.6]">Four questions about where you wear it and what you reach for. One color that&apos;s in stock, and the right bundle.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/quiz" className="btn btn-on-ink btn-large" style={{ "--btn-bg": "#F1ECE0", "--btn-fg": "#1E3B2F" } as React.CSSProperties} data-track="fit_guide_quiz">
              Take the quiz
            </Link>
            <Link href="/products/rope-cap" className="btn btn-outline-white btn-large" data-track="fit_guide_shop">
              Shop the Rope Cap
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

async function FitSpec() {
  const { core } = await ropeCatalog()
  if (!core) return null
  return <SidePanel product={core} id="crown" />
}
