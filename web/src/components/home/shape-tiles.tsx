import Image from "next/image"
import Link from "next/link"
import { formatDropDate, formatMoney } from "@/lib/format"
import { imageUrl } from "@/lib/product"
import type { Shape } from "@/lib/shapes"
import type { StoreRelease } from "@/lib/types"
import { Container } from "../container"

/**
 * Shop by shape (SITE_SPEC §6.1.2): cut-out tiles on the canvas, shape first
 * (both hat stores studied). The last tile previews the next drop.
 */
export function ShapeTiles({ shapes, next }: { shapes: Shape[]; next: StoreRelease | null }) {
  if (!shapes.length) return null
  const nextImage = next ? imageUrl(next.products[0]?.thumbnail ?? next.hero_image) : null
  return (
    <section id="shapes" className="py-12 lg:py-20">
      <Container className="flex flex-col gap-6 lg:gap-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-section">Shop by shape</h2>
          <Link href="/fit-guide" className="text-[14px] underline underline-offset-4 hover:text-ink-muted" data-track="fit_guide">
            Fit guide
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4">
          {shapes.map((s, i) => (
            <Link key={s.handle} href={`/shop?shape=${s.handle}`} className="group flex flex-col gap-2" data-track="shape_tile">
              <div className="relative aspect-[4/5] overflow-hidden bg-page">
                {s.image && (
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    preload={i < 2}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <span className="font-display text-[24px] leading-none lg:text-[30px]">{s.name}</span>
              <span className="font-mono text-[12px] text-ink-muted">
                {s.count} {s.count === 1 ? "style" : "styles"}
                {s.from !== null && ` · from ${formatMoney(s.from, s.currency)}`}
              </span>
            </Link>
          ))}
          {next && (
            <Link href={`/drops/${next.handle}`} className="group flex flex-col gap-2" data-track="shape_tile">
              <div className="relative aspect-[4/5] overflow-hidden bg-page">
                {nextImage && (
                  <Image src={nextImage} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                )}
                <span className="text-eyebrow absolute left-2 top-2 rounded-[2px] bg-ink px-2 py-1 text-page">Next drop</span>
              </div>
              <span className="font-display text-[24px] leading-none lg:text-[30px]">{next.title}</span>
              <span className="font-mono text-[12px] text-accent-ink">{formatDropDate(next.release_at)}</span>
            </Link>
          )}
        </div>
      </Container>
    </section>
  )
}
