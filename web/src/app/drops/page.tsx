import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Container } from "@/components/container"
import { DropRow } from "@/components/drop-row"
import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button"
import { listReleases } from "@/lib/data/catalog"

export const metadata: Metadata = { title: "Drops" }

export default async function DropsPage() {
  const releases = await listReleases()
  const live = releases.filter((r) => r.phase === "live")
  const upcoming = releases.filter((r) => r.phase === "upcoming")
  const past = releases.filter((r) => r.phase === "past")

  return (
    <Container className="flex flex-col gap-16 py-8 lg:gap-24 lg:py-12">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-section">Drops</h1>
        <p className="max-w-lg text-[15px] text-ink-muted lg:text-base">Small releases, on a calendar. The core never leaves.</p>
      </div>

      {live.map((r) => (
        <section key={r.id} className="grid gap-6 bg-surface p-4 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-10">
          <Link href={`/drops/${r.handle}`} className="relative aspect-[4/5] overflow-hidden bg-surface-2">
            {r.hero_image && <Image src={r.hero_image} alt={r.title} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" preload />}
          </Link>
          <div className="flex flex-col items-start gap-4">
            <Badge tone="live" dot>
              Live now
            </Badge>
            <h2 className="font-display text-hero">{r.title}</h2>
            {r.product_promise && <p className="max-w-md text-[17px] text-ink-muted">{r.product_promise}</p>}
            <ButtonLink href={`/drops/${r.handle}`}>Shop the drop</ButtonLink>
          </div>
        </section>
      ))}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-[28px] lg:text-[40px]">Coming up</h2>
          <ul className="border-b border-line">
            {upcoming.map((r) => (
              <DropRow key={r.id} release={r} />
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-[28px] lg:text-[40px]">Past drops</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
            {past.map((r) => (
              <Link key={r.id} href={`/drops/${r.handle}`} className="group flex flex-col gap-3">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  {r.hero_image && <Image src={r.hero_image} alt={r.title} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />}
                </div>
                <div>
                  <p className="text-[15px] font-medium group-hover:underline">{r.title}</p>
                  <p className="text-eyebrow text-ink-muted">
                    Dropped {r.published_at ? new Date(r.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
