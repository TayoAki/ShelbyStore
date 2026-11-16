import { Suspense, type ReactNode } from "react"
import { getStock } from "@/lib/data/stock"
import { ropeCatalog } from "@/lib/data/rope"
import { fitProfileOf, imagesFor } from "@/lib/product"
import { CORE_COLORS, crownCm, pad2, ropeName } from "@/lib/rope"
import type { Product } from "@/lib/types"
import { BundleRows } from "./bundle-rows"
import { BuyCard } from "./pdp/buy-card"
import { Gallery } from "./pdp/gallery"
import { SelectionProvider } from "./pdp/selection"

/**
 * The core Rope Cap in Eastside's PDP layout for landing pages (story,
 * listicle, advertorial): the colour-synced gallery beside the buy block, its
 * own colour state (no URL writes), live stock and the kit rows.
 */
export async function RopeBuyBlock({
  initialColor,
  showBundles = true,
  source = "landing",
  bundleTrack,
  heading,
  intro,
}: {
  initialColor?: string | null
  showBundles?: boolean
  source?: string
  /** data-track names for the kit rows. */
  bundleTrack?: { pair: string; foursome: string }
  heading?: string
  /** Rendered above the title in the buy column. */
  intro?: ReactNode
  /** Accepted for older callers; v8 always uses the PDP layout. */
  withGallery?: boolean
  withSide?: boolean
  aside?: ReactNode
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
        .map((h) => ({ name: h.name, href: h.productHandle ? `/products/${h.productHandle}` : `/card/${h.handle}`, caption: `No. ${pad2(h.hole)}`, selected: false })),
    },
    ropeByColor: Object.fromEntries(CORE_COLORS.map((col) => [col, ropeName(core, col)])),
    edition: null,
    releaseId: null,
    crown: fit ? { value: fit.crown, note: crownCm(core) ? `about ${crownCm(core)} cm` : null, structure: fit.structure } : null,
    bundles: showBundles ? <BundleRows pair={c.pair} foursome={c.foursome} trackPair={bundleTrack?.pair} trackFoursome={bundleTrack?.foursome} /> : null,
    titleAs: "h2" as const,
    source,
    heading,
    crumbs: intro,
    compact: true,
  }
  const initial = initialColor && (CORE_COLORS as readonly string[]).includes(initialColor) ? initialColor : CORE_COLORS[0]
  return (
    <SelectionProvider initialColor={initial} syncUrl={false}>
      <div className="pdp-grid wrap py-10">
        <Gallery single title={core.title} imagesByColor={Object.fromEntries(CORE_COLORS.map((col) => [col, imagesFor(core, col)]))} fallback={imagesFor(core)} initialColor={initial} />
        <Suspense fallback={<BuyCard {...props} stock={null} />}>
          <Live core={core} props={props} />
        </Suspense>
      </div>
    </SelectionProvider>
  )
}

async function Live({ core, props }: { core: Product; props: Omit<Parameters<typeof BuyCard>[0], "stock"> }) {
  const stock = await getStock([core.id])
  return <BuyCard {...props} stock={stock} />
}
