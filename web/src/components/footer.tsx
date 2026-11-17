import Link from "next/link"
import { listSeries } from "@/lib/data/content"
import { POLICY } from "@/lib/policy"
import { sunwashedCap } from "@/lib/sunwashed-cap"
import { Accordion } from "./accordion"

type Column = { heading: string; links: { label: string; href: string; track?: string }[] }

/** Eastside's logo band above the footer (SITE_SPEC v8 E.6.0.8): black, the wordmark centred. */
export function Prefooter() {
  return (
    <div className="flex h-40 items-center justify-center bg-ink pt-12 pb-[34px]" aria-hidden>
      <span className="display-mark flex h-[78px] items-center !text-[32px] text-on-ink">Shelby</span>
    </div>
  )
}

export async function Footer() {
  const series = await listSeries()
  const story = series[0] ?? null
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_URL

  const columns: Column[] = [
    {
      heading: "Shop",
      links: [
        { label: sunwashedCap.title, href: sunwashedCap.href },
        { label: "Shop all", href: "/shop" },
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
        ...(tiktok ? [{ label: "TikTok", href: tiktok }] : []),
      ],
    },
  ]

  return (
    <footer className="footer on-ink bg-ink text-white">
      {/* Desktop */}
      <div className="wrap hidden pt-5 pb-[30px] md:block">
        <div className="grid grid-cols-3 gap-8">
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
