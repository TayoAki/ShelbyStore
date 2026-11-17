import Image from "next/image"
import Link from "next/link"
import { sunwashedCap } from "@/lib/sunwashed-cap"

export function SunwashedCapFeature({
  comingSoon = false,
  birdieFirst = false,
}: {
  comingSoon?: boolean
  birdieFirst?: boolean
}) {
  return (
    <section className="wrap grid items-center gap-8 py-8 md:grid-cols-2 md:gap-14 md:py-16">
      <div className="overflow-hidden bg-[#eee4d8]">
        <Image
          src={sunwashedCap.image}
          alt={sunwashedCap.alt}
          width={1100}
          height={1100}
          sizes="(min-width: 768px) 50vw, 100vw"
          preload
          className="h-auto w-full"
        />
      </div>
      <div className="max-w-lg pb-4">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest">{birdieFirst ? sunwashedCap.title : "Birdie behavior."}</p>
        <h1 className="title-page">{birdieFirst ? "Birdie behavior." : sunwashedCap.title}</h1>
        <p className="mt-4 max-w-sm text-lg">
          Espresso or Ivory, with a braided rope across the brim and a little birdie behavior stitched up front.
          For early tee times and questionable scorecards.
        </p>
        {comingSoon ? (
          <p className="mt-6 font-medium">Coming soon</p>
        ) : (
          <Link href={sunwashedCap.href} className="link mt-6 inline-block" data-track="sunwashed_cap">
            View the cap
          </Link>
        )}
      </div>
    </section>
  )
}
