/**
 * Advertorial content (SITE_SPEC G.6.12). Written in Shelby's voice to the
 * reader ("you"), never as a fictional customer or editor, and never naming a
 * competitor. Claims about rope caps in general are hedged; claims about The
 * Rope Cap are product facts. `{tokens}` are filled from live data:
 * {crown} {range} {price} {pair_price} {returns}.
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
    slug: "the-rope-cap",
    product: "rope-cap",
    kicker: "FIELD NOTES",
    headline: "Most rope caps sit too tall. We made one that doesn't.",
    dek: "What changed, how we check it, and what it costs.",
    published: "2026-11-16",
    lead: { src: "/hats/rope-lifestyle-hero.jpg", alt: "A golfer on a links course in a Pine rope cap", caption: "The Rope Cap in Pine, on the walk to the first tee." },
    blocks: [
      { kind: "h2", text: "The cap you bought last summer" },
      {
        kind: "p",
        text: "You liked it in the photo. Then you put it on and it sat up off your head like a stack of coasters. The rope looked good. The crown did not. You wore it twice and it went in the bag.",
      },
      { kind: "h2", text: "Why rope caps run tall" },
      {
        kind: "p",
        text: "Many rope caps start from the same template: a structured five-panel with a high, stiff front, built to hold a big logo. That shape photographs well on a shelf. On a head, it can look like a chef's hat.",
      },
      { kind: "figure", src: "/hats/rope-cap-tour-white-3.jpg", alt: "The Rope Cap in side profile", caption: "Side profile: the crown sits mid, about {crown} cm." },
      { kind: "h2", text: "What we changed" },
      {
        kind: "p",
        text: "We kept the rope and lowered the crown to about {crown} cm, with a lightly structured front instead of a stiff one. The cotton twill is garment-washed, so it feels broken in on day one. The strap is self-fabric with an antique-brass slide and fits {range}.",
      },
      { kind: "cta", label: "See The Rope Cap", to: "pdp", track: "advertorial_inline" },
      { kind: "h2", text: "How we check it" },
      {
        kind: "p",
        text: "We measure the crown of every rope cap we sign off, ruler on camera. The series is called The Crown Test, and it is where you can see the numbers for yourself.",
      },
      { kind: "proof" },
      { kind: "h2", text: "What it costs" },
      {
        kind: "p",
        text: "The Rope Cap is {price}, in four core colors that never run out. Two are {pair_price}, which clears the free-shipping line. Every cap comes with {returns}.",
      },
    ],
  },
]

export const getAdvertorial = (slug: string) => ADVERTORIALS.find((a) => a.slug === slug) ?? null
