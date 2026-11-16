import { CheckCircle } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { FoursomePicker, PairPicker } from "@/components/offer/pair-picker"
import { RopeBuyBlock } from "@/components/rope-buy-block"
import { RopeRule } from "@/components/rope-rule"
import { TeeSheetForm } from "@/components/tee-sheet-form"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { price } from "@/lib/product"
import { answerLabel, matchQuiz, parseAnswers, QUESTIONS, type Answers, type QuizMatch } from "@/lib/quiz"
import { CORE_COLORS, holeDate, type Hole } from "@/lib/rope"

export const metadata: Metadata = {
  title: "Your match",
  description: "The Rope Cap color, pair or foursome that suits how you'll wear it.",
}

const short = (c: string) => c.replace(/^Clubhouse /, "")

/**
 * Quiz result: the match as the H1, "Why it fits you" printed on a pine
 * panel, the matching front panel preselected (`source: "quiz"`), and the
 * bundle nudge for one cap.
 * Stateless: the answers live in the URL, so a result can be shared.
 */
export default function QuizResultPage(props: PageProps<"/quiz/result">) {
  return (
    <Suspense fallback={<div className="panel mx-3 mt-6 h-[80vh] md:mx-6" />}>
      <Result searchParams={props.searchParams} />
    </Suspense>
  )
}

async function Result({ searchParams }: { searchParams: PageProps<"/quiz/result">["searchParams"] }) {
  const answers = parseAnswers(await searchParams)
  if (!answers) redirect("/quiz")
  const c = await ropeCatalog()
  if (!c.core) redirect("/quiz")
  const { stock, holes } = await liveStock(c)
  const match = matchQuiz(answers, c.core, stock, holes)

  const title =
    match.kind === "single"
      ? `The Rope Cap in ${match.color}`
      : match.kind === "edition"
        ? `The Rope Cap in ${match.hole.name}`
        : match.kind === "pair"
          ? `The Pair: ${short(match.first)} + ${short(match.second)}`
          : match.value === "One of each"
            ? "The Foursome, one of each"
            : `The Foursome, four ${match.value.slice(4)}`
  const matchId =
    match.kind === "single"
      ? `rope-cap:${match.color}`
      : match.kind === "edition"
        ? `hole-${match.hole.hole}:${match.hole.name}`
        : match.kind === "pair"
          ? `the-pair:${match.first}+${match.second}`
          : `the-foursome:${match.value}`
  const why = <WhyCard lines={match.why} />

  return (
    <>
      <Track event="quiz_completed" props={{ match: matchId, kind: match.kind, ...answers }} />
      <Suspense fallback={null}>
        <ContinuityBanner />
      </Suspense>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-6 md:gap-6 md:px-6 md:pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="model">{title}</h1>
        <p className="text-[1.125rem] text-ink-2">Your match, from your four answers.</p>
      </header>

      {match.kind === "single" && <RopeBuyBlock withGallery initialColor={match.color} source="quiz" aside={why} bundleTrack={{ pair: "quiz_bundle", foursome: "quiz_bundle" }} />}
      {match.kind === "edition" && <EditionMatch hole={match.hole} why={why} c={c} />}
      {match.kind === "pair" && c.pair && <PairMatch c={c} match={match} why={why} />}
      {match.kind === "foursome" && c.foursome && <FoursomeMatch c={c} match={match} why={why} />}

      <div className="flex flex-col gap-2">
        <AnswersLine answers={answers} />
        <Link href="/quiz" className="btn btn-outline-black w-fit" data-track="quiz_retake">
          Retake the quiz
        </Link>
      </div>
      </div>
    </>
  )
}

function WhyCard({ lines }: { lines: string[] }) {
  return (
    <section aria-labelledby="why-title" className="panel ink-dark" style={{ "--panel-bg": "#1E3B2F", "--panel-ink": "#F1ECE0", "--panel-line": "#10241B" } as React.CSSProperties}>
      <span className="panel-inner" aria-hidden />
      <div className="relative p-[var(--panel-pad)]">
      <h2 id="why-title" className="panel-title !text-[2rem]">Why it fits you</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {lines.map((w) => (
          <li key={w} className="flex gap-3 text-[1.0625rem] leading-7">
            <CheckCircle size={20} weight="fill" className="mt-[4px] shrink-0" aria-hidden />
            {w}
          </li>
        ))}
      </ul>
      </div>
    </section>
  )
}

function EditionMatch({ hole, why, c }: { hole: Hole; why: React.ReactNode; c: RopeCatalog }) {
  const { day, time } = holeDate(hole.date)
  const edition = hole.productHandle ? c.editions.find((p) => p.handle === hole.productHandle) : null
  const amount = edition ? price(edition).amount : null
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <div className="window aspect-square">
        {hole.image ? (
          <Image src={hole.image} alt={`The Rope Cap in ${hole.name}`} fill preload sizes="(min-width: 768px) 55vw, 100vw" className="object-contain" />
        ) : (
          <div className="flex size-full items-center justify-center bg-wash font-model text-[3rem] font-[800] text-ink">{hole.hole}</div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {why}
        <div className="panel flex flex-col gap-4 p-[var(--panel-pad)]">
          <p className="label">
            Hole {hole.hole} · {hole.status === "live" ? "Live now" : `${day ?? "Date to come"}${time ? ` · ${time}` : ""}`}
          </p>
          <RopeRule color={hole.name} />
          {hole.size && <span className="badge-edition w-fit">Edition of {hole.size}</span>}
          {hole.status === "live" && hole.productHandle ? (
            <ButtonLink href={`/products/${hole.productHandle}`} variant="secondary" size="atc" track="quiz_edition">
              {`Shop ${hole.name}${amount !== null ? ` · ${formatMoney(amount)}` : ""}`}
            </ButtonLink>
          ) : hole.handle ? (
            <TeeSheetForm releaseHandle={hole.handle} hole={hole.hole} name={hole.name} tone="light" />
          ) : null}
          <Link href="/products/rope-cap" className="link" data-track="quiz_core">
            Or a core color, in stock today
          </Link>
        </div>
      </div>
    </div>
  )
}

async function PairMatch({ c, match, why }: { c: RopeCatalog; match: Extract<QuizMatch, { kind: "pair" }>; why: React.ReactNode }) {
  const stock = await getStock([c.pair!.id])
  return (
    <>
      {why}
      <PairPicker
        pair={c.pair!}
        colors={[...CORE_COLORS]}
        single={price(c.core!).amount}
        stock={stock}
        headline="Two rope caps, picked for you."
        initial={[match.first, match.second]}
        source="quiz"
        headingAs="h2"
      />
    </>
  )
}

async function FoursomeMatch({ c, match, why }: { c: RopeCatalog; match: Extract<QuizMatch, { kind: "foursome" }>; why: React.ReactNode }) {
  const stock = await getStock([c.foursome!.id])
  return (
    <>
      {why}
      <FoursomePicker foursome={c.foursome!} colors={[...CORE_COLORS]} single={price(c.core!).amount} stock={stock} initial={match.value} source="quiz" plain />
    </>
  )
}

function AnswersLine({ answers }: { answers: Answers }) {
  return (
    <p className="label text-ink-2">
      Your answers: {QUESTIONS.map((q) => answerLabel(q.key, answers[q.key])).join(" · ")}
    </p>
  )
}
