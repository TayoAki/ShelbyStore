import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/container"
import { NotifyForm } from "@/components/notify-form"
import { ProductCard } from "@/components/product-card"
import { RelativeTime } from "@/components/relative-time"
import { Track } from "@/components/track"
import { Badge } from "@/components/ui/badge"
import { getRegion, getRelease, listProducts } from "@/lib/data/catalog"
import { getStock } from "@/lib/data/stock"
import { formatDropDate } from "@/lib/format"
import type { Product, StoreRelease } from "@/lib/types"

export async function generateMetadata({ params }: PageProps<"/drops/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const release = await getRelease(handle)
  return release ? { title: release.title, description: release.product_promise ?? undefined } : { title: "Not found" }
}

export default function DropPage(props: PageProps<"/drops/[handle]">) {
  return (
    <Suspense fallback={<div className="aspect-[4/5] w-full animate-pulse bg-surface lg:aspect-[16/7]" />}>
      <DropContent params={props.params} />
    </Suspense>
  )
}

async function DropContent({ params }: { params: PageProps<"/drops/[handle]">["params"] }) {
  const { handle } = await params
  const [release, region] = await Promise.all([getRelease(handle), getRegion()])
  if (!release) notFound()
  const all = region ? await listProducts(region.id) : []
  const ids = new Set(release.products.map((p) => p.id))
  const purchasable = all.filter((p) => ids.has(p.id))

  return (
    <>
      <Track event="drop_viewed" props={{ release_id: release.id, handle: release.handle, phase: release.phase }} />
      <section className="bg-surface">
        <Container className="grid gap-6 py-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-12">
          <div className="relative aspect-[4/5] overflow-hidden bg-surface-2 lg:order-2">
            {release.hero_image && (
              <Image src={release.hero_image} alt={release.title} fill preload sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            )}
          </div>
          <div className="flex flex-col items-start gap-5 lg:order-1">
            <PhaseBadge release={release} />
            <h1 className="font-display text-hero">{release.title}</h1>
            {release.story && <p className="max-w-lg text-[16px] leading-relaxed lg:text-[17px]">{release.story}</p>}
            {release.product_promise && <p className="max-w-lg text-[17px] italic text-ink-muted">“{release.product_promise}”</p>}
            {release.proof && (
              <div className="flex max-w-lg flex-col gap-1 border-l-2 border-accent bg-page px-4 py-3">
                <p className="text-eyebrow text-accent">What to look for</p>
                <p className="text-[15px]">{release.proof}</p>
              </div>
            )}
            {release.phase === "upcoming" && (
              <div className="flex w-full flex-col gap-2">
                <p className="text-[13px] text-ink-muted">Get an email the moment it drops.</p>
                <NotifyForm releaseId={release.id} />
              </div>
            )}
          </div>
        </Container>
      </section>

      <Container className="flex flex-col gap-6 py-12 lg:py-16">
        {release.phase === "live" && <h2 className="font-display text-section">Shop the drop</h2>}
        {release.phase === "upcoming" && <h2 className="font-display text-section">First look</h2>}
        {release.phase === "past" && (
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-section">This drop has ended</h2>
            {purchasable.length > 0 && <p className="text-[15px] text-ink-muted">A few pieces are still available.</p>}
          </div>
        )}

        {release.phase === "upcoming" ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
            {release.products.map((p) => (
              <div key={p.id} className="flex flex-col gap-3">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  {p.thumbnail && <Image src={p.thumbnail} alt={p.title} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />}
                </div>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-eyebrow text-accent">Available {release.release_at ? formatDropDate(release.release_at) : "soon"}</p>
              </div>
            ))}
          </div>
        ) : (
          <Suspense fallback={<Products products={purchasable} release={release} />}>
            <ProductsWithStock products={purchasable} release={release} />
          </Suspense>
        )}
      </Container>
    </>
  )
}

function PhaseBadge({ release }: { release: StoreRelease }) {
  if (release.phase === "live")
    return (
      <Badge tone="live" dot>
        Live now
      </Badge>
    )
  if (release.phase === "past") return <Badge tone="past">Ended</Badge>
  return (
    <p className="text-eyebrow text-accent">
      {release.release_at ? `Drops ${formatDropDate(release.release_at)}` : "Date coming soon"}
      {release.release_at && (
        <span className="text-ink-muted">
          {" · "}
          <RelativeTime iso={release.release_at} />
        </span>
      )}
    </p>
  )
}

async function ProductsWithStock({ products, release }: { products: Product[]; release: StoreRelease }) {
  const stock = await getStock(products.map((p) => p.id))
  return <Products products={products} release={release} stock={stock} />
}

function Products({ products, release, stock }: { products: Product[]; release: StoreRelease; stock?: Record<string, number | null> }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          stock={stock}
          status={release.phase === "live" ? "live" : "past"}
          releaseTitle={release.title}
          preload={i < 2}
        />
      ))}
    </div>
  )
}
