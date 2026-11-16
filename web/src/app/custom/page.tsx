import type { Metadata } from "next"
import Image from "next/image"
import { Faq } from "@/components/accordion"
import { QuoteForm } from "@/components/custom/quote-form"
import { Track } from "@/components/track"

export const metadata: Metadata = {
  title: "Custom rope caps for clubs and outings",
  description: "Your logo above the rope, on The Rope Cap. Twenty-four caps or more, $40 a cap, 2–4 weeks after artwork approval.",
}

const STEPS = [
  ["Send your logo", "Share a link to your artwork and tell us the colors and how many."],
  ["Approve a proof", "We send a quote and a stitch proof of your logo above the rope."],
  ["We make and ship", "Caps ship 2–4 weeks after you approve the proof."],
]

/**
 * Custom orders (SITE_SPEC v8 E.6.8): an editorial-split hero, the terms as
 * three columns of facts, three numbered steps, the quote form and the FAQ.
 */
export default function CustomPage() {
  return (
    <>
      <Track event="custom_viewed" props={{}} />
      <section className="grid md:grid-cols-2">
        <div className="band-tile flex items-center justify-center px-4 py-12 md:p-12">
          <div className="flex max-w-[460px] flex-col items-center text-center">
            <p className="eyebrow">Custom orders</p>
            <h1 className="display-xl mt-2">Your crest, our cap.</h1>
            <p className="body-editorial mt-3 max-w-[337px]">From 24 caps, $40 each. Clubs, outings, leagues and teams. Your logo embroidered above the rope.</p>
            <a href="#quote" className="btn btn-black btn-sm mt-5">
              Get a Quote
            </a>
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden">
          <Image src="/hats/rope-clubhouse.jpg" alt="A Tour White rope cap on a locker-room bench" fill preload sizes="(min-width: 750px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section aria-label="Terms" className="wrap grid gap-10 py-14 text-center md:grid-cols-3">
        {[
          ["Minimum", "24 caps", "Mix colors in twelves: Tour White, Clubhouse Navy, Pine, Fescue."],
          ["Price", "$40 each", "Set-up is quoted with your artwork, before you pay anything."],
          ["Lead time", "2–4 weeks", "From the day you approve the stitch proof."],
        ].map(([k, v, note]) => (
          <div key={k} className="flex flex-col items-center">
            <p className="eyebrow-sm">{k}</p>
            <p className="title-section mt-1 !text-[30px] md:!text-[38.4px]">{v}</p>
            <p className="meta mt-2 max-w-[32ch]">{note}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="steps-title" className="wrap mx-auto max-w-[1116px] pb-14">
        <h2 id="steps-title" className="display-md text-center">
          How it works
        </h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {STEPS.map(([t, b], i) => (
            <li key={t} className="flex gap-4">
              <span className="font-display text-[38px] leading-none text-green" aria-hidden>
                {i + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="title-card">{t}</span>
                <span className="text-[14.4px] leading-[19.73px]">{b}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section id="quote" aria-labelledby="quote-title" className="band-tile scroll-mt-24 py-14">
        <div className="wrap mx-auto max-w-[780px]">
          <h2 id="quote-title" className="title-page text-center">
            Request a quote
          </h2>
          <div className="mt-8 bg-white p-5 md:p-8">
            <QuoteForm />
          </div>
        </div>
      </section>

      <Faq
        items={[
          { q: "Can I use my club's logo?", a: "Only with the club's permission. The form asks you to confirm you have the right to use the artwork." },
          { q: "Is there a set-up fee?", a: "Yes, quoted with your artwork, before you pay anything." },
          { q: "Can I mix colors?", a: "Yes, in twelves: for example 12 Tour White and 12 Pine." },
          { q: "How long does it take?", a: "2–4 weeks after you approve the proof." },
        ]}
      />
    </>
  )
}
