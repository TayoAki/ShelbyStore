import Link from "next/link"
import { POLICY } from "@/lib/policy"
import { Container } from "./container"
import { Wordmark } from "./wordmark"

export function Footer() {
  const columns: { title: string; links: [string, string][] }[] = [
    { title: "Shop", links: [["The core", "/#core"], ["Drops", "/drops"], ["Everything", "/shop"]] },
    { title: "Help", links: [["Shipping & returns", "/help/shipping-returns"], ["Your bag", "/cart"]] },
    { title: "Shelby", links: [["The 30-Wash Test", "/#series"]] },
  ]
  return (
    <footer className="mt-24 bg-surface py-16">
      <Container className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Wordmark />
          <p className="text-[13px] text-ink-muted">The core, always. Drops, often.</p>
          <p className="text-eyebrow text-ink-muted">{POLICY.announcement}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <p className="text-eyebrow text-ink-muted">{col.title}</p>
            {col.links.map(([label, href]) => (
              <Link key={href} href={href} className="text-[14px] hover:text-ink-muted">
                {label}
              </Link>
            ))}
          </div>
        ))}
      </Container>
      <Container className="mt-12">
        <p className="text-[12px] text-ink-muted">© Shelby</p>
      </Container>
    </footer>
  )
}
