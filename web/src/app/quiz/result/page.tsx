import { CheckCircle } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ContinuityBanner } from "@/components/continuity-banner"
import { FoursomePicker, PairPicker } from "@/components/offer/pair-picker"
import { TeeSheetForm } from "@/components/tee-sheet-form"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
import { BundleRows } from "@/components/bundle-rows"
import { shortDate } from "@/components/hole-card"
import { liveStock, ropeCatalog, type RopeCatalog } from "@/lib/data/rope"
import { getStock } from "@/lib/data/stock"
import { formatMoney } from "@/lib/format"
import { findVariant, imagesFor, price } from "@/lib/product"
import { POLICY } from "@/lib/policy"
import type { VariantStock } from "@/lib/types"
import { answerLabel, matchQuiz, parseAnswers, QUESTIONS, type Answers, type QuizMatch } from "@/lib/quiz"
import { CORE_COLORS, holeDate, pad2, type Hole } from "@/lib/rope"

export const metadata: Metadata = {
  title: "Your match",
  description: "The Rope Cap color, pair or foursome that suits how you'll wear it.",
}

const short = (c: string) => c.replace(/^Clubhouse /, "")

/**
 * Quiz result (SITE_SPEC v8 E.6.13): the match in the PDP layout with
 * "Your color", the reasons, the price and the way to buy it; the kit rows
 * for one cap. Stateless: the answers live in the URL, so a result can be
 * shared.
 */
export default function QuizResultPage(props: PageProps<"/quiz/result">) {
  return (
    <Suspense fallback={<div className="h-[80vh]" aria-busy />}>
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
      {match.kind === "single" && <SingleMatch c={c} color={match.color} title={title} why={why} stock={stock} />}
      {match.kind === "edition" && <EditionMatch hole={match.hole} why={why} c={c} title={title} />}
      {match.kind === "pair" && c.pair && <PairMatch c={c} match={match} why={why} title={title} />}
      {match.kind === "foursome" && c.foursome && <FoursomeMatch c={c} match={match} why={why} title={title} />}

      <div className="wrap flex flex-col items-center gap-3 py-12 text-center">
        <AnswersLine answers={answers} />
        <Link href="/quiz" className="link text-[14.4px]" data-track="quiz_retake">
          Retake the quiz
        </Link>
      </div>
    </>
  )
}

function WhyCard({ lines }: { lines: string[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-2" aria-label="Why it fits you">
      {lines.map((w) => (
        <li key={w} className="flex gap-2 text-[14.4px] leading-[19.73px]">
          <CheckCircle size={18} weight="fill" className="mt-px shrink-0 text-green" aria-hidden />
          {w}
        </li>
      ))}
    </ul>
  )
}

/** One core colour: the PDP layout with "Your color", the reasons, the price and "Shop Pine". */
function SingleMatch({ c, color, title, why, stock }: { c: RopeCatalog; color: string; title: string; why: React.ReactNode; stock: VariantStock }) {
  const core = c.core!
  const v = findVariant(core, { Color: color })
  const n = v ? stock[v.id] : undefined
  const images = imagesFor(core, color)
  return (
    <div className="pdp-grid wrap pt-4 lg:pt-6">
      <div className="pdp-gallery">
        <div className="tile relative aspect-[5/6] lg:aspect-[2/3] lg:max-w-[565px]">
          {images[0] && <Image src={images[0]} alt={title} fill preload sizes="(min-width: 990px) 565px, 100vw" className="tile-photo object-contain" />}
        </div>
      </div>
      <div className="pdp-side">
        <div className="pdp-head pt-4 lg:pt-0">
          <p className="eyebrow-sm">Your color</p>
          <h1 className="title-product mt-1">{`${color} Rope Cap`}</h1>
          {why}
          <p className="price mt-4">{formatMoney(price(core, v).amount)}</p>
        </div>
        <div className="pdp-buy pt-4">
          <ButtonLink href={`/products/rope-cap?color=${encodeURIComponent(color)}`} size="atc" track="quiz_core">
            {`Shop ${color.replace(/^Clubhouse /, "")}`}
          </ButtonLink>
          <p className="meta mt-3">{typeof n === "number" && n <= 0 ? `Sold out in ${color} right now.` : `In stock · ${POLICY.dispatch.toLowerCase()}`}</p>
          <div className="mt-6">
            <BundleRows pair={c.pair} foursome={c.foursome} trackPair="quiz_bundle" trackFoursome="quiz_bundle" />
          </div>
        </div>
      </div>
    </div>
  )
}

function EditionMatch({ hole, why, c, title }: { hole: Hole; why: React.ReactNode; c: RopeCatalog; title: string }) {
  const { time } = holeDate(hole.date)
  const d = shortDate(hole.date)
  const edition = hole.productHandle ? c.editions.find((p) => p.handle === hole.productHandle) : null
  const amount = edition ? price(edition).amount : null
  return (
    <div className="pdp-grid wrap pt-4 lg:pt-6">
      <div className="pdp-gallery">
        <div className="tile relative aspect-[5/6] lg:aspect-[2/3] lg:max-w-[565px]">
          {hole.image ? (
            <Image src={hole.image} alt={title} fill preload sizes="(min-width: 990px) 565px, 100vw" className="tile-photo object-contain" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-display text-[96px] leading-none" aria-hidden>
              {pad2(hole.hole)}
            </span>
          )}
        </div>
      </div>
      <div className="pdp-side">
        <div className="pdp-head pt-4 lg:pt-0">
          <p className="eyebrow-sm">Your color · Hole {pad2(hole.hole)}</p>
          <h1 className="title-product mt-1">{`${hole.name} Rope Cap`}</h1>
          {why}
          <p className="meta mt-3">
            {hole.status === "live" ? "Out now" : d ? `Opens ${d}${time ? `, ${time.replace(" PT", " Pacific")}` : ""}` : "Date to come"}
            {hole.size ? ` · Edition of ${hole.size}` : ""}
          </p>
          {amount !== null && <p className="price mt-2">{formatMoney(amount)}</p>}
        </div>
        <div className="pdp-buy flex flex-col gap-4 pt-4">
          {hole.status === "live" && hole.productHandle ? (
            <ButtonLink href={`/products/${hole.productHandle}`} variant="outline" block track="quiz_edition">
              {`Shop ${hole.name}`}
            </ButtonLink>
          ) : hole.handle ? (
            <TeeSheetForm releaseHandle={hole.handle} hole={hole.hole} name={hole.name} />
          ) : null}
          <Link href="/products/rope-cap" className="link w-fit text-[14.4px]" data-track="quiz_core">
            Or a core color, in stock today
          </Link>
        </div>
      </div>
    </div>
  )
}

async function PairMatch({ c, match, why, title }: { c: RopeCatalog; match: Extract<QuizMatch, { kind: "pair" }>; why: React.ReactNode; title: string }) {
  const stock = await getStock([c.pair!.id])
  return (
    <PairPicker
      pair={c.pair!}
      colors={[...CORE_COLORS]}
      single={price(c.core!).amount}
      stock={stock}
      headline={title}
      initial={[match.first, match.second]}
      source="quiz"
      crumbs={
        <>
          <p className="eyebrow-sm">Your match</p>
          {why}
        </>
      }
    />
  )
}

async function FoursomeMatch({ c, match, why, title }: { c: RopeCatalog; match: Extract<QuizMatch, { kind: "foursome" }>; why: React.ReactNode; title: string }) {
  const stock = await getStock([c.foursome!.id])
  return (
    <>
      <header className="wrap pt-6 text-center">
        <p className="eyebrow-sm">Your match</p>
        <h1 className="title-page mt-2">{title}</h1>
        <div className="mx-auto flex max-w-[560px] justify-center text-left">{why}</div>
      </header>
      <div className="mt-6">
        <FoursomePicker foursome={c.foursome!} colors={[...CORE_COLORS]} single={price(c.core!).amount} stock={stock} initial={match.value} source="quiz" />
      </div>
    </>
  )
}

function AnswersLine({ answers }: { answers: Answers }) {
  return <p className="meta">Your answers: {QUESTIONS.map((q) => answerLabel(q.key, answers[q.key])).join(" · ")}</p>
}
