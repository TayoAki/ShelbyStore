"use client"

import Image from "next/image"
import { Scorecard } from "../scorecard"
import { Reveal } from "../motion/reveal"
import { useSelection } from "./selection"
import type { Product } from "@/lib/types"

/** The PDP's golf-green band (G.6.3 item 13): side photo and the scorecard for the selected colourway. */
export function ScorecardBand({ product, sideByColor, edition }: { product: Product; sideByColor: Record<string, string>; edition: { size: number | null; left: number | null } | null }) {
  const { color } = useSelection()
  const side = (color && sideByColor[color]) || Object.values(sideByColor)[0]
  return (
    <Reveal id="scorecard" aria-label="The scorecard" className="band-golf m-2.5 my-10 grid scroll-mt-28 gap-8 rounded-xl p-5 md:grid-cols-[1fr_1.2fr] md:rounded-3xl md:p-10">
      <div className="flex flex-col gap-4">
        <p className="font-mono text-xs leading-5 tracking-[.1em] text-golf-tint">THE SCORECARD</p>
        <h2 className="font-display text-[30px] leading-9">Every spec, on one card.</h2>
        <p className="kicker text-golf-tint">Ruled like the card in your back pocket.</p>
        {side && (
          <div className="relative mt-2 aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl bg-white">
            <Image src={side} alt={`${product.title} side profile`} fill sizes="(min-width: 768px) 35vw, 90vw" className="object-contain" />
          </div>
        )}
      </div>
      <div className="self-start text-black">
        <Scorecard product={product} color={color} edition={edition} title={product.title} />
      </div>
    </Reveal>
  )
}
