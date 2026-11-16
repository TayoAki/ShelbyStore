import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Countdown } from "@/components/countdown"
import { NotifyForm } from "@/components/notify-form"
import { ButtonLink } from "@/components/ui/button"
import { listReleases } from "@/lib/data/catalog"
import { formatDropDate } from "@/lib/format"
import type { StoreRelease } from "@/lib/types"

export const metadata: Metadata = { title: "Drops" }

/** Drops index, derived from Melin's blog index (SITE_SPEC §6.6). */
export default function DropsPage(props: PageProps<"/drops">) {
  return (
    <Suspense fallback={<div className="aspect-[2/1] animate-pulse bg-tile lg:aspect-[1440/330]" />}>
      <DropsContent searchParams={props.searchParams} />
    </Suspense>
  )
}

async function DropsContent({ searchParams }: { searchParams: PageProps<"/drops">["searchParams"] }) {
  const tab = (await searchParams).tab === "past" ? "past" : "current"
  const releases = await listReleases()
  const live = releases.filter((r) => r.phase === "live")
  const upcoming = releases
    .filter((r) => r.phase === "upcoming")
    .sort((a, b) => (a.release_at ? Date.parse(a.release_at) : Infinity) - (b.release_at ? Date.parse(b.release_at) : Infinity))
  const past = releases.filter((r) => r.phase === "past")
  const featured = live[0] ?? upcoming[0] ?? null
  const grid = tab === "past" ? past : [...live, ...upcoming]

  return (
    <>
      {featured && (
        <section className="grid lg:h-[330px] lg:grid-cols-2">
          <Link href={`/drops/${featured.handle}`} className="relative block aspect-[390/293] lg:aspect-auto">
            {featured.hero_image && <Image src={featured.hero_image} alt={featured.title} fill preload sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />}
          </Link>
          <div className="flex flex-col items-center justify-center bg-white px-4 py-8 text-center">
            <Meta release={featured} />
            <h1 className="mt-2 font-heading text-[39.808px] uppercase leading-none lg:text-[57.328px]">{featured.title}</h1>
            {featured.product_promise && <p className="mt-2 font-body text-[15px]">{featured.product_promise}</p>}
            {featured.phase === "upcoming" && featured.release_at && (
              <div className="mt-5">
                <Countdown iso={featured.release_at} />
              </div>
            )}
            <ButtonLink href={`/drops/${featured.handle}${featured.phase === "upcoming" ? "#notify" : ""}`} variant="light" className="mt-5" track="drop_hero">
              {featured.phase === "live" ? "Shop the drop" : "Get notified"}
            </ButtonLink>
          </div>
        </section>
      )}
      {!featured && (
        <div className="py-12 text-center">
          <h1 className="font-heading text-[39.808px] uppercase leading-none lg:text-[57.328px]">Drops</h1>
          <p className="mt-2 font-body text-[15px]">Small releases, on a calendar. The core never leaves.</p>
        </div>
      )}

      <nav aria-label="Drop tabs" className="mt-8 flex justify-center">
        <div className="flex h-7 w-[240px] rounded-full bg-mega p-0">
          {(
            [
              ["current", "Live & Upcoming", "/drops"],
              ["past", "Past", "/drops?tab=past"],
            ] as const
          ).map(([key, label, href]) => (
            <Link
              key={key}
              href={href}
              aria-current={tab === key ? "page" : undefined}
              className={`flex flex-1 items-center justify-center rounded-full font-body text-[12px] capitalize ${tab === key ? "border border-black bg-white" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="container-site px-[28px] py-[38px]">
        {grid.length ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-[38px]">
            {grid.map((r) => (
              <article key={r.id} className="flex flex-col gap-2">
                <Meta release={r} />
                <Link href={`/drops/${r.handle}`} className="relative block aspect-[3/2] bg-tile">
                  {r.hero_image && <Image src={r.hero_image} alt={r.title} fill sizes="(min-width:1024px) 436px, 100vw" className="object-cover" />}
                </Link>
                <Link href={`/drops/${r.handle}`} className="mb-[10px] font-heading text-[16px] leading-[20.8px] hover:underline">
                  {r.title}
                </Link>
                {r.phase === "upcoming" && (
                  <>
                    {r.release_at && <Countdown iso={r.release_at} />}
                    <NotifyForm releaseId={r.id} />
                  </>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="py-20 text-center font-body text-[15px]">No drops here yet.</p>
        )}
      </div>
    </>
  )
}

function Meta({ release }: { release: StoreRelease }) {
  const [first, rest] =
    release.phase === "live"
      ? ["Live now", release.published_at ? shortDate(release.published_at) : "Today"]
      : release.phase === "upcoming"
        ? ["Drops", formatDropDate(release.release_at)]
        : ["Ended", release.published_at ? shortDate(release.published_at) : ""]
  return (
    <p className="type-eyebrow uppercase">
      <span className="text-[11px] text-muted">{first}</span> | {rest}
    </p>
  )
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" })
