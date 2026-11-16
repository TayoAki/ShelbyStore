import { Users } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Image from "next/image"
import { Faq } from "@/components/accordion"
import { QuoteForm } from "@/components/custom/quote-form"
import { Reveal } from "@/components/motion/reveal"
import { Scorecard } from "@/components/scorecard"
import { Track } from "@/components/track"

export const metadata: Metadata = {
  title: "Custom rope caps for clubs and outings",
  description: "Your logo above the rope, on The Rope Cap. Twenty-four caps or more, $40 a cap, 2–4 weeks after artwork approval.",
}

/** Custom orders (SITE_SPEC G.6.10, page_type "custom"). */
export default function CustomPage() {
  return (
    <>
      <Track event="custom_viewed" props={{}} />
      <section data-hero="" className="hero-in relative m-2.5 h-[70svh] min-h-[480px] overflow-hidden rounded-[20px] text-white md:h-[78vh]">
        <Image src="/hats/rope-clubhouse.jpg" alt="A Tour White rope cap on a locker-room bench" fill preload sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(0deg,rgba(0,0,0,.4),rgba(0,0,0,0))]" aria-hidden />
        <div className="hero-in-content absolute inset-0 flex flex-col items-start justify-end p-8 pt-20 md:items-end md:p-16 md:text-right">
          <p className="mb-4 font-mono text-xs leading-5 font-medium tracking-[.1em]">CUSTOM</p>
          <h1 className="mb-2 font-display text-2xl leading-8 tracking-[.025em]">Rope caps for your club or outing</h1>
          <p className="kicker mb-6 text-white">Your logo above the rope. Twenty-four caps or more.</p>
          <a href="#quote" className="btn btn-primary">
            GET A QUOTE
          </a>
        </div>
      </section>

      <Reveal aria-label="Custom orders" className="band-golf mx-2.5 my-10 grid gap-8 rounded-3xl p-5 md:grid-cols-[1fr_1.4fr] md:p-10">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs leading-5 tracking-[.1em] text-golf-tint">THE TERMS</p>
          <h2 className="font-display text-[30px] leading-9">Custom orders, on one card.</h2>
          <p className="kicker text-golf-tint">Every number here is the number on the invoice.</p>
        </div>
        <Scorecard
          title="Custom orders"
          rows={[
            { label: "MINIMUM", value: "24 caps" },
            { label: "PER COLOR", value: "In twelves" },
            { label: "PRICE", value: "$40 a cap" },
            { label: "SET-UP", value: "Quoted with your artwork" },
            { label: "TIMING", value: "2–4 weeks after artwork approval" },
            { label: "COLORS", value: "Tour White, Clubhouse Navy, Pine, Fescue" },
            { label: "MARK", value: "Your logo, embroidered above the rope" },
          ]}
        />
      </Reveal>

      <Reveal aria-label="How it works" className="grid grid-cols-1 gap-2.5 p-2.5 md:grid-cols-3">
        {[
          ["01 SEND YOUR LOGO", "Share a link to your artwork and tell us the colors and how many."],
          ["02 APPROVE A PROOF", "We send a quote and a stitch proof of your logo above the rope."],
          ["03 WE MAKE AND SHIP", "Caps ship 2–4 weeks after you approve the proof."],
        ].map(([t, b], i) => (
          <div key={t} data-reveal-child="" style={{ ["--i" as string]: i, ["--stagger" as string]: ".05s" }} className="flex flex-col gap-5 rounded-2xl bg-white px-5 pt-10 pb-8 md:p-8">
            <Users size={24} aria-hidden />
            <p className="eyebrow">{t}</p>
            <p className="text-sm leading-[21px]">{b}</p>
          </div>
        ))}
      </Reveal>

      <section id="quote" aria-label="Request a quote" className="mx-2.5 my-10 scroll-mt-28">
        <div className="mx-auto max-w-[720px] rounded-3xl bg-white p-6 md:p-10">
          <h2 className="mb-6 font-display text-2xl leading-8">Request a quote</h2>
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
    </>
  )
}
