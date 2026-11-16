import Image from "next/image"
import Link from "next/link"
import { POLICY } from "@/lib/policy"

/**
 * The page's close, printed in the base navy ink like the box's bottom flap:
 * the cap on the course through a wide die-cut window, the one line, and the
 * actions that finish the visit.
 */
export function BackPanelClose() {
  return (
    <section aria-labelledby="close-title" className="panel ink-dark overflow-hidden" style={{ "--panel-bg": "#14213D", "--panel-ink": "#FFFFFF", "--panel-line": "#14213D", "--window-edge": "#0B1427" } as React.CSSProperties}>
      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-[var(--panel-pad)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
        <div className="window aspect-[4/5] sm:aspect-[16/9]">
          <Image src="/hats/rope-lifestyle-hero.jpg" alt="A golfer walking a links course in a Pine rope cap" fill sizes="(min-width: 1024px) 55vw, 92vw" className="hidden object-cover sm:block" />
          <Image src="/hats/rope-lifestyle-hero-mobile.jpg" alt="A golfer in a Pine rope cap on a links course" fill sizes="92vw" className="object-cover sm:hidden" />
          <span className="window-shade" aria-hidden />
        </div>
        <div className="flex flex-col gap-5">
          <h2 id="close-title" className="model !text-[clamp(3rem,2rem+4vw,5rem)]">
            One cap. Made properly.
          </h2>
          <p className="max-w-[40ch] text-[1.125rem] leading-[1.6] text-white/90">
            Washed cotton, a mid crown that sits right, and a rope worth looking at. {POLICY.returns}, and any two ship free.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products/rope-cap" className="btn btn-on-ink btn-large" style={{ "--btn-bg": "#FFFFFF", "--btn-fg": "#14213D" } as React.CSSProperties} data-track="hero_shop_core">
              Shop the Rope Cap
            </Link>
            <Link href="/quiz" className="btn btn-outline-white btn-large" data-track="home_quiz">
              Find your color
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
