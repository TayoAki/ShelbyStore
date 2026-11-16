import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Countdown } from "@/components/countdown"
import { NotifyForm } from "@/components/notify-form"
import { cardStatus, ProductCard } from "@/components/product-card"
import { Track } from "@/components/track"
import { ButtonLink } from "@/components/ui/button"
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
    <Suspense fallback={<div className="aspect-[390/260] w-full animate-pulse bg-tile lg:aspect-[1440/412]" />}>
      <DropContent params={props.params} />
    </Suspense>
  )
}

/** A drop, derived from Melin's article page (SITE_SPEC §6.6). */
async function DropContent({ params }: { params: PageProps<"/drops/[handle]">["params"] }) {
  const { handle } = await params
  const [release, region] = await Promise.all([getRelease(handle), getRegion()])
  if (!release) notFound()
  const all = region ? await listProducts(region.id) : []
  const ids = new Set(release.products.map((p) => p.id))
  const purchasable = all.filter((p) => ids.has(p.id))
  const meta =
    release.phase === "live"
      ? ["Limited release", "Live now"]
      : release.phase === "upcoming"
        ? ["Next drop", formatDropDate(release.release_at)]
        : ["Ended", release.published_at ? new Date(release.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""]

  return (
    <>
      <Track event="drop_viewed" props={{ release_id: release.id, handle: release.handle, phase: release.phase }} />
      <div className="relative aspect-[390/260] w-full bg-tile lg:aspect-[1440/412]">
        {release.hero_image && <Image src={release.hero_image} alt={release.title} fill preload sizes="100vw" className="object-cover" />}
      </div>
      <article className="container-article bg-white pt-[27px]">
        <p className="article-meta opacity-60">
          {meta.map((m, i) => (
            <span key={m} className={i ? "pl-3" : "pr-3"}>
              {i ? "| " : ""}
              {m}
            </span>
          ))}
        </p>
        <h1 className="mt-3 article-h1">{release.title}</h1>
        <div className="mt-4">
          {release.story && <p className="article-p">{release.story}</p>}
          {release.product_promise && <p className="article-p italic">“{release.product_promise}”</p>}
        </div>
        {release.proof && (
          <>
            <h2 className="article-h2">What To Look For</h2>
            <p className="article-p">{release.proof}</p>
          </>
        )}
        {release.phase === "upcoming" && (
          <div id="notify" className="mt-8 flex scroll-mt-[120px] flex-col gap-4">
            {release.release_at && <Countdown iso={release.release_at} size="large" />}
            <p className="font-body text-[13px] text-muted">Get an email the moment it drops.</p>
            <NotifyForm releaseId={release.id} />
          </div>
        )}
        {release.phase === "past" && <p className="mt-8 font-heading text-[18px]">This drop has ended.</p>}
      </article>
      {release.phase !== "upcoming" && purchasable.length > 0 && (
        <div className="container-article mt-8">
          <Suspense fallback={<Products products={purchasable} release={release} />}>
            <ProductsWithStock products={purchasable} release={release} />
          </Suspense>
        </div>
      )}
      <div className="container-article pb-[50.512px]">
        <hr className="mb-6 mt-12 border-0 border-t-4 border-black" />
        <div className="flex justify-center">
          <ButtonLink href="/drops" variant="link" className="h-14 w-[144px]">
            ← Back to drops
          </ButtonLink>
        </div>
      </div>
    </>
  )
}

async function ProductsWithStock({ products, release }: { products: Product[]; release: StoreRelease }) {
  return <Products products={products} release={release} stock={await getStock(products.map((p) => p.id))} />
}

function Products({ products, release, stock }: { products: Product[]; release: StoreRelease; stock?: Record<string, number | null> }) {
  const live = release.phase === "live" ? Object.fromEntries(products.map((p) => [p.id, release])) : {}
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} stock={stock} status={cardStatus(p, live)} releaseId={release.phase === "live" ? release.id : undefined} />
      ))}
    </div>
  )
}
