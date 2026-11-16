import { Suspense, type ReactNode } from "react"
import { getStock } from "@/lib/data/stock"
import { ropeCatalog } from "@/lib/data/rope"
import { fitProfileOf, imagesFor } from "@/lib/product"
import { CORE_COLORS, crownCm, holeDate, ropeName } from "@/lib/rope"
import type { Product } from "@/lib/types"
import { BundleRows } from "./bundle-rows"
import { BuyCard } from "./pdp/buy-card"
import { Gallery } from "./pdp/gallery"
import { SelectionProvider } from "./pdp/selection"

/**
 * The core Rope Cap's buy card for landing pages (story, listicle, advertorial,
 * quiz result): its own colour state (no URL writes), live stock, bundles.
 */
export async function RopeBuyBlock({
  initialColor,
  showBundles = true,
  source = "landing",
  withGallery = false,
  aside,
  bundleTrack,
}: {
  initialColor?: string | null
  showBundles?: boolean
  source?: string
  /** The v5 PDP layout: the colour-synced gallery beside the buy card (quiz result). */
  withGallery?: boolean
  /** Rendered above the buy card (the quiz result's "Why it fits you" card). */
  aside?: ReactNode
  /** data-track names for the bundle rows (the quiz result uses `quiz_bundle`). */
  bundleTrack?: { pair: string; foursome: string }
}) {
  const c = await ropeCatalog()
  if (!c.core) return null
  const core = c.core
  const fit = fitProfileOf(core)
  const props = {
    product: core,
    colors: [...CORE_COLORS] as string[],
    linked: {
      group: "LIMITED" as const,
      swatches: c.holes
        .filter((h) => !h.core && (h.status === "live" || h.status === "upcoming"))
        .map((h) => ({
          name: h.name,
          href: h.productHandle ? `/products/${h.productHandle}` : `/card/${h.handle}`,
          caption: h.status === "upcoming" ? (holeDate(h.date).day ?? "").replace(/ \d{4}$/, "") : null,
          selected: false,
        })),
    },
    ropeByColor: Object.fromEntries(CORE_COLORS.map((col) => [col, ropeName(core, col)])),
    edition: null,
    releaseId: null,
    crown: fit ? { value: fit.crown, note: crownCm(core) ? `about ${crownCm(core)} cm` : null, structure: fit.structure } : null,
    bundles: showBundles ? <BundleRows pair={c.pair} foursome={c.foursome} trackPair={bundleTrack?.pair} trackFoursome={bundleTrack?.foursome} /> : null,
    titleAs: "h2" as const,
    source,
  }
  const initial = initialColor && (CORE_COLORS as readonly string[]).includes(initialColor) ? initialColor : CORE_COLORS[0]
  const card = (
    <Suspense fallback={<BuyCard {...props} stock={null} />}>
      <Live core={core} props={props} />
    </Suspense>
  )
  if (!withGallery)
    return (
      <SelectionProvider initialColor={initial} syncUrl={false}>
        {aside}
        {card}
      </SelectionProvider>
    )
  const imagesByColor = Object.fromEntries(CORE_COLORS.map((col) => [col, imagesFor(core, col)]))
  return (
    <SelectionProvider initialColor={initial} syncUrl={false}>
      <div className="relative md:mx-5 md:grid md:grid-cols-[1fr_45vw] md:items-start md:gap-5 xl:grid-cols-[1fr_38vw] 2xl:grid-cols-[1fr_33vw]">
        <Gallery imagesByColor={imagesByColor} fallback={imagesFor(core)} title={core.title} badge={null} />
        <div className="mt-4 flex flex-col gap-2.5 md:mt-0">
          {aside}
          {card}
        </div>
      </div>
    </SelectionProvider>
  )
}

async function Live({ core, props }: { core: Product; props: Omit<Parameters<typeof BuyCard>[0], "stock"> }) {
  const stock = await getStock([core.id])
  return <BuyCard {...props} stock={stock} />
}
