import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Banner } from "@/components/banner"
import { CROWN, FitScale } from "@/components/fit-scale"
import { MaterialRing } from "@/components/material-ring"
import { Reveal } from "@/components/motion/reveal"
import { Scorecard } from "@/components/scorecard"
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

/** Fit guide (SITE_SPEC G.6.11): one cap, one size, a mid crown. */
export default function FitGuidePage() {
  return (
    <>
      <Banner
        image="/hats/rope-brim.jpg"
        crumbs={[{ label: "Home", href: "/" }, { label: "Fit guide" }]}
        title="How it fits"
        description="One size. The strap fits 21.5–23.75 in (55–60 cm). The crown sits mid, about 11–11.5 cm."
      />
      <Reveal aria-label="Crown height" className="band-golf mx-2.5 my-10 grid items-center gap-8 rounded-3xl p-5 md:grid-cols-2 md:p-10">
        <div className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-full bg-white">
          <Image src="/hats/rope-cap-tour-white-3.jpg" alt="The Rope Cap in side profile, showing the mid crown" fill sizes="380px" className="object-contain p-8" />
        </div>
        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs leading-5 tracking-[.1em] text-golf-tint">THE CROWN</p>
          <p className="font-display text-[30px] leading-9">Most rope caps sit tall. Ours sits mid.</p>
          <FitScale title="Crown height" steps={CROWN} value="Mid" note="about 11–11.5 cm" large tone="light" />
        </div>
      </Reveal>
      <Reveal aria-label="How to measure" className="mx-2.5 my-10 grid gap-10 rounded-3xl bg-white p-6 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="font-mono text-xs leading-4 tracking-[.1em] uppercase">How to measure</h2>
          <ol className="mt-5 flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-natural-white font-mono text-xs">{i + 1}</span>
                <span className="text-sm leading-[22px] text-charcoal">{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="font-mono text-xs leading-4 tracking-[.1em] uppercase">Size</h2>
          <table className="mt-5 w-full text-sm leading-5">
            <thead>
              <tr>
                {["Size", "Inches", "Centimetres", "Fitted size"].map((h) => (
                  <th key={h} scope="col" className="pb-2 text-left font-mono text-xs font-normal uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="h-11 border-t border-natural-white">
                <td>One size</td>
                <td>21.5–23.75</td>
                <td>55–60</td>
                <td>6⅞–7½</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>
      <Suspense fallback={null}>
        <FitScorecard />
      </Suspense>
      <MaterialRing
        background="/hats/rope-lifestyle-hero.jpg"
        callouts={[
          { title: "WHERE IT GETS WORN", body: "On the course, at the range, every day, or as a gift." },
          { title: "WHICH COLORS", body: "Light, dark, earthy, or something limited." },
          { title: "HOW MANY", body: "One, two or four." },
          { title: "YOUR CROWN", body: "Low, mid or tall." },
        ]}
        centre={
          <>
            <h2 className="font-display text-2xl leading-8">Find your color</h2>
            <p className="text-sm leading-5">Four questions. One color that&apos;s in stock, and the right bundle.</p>
            <Link href="/quiz" className="btn btn-primary" data-track="fit_guide_quiz">
              TAKE THE QUIZ
            </Link>
          </>
        }
      />
    </>
  )
}

async function FitScorecard() {
  const { core } = await ropeCatalog()
  if (!core) return null
  return (
    <Reveal aria-label="Scorecard" className="mx-2.5 my-10 grid gap-6 rounded-3xl bg-white p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl leading-8">The scorecard</h2>
        <p className="kicker text-light-charcoal">Every spec that decides the fit.</p>
        <Link href="/products/rope-cap" className="btn btn-secondary mt-2 w-fit" data-track="fit_guide_shop">
          SHOP THE ROPE CAP
        </Link>
      </div>
      <Scorecard product={core} color="Tour White" title={core.title} />
    </Reveal>
  )
}
