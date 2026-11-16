import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateProductCategoriesWorkflow,
  updateProductsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { RELEASE_MODULE } from "../modules/release"
import ReleaseModuleService from "../modules/release/service"
import { ensureRopeCap } from "./seed-rope-cap"

/** The apparel demo this store launched with. Retired (unpublished, not deleted). */
const RETIRED_PRODUCT_HANDLES = ["everyday-tee", "vintage-wash-crew", "field-shorts", "lounge-sweatpants"]
const RETIRED_RELEASE_HANDLES = ["everyday-tee-white", "vintage-wash", "field-shorts", "lounge-sweatpants-heather"]
const RETIRED_CATEGORIES = ["Tees", "Sweats", "Shorts"]

/**
 * Seeds Shelby, a golf brand that sells one product: The Rope Cap (web
 * SITE_SPEC Part G.8). Store setup (region, tax, stock location, shipping,
 * publishable key) runs only on an empty database; earlier catalogs (the
 * apparel demo, then the v4/v5 hats) are unpublished if present; then
 * seed-rope-cap.ts creates the rope cap, its numbered editions, The Pair and
 * The Foursome, Holes 1–4 and free shipping at $85+, each only once.
 */
export default async function seedShelby({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService = container.resolve(Modules.STORE)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const regionModuleService = container.resolve(Modules.REGION)
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
  const releaseService: ReleaseModuleService = container.resolve(RELEASE_MODULE)

  // --- Store, sales channel, region, shipping (first run only) ---------------
  const [store] = await storeModuleService.listStores()
  let [salesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!salesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    })
    salesChannel = result[0]
  }

  let [shippingProfile] = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    })
    shippingProfile = result[0]
  }

  const [existingRegion] = await regionModuleService.listRegions({ name: "United States" })
  let [location] = await stockLocationModuleService.listStockLocations({ name: "Main Warehouse" })

  if (!existingRegion) {
    logger.info("Seeding store...")
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          name: "Shelby",
          supported_currencies: [{ currency_code: "usd", is_default: true }],
          default_sales_channel_id: salesChannel.id,
        },
      },
    })

    const paymentProviders = ["pp_system_default"]
    if (process.env.STRIPE_API_KEY) {
      paymentProviders.push("pp_stripe_stripe")
    }
    const { result: regions } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "United States",
            currency_code: "usd",
            countries: ["us"],
            payment_providers: paymentProviders,
          },
        ],
      },
    })
    const region = regions[0]

    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "us", provider_id: "tp_system" }],
    })

    logger.info("Seeding stock location and shipping...")
    const { result: locations } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Main Warehouse",
            address: { city: "Los Angeles", country_code: "US", address_1: "" },
          },
        ],
      },
    })
    location = locations[0]

    await updateStoresWorkflow(container).run({
      input: { selector: { id: store.id }, update: { default_location_id: location.id } },
    })

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })

    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Main Warehouse delivery",
      type: "shipping",
      service_zones: [
        { name: "United States", geo_zones: [{ country_code: "us", type: "country" }] },
      ],
    })

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })

    const shippingRules = [
      { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
      { attribute: "is_return", value: "false", operator: "eq" as const },
    ]
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: { label: "Standard", description: "3–5 business days.", code: "standard" },
          prices: [
            { currency_code: "usd", amount: 6 },
            { region_id: region.id, amount: 6 },
          ],
          rules: shippingRules,
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: { label: "Express", description: "1–2 business days.", code: "express" },
          prices: [
            { currency_code: "usd", amount: 15 },
            { region_id: region.id, amount: 15 },
          ],
          rules: shippingRules,
        },
      ],
    })

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: location.id, add: [salesChannel.id] },
    })

    const { data: keys } = await query.graph({
      entity: "api_key",
      fields: ["id", "token"],
      filters: { type: "publishable" },
    })
    let apiKey = keys?.[0] as { id: string; token: string } | undefined
    if (!apiKey) {
      const { result } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: "Shelby App", type: "publishable", created_by: "" }] },
      })
      apiKey = result[0] as any
    }
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: apiKey!.id, add: [salesChannel.id] },
    })
    logger.info(`Publishable API key (EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY): ${apiKey!.token}`)
  }

  if (!location) {
    throw new Error("Seed: no 'Main Warehouse' stock location found")
  }

  // --- Retire the apparel demo (unpublish, keep the records) ----------------
  const retiredProducts = await productModuleService.listProducts({ handle: RETIRED_PRODUCT_HANDLES })
  const stillPublished = retiredProducts.filter((p) => p.status !== ProductStatus.DRAFT)
  if (stillPublished.length) {
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: stillPublished.map((p) => p.id) },
        update: { status: ProductStatus.DRAFT },
      },
    })
    logger.info(`Unpublished ${stillPublished.length} apparel demo products.`)
  }
  const retiredReleases = await releaseService.listReleases({ handle: RETIRED_RELEASE_HANDLES })
  if (retiredReleases.length) {
    await releaseService.softDeleteReleases(retiredReleases.map((r) => r.id))
    logger.info(`Archived ${retiredReleases.length} apparel demo releases.`)
  }
  const oldCategories = await productModuleService.listProductCategories({
    name: RETIRED_CATEGORIES,
    is_active: true,
  })
  for (const c of oldCategories) {
    await updateProductCategoriesWorkflow(container).run({
      input: { selector: { id: c.id }, update: { is_active: false } },
    })
  }

  await ensureRopeCap(container, {
    salesChannelId: salesChannel.id,
    shippingProfileId: shippingProfile.id,
    locationId: location.id,
  })
  logger.info("Finished seeding Shelby: The Rope Cap.")
}
