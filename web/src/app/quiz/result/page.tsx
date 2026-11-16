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
 * Quiz result (SITE_SPEC G.6.13): eyebrow "YOUR MATCH", the match as the H1,
 * the "Why it fits you" card (the page's golf-green band), the matching buy
 * card preselected (`source: "quiz"`), and the bundle nudge for one cap.
 * Stateless: the answers live in the URL, so a result can be shared.
 */
export default function QuizResultPage(props: PageProps<"/quiz/result">) {
  return (
    <Suspense fallback={<div className="mx-2.5 h-[80vh] animate-pulse rounded-3xl bg-white" />}>
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
      <header className="mx-5 mb-5 flex flex-col gap-2 pt-4">
        <p className="font-mono text-xs leading-4 tracking-[.1em]">YOUR MATCH</p>
        <h1 className="font-serif text-[30px] leading-[38px] italic md:text-[40px] md:leading-[48px]">{title}</h1>
      </header>

      {match.kind === "single" && <RopeBuyBlock withGallery initialColor={match.color} source="quiz" aside={why} bundleTrack={{ pair: "quiz_bundle", foursome: "quiz_bundle" }} />}
      {match.kind === "edition" && <EditionMatch hole={match.hole} why={why} c={c} />}
      {match.kind === "pair" && c.pair && <PairMatch c={c} match={match} why={why} />}
      {match.kind === "foursome" && c.foursome && <FoursomeMatch c={c} match={match} why={why} />}

      <p className="my-10 text-center">
        <Link href="/quiz" className="link text-sm leading-5" data-track="quiz_retake">
          Retake the quiz
        </Link>
      </p>
      <AnswersLine answers={answers} />
    </>
  )
}

function WhyCard({ lines }: { lines: string[] }) {
  return (
    <section aria-label="Why it fits you" className="band-golf rounded-2xl p-6">
      <h2 className="font-mono text-xs leading-4 tracking-[.1em]">WHY IT FITS YOU</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {lines.map((w) => (
          <li key={w} className="flex gap-2.5 text-sm leading-[22px]">
            <CheckCircle size={16} weight="fill" className="mt-[3px] shrink-0" aria-hidden />
            {w}
          </li>
        ))}
      </ul>
    </section>
  )
}

function EditionMatch({ hole, why, c }: { hole: Hole; why: React.ReactNode; c: RopeCatalog }) {
  const { day, time } = holeDate(hole.date)
  const edition = hole.productHandle ? c.editions.find((p) => p.handle === hole.productHandle) : null
  const amount = edition ? price(edition).amount : null
  return (
    <div className="relative md:mx-5 md:grid md:grid-cols-[1fr_45vw] md:items-start md:gap-5 xl:grid-cols-[1fr_38vw]">
      <div className="relative mx-2.5 aspect-square overflow-hidden rounded-2xl bg-white md:mx-0">
        {hole.image ? (
          <Image src={hole.image} alt={`The Rope Cap in ${hole.name}`} fill preload sizes="(min-width: 768px) 55vw, 100vw" className="object-contain" />
        ) : (
          <div className="flex size-full items-center justify-center bg-golf-tint font-display text-[40px] text-midnight">{hole.hole}</div>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-2.5 max-md:mx-2.5 md:mt-0">
        {why}
        <div className="flex flex-col gap-4 rounded-xl bg-white p-5 lg:p-6">
          <p className="label-score">
            HOLE {hole.hole} · {hole.status === "live" ? "LIVE NOW" : `${day ?? "DATE TBC"}${time ? ` · ${time.toUpperCase()}` : ""}`}
          </p>
          <RopeRule color={hole.name} />
          {hole.size && <span className="badge-edition edition w-fit">EDITION OF {hole.size}</span>}
          {hole.status === "live" && hole.productHandle ? (
            <ButtonLink href={`/products/${hole.productHandle}`} variant="secondary" size="atc" track="quiz_edition">
              {`SHOP ${hole.name.toUpperCase()}${amount !== null ? ` – ${formatMoney(amount)}` : ""}`}
            </ButtonLink>
          ) : hole.handle ? (
            <TeeSheetForm releaseHandle={hole.handle} hole={hole.hole} name={hole.name} tone="light" />
          ) : null}
          <Link href="/products/rope-cap" className="link text-xs leading-4" data-track="quiz_core">
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
      <div className="mx-2.5 mb-2.5 md:mx-5">{why}</div>
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
      <div className="mx-2.5 md:mx-5">{why}</div>
      <FoursomePicker foursome={c.foursome!} colors={[...CORE_COLORS]} single={price(c.core!).amount} stock={stock} initial={match.value} source="quiz" plain />
    </>
  )
}

function AnswersLine({ answers }: { answers: Answers }) {
  return (
    <p className="mx-5 mb-10 text-center font-mono text-xs leading-4 tracking-[.05em] text-light-charcoal uppercase">
      Your answers: {QUESTIONS.map((q) => answerLabel(q.key, answers[q.key])).join(" · ")}
    </p>
  )
}
