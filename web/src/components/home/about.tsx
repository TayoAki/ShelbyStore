import Image from "next/image"
import { ButtonLink } from "../ui/button"

/** "About Shelby" in Melin's About Us slot (SITE_SPEC §6.1.8). */
export function AboutShelby() {
  return (
    <section id="about" className="relative aspect-[390/521] w-full lg:aspect-auto lg:h-[592px]">
      <Image src="/hats/lifestyle-bucket.jpg" alt="" fill sizes="100vw" className="object-cover lg:object-[50%_40%]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.55)_0%,rgba(0,0,0,0)_60%)]" />
      <div className="absolute inset-y-0 left-5 flex max-w-[460px] flex-col justify-center pr-5 text-white lg:left-[72px] lg:pr-0">
        <h2 className="font-heading text-[34px] uppercase leading-[44px] tracking-[2px]">About Shelby</h2>
        <p className="mt-4 font-body text-[18px] leading-[27px]">
          We make one cap we never let run out, and a few small drops a year. We show you the stock count, and we fold every cap into a back pocket before
          we sign it off.
        </p>
        <ButtonLink href="/reasons/everyday-cap" variant="highlight" className="mt-6 self-start" track="home_reasons">
          Why the Everyday Cap
        </ButtonLink>
      </div>
    </section>
  )
}
