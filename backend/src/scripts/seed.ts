import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { RELEASE_MODULE } from "../modules/release"
import ReleaseModuleService from "../modules/release/service"
import {
  createReleaseWorkflow,
  goLiveReleaseWorkflow,
} from "../workflows/release"
import { CORE_COLLECTION_HANDLE } from "../lib/release-data"

const IMG = "https://medusa-public-images.s3.eu-west-1.amazonaws.com"
const DAY = 24 * 60 * 60 * 1000

/** Release date `days` from now at 17:00 UTC (10am Pacific). */
const dropDate = (days: number) => {
  const d = new Date(Date.now() + days * DAY)
  d.setUTCHours(17, 0, 0, 0)
  return d
}

type SizeStock = Record<string, number>

const variantsFor = (
  skuPrefix: string,
  price: number,
  unitCost: number,
  sizes: string[],
  colors?: string[]
) => {
  const combos = colors
    ? colors.flatMap((color) => sizes.map((size) => ({ size, color })))
    : sizes.map((size) => ({ size, color: undefined as string | undefined }))
  return combos.map(({ size, color }) => ({
    title: color ? `${size} / ${color}` : size,
    sku: [skuPrefix, color?.toUpperCase(), size].filter(Boolean).join("-"),
    options: (color ? { Size: size, Color: color } : { Size: size }) as Record<string, string>,
    prices: [{ amount: price, currency_code: "usd" }],
    metadata: { unit_cost: unitCost },
  }))
}

/**
 * Seeds Shelby: one US region, a core collection with the signature tee, and
 * four releases that walk through the playbook:
 *   - Everyday Tee in White: a past light release, reviewed, decision "repeat"
 *   - Vintage Wash: a light release that goes live through the go/no-go checks
 *   - Field Shorts: an upcoming major release (editorial still awaiting approval)
 *   - Lounge Sweatpants: an upcoming light release whose XL run is delayed, so
 *     it will be held on its date unless stock arrives (the playbook's skill test)
 */
export default async function seedShelby({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService = container.resolve(Modules.STORE)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const releaseService: ReleaseModuleService = container.resolve(RELEASE_MODULE)

  const existing = await productModuleService.listProducts({ handle: "everyday-tee" })
  if (existing.length) {
    logger.info("Shelby seed data already present. Skipping.")
    return
  }

  // --- Store, sales channel, region ------------------------------------------
  logger.info("Seeding store...")
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

  // --- Stock location & fulfillment -------------------------------------------
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
  const location = locations[0]

  await updateStoresWorkflow(container).run({
    input: { selector: { id: store.id }, update: { default_location_id: location.id } },
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  let [shippingProfile] = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    })
    shippingProfile = result[0]
  }

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

  // --- Publishable API key ----------------------------------------------------
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

  // --- Catalog -------------------------------------------------------------------
  logger.info("Seeding catalog...")
  const { result: categories } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        { name: "Tees", is_active: true },
        { name: "Sweats", is_active: true },
        { name: "Shorts", is_active: true },
      ],
    },
  })
  const category = (name: string) => categories.find((c) => c.name === name)!.id

  const { result: collections } = await createCollectionsWorkflow(container).run({
    input: { collections: [{ title: "The Core", handle: CORE_COLLECTION_HANDLE }] },
  })
  const coreCollection = collections[0]

  const sizes = ["S", "M", "L", "XL"]
  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "The Everyday Tee",
          handle: "everyday-tee",
          subtitle: "Our signature basic",
          description:
            "A 7.5 oz cotton tee with a vintage-inspired cut: a slightly boxy body, a sleeve that falls just above the elbow and a collar that keeps its shape wash after wash.",
          status: ProductStatus.PUBLISHED,
          collection_id: coreCollection.id,
          category_ids: [category("Tees")],
          shipping_profile_id: shippingProfile.id,
          weight: 250,
          thumbnail: `${IMG}/tee-black-front.png`,
          images: [
            { url: `${IMG}/tee-black-front.png` },
            { url: `${IMG}/tee-black-back.png` },
            { url: `${IMG}/tee-white-front.png` },
            { url: `${IMG}/tee-white-back.png` },
          ],
          metadata: {
            promise: "The tee you reach for first: heavyweight, relaxed, and always in stock.",
            fit_notes: "Relaxed through the body. The sleeve falls just above the elbow. Size down for a closer fit.",
          },
          options: [
            { title: "Size", values: [...sizes, "XXL"] },
            { title: "Color", values: ["Black", "White"] },
          ],
          variants: variantsFor("TEE-EVERYDAY", 32, 9.5, [...sizes, "XXL"], ["Black", "White"]),
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: "Vintage Wash Crew",
          handle: "vintage-wash-crew",
          subtitle: "Limited release",
          description:
            "Our crew sweatshirt, garment-dyed and stone-washed so it feels broken in from the first wear. Same fit as the core crew.",
          status: ProductStatus.DRAFT,
          category_ids: [category("Sweats")],
          shipping_profile_id: shippingProfile.id,
          weight: 600,
          thumbnail: `${IMG}/sweatshirt-vintage-front.png`,
          images: [
            { url: `${IMG}/sweatshirt-vintage-front.png` },
            { url: `${IMG}/sweatshirt-vintage-back.png` },
          ],
          metadata: {
            promise: "The core crew, washed until it feels like you've owned it for years.",
            fit_notes: "Watch the faded seams and how the ribbed hem sits at the hip.",
          },
          options: [{ title: "Size", values: sizes }],
          variants: variantsFor("CREW-VWASH", 68, 21, sizes),
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: "Field Shorts",
          handle: "field-shorts",
          subtitle: "New silhouette",
          description:
            "A 7-inch short cut from the same heavyweight cotton as our tees, with an elastic waist and deep pockets.",
          status: ProductStatus.DRAFT,
          category_ids: [category("Shorts")],
          shipping_profile_id: shippingProfile.id,
          weight: 350,
          thumbnail: `${IMG}/shorts-vintage-front.png`,
          images: [
            { url: `${IMG}/shorts-vintage-front.png` },
            { url: `${IMG}/shorts-vintage-back.png` },
          ],
          metadata: {
            promise: "A short that wears like your favourite tee.",
            fit_notes: "Show the 7-inch inseam above the knee and how it moves on a walk.",
          },
          options: [{ title: "Size", values: sizes }],
          variants: variantsFor("SHORT-FIELD", 54, 15, sizes),
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: "Lounge Sweatpants",
          handle: "lounge-sweatpants",
          subtitle: "New colour",
          description: "Our tapered sweatpant in heather grey, with a brushed-back fleece.",
          status: ProductStatus.DRAFT,
          category_ids: [category("Sweats")],
          shipping_profile_id: shippingProfile.id,
          weight: 650,
          thumbnail: `${IMG}/sweatpants-gray-front.png`,
          images: [
            { url: `${IMG}/sweatpants-gray-front.png` },
            { url: `${IMG}/sweatpants-gray-back.png` },
          ],
          metadata: {
            promise: "The sweatpant you'll wear out of the house.",
            fit_notes: "Show the taper at the ankle cuff in a side-by-side with the black pair.",
          },
          options: [{ title: "Size", values: sizes }],
          variants: variantsFor("PANT-LOUNGE", 64, 18, sizes),
          sales_channels: [{ id: salesChannel.id }],
        },
      ],
    },
  })
  const productId = (handle: string) => products.find((p) => p.handle === handle)!.id

  // --- Inventory --------------------------------------------------------------
  logger.info("Seeding inventory...")
  const stockBySkuPrefix: Record<string, SizeStock> = {
    "TEE-EVERYDAY": { S: 80, M: 140, L: 140, XL: 90, XXL: 40 },
    "CREW-VWASH": { S: 25, M: 40, L: 40, XL: 25 },
    "SHORT-FIELD": { S: 30, M: 45, L: 45, XL: 30 },
    // The XL size run is delayed, so this release will be held on its date.
    "PANT-LOUNGE": { S: 20, M: 30, L: 30, XL: 0 },
  }
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  })
  const levels: CreateInventoryLevelInput[] = inventoryItems.map((item: any) => {
    const sku: string = item.sku ?? ""
    const prefix = Object.keys(stockBySkuPrefix).find((p) => sku.startsWith(p))
    const size = sku.split("-").pop() ?? ""
    return {
      location_id: location.id,
      inventory_item_id: item.id,
      stocked_quantity: prefix ? stockBySkuPrefix[prefix][size] ?? 0 : 0,
    }
  })
  await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: levels } })

  // --- Releases -----------------------------------------------------------------
  logger.info("Seeding releases...")

  // 1. A past light release, reviewed at the end of its returns window.
  const { result: past } = await createReleaseWorkflow(container).run({
    input: {
      data: {
        title: "Everyday Tee in White",
        handle: "everyday-tee-white",
        tier: "light",
        story: "The Everyday Tee, now in white. Same fit, same weight, a new colour for summer.",
        product_promise: "The tee you already love, in white.",
        proof: "Side-by-side try-on in black and white.",
        hero_image: `${IMG}/tee-white-front.png`,
        owner: "Merchandising lead",
        backup_approver: "Founder",
        assets: [
          { key: "pdp-photos-white", kind: "product_images", channel: "site", approved: true },
          { key: "tiktok-side-by-side", kind: "short_video", channel: "tiktok", approved: true },
        ],
        check_mobile_pdp: true,
        check_fulfillment: true,
        check_channel_links: true,
        check_tracking: true,
        capacity_hours: 12,
        actual_hours: 10,
        launch_spend: 80,
        fulfillment_cost_per_order: 6.5,
        selling_cost_rate: 0.03,
        contribution_floor: 300,
      },
      product_ids: [productId("everyday-tee")],
    },
  })
  await releaseService.updateReleases({
    id: past.id,
    status: "reviewed",
    release_at: new Date(Date.now() - 45 * DAY),
    published_at: new Date(Date.now() - 45 * DAY),
    starting_units: 490,
    decision: "repeat",
    decision_notes:
      "Met the contribution floor inside the 12-hour cap and core sizes stayed in stock. Next: a comparable light release before adding cadence.",
    decided_by: "Founder",
    decided_at: new Date(Date.now() - 14 * DAY),
  })

  // 2. A light release that is ready and goes live through the go/no-go checks now.
  const { result: live } = await createReleaseWorkflow(container).run({
    input: {
      data: {
        title: "Vintage Wash",
        handle: "vintage-wash",
        tier: "light",
        status: "scheduled",
        release_at: new Date(),
        story:
          "Our crew sweatshirt, garment-dyed and stone-washed for a broken-in feel from day one. Same fit as the core crew. A limited run, restocked only if it sells through.",
        product_promise: "The core crew, washed until it feels like you've owned it for years.",
        proof: "Close-up of the faded seams and how the hem sits after a wash.",
        hero_image: `${IMG}/sweatshirt-vintage-front.png`,
        owner: "Merchandising lead",
        backup_approver: "Founder",
        assets: [
          { key: "pdp-photos", kind: "product_images", channel: "site", approved: true },
          { key: "tiktok-tryon", kind: "short_video", channel: "tiktok", approved: true },
          { key: "ig-stories", kind: "stories", channel: "instagram", approved: true, optional: true },
        ],
        check_mobile_pdp: true,
        check_fulfillment: true,
        check_channel_links: true,
        check_tracking: true,
        capacity_hours: 16,
        launch_spend: 150,
        fulfillment_cost_per_order: 6.5,
        selling_cost_rate: 0.03,
        contribution_floor: 400,
      },
      product_ids: [productId("vintage-wash-crew")],
    },
  })
  const { result: liveCheck } = await goLiveReleaseWorkflow(container).run({
    input: { release_id: live.id },
  })
  logger.info(
    liveCheck.ready
      ? "Vintage Wash passed its go/no-go checks and is live."
      : `Vintage Wash was held: ${liveCheck.failures.join("; ")}`
  )

  // 3. An upcoming major release. Editorial isn't approved yet, so it would
  //    be held if its date arrived today.
  await createReleaseWorkflow(container).run({
    input: {
      data: {
        title: "Field Shorts",
        handle: "field-shorts",
        tier: "major",
        status: "scheduled",
        release_at: dropDate(5),
        story:
          "A new silhouette for Shelby: a 7-inch short cut from the same heavyweight cotton as our tees. Made for long weekends outside.",
        product_promise: "A short that wears like your favourite tee.",
        proof: "How the short moves on a walk, and the inseam sitting above the knee.",
        hero_image: `${IMG}/shorts-vintage-front.png`,
        owner: "Creative lead",
        backup_approver: "Founder",
        assets: [
          { key: "editorial-weekend", kind: "editorial", channel: "instagram", approved: false },
          { key: "tiktok-walk", kind: "short_video", channel: "tiktok", approved: true },
          { key: "launch-email", kind: "email", channel: "email", approved: false, optional: true },
        ],
        check_mobile_pdp: true,
        check_fulfillment: true,
        capacity_hours: 40,
        launch_spend: 1200,
        fulfillment_cost_per_order: 6.5,
        selling_cost_rate: 0.03,
        contribution_floor: 1500,
      },
      product_ids: [productId("field-shorts")],
    },
  })

  // 4. An upcoming light release with a delayed XL size run.
  await createReleaseWorkflow(container).run({
    input: {
      data: {
        title: "Lounge Sweatpants in Heather",
        handle: "lounge-sweatpants-heather",
        tier: "light",
        status: "scheduled",
        release_at: dropDate(12),
        story: "Our tapered sweatpant in a new heather grey, with a brushed-back fleece.",
        product_promise: "The sweatpant you'll wear out of the house.",
        proof: "Side-by-side of the ankle taper next to the black pair.",
        hero_image: `${IMG}/sweatpants-gray-front.png`,
        owner: "Merchandising lead",
        backup_approver: "Ops lead",
        assets: [
          { key: "pdp-photos-heather", kind: "product_images", channel: "site", approved: true },
          { key: "tiktok-compare", kind: "short_video", channel: "tiktok", approved: true },
        ],
        check_mobile_pdp: true,
        check_fulfillment: true,
        check_channel_links: true,
        check_tracking: true,
        capacity_hours: 12,
        launch_spend: 60,
        fulfillment_cost_per_order: 6.5,
        selling_cost_rate: 0.03,
        contribution_floor: 250,
      },
      product_ids: [productId("lounge-sweatpants")],
    },
  })

  logger.info("Finished seeding Shelby.")
  logger.info(`Publishable API key (EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY): ${apiKey!.token}`)
}
