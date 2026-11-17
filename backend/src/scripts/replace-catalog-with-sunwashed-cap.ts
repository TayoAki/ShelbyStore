import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { RELEASE_MODULE } from "../modules/release"
import type ReleaseModuleService from "../modules/release/service"

const HANDLE = "sunwashed-rope-cap"

export default async function replaceCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)
  const releaseService: ReleaseModuleService = container.resolve(RELEASE_MODULE)
  const [cap] = await productService.listProducts({ handle: HANDLE })

  if (cap?.metadata?.sunwashed_catalog_cutover === true) {
    return
  }

  const [store] = await container.resolve(Modules.STORE).listStores()
  const [shippingProfile] = await container.resolve(Modules.FULFILLMENT).listShippingProfiles({ type: "default" })
  const storefrontUrl = process.env.STOREFRONT_URL
  if (!store?.default_sales_channel_id || !shippingProfile || !storefrontUrl) {
    throw new Error("Catalog replacement requires a default sales channel, a shipping profile, and STOREFRONT_URL.")
  }
  const imageUrl = new URL("/hats/sunwashed-rope-cap.webp", storefrontUrl).href

  const target = cap ?? (await createProductsWorkflow(container).run({
    input: {
      products: [{
        handle: HANDLE,
        title: "Sunwashed Rope Cap",
        subtitle: "Birdie behavior.",
        description: "Washed sage, a cream rope across the brim, and a little birdie behavior stitched up front. For early tee times and questionable scorecards.",
        thumbnail: imageUrl,
        images: [{ url: imageUrl }],
        status: ProductStatus.DRAFT,
        shipping_profile_id: shippingProfile.id,
        sales_channels: [{ id: store.default_sales_channel_id }],
        metadata: { promise: "A little birdie behavior.", rope: "Cream" },
        options: [{ title: "Color", values: ["Washed Sage"] }, { title: "Size", values: ["One Size"] }],
        variants: [{
          title: "Washed Sage / One Size",
          sku: "SUNWASHED-SAGE-OS",
          options: { Color: "Washed Sage", Size: "One Size" },
          prices: [{ currency_code: "usd", amount: 48 }],
          manage_inventory: true,
          allow_backorder: false,
        }],
      }],
    },
  })).result[0]

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
