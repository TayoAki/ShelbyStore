import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Accordion } from "@/components/accordion"
import { Countdown } from "@/components/countdown"
import { HoleCard, shortDate } from "@/components/hole-card"
import { Rail } from "@/components/rail"
import { TeeSheetForm } from "@/components/tee-sheet-form"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
import { getRelease } from "@/lib/data/catalog"
import { liveStock, ropeCatalog } from "@/lib/data/rope"
import { POLICY } from "@/lib/policy"
import { holeDate, nextHole, pad2 } from "@/lib/rope"
import { colorway } from "@/lib/swatches"

export async function generateMetadata({ params }: PageProps<"/card/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const r = await getRelease(handle)
  return r ? { title: r.title, description: r.product_promise ?? undefined } : { title: "Not found" }
}

/**
 * A hole page (SITE_SPEC v8 E.6.7): the PDP breadcrumb, an editorial split
 * (the edition photo, `drop_hero`; then by phase the countdown and tee sheet,
 * the shop button, or "Sold out"), the details accordions and the other holes.
 */
export default function HolePage(props: PageProps<"/card/[handle]">) {
  return (
    <Suspense fallback={<div className="wrap aspect-[2/1] pt-6" aria-busy />}>
      <HoleContent params={props.params} />
    </Suspense>
  )
}

async function HoleContent({ params }: { params: PageProps<"/card/[handle]">["params"] }) {
  const { handle } = await params
  const c = await ropeCatalog()
  const release = c.releases.find((r) => r.handle === handle)
  if (!release) notFound()
  const { holes } = await liveStock(c)
  const hole = holes.find((h) => h.handle === handle)
  if (!hole) notFound()
  const { time } = holeDate(hole.date)
  const d = shortDate(hole.date)
  const ink = colorway(hole.core ? "Tour White" : hole.name)
  const next = nextHole(holes)
  const shopHref = hole.productHandle ? `/products/${hole.productHandle}` : "/products/rope-cap"
  const others = holes.filter((h) => h.hole !== hole.hole)

  return (
    <>
      <Track event="drop_viewed" props={{ release_id: release.id, handle: release.handle, phase: release.phase }} />
      <nav aria-label="Breadcrumb" className="crumbs-pdp wrap py-4">
        <Link href="/">Home</Link>
        <span className="dot" aria-hidden />
        <Link href="/card">The Card</Link>
        <span className="dot" aria-hidden />
        <span aria-current="page">Hole {pad2(hole.hole)}</span>
      </nav>

      <section className="grid md:grid-cols-2">
        <Link href={hole.status === "live" ? shopHref : `/card/${handle}`} data-track="drop_hero" aria-label={`${hole.name}, Hole ${hole.hole}`} className="tile relative block aspect-square">
          {hole.image ? (
            <Image src={hole.image} alt="" fill preload sizes="(min-width: 750px) 50vw, 100vw" className="tile-photo object-contain" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-display text-[96px] leading-none" aria-hidden>
              {pad2(hole.hole)}
            </span>
          )}
          {hole.status === "sold_out" && <span className="badge badge-dark absolute top-[5px] left-[5px]">Sold out</span>}
        </Link>
        <div className="flex items-center justify-center px-4 py-10 md:p-12">
          <div className="flex w-full max-w-[460px] flex-col items-start">
            <p className="eyebrow-sm">Hole {pad2(hole.hole)}</p>
            <h1 className="display-xl mt-2">{hole.name}</h1>
            <p className="meta mt-3">
              {[d ? `${hole.status === "upcoming" || hole.status === "announced" ? "Opens" : "Released"} ${d}${time ? `, ${time.replace(" PT", " Pacific")}` : ""}` : "Date to be confirmed", hole.size ? `Edition of ${hole.size}` : null, hole.status === "live" && hole.left !== null ? `${hole.left} left` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {hole.promise && <p className="body-editorial mt-4">{hole.promise}</p>}
            {hole.status === "upcoming" && (
              <>
                {hole.date && (
                  <div className="mt-5">
                    <Countdown iso={hole.date} size="large" />
                  </div>
                )}
                <div className="mt-5 w-full">
                  <TeeSheetForm releaseHandle={handle} hole={hole.hole} name={hole.name} />
                </div>
              </>
            )}
            {hole.status === "live" && (
              <ButtonLink href={shopHref} className="mt-6" track="drop_hero">
                {hole.core ? "Shop the Rope Cap" : `Shop Hole ${pad2(hole.hole)}`}
              </ButtonLink>
            )}
            {(hole.status === "sold_out" || hole.status === "ended") && (
              <div className="mt-6 flex flex-col items-start gap-3">
                <span className="badge badge-dark">{hole.status === "sold_out" ? "Sold out" : "Played"}</span>
                {next?.handle && (
                  <Link href={`/card/${next.handle}`} className="link text-[14.4px]">
                    Next: Hole {pad2(next.hole)} {next.name}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="wrap mx-auto max-w-[900px] py-12">
        {release.story && <p className="body-editorial mb-6">{release.story}</p>}
        <div className="border-t border-border">
          <Accordion title="The color">
            <p>
              {hole.name}: a {ink.light ? "light" : "dark"} crown with {ink.ropeName ? `a ${ink.ropeName.toLowerCase()}` : "a braided"} rope above the brim.
            </p>
            {release.proof && <p className="mt-2">{release.proof}</p>}
          </Accordion>
          <Accordion title="The release">
            <p>
              {d ? `${d}${time ? `, ${time.replace(" PT", " Pacific")}` : ""}.` : "Date to be confirmed."} {hole.size ? `Edition of ${hole.size}.` : ""} {POLICY.limitedRun}
            </p>
          </Accordion>
          <Accordion title="Shipping">
            <p>{POLICY.shipping}</p>
          </Accordion>
        </div>
      </div>

      {others.length > 0 && (
        <section aria-labelledby="other-holes" className="pb-12">
          <h2 id="other-holes" className="display-md wrap">
            The other holes
          </h2>
          <Rail label="The other holes" className="mt-6" itemClass="[grid-auto-columns:164px] md:[grid-auto-columns:349px]">
            {others.map((h) => (
              <li key={h.hole}>
                <HoleCard hole={h} price={null} />
              </li>
            ))}
          </Rail>
        </section>
      )}
    </>
  )
}
