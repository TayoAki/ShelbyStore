import { TiktokLogo } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { listReleases } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { POLICY } from "@/lib/policy"
import { buildHoles, holeDate, nextHole } from "@/lib/rope"
import { TeeSheetForm } from "./tee-sheet-form"

/**
 * The box's bottom flap: printed in the base navy ink. The tee sheet for the
 * next hole, four printed link columns, and the fine print a box carries.
 */
export async function Footer() {
  const [releases, series] = await Promise.all([listReleases(), listSeries()])
  const holes = buildHoles(releases)
  const next = nextHole(holes)
  const live = holes.filter((h) => h.status === "live" && !h.core)
  const story = series[0] ?? null
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_URL

  const columns = [
    {
      heading: "Shop",
      links: [
        { label: "The Rope Cap", href: "/products/rope-cap" },
        { label: "The Pair", href: "/offer/the-pair" },
        { label: "The Foursome", href: "/offer/the-pair#foursome" },
        { label: "Numbered editions", href: "/shop?group=limited" },
      ],
    },
    {
      heading: "The Card",
      links: [
        ...(live.length ? [{ label: "Now", href: live[0].productHandle ? `/products/${live[0].productHandle}` : "/card" }] : []),
        ...(next ? [{ label: "Next", href: `/card/${next.handle}` }] : []),
        { label: "All six holes", href: "/card" },
      ],
    },
    {
      heading: "Help",
      links: [
        { label: "Shipping & returns", href: "/help/shipping-returns" },
        { label: "Fit guide", href: "/fit-guide" },
        { label: "Custom orders", href: "/custom", track: "footer_custom" },
        { label: "Your bag", href: "/cart" },
      ],
    },
    {
      heading: "Shelby",
      links: [
        ...(story ? [{ label: story.title, href: `/stories/${story.handle}` }] : []),
        { label: "Why the Rope Cap", href: "/reasons/rope-cap" },
        { label: "The quiz", href: "/quiz" },
      ],
    },
  ]

  return (
    <footer className="ink-dark mt-16 border-t-2 border-ink bg-ink text-white">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 pt-14 pb-10 md:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-6">
          <p className="model !text-[clamp(3rem,2rem+4vw,5rem)]">Shelby</p>
          <p className="max-w-[34ch] text-[1.0625rem] leading-7 text-white/85">One rope cap. A mid crown that sits right. New numbered colors when the golf season turns.</p>
          {next?.handle && (
            <div id="notify" className="max-w-[420px]">
              <TeeSheetForm releaseHandle={next.handle} hole={next.hole} name={next.name} />
              <p className="mt-2 text-[0.875rem] text-white/75">
                Hole {next.hole}, {next.name}: {holeDate(next.date).day ?? "date to come"}
              </p>
            </div>
          )}
          {tiktok && (
            <a href={tiktok} aria-label="Shelby on TikTok" className="btn btn-icon-white w-fit">
              <TiktokLogo size={22} />
            </a>
          )}
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {columns.map((c) => (
            <div key={c.heading}>
              <p className="label border-b-2 border-white pb-2">{c.heading}</p>
              <ul className="mt-3 grid gap-1">
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} data-track={"track" in l ? l.track : undefined} className="flex min-h-10 items-center text-[0.9375rem] text-white/90 hover:text-white hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-dashed border-white/40">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-5 text-[0.8125rem] text-white/80 md:px-10">
          <span>© Shelby. One size, {POLICY.oneSize}.</span>
          <span>{POLICY.returns}. Free standard shipping on $85+.</span>
        </div>
      </div>
    </footer>
  )
}
