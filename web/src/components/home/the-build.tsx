import Image from "next/image"
import Link from "next/link"
import { MaterialRing } from "../material-ring"

/** "The build" (G.6.2 item 4): the material ring on the clubhouse photo with the rope macro. */
export function TheBuild({ callouts }: { callouts: { title: string; body: string }[] }) {
  return (
    <MaterialRing
      id="build"
      background="/hats/rope-clubhouse.jpg"
      callouts={callouts}
      centre={
        <>
          <div className="relative size-[38%] overflow-hidden rounded-full bg-white shadow-[0_.85rem_1rem_rgba(0,0,0,0.25)]">
            <Image src="/hats/rope-cap-tour-white-5.jpg" alt="The braided rope above the brim" fill sizes="200px" className="object-cover" />
          </div>
          <h2 className="font-display text-2xl leading-8">What it&apos;s made of</h2>
          <Link href="/products/rope-cap#scorecard" className="btn btn-primary" data-track="home_scorecard">
            SEE THE SCORECARD
          </Link>
        </>
      }
    />
  )
}
