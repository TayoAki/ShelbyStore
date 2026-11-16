import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { batchVariantImagesWorkflow, createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { ANALYTICS_MODULE } from "../modules/analytics"
import AnalyticsModuleService from "../modules/analytics/service"
import { createExperimentWorkflow } from "../workflows/analytics"

const STOREFRONT = (process.env.STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "")
const img = (file: string) => `${STOREFRONT}/hats/${file}`

const SINGLE_HANDLE = "everyday-cap"
const OFFER_HANDLE = "everyday-two-pack"
const OFFER_PRICE = 68
/** What two singles cost at today's $38: the anchor must stay true. */
const SINGLE_PRICE = 38

/** Lead photo per Everyday Cap colour (the seed's file names). */
const LEAD_IMAGE: Record<string, string> = {
  "Washed Black": "everyday-cap-black-1.jpg",
  Navy: "everyday-cap-navy-1.jpg",
  Bone: "everyday-cap-bone-1.jpg",
  Olive: "everyday-cap-olive-1.jpg",
}

const code = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]+/g, "")

/**
 * Landing-page data (web SITE_SPEC §12), idempotent and safe on every deploy:
 *
 * 1. The Everyday Cap Two-Pack, the one focused deal behind /offer/everyday-two-pack.
 *    Each of its 16 variants (first colour × second colour) is an inventory
 *    kit over the single cap's inventory items, so its availability and stock
 *    decrements follow the real core stock and it can never oversell.
 * 2. The `offer-headline` experiment, so the offer page launches as a test
 *    against a control.
 *
 * DEMO OFFER: $68 for two ($8 under two singles) is a placeholder price. Confirm
 * it before launch; the page reads the price from Medusa.
 */
export async function ensureLandingPages(
  container: MedusaContainer,
  { salesChannelId, shippingProfileId }: { salesChannelId: string; shippingProfileId: string }
) {
  await ensureTwoPack(container, { salesChannelId, shippingProfileId })
  await ensureOfferExperiment(container)
}

async function ensureTwoPack(
  container: MedusaContainer,
  { salesChannelId, shippingProfileId }: { salesChannelId: string; shippingProfileId: string }
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  if ((await productService.listProducts({ handle: OFFER_HANDLE })).length) return

  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "metadata",
      "variants.id",
      "variants.options.value",
      "variants.options.option.title",
      "variants.inventory_items.inventory_item_id",
    ],
    filters: { handle: SINGLE_HANDLE },
  })
  const single = data[0] as any
  if (!single) {
    logger.warn(`[seed] No ${SINGLE_HANDLE} product; skipping the two-pack.`)
    return
  }

  // Colour → the single cap's inventory item for that colour.
  const inventory: Record<string, string> = {}
  for (const v of single.variants ?? []) {
    const color = (v.options ?? []).find((o: any) => o.option?.title === "Color")?.value
    const item = v.inventory_items?.[0]?.inventory_item_id
    if (color && item) inventory[color] = item
  }
  const colors = Object.keys(LEAD_IMAGE).filter((c) => inventory[c])
  if (colors.length < 2) {
    logger.warn("[seed] The Everyday Cap has fewer than two stocked colours; skipping the two-pack.")
    return
  }

  const variants = colors.flatMap((first) =>
    colors.map((second) => ({
      title: `${first} + ${second}`,
      sku: `PACK2-EVERYDAY-${code(first)}-${code(second)}`,
      options: { "First cap": first, "Second cap": second },
      prices: [{ amount: OFFER_PRICE, currency_code: "usd" }],
      manage_inventory: true,
      // One entry per inventory item: the same colour twice is a quantity of 2.
      inventory_items:
        first === second
          ? [{ inventory_item_id: inventory[first], required_quantity: 2 }]
          : [
              { inventory_item_id: inventory[first], required_quantity: 1 },
              { inventory_item_id: inventory[second], required_quantity: 1 },
            ],
      metadata: { unit_cost: 15 },
    }))
  )

  const singleMeta = (single.metadata ?? {}) as Record<string, unknown>
  const files = [...colors.map((c) => LEAD_IMAGE[c]), "everyday-cap-black-2.jpg"]
  const { result } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "The Everyday Cap Two-Pack",
          handle: OFFER_HANDLE,
          subtitle: `Two Everyday Caps for $${OFFER_PRICE}`,
          description:
            "Two Everyday Caps in the colours you pick: garment-washed cotton twill, a low unstructured crown and a strap that adjusts from 21.5 to 23.75 inches. One order, one shipping charge.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfileId,
          weight: 180,
          thumbnail: img(files[0]),
          images: files.map((f) => ({ url: img(f) })),
          metadata: {
            // Offer products stay out of /shop, shape tiles, the fit guide and suggestions.
            offer: true,
            offer_path: `/offer/${OFFER_HANDLE}`,
            single_handle: SINGLE_HANDLE,
            compare_at: SINGLE_PRICE * 2,
            promise: "Two of the cap you reach for first.",
            fit_notes: singleMeta.fit_notes ?? null,
            fit_profile: singleMeta.fit_profile ?? { crown: "Low", structure: "Unstructured" },
            details: singleMeta.details ?? null,
          },
          options: [
            { title: "First cap", values: colors },
            { title: "Second cap", values: colors },
          ],
          variants,
          sales_channels: [{ id: salesChannelId }],
        },
      ],
    },
  })

  // Variant images: the two chosen colours' lead photos (bag thumbnails use the first).
  const { data: created } = await query.graph({
    entity: "product",
    fields: ["images.id", "images.url", "variants.id", "variants.options.value", "variants.options.option.title"],
    filters: { id: result[0].id },
  })
  const product = created[0] as any
  const imageId = (color: string) => product.images.find((i: any) => i.url === img(LEAD_IMAGE[color]))?.id
  for (const v of product.variants ?? []) {
    const opt = (title: string) => (v.options ?? []).find((o: any) => o.option?.title === title)?.value
    const ids = [...new Set([imageId(opt("First cap")), imageId(opt("Second cap"))].filter(Boolean))] as string[]
    if (ids.length) {
      await batchVariantImagesWorkflow(container).run({ input: { variant_id: v.id, add: ids } })
    }
  }
  logger.info(`Created ${OFFER_HANDLE} (${variants.length} kit variants at $${OFFER_PRICE}).`)
}

/** The offer page's headline test (Admin → Analytics → Experiments). */
async function ensureOfferExperiment(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const analytics: AnalyticsModuleService = container.resolve(ANALYTICS_MODULE)
  const key = "offer-headline"
  if ((await analytics.listAnalyticsExperiments({ key })).length) return
  await createExperimentWorkflow(container).run({
    input: {
      data: {
        key,
        name: "Offer page: lead with the price or the saving",
        hypothesis:
          "Leading the two-pack offer with the $8 saving (against two $38 singles) gets more visitors to add the pair than leading with the $68 price.",
        audience: "Everyone who lands on /offer/everyday-two-pack (mostly warm traffic: retargeting, email, the PDP and bag links).",
        change_description:
          "Control headline: \"Two Everyday Caps. $68.\" Variant `saving`: \"Save $8 on two Everyday Caps.\" Everything else on the page is identical.",
        status: "running",
        started_at: new Date(),
        variants: [
          { key: "control", weight: 50 },
          { key: "saving", weight: 50 },
        ],
        funnel_steps: [
          { event: "add_to_cart", filters: [{ key: "page_type", op: "eq", value: "offer" }], label: "Added the pair" },
          { event: "order_completed", label: "Ordered" },
        ],
        minimum_sample: 100,
        notes: "Seeded with the offer page. The minimum sample is per variant; don't call it before then.",
      },
    },
  })
  logger.info(`Started the ${key} experiment.`)
}
