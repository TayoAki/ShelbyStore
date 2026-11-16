import type { Metadata } from "next"
import Image from "next/image"
import { Faq } from "@/components/accordion"
import { QuoteForm } from "@/components/custom/quote-form"
import { Digits } from "@/components/digits"
import { Track } from "@/components/track"

export const metadata: Metadata = {
  title: "Custom rope caps for clubs and outings",
  description: "Your logo above the rope, on The Rope Cap. Twenty-four caps or more, $40 a cap, 2–4 weeks after artwork approval.",
}

/** Custom orders (page_type "custom"): the terms printed as a spec block, three numbered steps, the quote form, the FAQ. */
export default function CustomPage() {
  return (
    <>
      <Track event="custom_viewed" props={{}} />
      <div className="box mt-3 md:mt-6">
        <section className="panel overflow-hidden">
          <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:items-center">
            <div className="flex flex-col gap-5">
              <h1 className="model">Rope caps for your club or outing</h1>
              <p className="max-w-[48ch] text-[1.125rem] leading-[1.6] text-ink-2">Your logo above the rope. Twenty-four caps or more, $40 a cap, 2–4 weeks after you approve the proof.</p>
              <a href="#quote" className="btn btn-secondary btn-large w-fit">
                Get a quote
              </a>
            </div>
            <div className="window aspect-[4/5] md:aspect-square">
              <Image src="/hats/rope-clubhouse.jpg" alt="A Tour White rope cap on a locker-room bench" fill preload sizes="(min-width: 768px) 40vw, 92vw" className="object-cover" />
              <span className="window-shade" aria-hidden />
            </div>
          </div>
        </section>

        <section aria-labelledby="terms-title" className="panel">
          <div className="relative grid grid-cols-[minmax(0,1fr)] gap-8 p-[var(--panel-pad)] md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
            <div className="flex flex-col gap-3">
              <h2 id="terms-title" className="panel-title">
                The terms, on one card
              </h2>
              <p className="text-[1.125rem] leading-[1.6] text-ink-2">Every number here is the number on the invoice.</p>
            </div>
            <table className="scorecard">
              <caption className="sr-only">Custom order terms</caption>
              <tbody>
                {[
                  ["Minimum", "24 caps"],
                  ["Per color", "In twelves"],
                  ["Price", "$40 a cap"],
                  ["Set-up", "Quoted with your artwork"],
                  ["Timing", "2–4 weeks after artwork approval"],
                  ["Colors", "Tour White, Clubhouse Navy, Pine, Fescue"],
                  ["Mark", "Your logo, embroidered above the rope"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="steps-title" className="flex flex-col gap-4">
          <h2 id="steps-title" className="panel-title">
            How it works
          </h2>
          <ol className="grid plate md:grid-cols-3">
            {[
              ["Send your logo", "Share a link to your artwork and tell us the colors and how many."],
              ["Approve a proof", "We send a quote and a stitch proof of your logo above the rope."],
              ["We make and ship", "Caps ship 2–4 weeks after you approve the proof."],
            ].map(([t, b], i) => (
              <li key={t} className="flex flex-col gap-3 bg-paper p-5">
                <span className="text-[3rem] leading-none" aria-hidden>
                  <Digits value={String(i + 1).padStart(2, "0")} />
                </span>
                <span className="text-[1.25rem] font-semibold">{t}</span>
                <span className="text-[1.0625rem] leading-7 text-ink-2">{b}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="quote" aria-labelledby="quote-title" className="panel scroll-mt-28">
          <div className="relative mx-auto flex max-w-[760px] flex-col gap-6 p-[var(--panel-pad)]">
            <h2 id="quote-title" className="panel-title">
              Request a quote
            </h2>
            <QuoteForm />
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
      </div>
    </>
  )
}
