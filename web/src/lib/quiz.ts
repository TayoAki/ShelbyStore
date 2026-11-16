import { findVariant } from "./product"
import { CORE_COLORS } from "./rope"
import type { Hole } from "./rope"
import type { Product, VariantStock } from "./types"

/**
 * The colour and bundle finder (SITE_SPEC G.6.13): four questions, a
 * deterministic match. Keys and values are the result URL's query string.
 */
export const QUESTIONS = [
  {
    key: "wear",
    question: "Where will it get the most wear?",
    answers: [
      { value: "course", label: "On the course" },
      { value: "range", label: "Range and simulator" },
      { value: "everyday", label: "Everyday" },
      { value: "gift", label: "It's a gift" },
    ],
  },
  {
    key: "palette",
    question: "Which do you reach for?",
    answers: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "earthy", label: "Earthy" },
      { value: "limited", label: "Something limited" },
    ],
  },
  {
    key: "count",
    question: "How many are you buying?",
    answers: [
      { value: "one", label: "Just one" },
      { value: "two", label: "Two" },
      { value: "four", label: "Four (a group or a gift set)" },
    ],
  },
  {
    key: "crown",
    question: "How do you like a crown?",
    answers: [
      { value: "low", label: "Low" },
      { value: "mid", label: "Mid" },
      { value: "tall", label: "Tall" },
      { value: "unsure", label: "No idea" },
    ],
  },
] as const

type Q = (typeof QUESTIONS)[number]
export type Answers = { [K in Q["key"]]: Extract<Q, { key: K }>["answers"][number]["value"] }

/** Answers from the result URL, or null when any is missing or unknown. */
export function parseAnswers(params: Record<string, string | string[] | undefined>): Answers | null {
  const out: Record<string, string> = {}
  for (const q of QUESTIONS) {
    const v = params[q.key]
    if (typeof v !== "string" || !q.answers.some((a) => a.value === v)) return null
    out[q.key] = v
  }
  return out as Answers
}

export const answersQuery = (a: Answers) => new URLSearchParams(a as Record<string, string>).toString()

const label = (key: Q["key"], value: string) =>
  QUESTIONS.find((q) => q.key === key)?.answers.find((a) => a.value === value)?.label ?? value

const BY_PALETTE: Record<string, string> = { light: "Tour White", dark: "Clubhouse Navy", earthy: "Fescue" }
const CONTRAST: Record<string, string> = { "Tour White": "Clubhouse Navy", "Clubhouse Navy": "Tour White", Fescue: "Pine", Pine: "Fescue" }

export type QuizMatch =
  | { kind: "single"; color: string; why: string[] }
  | { kind: "edition"; hole: Hole; why: string[] }
  | { kind: "pair"; first: string; second: string; why: string[] }
  | { kind: "foursome"; value: string; why: string[] }

const inStock = (core: Product | null, stock: VariantStock, color: string) => {
  if (!core) return true
  const v = findVariant(core, { Color: color })
  const n = v ? stock[v.id] : undefined
  return n === null || n === undefined || n > 0
}

/** First in-stock colour starting from `want`, in the order Tour White, Clubhouse Navy, Pine, Fescue. */
function available(core: Product | null, stock: VariantStock, want: string) {
  const order = [want, ...CORE_COLORS.filter((c) => c !== want)]
  return order.find((c) => inStock(core, stock, c)) ?? want
}

/**
 * Deterministic match (G.6.13): colour by palette (limited → the live edition,
 * else the next upcoming one, else Pine), product by count, and a "why" line
 * for every answer paired with a fact.
 */
export function matchQuiz(a: Answers, core: Product | null, stock: VariantStock, holes: Hole[]): QuizMatch {
  const why: string[] = []
  const wearWhy: Record<string, string> = {
    course: "On the course: a moisture-wicking sweatband and a brim that keeps the sun off.",
    range: "Range and simulator: washed cotton that's comfortable for a long session.",
    everyday: "Everyday: four core colors that never run out.",
    gift: "A gift: one size fits 21.5–23.75 in (55–60 cm), and there are 30-day returns.",
  }
  why.push(wearWhy[a.wear])
  const crownWhy: Record<string, string> = {
    low: "Ours sits mid, a touch higher than a low dad cap.",
    mid: "Mid is exactly where ours sits.",
    tall: "Ours is lower than most rope caps; if you like tall, try it on and use the 30-day returns.",
    unsure: "Mid suits most heads; the fit guide shows why.",
  }

  if (a.palette === "limited" && a.count === "one") {
    const live = holes.find((h) => !h.core && h.status === "live" && h.productHandle)
    const next = holes.find((h) => !h.core && h.status === "upcoming")
    const hole = live ?? next
    if (hole) {
      why.push(`Something limited: Hole ${hole.hole}, ${hole.name}${hole.size ? `, an edition of ${hole.size}` : ""}${hole.status === "upcoming" ? ". Join the tee sheet to hear when it goes live." : "."}`)
      why.push(crownWhy[a.crown])
      return { kind: "edition", hole, why }
    }
  }

  const want = a.palette === "limited" ? "Pine" : BY_PALETTE[a.palette]
  const color = available(core, stock, want)
  why.push(`You reach for ${label("palette", a.palette).toLowerCase()}: ${color}${color !== want ? ` (${want} is restocking)` : ""}.`)

  if (a.count === "two") {
    const second = available(core, stock, CONTRAST[color] ?? "Pine")
    why.push(`Two caps: ${color} and a contrasting ${second} as The Pair, which clears free shipping.`)
    why.push(crownWhy[a.crown])
    return { kind: "pair", first: color, second, why }
  }
  if (a.count === "four") {
    const value = a.wear === "gift" ? `4 × ${color}` : "One of each"
    why.push(a.wear === "gift" ? `A gift set of four: four ${color} caps as The Foursome.` : "Four caps: one of each core color as The Foursome.")
    why.push(crownWhy[a.crown])
    return { kind: "foursome", value, why }
  }
  why.push(crownWhy[a.crown])
  return { kind: "single", color, why }
}

export const answerLabel = label
