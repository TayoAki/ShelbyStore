/**
 * Advertorial content (SITE_SPEC §12.3). Written in Shelby's voice to the
 * reader ("you"), never as a fictional customer or editor. Claims about caps
 * in general are hedged; claims about the Everyday Cap are product facts.
 * `{tokens}` are filled from live data: {range} {price} {offer_price} {colors} {returns}.
 */
export type ArticleBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "figure"; src: string; alt: string; caption: string }
  | { kind: "cta"; label: string; to: "pdp" | "offer"; track: string }
  /** The series stance and today's live stock count (omitted without data). */
  | { kind: "proof" }

export type Advertorial = {
  slug: string
  product: string
  kicker: string
  headline: string
  dek: string
  published: string
  lead: { src: string; alt: string; caption: string }
  blocks: ArticleBlock[]
}

export const ADVERTORIALS: Advertorial[] = [
  {
    slug: "one-cap",
    product: "everyday-cap",
    kicker: "Field notes",
    headline: "Most caps are made to be replaced. We made one that isn't.",
    dek: "Why a favorite cap goes flat, fades in patches and loses its curve by the end of summer, and what we changed in the Everyday Cap.",
    published: "2026-11-16",
    lead: {
      src: "/hats/lifestyle-hero.jpg",
      alt: "Someone in a washed black cap on a coastal road at golden hour",
      caption: "The Everyday Cap in washed black.",
    },
    blocks: [
      {
        kind: "p",
        text: "You know the one. The cap you wore everywhere for a summer. Then the front started to fold in, the brim flattened into a duck bill, and the color faded in patches where the sun hit it. So you bought another one, and it went the same way.",
      },
      { kind: "p", text: "That usually isn't bad luck. It's how a lot of caps are built." },
      { kind: "h2", text: "Why caps give up" },
      {
        kind: "p",
        text: "Many caps get their shape from a stiff panel behind the front, called buckram. It holds the crown up on the shelf, and it's the first thing to crease when the cap is folded or sat on. Once it creases, it tends to stay creased.",
      },
      {
        kind: "p",
        text: "A brim that's curved by hand can drift back toward flat. And fabric that's dyed but never washed can fade unevenly the first time it meets sun and sweat.",
      },
      {
        kind: "figure",
        src: "/hats/everyday-cap-black-3.jpg",
        alt: "Side profile of the Everyday Cap",
        caption: "From the side: a low, unstructured crown with nothing stiff inside to crease.",
      },
      { kind: "h2", text: "What we changed" },
      {
        kind: "p",
        text: "We took the stiff part out. The Everyday Cap is six panels of cotton twill with a low, unstructured crown, so there's nothing inside to crease. It sits close to your head and folds without a fight.",
      },
      {
        kind: "p",
        text: "We wash it after it's sewn. Garment-washing does the softening and fading before the cap reaches you, so it starts out broken in.",
      },
      {
        kind: "p",
        text: "The brim comes pre-curved, and a fabric strap with an antique-brass buckle adjusts so it {range}.",
      },
      { kind: "cta", label: "See the Everyday Cap", to: "pdp", track: "advertorial_inline" },
      {
        kind: "figure",
        src: "/hats/everyday-cap-black-2.jpg",
        alt: "The back of the Everyday Cap with its fabric strap and brass buckle",
        caption: "The back: a self-fabric strap and an antique-brass buckle.",
      },
      { kind: "h2", text: "How we check it" },
      {
        kind: "p",
        text: "We'd rather show you than tell you. We film the test, and we post the live count of every color on the site. If a color is running low, the page says so.",
      },
      { kind: "proof" },
      {
        kind: "figure",
        src: "/hats/story-crush.jpg",
        alt: "A cap folded in half going into a back pocket",
        caption: "The crush test: folded, pocketed, measured.",
      },
      { kind: "h2", text: "Try it" },
      {
        kind: "p",
        text: "The Everyday Cap is {price} in {colors} colors, or two for {offer_price}. {returns}.",
      },
    ],
  },
]

export const getAdvertorial = (slug: string) => ADVERTORIALS.find((a) => a.slug === slug) ?? null
