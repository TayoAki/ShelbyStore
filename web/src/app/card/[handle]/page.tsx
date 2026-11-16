import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Countdown } from "@/components/countdown"
import { Digits } from "@/components/digits"
import { TeeSheetForm } from "@/components/tee-sheet-form"
import { colorway } from "@/lib/swatches"
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
    <Suspense fallback={<div className="panel m-3 aspect-[2/1] md:m-6" />}>
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
  const phase = hole.status === "live" ? "Live now" : hole.status === "upcoming" ? "Upcoming" : hole.status === "sold_out" ? "Sold out" : "Played"
  const ink = colorway(hole.core ? "Tour White" : hole.name)

  return (
    <>
      <Track event="drop_viewed" props={{ release_id: release.id, handle: release.handle, phase: release.phase }} />
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-3 md:gap-6 md:px-6 md:pt-6">
        <nav aria-label="Breadcrumb" className="label !text-[12px] text-ink-2">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/card" className="hover:underline">
            The Card
          </Link>{" "}
          / Hole {hole.hole}
        </nav>
        <section
          className={`panel ${ink.light ? "" : "ink-dark"}`}
          style={{ "--panel-bg": ink.panel, "--panel-ink": ink.ink, "--panel-line": ink.edge, "--window-edge": ink.edge } as React.CSSProperties}
          data-track="drop_hero"
        >
          <span className="panel-inner" aria-hidden />
          <div className="relative grid grid-cols-[minmax(0,1fr)] gap-8 p-[var(--panel-pad)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center">
            <div className="window aspect-square">
              {hole.image && <Image src={hole.image} alt={`${hole.name}, Hole ${hole.hole}`} fill preload sizes="(min-width: 768px) 45vw, 92vw" className="object-contain p-[8%]" />}
              <span className="window-shade" aria-hidden />
            </div>
            <div className="flex flex-col gap-5">
              <h1 className="flex items-end gap-4">
                <span className="text-[4.5rem] leading-[.8]" aria-hidden>
                  <Digits value={pad2(hole.hole)} />
                </span>
                <span className="model !text-[clamp(3rem,2rem+4vw,5.5rem)]">{hole.name}</span>
              </h1>
              <p className="flex flex-wrap items-center gap-3">
                <span className={hole.status === "live" || hole.status === "upcoming" ? "badge-edition" : "badge"}>
                  Hole {hole.hole} · {phase}
                </span>
                {hole.size && <span className="label">{hole.status === "live" && hole.left !== null ? `${hole.left} of ${hole.size} left` : `Edition of ${hole.size}`}</span>}
              </p>
              {hole.promise && <p className="max-w-[48ch] text-[1.125rem] leading-[1.6]">{hole.promise}</p>}
              <p className="spec-line">
                {day ?? "Date to be confirmed"}
                {time ? ` · ${time}` : ""}
              </p>
              {hole.status === "upcoming" && hole.date && <Countdown iso={hole.date} size="large" />}
              {hole.status === "upcoming" && (
                <div className="max-w-[440px]">
                  <TeeSheetForm releaseHandle={handle} hole={hole.hole} name={hole.name} tone={ink.light ? "light" : "dark"} />
                </div>
              )}
              {hole.status === "live" && (
                <Link href={hole.productHandle ? `/products/${hole.productHandle}` : "/products/rope-cap"} className="btn btn-on-ink btn-large w-fit" style={{ "--btn-bg": ink.light ? "#14213D" : ink.ink, "--btn-fg": ink.light ? "#FFFFFF" : ink.panel } as React.CSSProperties} data-track="drop_hero">
                  Shop {hole.core ? "the Rope Cap" : hole.name}
                </Link>
              )}
            </div>
          </div>
        </section>

        {(release.story || release.proof) && (
          <article className="panel">
            <span className="panel-inner" aria-hidden />
            <div className="relative mx-auto flex max-w-[68ch] flex-col gap-4 p-[var(--panel-pad)] md:py-12">
              {release.story && <p className="text-[1.125rem] leading-[1.7]">{release.story}</p>}
              {release.proof && (
                <>
                  <h2 className="panel-title !text-[2rem]">What to look for</h2>
                  <p className="text-[1.125rem] leading-[1.7]">{release.proof}</p>
                </>
              )}
            </div>
          </article>
        )}

        {(hole.status === "ended" || hole.status === "sold_out") && (
          <section className="panel flex flex-col items-start gap-4 p-[var(--panel-pad)]">
            <p className="panel-title !text-[2.25rem]">This hole has been played.</p>
            <Link href="/products/rope-cap" className="btn btn-secondary">
              Shop the Rope Cap
            </Link>
          </section>
        )}
      </div>
    </>
  )
}
