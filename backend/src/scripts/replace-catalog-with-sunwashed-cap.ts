import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { batchVariantImagesWorkflow, createProductsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { ANALYTICS_MODULE } from "../modules/analytics"
import type AnalyticsModuleService from "../modules/analytics/service"
import { createExperimentWorkflow } from "../workflows/analytics"
import { RELEASE_MODULE } from "../modules/release"
import type ReleaseModuleService from "../modules/release/service"

const HANDLE = "sunwashed-rope-cap"
const PRINTIFY_PRODUCT_ID = "6afbd089a57e3213600a8e97"
const VARIANTS = [
  { color: "Espresso", id: 288210, sku: "28501630377054746155" },
  { color: "Ivory", id: 288216, sku: "76715938844958409254" },
]
const mockup = (variantId: number) =>
  `https://images-api.printify.com/mockup/${PRINTIFY_PRODUCT_ID}/${variantId}/128155/sunwashed-rope-cap-birdie-behavior.jpg?camera_label=front`

export default async function replaceCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)
  const releaseService: ReleaseModuleService = container.resolve(RELEASE_MODULE)
  const [cap] = await productService.listProducts({ handle: HANDLE })

  const analytics = container.resolve<AnalyticsModuleService>(ANALYTICS_MODULE)
  const key = "sunwashed-cap-message"
  const [experiment] = await analytics.listAnalyticsExperiments({ key })
  if (!experiment) {
    await createExperimentWorkflow(container).run({
      input: {
        data: {
          key,
          name: "Sunwashed Rope Cap homepage message",
          hypothesis: "Leading with Birdie behavior produces more orders per exposed visitor than leading with the product name.",
          audience: "ShelbyStore homepage visitors.",
          change_description: "Control: Sunwashed Rope Cap. Treatment: Birdie behavior. Product, photo, pricing and CTA are identical.",
          status: "draft",
          variants: [{ key: "control", weight: 50 }, { key: "birdie", weight: 50 }],
          funnel_steps: [{ event: "order_completed", label: "Placed an order" }],
          minimum_sample: 1400,
          notes: "Start after a delivered test order and purchase attribution are verified. Review at two weeks and 1,400 visitors per group. Treat lower traffic as inconclusive.",
        },
      },
    })
  }

  if (cap?.metadata?.sunwashed_catalog_cutover === true) {
    return
  }

  const [store] = await container.resolve(Modules.STORE).listStores()
  const [shippingProfile] = await container.resolve(Modules.FULFILLMENT).listShippingProfiles({ type: "default" })
  if (!store?.default_sales_channel_id || !shippingProfile) {
    throw new Error("Catalog replacement requires a default sales channel and a shipping profile.")
  }

  const target = cap ?? (await createProductsWorkflow(container).run({
    input: {
      products: [{
        handle: HANDLE,
        title: "Sunwashed Rope Cap",
        subtitle: "Birdie behavior.",
        description: "An adjustable five-panel Comfort Colors rope cap with birdie behavior embroidered on the front. Choose Espresso with white stitching or Ivory with green stitching.",
        thumbnail: mockup(VARIANTS[0].id),
        images: VARIANTS.map(({ id }) => ({ url: mockup(id) })),
        status: ProductStatus.DRAFT,
        shipping_profile_id: shippingProfile.id,
        sales_channels: [{ id: store.default_sales_channel_id }],
        metadata: { promise: "A little birdie behavior.", printify_shop_id: 29788014 },
        options: [{ title: "Color", values: VARIANTS.map(({ color }) => color) }, { title: "Size", values: ["Adjustable"] }],
        variants: VARIANTS.map(({ color, id, sku }) => ({
          title: `${color} / Adjustable`,
          sku,
          options: { Color: color, Size: "Adjustable" },
          prices: [{ currency_code: "usd", amount: 42 }],
          manage_inventory: true,
          allow_backorder: false,
          metadata: { printify_product_id: PRINTIFY_PRODUCT_ID, printify_variant_id: id },
        })),
      }],
    },
  })).result[0]

  const [product] = await productService.listProducts({ id: target.id }, { relations: ["images", "variants"] })
  for (const { id, sku } of VARIANTS) {
    const variant = product?.variants.find((item) => item.sku === sku)
    const image = product?.images.find((item) => item.url === mockup(id))
    if (!variant || !image) {
      throw new Error(`Missing Printify variant or mockup for SKU ${sku}.`)
    }
    await batchVariantImagesWorkflow(container).run({ input: { variant_id: variant.id, add: [image.id] } })
  }

  // Archive release schedules first so their worker cannot republish retired products.
  const releaseIds: string[] = []
  for (let skip = 0; ; skip += 100) {
    const page = await releaseService.listReleases({}, { skip, take: 100, order: { id: "ASC" } })
    releaseIds.push(...page.map(({ id }) => id))
    if (page.length < 100) break
  }
  if (releaseIds.length) await releaseService.softDeleteReleases(releaseIds)

  while (true) {
    const published = await productService.listProducts({ status: ProductStatus.PUBLISHED }, { take: 100 })
    const ids = published.filter(({ id }) => id !== target.id).map(({ id }) => id)
    if (!ids.length) break
    await updateProductsWorkflow(container).run({
      input: { selector: { id: ids }, update: { status: ProductStatus.DRAFT } },
    })
  }

  await updateProductsWorkflow(container).run({
    input: {
      selector: { id: target.id },
      update: {
        status: ProductStatus.PUBLISHED,
        metadata: { ...target.metadata, sunwashed_catalog_cutover: true },
      },
    },
  })
  logger.info("Published Sunwashed Rope Cap and removed the previous catalog from sale.")
}
