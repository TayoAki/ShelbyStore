import Link from "next/link"
import { listReleases } from "@/lib/data/catalog"
import { listSeries } from "@/lib/data/content"
import { POLICY } from "@/lib/policy"
import { buildHoles, nextHole } from "@/lib/rope"
import { Accordion } from "./accordion"
import { TeeSheetForm } from "./tee-sheet-form"

type Column = { heading: string; links: { label: string; href: string; track?: string }[] }

/** Eastside's logo band above the footer (SITE_SPEC v8 E.6.0.8): black, the wordmark centred. */
export function Prefooter() {
  return (
    <div className="flex h-40 items-center justify-center bg-ink pt-12 pb-[34px]" aria-hidden>
      <span className="display-mark flex h-[78px] items-center !text-[32px] text-on-ink">Shelby</span>
    </div>
  )
}

/**
 * Eastside's footer (SITE_SPEC v8 E.6.0.9): black, four link columns and the
 * tee sheet for the next hole; on mobile the columns fold into accordions.
 */
export async function Footer() {
  const [releases, series] = await Promise.all([listReleases(), listSeries()])
  const holes = buildHoles(releases)
  const next = nextHole(holes)
  const live = holes.filter((h) => h.status === "live" && !h.core)
  const story = series[0] ?? null
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_URL

  const columns: Column[] = [
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
        ...(tiktok ? [{ label: "TikTok", href: tiktok }] : []),
      ],
    },
  ]

  const tee = next?.handle ? (
    <div id="notify" className="mx-auto flex w-full max-w-[420px] flex-col gap-2 text-center">
      <p className="text-[12.6px] text-on-ink">One email when the next hole opens.</p>
      <p className="font-display text-[24px] leading-[1.1] text-white uppercase">Get on the tee sheet</p>
      <div className="mt-2 text-left">
        <TeeSheetForm releaseHandle={next.handle} hole={next.hole} name={next.name} tone="dark" label={false} />
      </div>
    </div>
  ) : null

  return (
    <footer className="footer on-ink bg-ink text-white">
      {/* Desktop */}
      <div className="wrap hidden pt-5 pb-[30px] md:block">
        <div className="grid grid-cols-[repeat(4,minmax(0,242px))_minmax(0,1fr)] gap-8">
          {columns.map((c) => (
            <nav key={c.heading} aria-label={c.heading}>
              <p className="pt-[17px] text-[14.4px] font-bold uppercase">{c.heading}</p>
              <ul className="mt-2">
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <FooterLink {...l} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="pt-[17px]">{tee}</div>
        </div>
      </div>

      {/* Mobile */}
      <div className="px-4 pt-3 pb-[18px] md:hidden">
        <p className="display-mark pt-[28px] pb-4 text-on-ink">Shelby</p>
        {columns.map((c) => (
          <Accordion key={c.heading} title={c.heading} tone="ink">
            <ul>
              {c.links.map((l) => (
                <li key={l.href + l.label}>
                  <FooterLink {...l} small />
                </li>
              ))}
            </ul>
          </Accordion>
        ))}
        {tee && <div className="pt-8">{tee}</div>}
      </div>

      <div className="wrap flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-[30px] text-[12.6px] text-white/50">
        <span>© Shelby 2026</span>
        <Link href="/help/shipping-returns" className="!text-white/50 hover:!text-on-ink-hover">
          Shipping &amp; returns
        </Link>
        <span>{POLICY.oneSize.replace(/^fits/, "One size fits")}</span>
      </div>
    </footer>
  )
}

function FooterLink({ label, href, track, small = false }: { label: string; href: string; track?: string; small?: boolean }) {
  return (
    <Link href={href} data-track={track} className={`flex items-center text-on-ink ${small ? "min-h-[31px] text-[12.6px]" : "min-h-[35px] text-[14.4px]"}`}>
      {label}
    </Link>
  )
}
