/**
 * Listicle content (SITE_SPEC §12.2). Each reason is tied to a fact the page
 * can show: a product detail, the fit profile, live stock, the content-series
 * record or store policy. `{tokens}` are filled from live data at render;
 * a reason whose `needs` source is missing is dropped (never filled in).
 *
 * Tokens: {range} one-size range · {fabric} details.Fabric (lowercased) ·
 * {Fabric} details.Fabric · {crown} details.Crown · {returns} · {shipping} ·
 * {dispatch} · {story} the content series title.
 */
export type ListicleReason = {
  title: string
  body: string[]
  image: { src: string; alt: string } | null
  /** Live block shown under the text. */
  live?: "fit_scales" | "stock" | "story" | null
  /** Media: one image, or the product's color grid. */
  media?: "color_grid"
  /** Data the reason can't stand without. */
  needs?: "story" | "fit_profile"
  /** "The fact" line under the reason (SITE_SPEC §12.2), with the same tokens. */
  fact: string
}

export type Listicle = {
  handle: string
  /** Product the listicle sells (its buy block). */
  product: string
  eyebrow: string
  /** "{count}" becomes the number of reasons shown. */
  title: string
  dek: string
  description: string
  heroImage: { src: string; alt: string }
  reasons: ListicleReason[]
  /** CTA after these reason numbers (1-based, after filtering). */
  ctaAfter: number[]
}

export const LISTICLES: Listicle[] = [
  {
    handle: "everyday-cap",
    product: "everyday-cap",
    eyebrow: "The Everyday Cap",
    title: "{count} Things That Make The Everyday Cap Different",
    dek: "Every reason below comes with the fact behind it, so you can check it on this page.",
    description: "Garment-washed twill, a low crown, a strap that really adjusts, live stock and 30-day returns: what makes the Everyday Cap different.",
    heroImage: { src: "/hats/everyday-cap-black-1.jpg", alt: "The Everyday Cap in washed black" },
    ctaAfter: [3, 6],
    reasons: [
      {
        title: "Broken In On Day One",
        fact: "Fabric: {Fabric}.",
        body: [
          "The cap is garment-washed after it's sewn: {fabric}. It arrives soft and slightly faded, like a cap you've already worn in.",
          "No stiff crown to wear down first.",
        ],
        image: { src: "/hats/everyday-cap-black-1.jpg", alt: "The Everyday Cap in washed black, three-quarter view" },
      },
      {
        title: "A Low Crown That Sits Close",
        fact: "Crown: {crown}.",
        body: [
          "{crown}. There's no stiff front panel standing up off your head, so it follows the shape of your head instead of sitting on top of it.",
        ],
        image: { src: "/hats/everyday-cap-black-3.jpg", alt: "Side profile of the Everyday Cap showing the low crown" },
        live: "fit_scales",
        needs: "fit_profile",
      },
      {
        title: "One Size That Actually Adjusts",
        fact: "One size: {range}.",
        body: [
          "A self-fabric strap with an antique-brass buckle, adjustable so it {range}.",
          "Not sure where you fall? The fit guide shows how to measure in under a minute.",
        ],
        image: { src: "/hats/everyday-cap-black-2.jpg", alt: "The back of the Everyday Cap: fabric strap and brass buckle" },
      },
      {
        title: "Built For The Back Pocket",
        fact: "From {story}, a filmed test series.",
        body: ["We test it before we sell it, and we film the test."],
        image: { src: "/hats/story-crush.jpg", alt: "A cap folded in half going into a back pocket" },
        live: "story",
        needs: "story",
      },
      {
        title: "Every Color, In Stock",
        fact: "Counts are live sellable stock, read on every visit.",
        body: ["We don't let the core run out, and we don't ask you to take our word for it. These are today's counts."],
        image: null,
        media: "color_grid",
        live: "stock",
      },
      {
        title: "30 Days To Change Your Mind",
        fact: "{returns}: send it back within 30 days of delivery.",
        body: ["{returns}. {shipping}. {dispatch}."],
        image: { src: "/hats/lifestyle-hero-mobile.jpg", alt: "Someone smiling in a washed black Everyday Cap by the sea" },
      },
    ],
  },
]

export const getListicle = (handle: string) => LISTICLES.find((l) => l.handle === handle) ?? null
