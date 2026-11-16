"use client"

import Image from "next/image"
import { useRef, type ReactNode } from "react"
import { useInView, usePathMotion } from "@/lib/motion"

/**
 * Allbirds' material ring (v5 §6.1.4 / §6.4.7, M26–M26d): a photo under three
 * circles, dots travelling the outer path, a floating centre and four callouts
 * that fade in the order 4, 3, 1, 2.
 */
export function MaterialRing({ id, background, centre, callouts }: { id?: string; background: string; centre: ReactNode; callouts: { title: string; body: string }[] }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const path = useRef<SVGPathElement>(null)
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const s = [0.681, 0.825, 0.175, 0.3243]
  usePathMotion(path, dots, { start: inView, from: s.map((x) => x + 0.15), to: s, duration: 1.5, ease: "sine.out", delay: s.map((_, i) => 0.8 + i * 0.4) })
  const pos = ["top-[28.5%] -left-55 text-right", "top-[68.5%] -left-55 text-right", "top-[28.5%] -right-55 text-left", "top-[68.5%] -right-55 text-left"]
  const order = [2, 3, 1, 0]
  const four = callouts.slice(0, 4)

  return (
    <section ref={ref} id={id} data-reveal="" className="relative mx-2.5 my-10 h-[175vw] max-h-[98vh] overflow-hidden rounded-xl text-white md:h-[56.25vw] md:max-h-[90vh] md:rounded-3xl">
      <Image src={background} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute m-auto h-fit w-full max-md:top-[8%] md:inset-0 md:w-[50%] md:max-w-[65vh]">
        <svg viewBox="0 0 200 200" className="w-full" aria-hidden>
          <circle className="ring-circle" cx={100} cy={100} r={70} fill="#212121" fillOpacity={0.1} />
          <circle className="ring-circle" cx={100} cy={100} r={80} fill="none" stroke="white" strokeWidth={0.6} strokeOpacity={0.7} />
          <circle className="ring-circle" cx={100} cy={100} r={90} fill="none" stroke="white" strokeWidth={0.6} strokeOpacity={0.4} />
          <path ref={path} d="M 100,10 a 90,90 0 1,0 0.01,0" fill="none" className="hidden md:block" />
          {s.map((_, i) => (
            <circle key={i} ref={(el) => void (dots.current[i] = el)} cx={100} cy={10} r={0} fill="white" className="hidden md:block" />
          ))}
        </svg>
        <div className="ring-centre absolute inset-0 m-auto flex h-fit w-[60%] flex-col items-center gap-3 text-center">{centre}</div>
        {four.map((c, i) => (
          <div key={c.title} className={`ring-callout absolute hidden w-55 md:block ${pos[i]}`} style={{ ["--i" as string]: order[i] }}>
            <p className="font-mono text-xs leading-5 tracking-[.1em] uppercase">{c.title}</p>
            <p className="text-sm leading-5">{c.body}</p>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-5 bottom-8 grid grid-cols-2 gap-4 md:hidden">
        {four.map((c) => (
          <div key={c.title} className="ring-callout">
            <p className="font-mono text-xs leading-5 tracking-[.1em] uppercase">{c.title}</p>
            <p className="text-sm leading-5">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
