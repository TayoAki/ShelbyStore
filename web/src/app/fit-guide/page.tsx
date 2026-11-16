import type { Metadata } from "next"
import Link from "next/link"
import { Faq } from "@/components/accordion"
import { CrownProfiles } from "@/components/crown-profiles"
import { ButtonLink } from "@/components/ui/button"
import { POLICY } from "@/lib/policy"

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
 * Fit guide (SITE_SPEC v8 E.6.6): a collection-style header, an editorial
 * split with the crown profiles drawn to scale, the size table, three
 * numbered steps, the FAQ and the way into the quiz.
 */
export default function FitGuidePage() {
  return (
    <>
      <header className="wrap pt-4 text-center">
        <nav aria-label="Breadcrumb" className="crumbs-coll">
          <Link href="/">Home</Link> / <span aria-current="page">Fit guide</span>
        </nav>
        <h1 className="title-page mt-[13px]">Fit guide</h1>
      </header>

      <section aria-labelledby="crown-title" className="mt-8 grid md:grid-cols-2">
        <div className="band-tile flex items-center justify-center p-6 md:p-12">
          <CrownProfiles low={11} top={11.5} fallbackColor="Tour White" />
        </div>
        <div className="flex flex-col items-start justify-center p-6 md:p-12">
          <p className="eyebrow">The mid crown</p>
          <h2 id="crown-title" className="title-section mt-2 !text-[30px] md:!text-[38.4px]">
            About 11–11.5 cm
          </h2>
          <p className="body-long mt-4 max-w-[52ch]">
            The rope caps that sell best are built high, and their buyers say the height takes getting used to. The Rope Cap is cut to a mid crown, measured from the button to the brim, so it sits on your head the first time you put it on. The drawing is to scale against a 12 cm high crown.
          </p>
          <ButtonLink href="/products/rope-cap" className="mt-6" track="fit_guide_shop">
            Shop the Rope Cap
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="size-title" className="wrap mx-auto max-w-[780px] pt-14">
        <h2 id="size-title" className="title-card text-center">
          Size
        </h2>
        <p className="mt-3 text-center text-[14.4px] font-bold">One size {POLICY.oneSize}</p>
        <table className="spec-table mt-6">
          <thead>
            <tr>
              {["Head circumference", "Inches", "Centimetres"].map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="font-normal">
                One size (fitted 6⅞–7½)
              </th>
              <td className="tabular">21.5–23.75</td>
              <td className="tabular">55–60</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section aria-labelledby="measure-title" className="wrap mx-auto max-w-[780px] pt-14">
        <h2 id="measure-title" className="title-card text-center">
          How to measure
        </h2>
        <ol className="mt-6 flex flex-col">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-5 border-b border-border py-4">
              <span className="w-10 shrink-0 font-display text-[38px] leading-none text-green" aria-hidden>
                {i + 1}
              </span>
              <span className="text-[14.4px] leading-[19.73px]">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <Faq
        items={[
          { q: "What if I'm between sizes?", a: "There is one size. The strap adjusts from 21.5 to 23.75 in (55–60 cm), which covers fitted sizes 6⅞ to 7½." },
          { q: "Does it shrink?", a: "It's garment-washed before it reaches you, so it won't shrink further. Spot clean and air dry." },
          { q: "Can I return it if it doesn't fit?", a: `${POLICY.returns}.` },
        ]}
      />
      <p className="wrap pb-16 text-center text-[14.4px]">
        <Link href="/quiz" className="link" data-track="fit_guide_quiz">
          Still unsure? Take the quiz
        </Link>
      </p>
    </>
  )
}
