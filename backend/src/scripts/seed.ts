import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  batchVariantImagesWorkflow,
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
  updateProductCategoriesWorkflow,
  updateProductsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { RELEASE_MODULE } from "../modules/release"
import ReleaseModuleService from "../modules/release/service"
import {
  createReleaseWorkflow,
  goLiveReleaseWorkflow,
} from "../workflows/release"
import { CORE_COLLECTION_HANDLE } from "../lib/release-data"

const DAY = 24 * 60 * 60 * 1000

/**
 * Demo product photos live in the storefront (web/public/hats). They are
 * AI-generated stand-ins: replace them with real photography by uploading
 * images in the admin.
 */
const STOREFRONT = (process.env.STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "")
const img = (file: string) => `${STOREFRONT}/hats/${file}`

/** Release date `days` from now at 17:00 UTC (10am Pacific). */
const dropDate = (days: number) => {
  const d = new Date(Date.now() + days * DAY)
  d.setUTCHours(17, 0, 0, 0)
  return d
}

const ONE_SIZE = "One Size"
const SIZED = ["S/M", "L/XL"]

const code = (value: string) =>
  value === ONE_SIZE ? "OS" : value.toUpperCase().replace(/[^A-Z0-9]+/g, "")

const variantsFor = (
  skuPrefix: string,
  price: number,
  unitCost: number,
  sizes: string[],
  colors: string[]
) =>
  colors.flatMap((color) =>
    sizes.map((size) => ({
      title: `${color} / ${size}`,
      sku: `${skuPrefix}-${code(color)}-${code(size)}`,
      options: { Color: color, Size: size } as Record<string, string>,
      prices: [{ amount: price, currency_code: "usd" }],
      metadata: { unit_cost: unitCost },
    }))
  )

/** Sizing for the sized hats (head circumference). Demo values; confirm with the factory spec. */
const HAT_SIZE_CHART = {
  unit: "head circumference",
  columns: ["Size", "Inches", "Centimetres", "Fitted size"],
  rows: [
    { Size: "S/M", Inches: "21.5–22.5", Centimetres: "55–57", "Fitted size": "6⅞–7⅛" },
    { Size: "L/XL", Inches: "22.75–23.75", Centimetres: "58–60", "Fitted size": "7¼–7½" },
  ],
}

/** The apparel demo this store launched with. Retired (unpublished, not deleted) on the move to hats. */
const RETIRED_PRODUCT_HANDLES = ["everyday-tee", "vintage-wash-crew", "field-shorts", "lounge-sweatpants"]
const RETIRED_RELEASE_HANDLES = ["everyday-tee-white", "vintage-wash", "field-shorts", "lounge-sweatpants-heather"]
const RETIRED_CATEGORIES = ["Tees", "Sweats", "Shorts"]

/**
 * Seeds Shelby, a hat brand: one US region, a core collection with the
 * signature Everyday Cap, four more styles, and four releases that walk
 * through the playbook:
 *   - Everyday Cap in Bone: a past light release, reviewed, decision "repeat"
 *   - Corduroy Cap: a light release that goes live through the go/no-go checks
 *   - The Bucket Hat: an upcoming major release (editorial still awaiting approval)
 *   - Waxed Field Cap: an upcoming light release whose L/XL run is delayed, so
 *     it will be held on its date unless stock arrives (the playbook's skill test)
 *
 * Every step is idempotent: store setup runs only on an empty database, the
 * apparel demo is retired if present, and the hat catalog is created once.
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

  // --- Hat catalog (once) -----------------------------------------------------
  const existing = await productModuleService.listProducts({ handle: "everyday-cap" })
  if (existing.length) {
    logger.info("Shelby hat catalog already present. Skipping.")
    return
  }

  logger.info("Seeding hat catalog...")
  const { result: categories } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        { name: "Caps", handle: "caps", is_active: true },
        { name: "Truckers", handle: "truckers", is_active: true },
        { name: "Beanies", handle: "beanies", is_active: true },
        { name: "Bucket Hats", handle: "bucket-hats", is_active: true },
      ],
    },
  })
  const category = (name: string) => categories.find((c) => c.name === name)!.id

  let [coreCollection] = await productModuleService.listProductCollections({
    handle: CORE_COLLECTION_HANDLE,
  })
  if (!coreCollection) {
    const { result: collections } = await createCollectionsWorkflow(container).run({
      input: { collections: [{ title: "The Core", handle: CORE_COLLECTION_HANDLE }] },
    })
    coreCollection = collections[0]
  }

  /** Images per colour, in gallery order. Product-level images not listed here show for every colour. */
  const colorImages: Record<string, Record<string, string[]>> = {
    "everyday-cap": {
      "Washed Black": ["everyday-cap-black-1.jpg", "everyday-cap-black-2.jpg", "everyday-cap-black-3.jpg"],
      Navy: ["everyday-cap-navy-1.jpg"],
      Bone: ["everyday-cap-bone-1.jpg"],
      Olive: ["everyday-cap-olive-1.jpg"],
    },
    trucker: {
      Black: ["trucker-black-1.jpg", "trucker-black-2.jpg"],
      "Bone / Brown": ["trucker-bone-1.jpg"],
    },
    "ribbed-beanie": {
      Charcoal: ["beanie-charcoal-1.jpg"],
      Rust: ["beanie-rust-1.jpg"],
      Cream: ["beanie-cream-1.jpg"],
    },
    "performance-cap": {
      Black: ["performance-cap-black-1.jpg"],
      Stone: ["performance-cap-stone-1.jpg"],
    },
    "corduroy-cap": {
      Tobacco: ["corduroy-cap-tobacco-1.jpg"],
      Forest: ["corduroy-cap-forest-1.jpg"],
    },
    "bucket-hat": {
      Sand: ["bucket-hat-sand-1.jpg"],
      Black: ["bucket-hat-black-1.jpg"],
    },
    "waxed-field-cap": {
      Olive: ["waxed-field-cap-olive-1.jpg"],
    },
  }
  const imagesOf = (handle: string, extra: string[] = []) => {
    const files = [...Object.values(colorImages[handle]).flat(), ...extra]
    return { thumbnail: img(files[0]), images: files.map((f) => ({ url: img(f) })) }
  }
  const colorsOf = (handle: string) => Object.keys(colorImages[handle])

  const capDetails = {
    Crown: "Six panels, unstructured, low profile",
    Brim: "Pre-curved, 2.75 in",
    Closure: "Self-fabric strap with an antique-brass buckle",
    Fabric: "100% cotton twill, garment-washed",
    Care: "Spot clean or hand wash cold. Reshape and air dry.",
  }

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "The Everyday Cap",
          handle: "everyday-cap",
          subtitle: "Our signature cap",
          description:
            "A six-panel cap in garment-washed cotton twill with a low, unstructured crown and a pre-curved brim. Broken in from the first wear, and built to keep its shape after years in a back pocket.",
          status: ProductStatus.PUBLISHED,
          collection_id: coreCollection.id,
          category_ids: [category("Caps")],
          shipping_profile_id: shippingProfile.id,
          weight: 90,
          ...imagesOf("everyday-cap"),
          metadata: {
            promise: "The cap you reach for first: soft, low and always in stock.",
            fit_notes:
              "One size. The strap adjusts from 21.5 to 23.75 inches, which fits most adult heads. The low crown sits close to the head.",
            details: capDetails,
          },
          options: [
            { title: "Color", values: colorsOf("everyday-cap") },
            { title: "Size", values: [ONE_SIZE] },
          ],
          variants: variantsFor("CAP-EVERYDAY", 38, 7.5, [ONE_SIZE], colorsOf("everyday-cap")),
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: "The Trucker",
          handle: "trucker",
          subtitle: "Mesh-back snapback",
          description:
            "A structured trucker with a cotton-twill front, breathable mesh back and plastic snap. Mid-height crown, slightly curved brim.",
          status: ProductStatus.PUBLISHED,
          category_ids: [category("Truckers")],
          shipping_profile_id: shippingProfile.id,
          weight: 100,
          ...imagesOf("trucker"),
          metadata: {
            promise: "A summer cap that breathes.",
            fit_notes: "One size. The snap closure adjusts from 21.5 to 24 inches. Mid-height structured crown.",
            details: {
              Crown: "Five panels, structured front, mid profile",
              Brim: "Slight curve, 2.75 in",
              Closure: "Plastic snap",
              Fabric: "Cotton twill front, polyester mesh back",
              Care: "Spot clean only.",
            },
          },
          options: [
            { title: "Color", values: colorsOf("trucker") },
            { title: "Size", values: [ONE_SIZE] },
          ],
          variants: variantsFor("TRUCKER", 40, 8, [ONE_SIZE], colorsOf("trucker")),
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: "The Ribbed Beanie",
          handle: "ribbed-beanie",
          subtitle: "Merino-blend knit",
          description:
            "A cuffed rib-knit beanie in a soft merino and recycled-nylon blend. Warm without the itch, and it holds its shape after a season of wear.",
          status: ProductStatus.PUBLISHED,
          category_ids: [category("Beanies")],
          shipping_profile_id: shippingProfile.id,
          weight: 110,
          ...imagesOf("ribbed-beanie"),
          metadata: {
            promise: "The cold-weather staple.",
            fit_notes: "One size. Wear it cuffed for a close fit, or uncuffed for a slouch.",
            details: {
              Knit: "2×2 rib with a deep cuff",
              Fabric: "70% merino wool, 30% recycled nylon",
              Care: "Hand wash cold, dry flat.",
            },
          },
          options: [
            { title: "Color", values: colorsOf("ribbed-beanie") },
            { title: "Size", values: [ONE_SIZE] },
          ],
          variants: variantsFor("BEANIE", 34, 7, [ONE_SIZE], colorsOf("ribbed-beanie")),
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: "The Performance Cap",
          handle: "performance-cap",
          subtitle: "Water-resistant, sized",
          description:
            "A lightweight cap in water-resistant nylon with laser-perforated side panels and a moisture-wicking sweatband. Sized for a fit that stays put on a run.",
          status: ProductStatus.PUBLISHED,
          category_ids: [category("Caps")],
          shipping_profile_id: shippingProfile.id,
          weight: 80,
          ...imagesOf("performance-cap"),
          metadata: {
            promise: "The cap for sweat, rain and long days outside.",
            fit_notes: "Sized for a snug fit. Between sizes? Size up. Measure around your head just above the ears.",
            size_chart: HAT_SIZE_CHART,
            details: {
              Crown: "Six panels, semi-structured, mid profile",
              Brim: "Flat-to-curved, 2.75 in",
              Closure: "Stretch band (sized)",
              Fabric: "Water-resistant recycled nylon",
              Care: "Machine wash cold on a gentle cycle. Air dry.",
            },
          },
          options: [
            { title: "Color", values: colorsOf("performance-cap") },
            { title: "Size", values: SIZED },
          ],
          variants: variantsFor("CAP-PERF", 48, 10, SIZED, colorsOf("performance-cap")),
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: "The Corduroy Cap",
          handle: "corduroy-cap",
          subtitle: "Limited release",
          description:
            "The Everyday Cap, cut in 8-wale corduroy for the colder months. Same low crown, same strap and buckle.",
          status: ProductStatus.DRAFT,
          category_ids: [category("Caps")],
          shipping_profile_id: shippingProfile.id,
          weight: 100,
          ...imagesOf("corduroy-cap"),
          metadata: {
            promise: "The cap you already love, in corduroy.",
            fit_notes: "One size, same fit as the Everyday Cap. The strap adjusts from 21.5 to 23.75 inches.",
            details: { ...capDetails, Fabric: "100% cotton corduroy, 8-wale" },
          },
          options: [
            { title: "Color", values: colorsOf("corduroy-cap") },
            { title: "Size", values: [ONE_SIZE] },
          ],
          variants: variantsFor("CAP-CORD", 44, 9, [ONE_SIZE], colorsOf("corduroy-cap")),
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: "The Bucket Hat",
          handle: "bucket-hat",
          subtitle: "New silhouette",
          description:
            "A bucket hat in heavyweight cotton canvas with a soft, downward-sloping brim. Packs flat and springs back.",
          status: ProductStatus.DRAFT,
          category_ids: [category("Bucket Hats")],
          shipping_profile_id: shippingProfile.id,
          weight: 120,
          ...imagesOf("bucket-hat"),
          metadata: {
            promise: "Shade that packs flat.",
            fit_notes: "Sized. Between sizes? Size up. Measure around your head just above the ears.",
            size_chart: HAT_SIZE_CHART,
            details: {
              Crown: "Six panels, soft",
              Brim: "Downward slope, 2.25 in",
              Fabric: "100% cotton canvas, 12 oz",
              Care: "Machine wash cold. Air dry.",
            },
          },
          options: [
            { title: "Color", values: colorsOf("bucket-hat") },
            { title: "Size", values: SIZED },
          ],
          variants: variantsFor("BUCKET", 46, 9, SIZED, colorsOf("bucket-hat")),
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: "The Waxed Field Cap",
          handle: "waxed-field-cap",
          subtitle: "New fabric",
          description:
            "Our sized six-panel in waxed cotton that sheds light rain and picks up character with every wear.",
          status: ProductStatus.DRAFT,
          category_ids: [category("Caps")],
          shipping_profile_id: shippingProfile.id,
          weight: 110,
          ...imagesOf("waxed-field-cap"),
          metadata: {
            promise: "A cap that looks better the more you wear it.",
            fit_notes: "Sized. Between sizes? Size up.",
            size_chart: HAT_SIZE_CHART,
            details: {
              Crown: "Six panels, semi-structured, mid profile",
              Brim: "Pre-curved, 2.75 in",
              Closure: "Leather strap with a brass buckle",
              Fabric: "Waxed cotton canvas",
              Care: "Wipe clean. Re-wax once a season.",
            },
          },
          options: [
            { title: "Color", values: colorsOf("waxed-field-cap") },
            { title: "Size", values: SIZED },
          ],
          variants: variantsFor("CAP-WAXED", 52, 12, SIZED, colorsOf("waxed-field-cap")),
          sales_channels: [{ id: salesChannel.id }],
        },
      ],
    },
  })
  const productId = (handle: string) => products.find((p) => p.handle === handle)!.id

  // --- Variant images: each colour shows its own photos -----------------------
  const { data: seeded } = await query.graph({
    entity: "product",
    fields: ["handle", "images.id", "images.url", "variants.id", "variants.options.value", "variants.options.option.title"],
    filters: { id: products.map((p) => p.id) },
  })
  for (const product of seeded as any[]) {
    const byColor = colorImages[product.handle] ?? {}
    for (const variant of product.variants ?? []) {
      const color = (variant.options ?? []).find((o: any) => o.option?.title === "Color")?.value
      const files = byColor[color] ?? []
      const imageIds = (product.images ?? [])
        .filter((i: any) => files.some((f) => i.url === img(f)))
        .map((i: any) => i.id)
      if (imageIds.length) {
        await batchVariantImagesWorkflow(container).run({
          input: { variant_id: variant.id, add: imageIds },
        })
      }
    }
  }

  // --- Inventory --------------------------------------------------------------
  logger.info("Seeding inventory...")
  // Keyed by SKU prefix, then "COLOR-SIZE" or just "SIZE".
  const stock: Record<string, Record<string, number>> = {
    "CAP-EVERYDAY": { "WASHEDBLACK-OS": 220, "NAVY-OS": 160, "BONE-OS": 140, "OLIVE-OS": 120 },
    TRUCKER: { "BLACK-OS": 90, "BONEBROWN-OS": 70 },
    BEANIE: { "CHARCOAL-OS": 80, "RUST-OS": 50, "CREAM-OS": 60 },
    // Stone S/M is nearly gone, to show the low-stock state.
    "CAP-PERF": { "BLACK-SM": 40, "BLACK-LXL": 50, "STONE-SM": 3, "STONE-LXL": 35 },
    "CAP-CORD": { "TOBACCO-OS": 60, "FOREST-OS": 45 },
    BUCKET: { SM: 40, LXL: 45 },
    // The L/XL run is delayed, so this release will be held on its date.
    "CAP-WAXED": { SM: 30, LXL: 0 },
  }
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku", "location_levels.location_id"],
  })
  const levels: CreateInventoryLevelInput[] = []
  for (const item of inventoryItems as any[]) {
    const sku: string = item.sku ?? ""
    const prefix = Object.keys(stock).find((p) => sku.startsWith(`${p}-`))
    if (!prefix) continue
    if ((item.location_levels ?? []).some((l: any) => l.location_id === location.id)) continue
    const [color, size] = sku.slice(prefix.length + 1).split("-")
    const qty = stock[prefix][`${color}-${size}`] ?? stock[prefix][size] ?? 0
    levels.push({ location_id: location.id, inventory_item_id: item.id, stocked_quantity: qty })
  }
  await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: levels } })

  // --- Releases -----------------------------------------------------------------
  logger.info("Seeding releases...")

  // 1. A past light release, reviewed at the end of its returns window.
  const { result: past } = await createReleaseWorkflow(container).run({
    input: {
      data: {
        title: "Everyday Cap in Bone",
        handle: "everyday-cap-bone",
        tier: "light",
        story: "The Everyday Cap, now in bone. Same low crown, same strap, a lighter colour for summer.",
        product_promise: "The cap you already love, in bone.",
        proof: "Side-by-side of the bone and washed-black caps after a month of wear.",
        hero_image: img("everyday-cap-bone-1.jpg"),
        owner: "Merchandising lead",
        backup_approver: "Founder",
        assets: [
          { key: "pdp-photos-bone", kind: "product_images", channel: "site", approved: true },
          { key: "tiktok-side-by-side", kind: "short_video", channel: "tiktok", approved: true },
        ],
        check_mobile_pdp: true,
        check_fulfillment: true,
        check_channel_links: true,
        check_tracking: true,
        capacity_hours: 12,
        actual_hours: 10,
        launch_spend: 80,
        fulfillment_cost_per_order: 5.5,
        selling_cost_rate: 0.03,
        contribution_floor: 300,
      },
      product_ids: [productId("everyday-cap")],
    },
  })
  await releaseService.updateReleases({
    id: past.id,
    status: "reviewed",
    release_at: new Date(Date.now() - 45 * DAY),
    published_at: new Date(Date.now() - 45 * DAY),
    starting_units: 140,
    decision: "repeat",
    decision_notes:
      "Met the contribution floor inside the 12-hour cap and the core colours stayed in stock. Bone joins the core range. Next: a comparable light release before adding cadence.",
    decided_by: "Founder",
    decided_at: new Date(Date.now() - 14 * DAY),
  })

  // 2. A light release that is ready and goes live through the go/no-go checks now.
  const { result: live } = await createReleaseWorkflow(container).run({
    input: {
      data: {
        title: "Corduroy Cap",
        handle: "corduroy-cap",
        tier: "light",
        status: "scheduled",
        release_at: new Date(),
        story:
          "Our Everyday Cap, cut in 8-wale corduroy for the colder months. Same low crown, same strap and buckle. A limited run in tobacco and forest, restocked only if it sells through.",
        product_promise: "The cap you already love, in corduroy.",
        proof: "Close-up of the wale catching the light, and the cap on next to the cotton original.",
        hero_image: img("corduroy-cap-tobacco-1.jpg"),
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
        fulfillment_cost_per_order: 5.5,
        selling_cost_rate: 0.03,
        contribution_floor: 400,
      },
      product_ids: [productId("corduroy-cap")],
    },
  })
  const { result: liveCheck } = await goLiveReleaseWorkflow(container).run({
    input: { release_id: live.id },
  })
  logger.info(
    liveCheck.ready
      ? "Corduroy Cap passed its go/no-go checks and is live."
      : `Corduroy Cap was held: ${liveCheck.failures.join("; ")}`
  )

  // 3. An upcoming major release. Editorial isn't approved yet, so it would
  //    be held if its date arrived today.
  await createReleaseWorkflow(container).run({
    input: {
      data: {
        title: "The Bucket Hat",
        handle: "bucket-hat",
        tier: "major",
        status: "scheduled",
        release_at: dropDate(5),
        story:
          "A new silhouette for Shelby: a bucket hat in heavyweight cotton canvas that packs flat in a bag and springs back. Made for long days outside.",
        product_promise: "Shade that packs flat.",
        proof: "Folded into a back pocket, pulled out and worn, shape intact.",
        hero_image: img("bucket-hat-sand-1.jpg"),
        owner: "Creative lead",
        backup_approver: "Founder",
        assets: [
          { key: "editorial-coast", kind: "editorial", channel: "instagram", approved: false },
          { key: "tiktok-pocket-fold", kind: "short_video", channel: "tiktok", approved: true },
          { key: "launch-email", kind: "email", channel: "email", approved: false, optional: true },
        ],
        check_mobile_pdp: true,
        check_fulfillment: true,
        capacity_hours: 40,
        launch_spend: 1200,
        fulfillment_cost_per_order: 5.5,
        selling_cost_rate: 0.03,
        contribution_floor: 1500,
      },
      product_ids: [productId("bucket-hat")],
    },
  })

  // 4. An upcoming light release with a delayed L/XL run.
  await createReleaseWorkflow(container).run({
    input: {
      data: {
        title: "Waxed Field Cap",
        handle: "waxed-field-cap",
        tier: "light",
        status: "scheduled",
        release_at: dropDate(12),
        story: "Our sized six-panel in waxed cotton that sheds light rain and picks up character with every wear.",
        product_promise: "A cap that looks better the more you wear it.",
        proof: "A drizzle test: water beading on the crown, then the cap a month later.",
        hero_image: img("waxed-field-cap-olive-1.jpg"),
        owner: "Merchandising lead",
        backup_approver: "Ops lead",
        assets: [
          { key: "pdp-photos-waxed", kind: "product_images", channel: "site", approved: true },
          { key: "tiktok-drizzle", kind: "short_video", channel: "tiktok", approved: true },
        ],
        check_mobile_pdp: true,
        check_fulfillment: true,
        check_channel_links: true,
        check_tracking: true,
        capacity_hours: 12,
        launch_spend: 60,
        fulfillment_cost_per_order: 5.5,
        selling_cost_rate: 0.03,
        contribution_floor: 250,
      },
      product_ids: [productId("waxed-field-cap")],
    },
  })

  logger.info("Finished seeding Shelby hats.")
}
