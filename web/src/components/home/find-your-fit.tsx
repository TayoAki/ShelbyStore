import { Ruler } from "@phosphor-icons/react/dist/ssr"
import Image from "next/image"
import { ButtonLink } from "../ui/button"

/** "Find Your Fit" (Melin's fit-finder promo, SITE_SPEC §6.1.4), pointing at Shelby's own quiz. */
export function FindYourFit() {
  return (
    <section id="fit" className="grid lg:h-[480px] lg:grid-cols-2">
      <div className="flex items-start justify-center bg-tile pt-10 lg:items-center lg:pt-0">
        <span className="relative block h-[300px] w-[300px] lg:h-[420px] lg:w-[420px]">
          <Image src="/hats/everyday-cap-black-3.jpg" alt="The Everyday Cap in profile" fill sizes="(min-width:1024px) 420px, 300px" className="cutout object-contain" />
        </span>
      </div>
      <div className="flex items-center justify-center bg-white px-4 pb-8 pt-6 lg:p-0">
        <div className="flex max-w-[360px] flex-col items-center text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-black" aria-hidden>
            <Ruler size={40} />
          </span>
          <h2 className="mt-6 font-heading text-[18px] leading-[23.4px] lg:text-[26px] lg:leading-[33.8px]">Find Your Fit</h2>
          <p className="mt-3 type-body-sm lg:type-body">
            Four questions about how you wear a hat. We&apos;ll match you to one style, a color that&apos;s in stock and, for sized hats, a size.
          </p>
          <ButtonLink href="/quiz" variant="light" size="large" className="mt-8 lg:w-[228px]" track="home_quiz">
            Take the quiz
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
