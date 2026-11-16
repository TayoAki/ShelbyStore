import { TiktokLogo } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { listReleases } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { buildHoles, nextHole } from "@/lib/rope"
import { FooterColumn } from "./footer-column"
import { TeeSheetForm } from "./tee-sheet-form"
import { ValueTiles } from "./value-tiles"

/**
 * Value tiles, then Allbirds' black footer (SITE_SPEC §6.0.8–§6.0.9, G.6.1):
 * the tee sheet for the next hole, an optional TikTok link, four link columns
 * (accordions on mobile) and the bottom row.
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
      heading: "Help",
      links: [
        { label: "Shipping & Returns", href: "/help/shipping-returns" },
        { label: "Fit Guide", href: "/fit-guide" },
        { label: "Custom Orders", href: "/custom", track: "footer_custom" },
        { label: "Your Bag", href: "/cart" },
      ],
    },
    {
      heading: "Shop",
      links: [
        { label: "The Rope Cap", href: "/products/rope-cap" },
        { label: "The Pair", href: "/offer/the-pair" },
        { label: "The Foursome", href: "/offer/the-pair#foursome" },
        { label: "Limited Editions", href: "/shop?group=limited" },
      ],
    },
    {
      heading: "The Card",
      links: [
        ...(live.length ? [{ label: "Now", href: live[0].productHandle ? `/products/${live[0].productHandle}` : "/card" }] : []),
        ...(next ? [{ label: "Next", href: `/card/${next.handle}` }] : []),
        { label: "All Holes", href: "/card" },
      ],
    },
    {
      heading: "Shelby",
      links: [
        ...(story ? [{ label: story.title, href: `/stories/${story.handle}` }] : []),
        { label: "Why The Rope Cap", href: "/reasons/rope-cap" },
        { label: "Quiz", href: "/quiz" },
      ],
    },
  ]

  return (
    <>
      <ValueTiles />
      <footer className="bg-black px-5 py-[3.125rem] text-white md:px-10 md:pt-20 md:pb-5">
        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-10">
            {next?.handle && (
              <div id="notify">
                <TeeSheetForm releaseHandle={next.handle} hole={next.hole} name={next.name} />
              </div>
            )}
            {tiktok && (
              <div>
                <p className="mb-6 font-mono text-xs leading-4 tracking-[.05em] uppercase">Follow Shelby</p>
                <a href={tiktok} aria-label="Shelby on TikTok" className="inline-flex rounded-full border border-white p-2 transition-colors duration-200 hover:bg-white hover:text-black">
                  <TiktokLogo size={24} />
                </a>
              </div>
            )}
          </div>
          <div className="md:grid md:grid-cols-4">
            {columns.map((c) => (
              <FooterColumn key={c.heading} heading={c.heading}>
                <ul className="grid gap-3">
                  {c.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} data-track={"track" in l ? l.track : undefined} className="text-xs leading-4 hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterColumn>
            ))}
          </div>
        </div>
        <div className="grid gap-2 text-xs max-md:grid-cols-2 md:flex md:justify-between md:gap-4">
          <span>© Shelby</span>
          <span className="flex gap-4">
            <Link href="/help/shipping-returns" className="hover:underline">
              Shipping & Returns
            </Link>
            <Link href="/fit-guide" className="hover:underline">
              Fit Guide
            </Link>
          </span>
        </div>
      </footer>
    </>
  )
}
