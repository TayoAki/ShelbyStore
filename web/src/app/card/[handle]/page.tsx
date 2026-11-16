import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Countdown } from "@/components/countdown"
import { RopeRule } from "@/components/rope-rule"
import { TeeSheetForm } from "@/components/tee-sheet-form"
import { Track } from "@/components/track"
import { getRelease } from "@/lib/data/catalog"
import { liveStock, ropeCatalog } from "@/lib/data/rope"
import { holeDate, pad2 } from "@/lib/rope"

export async function generateMetadata({ params }: PageProps<"/card/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const r = await getRelease(handle)
  return r ? { title: r.title, description: r.product_promise ?? undefined } : { title: "Not found" }
}

/** A hole page (G.6.7): hero, the story sheet, then by phase: countdown + tee sheet, shop, or played. */
export default function HolePage(props: PageProps<"/card/[handle]">) {
  return (
    <Suspense fallback={<div className="m-2.5 aspect-[2/1] animate-pulse rounded-[20px] bg-white" />}>
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
  const { day, time } = holeDate(hole.date)
  const phase = hole.status === "live" ? "LIVE NOW" : hole.status === "upcoming" ? "UPCOMING" : hole.status === "sold_out" ? "SOLD OUT" : "PLAYED"
  const colorName = hole.core ? "Tour White" : hole.name

  return (
    <>
      <Track event="drop_viewed" props={{ release_id: release.id, handle: release.handle, phase: release.phase }} />
      <section data-hero="" className="relative m-2.5 grid overflow-hidden rounded-[20px] bg-white md:grid-cols-2" data-track="drop_hero">
        <div className="relative aspect-square">
          {hole.image && <Image src={hole.image} alt={`${hole.name}, Hole ${hole.hole}`} fill preload sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />}
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 pt-20 md:p-12">
          <p className="font-mono text-xs leading-5 tracking-[.1em]">
            HOLE {hole.hole} · {phase}
          </p>
          <h1 className="font-display text-2xl leading-8 text-midnight md:text-[30px] md:leading-9">
            <span className="tabular-nums">{pad2(hole.hole)}</span> <span className="kicker !text-[inherit]">{hole.name}</span>
          </h1>
          {hole.promise && <p className="text-sm leading-5">{hole.promise}</p>}
          <p className="label-score">
            {day ?? "DATE TO BE CONFIRMED"}
            {time ? ` · ${time.toUpperCase()}` : ""}
          </p>
          <RopeRule color={colorName} className="max-w-[320px]" />
          {hole.size && <span className="badge-edition edition w-fit">{hole.status === "live" && hole.left !== null ? `${hole.left} OF ${hole.size} LEFT` : `EDITION OF ${hole.size}`}</span>}
          {hole.status === "live" && (
            <Link href={hole.productHandle ? `/products/${hole.productHandle}` : "/products/rope-cap"} className="btn btn-secondary w-fit" data-track="drop_hero">
              SHOP {hole.core ? "THE ROPE CAP" : hole.name.toUpperCase()}
            </Link>
          )}
        </div>
      </section>

      <article className="mx-2.5 my-10 rounded-3xl bg-white p-6 md:p-10">
        <div className="mx-auto max-w-[65ch]">
          {release.story && <p className="text-base leading-[26px] text-charcoal">{release.story}</p>}
          {release.proof && (
            <>
              <h2 className="mt-8 font-mono text-xs leading-4 tracking-[.1em] uppercase">What to look for</h2>
              <p className="mt-3 text-base leading-[26px] text-charcoal">{release.proof}</p>
            </>
          )}
        </div>
      </article>

      {hole.status === "upcoming" && (
        <section aria-label="Tee sheet" className="band-golf mx-2.5 my-10 flex flex-col items-center gap-6 rounded-3xl p-6 text-center md:p-10">
          {hole.date ? <Countdown iso={hole.date} tone="light" size="large" /> : <p className="text-sm">Coming soon</p>}
          <div className="w-full max-w-[384px] text-left">
            <TeeSheetForm releaseHandle={handle} hole={hole.hole} name={hole.name} />
          </div>
        </section>
      )}
      {(hole.status === "ended" || hole.status === "sold_out") && (
        <section aria-label="Played" className="mx-2.5 my-10 flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center">
          <p className="text-xl leading-7">This hole has been played.</p>
          <Link href="/products/rope-cap" className="btn btn-secondary">
            SHOP THE ROPE CAP
          </Link>
        </section>
      )}
    </>
  )
}
