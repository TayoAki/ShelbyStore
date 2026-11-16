import { POLICY } from "./policy"
import {
  colorOption,
  colorThumbs,
  detailsOf,
  fitProfileOf,
  isOneSize,
  oneSizeRange,
  optionGroups,
  price,
  sizeChartOf,
  usesOf,
  variantOptions,
} from "./product"
import type { Product, VariantStock } from "./types"

/**
 * The fit quiz (SITE_SPEC §12.4; the essay's "connect expressed needs to a
 * recommendation"). Pure and deterministic: the same answers and stock always
 * give the same match. Every "why" line pairs an answer with a product fact,
 * and says so plainly when the match doesn't meet an answer.
 */

export const QUESTIONS = [
  {
    key: "use",
    title: "What will you wear it for most?",
    answers: [
      { value: "everyday", label: "Everyday" },
      { value: "running", label: "Running & training" },
      { value: "sun", label: "Sun & travel" },
      { value: "cold", label: "Cold days" },
    ],
  },
  {
    key: "fit",
    title: "How do caps usually fit you?",
    answers: [
      { value: "fine", label: "Usually fine" },
      { value: "tight", label: "Often too tight" },
      { value: "loose", label: "Often too loose" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    key: "crown",
    title: "How do you like the crown?",
    hint: "The crown is the part that covers your head.",
    answers: [
      { value: "low", label: "Low, close to the head" },
      { value: "structured", label: "Some structure" },
      { value: "any", label: "No preference" },
    ],
  },
  {
    key: "colors",
    title: "Which colors do you reach for?",
    answers: [
      { value: "dark", label: "Dark" },
      { value: "light", label: "Light" },
      { value: "earthy", label: "Earthy" },
      { value: "any", label: "Anything" },
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

/** House colour → family. Unknown colours have no family (never match a family answer). */
const FAMILY: Record<string, "dark" | "light" | "earthy"> = {
  "Washed Black": "dark",
  Black: "dark",
  Navy: "dark",
  Charcoal: "dark",
  Bone: "light",
  Stone: "light",
  Cream: "light",
  Sand: "light",
  "Bone / Brown": "light",
  Olive: "earthy",
  Rust: "earthy",
  Tobacco: "earthy",
  Forest: "earthy",
}

export type Match = {
  product: Product
  color: string | null
  size: string | null
  score: number
  why: string[]
}

const available = (n: number | null | undefined) => n === null || (typeof n === "number" && n > 0)

/** Ranked matches over hats with at least one colour in stock (best first). */
export function rankHats(products: Product[], stock: VariantStock, answers: Answers): Match[] {
  const out: Match[] = []
  for (const product of products) {
    const colorTitle = colorOption(product)
    const sizeTitle = optionGroups(product).find((g) => /size/i.test(g.title))?.title ?? null
    const variants = (product.variants ?? []).filter((v) => available(stock[v.id]))
    if (!variants.length) continue

    const colors = colorThumbs(product)
      .map((c) => c.color)
      .filter((c) => variants.some((v) => !colorTitle || variantOptions(v)[colorTitle] === c))
    const sizesFor = (color: string | null) =>
      variants
        .filter((v) => !colorTitle || !color || variantOptions(v)[colorTitle] === color)
        .map((v) => (sizeTitle ? variantOptions(v)[sizeTitle] : null))
        .filter((s): s is string => !!s)

    const profile = fitProfileOf(product)
    const uses = usesOf(product)
    const oneSize = isOneSize(product)
    const range = oneSizeRange(product, POLICY.oneSize)
    const name = product.title.replace(/^The /, "")
    const fabric = Object.fromEntries(detailsOf(product)).Fabric ?? null
    const why: string[] = []
    let score = 0

    // 1. Use.
    if (uses.includes(answers.use)) {
      score += 4
      why.push(
        answers.use === "everyday" && product.collection?.handle === "core"
          ? `You'll wear it most days: the ${name} is our core cap, always in stock.`
          : `You said ${label("use", answers.use).toLowerCase()}: that's what the ${name} is for${fabric ? ` (${fabric.toLowerCase()})` : ""}.`
      )
    }

    // 2. Crown.
    if (profile && answers.crown === "low") {
      if (profile.crown === "Low") {
        score += 2
        why.push(`You like a low crown: this one is ${profile.crown.toLowerCase()} and ${profile.structure.toLowerCase()}.`)
      } else {
        why.push(`Its crown is ${profile.crown.toLowerCase()}, a little higher than you asked for.`)
      }
    } else if (profile && answers.crown === "structured") {
      const bonus = profile.structure === "Structured" ? 2 : profile.structure === "Semi-structured" ? 1 : -1
      score += bonus
      why.push(
        bonus > 0
          ? `You like some structure: it's ${profile.structure.toLowerCase()}.`
          : `It's ${profile.structure.toLowerCase()}, softer than you asked for.`
      )
    } else if (!profile && answers.crown !== "any") {
      why.push("A beanie has no crown or brim to fit: the rib knit stretches to your head.")
    }

    // 3. Colour: first in-stock colour of the family, else the first in stock.
    const inFamily = answers.colors === "any" ? colors : colors.filter((c) => FAMILY[c] === answers.colors)
    const color = inFamily[0] ?? colors[0] ?? null
    if (answers.colors !== "any") {
      if (inFamily.length) {
        score += 1
        why.push(`You reach for ${answers.colors} colours: ${color} is in stock.`)
      } else if (color) {
        why.push(`Nothing ${answers.colors} is in stock in this style right now, so we picked ${color}.`)
      }
    }

    // 4. Fit and size.
    const sizes = sizesFor(color)
    let size: string | null = null
    const chart = sizeChartOf(product)
    const inches = (s: string) => chart?.rows.find((r) => r.Size === s)?.Inches
    if (oneSize) {
      const max = Number(range.match(/–(\d+(?:\.\d+)?) in/)?.[1] ?? 0)
      if (answers.fit === "tight") {
        if (max > 23.75) score += 1
        why.push(`Caps often feel tight on you: this one ${range}.`)
      } else if (answers.fit === "loose") {
        why.push(`Caps often feel loose on you: the strap ${range}, so you can take it in.`)
      } else {
        why.push(`One size: it ${range}.`)
      }
    } else {
      const want = answers.fit === "tight" ? "L/XL" : answers.fit === "loose" ? "S/M" : null
      if (want && sizes.includes(want)) {
        size = want
        score += 1
        why.push(`Caps often feel ${answers.fit} on you, so we've picked ${want}${inches(want) ? ` (${inches(want)} in)` : ""}.`)
      } else if (want) {
        why.push(`${want} is sold out in ${color} right now; check the size chart before you pick.`)
      } else {
        why.push("It's sized (S/M or L/XL): measure your head with the fit guide before you pick.")
      }
    }

    out.push({ product, color, size, score, why })
  }

  return out.sort(
    (a, b) =>
      b.score - a.score ||
      Number(b.product.collection?.handle === "core") - Number(a.product.collection?.handle === "core") ||
      (price(a.product).amount ?? 0) - (price(b.product).amount ?? 0)
  )
}
