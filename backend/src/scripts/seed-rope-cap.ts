import { CreateInventoryLevelInput, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  batchVariantImagesWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  updateProductCategoriesWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { CORE_COLLECTION_HANDLE } from "../lib/release-data"
import { ANALYTICS_MODULE } from "../modules/analytics"
import AnalyticsModuleService from "../modules/analytics/service"
import { RELEASE_MODULE } from "../modules/release"
import ReleaseModuleService from "../modules/release/service"
import { createExperimentWorkflow } from "../workflows/analytics"
import { createReleaseWorkflow, goLiveReleaseWorkflow } from "../workflows/release"

/**
 * v6 catalog (web SITE_SPEC Part G.8): Shelby sells one product, The Rope Cap.
 * Every step is idempotent and safe on the live database, which still holds the
 * v4/v5 hats: they are unpublished (records kept for old orders), and the rope
 * cap, its numbered editions, the two bundles, the holes (releases) and the
 * free-shipping price are created once.
 *
 * DEMO VALUES: every price, stock count and the $85 threshold are the research
 * report's recommendations (SITE_SPEC G.11). Confirm them before launch.
 */

const STOREFRONT = (process.env.STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "")
const img = (file: string) => `${STOREFRONT}/hats/${file}`
const ONE_SIZE = "One Size"
const code = (value: string) => (value === ONE_SIZE ? "OS" : value.toUpperCase().replace(/[^A-Z0-9]+/g, ""))

export const ROPE_CAP = "rope-cap"
const SINGLE_PRICE = 48
const EDITION_PRICE = 52
const PAIR_PRICE = 88
const FOURSOME_PRICE = 152
export const FREE_SHIPPING_THRESHOLD = 85

const CORE = ["Tour White", "Clubhouse Navy", "Pine", "Fescue"] as const
const SLUG: Record<string, string> = {
  "Tour White": "tour-white",
  "Clubhouse Navy": "clubhouse-navy",
  Pine: "pine",
  Fescue: "fescue",
}
const ROPE: Record<string, string> = { "Tour White": "Navy", "Clubhouse Navy": "White", Pine: "Cream", Fescue: "Navy" }
const shots = (slug: string, n: number) => Array.from({ length: n }, (_, i) => `rope-cap-${slug}-${i + 1}.jpg`)
/** Gallery per core colour, in order (G.7.1): Tour White has six angles, the others three. */
const CORE_IMAGES: Record<string, string[]> = {
  "Tour White": shots("tour-white", 6),
  "Clubhouse Navy": shots("clubhouse-navy", 3),
  Pine: shots("pine", 3),
  Fescue: shots("fescue", 3),
}
const lead = (color: string) => CORE_IMAGES[color][0]

const DETAILS = {
  Crown: "Mid profile, about 11–11.5 cm, lightly structured front",
  Panels: "Five, with a seamless front",
  Rope: "Braided cotton cord, about 3–5 mm, in a contrast color",
  Brim: "Pre-curved with a slight retro flat, 7 cm (2.75 in)",
  Closure: "Self-fabric strap with an antique-brass slide",
  Fabric: "100% cotton twill, garment-washed",
  Sweatband: "Moisture-wicking",
  Care: "Spot clean. Reshape and air dry.",
}
const FIT_NOTES = "One size. The strap adjusts from 21.5 to 23.75 inches. The crown sits mid, about 11–11.5 cm."

type Edition = {
  handle: string
  name: string
  hole: number
  /** Releases at 10:00 AM Pacific. */
  release_at: string
  stock: number
  images: string[]
  rope: string
  promise: string
  tier: "major" | "light"
}
const EDITIONS: Edition[] = [
  {
    handle: "rope-cap-azalea",
    name: "Azalea",
    hole: 2,
    release_at: "2027-04-05T17:00:00Z",
    stock: 200,
    images: shots("azalea", 3),
    rope: "Azalea pink",
    promise: "White crown, azalea rope, tan leather strap. An edition of 200.",
    tier: "light",
  },
  {
    handle: "rope-cap-cypress",
    name: "Cypress",
    hole: 3,
    release_at: "2027-06-01T17:00:00Z",
    stock: 200,
    images: shots("cypress", 1),
    rope: "Sand",
    promise: "Coastal green crown, sand rope, tan leather strap. An edition of 200.",
    tier: "major",
  },
  {
    // Its 200 arrive later: stock 0 shows the "held for stock" path (G.8 item 6).
    handle: "rope-cap-haar",
    name: "Haar",
    hole: 4,
    release_at: "2027-07-12T17:00:00Z",
    stock: 0,
    images: shots("haar", 1),
    rope: "Cream",
    promise: "Fog grey crown, cream rope, tonal brim, tan leather strap. An edition of 200.",
    tier: "light",
  },
]

/** The v4/v5 catalog this store sold before the rope cap. Unpublished, never deleted. */
export const RETIRED_HAT_HANDLES = [
  "everyday-cap",
  "trucker",
  "ribbed-beanie",
  "performance-cap",
  "corduroy-cap",
  "bucket-hat",
  "waxed-field-cap",
  "everyday-two-pack",
]
export const RETIRED_HAT_RELEASES = ["everyday-cap-bone", "corduroy-cap", "bucket-hat", "waxed-field-cap"]
export const RETIRED_HAT_CATEGORIES = ["Caps", "Truckers", "Beanies", "Bucket Hats"]

type Ctx = { salesChannelId: string; shippingProfileId: string; locationId: string }

export async function ensureRopeCap(container: MedusaContainer, ctx: Ctx) {
  await retireHats(container)
  await ensureCatalog(container, ctx)
  await ensureBundles(container, ctx)
  await ensureHoles(container)
  await ensureFreeShipping(container)
  await ensureOfferExperiment(container)
}

async function retireHats(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)
  const releaseService: ReleaseModuleService = container.resolve(RELEASE_MODULE)

  const products = await productService.listProducts({ handle: RETIRED_HAT_HANDLES })
  const published = products.filter((p) => p.status !== ProductStatus.DRAFT)
  if (published.length) {
    await updateProductsWorkflow(container).run({
      input: { selector: { id: published.map((p) => p.id) }, update: { status: ProductStatus.DRAFT } },
    })
    logger.info(`Unpublished ${published.length} earlier hats (the store now sells The Rope Cap).`)
  }
  const releases = await releaseService.listReleases({ handle: RETIRED_HAT_RELEASES })
  if (releases.length) {
    await releaseService.softDeleteReleases(releases.map((r) => r.id))
    logger.info(`Archived ${releases.length} earlier hat releases.`)
  }
  const categories = await productService.listProductCategories({ name: RETIRED_HAT_CATEGORIES, is_active: true })
  for (const c of categories) {
    await updateProductCategoriesWorkflow(container).run({
      input: { selector: { id: c.id }, update: { is_active: false } },
    })
  }
}

/** Creates inventory levels for every SKU starting with `prefix` that has none yet. */
async function stockUp(container: MedusaContainer, locationId: string, prefix: string, qty: (sku: string) => number) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "inventory_item", fields: ["id", "sku", "location_levels.location_id"] })
  const levels: CreateInventoryLevelInput[] = []
  for (const item of data as any[]) {
    const sku: string = item.sku ?? ""
    if (!sku.startsWith(prefix)) continue
    if ((item.location_levels ?? []).some((l: any) => l.location_id === locationId)) continue
    levels.push({ location_id: locationId, inventory_item_id: item.id, stocked_quantity: qty(sku) })
  }
  if (levels.length) await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: levels } })
}

/** Links each product image to the variants whose `pick(variant)` returns its file. */
async function linkVariantImages(container: MedusaContainer, productId: string, files: (opts: Record<string, string>) => string[]) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["images.id", "images.url", "variants.id", "variants.options.value", "variants.options.option.title"],
    filters: { id: productId },
  })
  const product = data[0] as any
  for (const v of product?.variants ?? []) {
    const opts: Record<string, string> = {}
    for (const o of v.options ?? []) if (o.option?.title) opts[o.option.title] = o.value
    const urls = files(opts).map(img)
    const ids = (product.images ?? []).filter((i: any) => urls.includes(i.url)).map((i: any) => i.id)
    if (ids.length) await batchVariantImagesWorkflow(container).run({ input: { variant_id: v.id, add: ids } })
  }
}

async function ensureCatalog(container: MedusaContainer, { salesChannelId, shippingProfileId, locationId }: Ctx) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)

  let [category] = await productService.listProductCategories({ handle: "rope-caps" })
  if (!category) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: [{ name: "Rope Caps", handle: "rope-caps", is_active: true }] },
    })
    category = result[0] as any
  }
  let [core] = await productService.listProductCollections({ handle: CORE_COLLECTION_HANDLE })
  if (!core) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: { collections: [{ title: "The Core", handle: CORE_COLLECTION_HANDLE }] },
    })
    core = result[0] as any
  }

  if (!(await productService.listProducts({ handle: ROPE_CAP })).length) {
    const files = CORE.flatMap((c) => CORE_IMAGES[c])
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "The Rope Cap",
            handle: ROPE_CAP,
            subtitle: "Mid-crown rope cap",
            description:
              "A five-panel rope cap in garment-washed cotton twill. The crown sits mid, about 11–11.5 cm, lower than most rope caps, with a lightly structured front, a pre-curved brim and a braided cotton rope in a contrast color.",
            status: ProductStatus.PUBLISHED,
            collection_id: core.id,
            category_ids: [category.id],
            shipping_profile_id: shippingProfileId,
            weight: 110,
            thumbnail: img(files[0]),
            images: files.map((f) => ({ url: img(f) })),
            metadata: {
              promise: "One rope cap, properly: a mid crown that sits right.",
              fit_notes: FIT_NOTES,
              crown_cm: "11–11.5",
              fit_profile: { crown: "Mid", structure: "Semi-structured" },
              details: DETAILS,
              rope: ROPE,
              edition: { hole: 1 },
            },
            options: [
              { title: "Color", values: [...CORE] },
              { title: "Size", values: [ONE_SIZE] },
            ],
            variants: CORE.map((color) => ({
              title: `${color} / ${ONE_SIZE}`,
              sku: `ROPE-${code(color)}-OS`,
              options: { Color: color, Size: ONE_SIZE },
              prices: [{ amount: SINGLE_PRICE, currency_code: "usd" }],
              manage_inventory: true,
              // Midpoint of the report's $7–14 landed estimate (demo).
              metadata: { unit_cost: 10.5 },
            })),
            sales_channels: [{ id: salesChannelId }],
          },
        ],
      },
    })
    await linkVariantImages(container, result[0].id, (o) => CORE_IMAGES[o.Color] ?? [])
    logger.info("Created The Rope Cap (4 core colours).")
  }
  // 300 per colour: the report's 1,200-cap launch run.
  await stockUp(container, locationId, "ROPE-", () => 300)

  for (const e of EDITIONS) {
    if ((await productService.listProducts({ handle: e.handle })).length) continue
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: `The Rope Cap, ${e.name}`,
            handle: e.handle,
            subtitle: `Hole ${e.hole} · numbered edition`,
            description: `${e.promise} Same mid crown, washed cotton and five panels as The Rope Cap, with a tan leather strap.`,
            // Published by its release's go/no-go checks, never before its date.
            status: ProductStatus.DRAFT,
            category_ids: [category.id],
            shipping_profile_id: shippingProfileId,
            weight: 115,
            thumbnail: img(e.images[0]),
            images: e.images.map((f) => ({ url: img(f) })),
            metadata: {
              promise: e.promise,
              fit_notes: FIT_NOTES,
              crown_cm: "11–11.5",
              fit_profile: { crown: "Mid", structure: "Semi-structured" },
              details: { ...DETAILS, Closure: "Tan leather strap with a brass buckle" },
              rope: { [e.name]: e.rope },
              // numbered_inside stays false until the factory confirms numbered labels (G.11 item 4).
              edition: { hole: e.hole, size: 200, numbered_inside: false },
            },
            options: [
              { title: "Color", values: [e.name] },
              { title: "Size", values: [ONE_SIZE] },
            ],
            variants: [
              {
                title: `${e.name} / ${ONE_SIZE}`,
                sku: `ROPE-ED-${code(e.name)}-OS`,
                options: { Color: e.name, Size: ONE_SIZE },
                prices: [{ amount: EDITION_PRICE, currency_code: "usd" }],
                manage_inventory: true,
                metadata: { unit_cost: 12 },
              },
            ],
            sales_channels: [{ id: salesChannelId }],
          },
        ],
      },
    })
    await linkVariantImages(container, result[0].id, () => e.images)
    logger.info(`Created ${e.handle} (Hole ${e.hole}).`)
  }
  await stockUp(container, locationId, "ROPE-ED-", (sku) => EDITIONS.find((e) => sku === `ROPE-ED-${code(e.name)}-OS`)?.stock ?? 0)
}

/** Colour → the core Rope Cap's inventory item for that colour. */
async function coreInventory(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["variants.options.value", "variants.options.option.title", "variants.inventory_items.inventory_item_id"],
    filters: { handle: ROPE_CAP },
  })
  const out: Record<string, string> = {}
  for (const v of (data[0] as any)?.variants ?? []) {
    const color = (v.options ?? []).find((o: any) => o.option?.title === "Color")?.value
    const item = v.inventory_items?.[0]?.inventory_item_id
    if (color && item) out[color] = item
  }
  return out
}

async function ensureBundles(container: MedusaContainer, { salesChannelId, shippingProfileId }: Ctx) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)
  const inventory = await coreInventory(container)
  const colors = CORE.filter((c) => inventory[c])
  if (colors.length < CORE.length) {
    logger.warn("[seed] The Rope Cap is missing a core colour's inventory; skipping the bundles.")
    return
  }
  const shared = {
    fit_notes: FIT_NOTES,
    crown_cm: "11–11.5",
    fit_profile: { crown: "Mid", structure: "Semi-structured" },
    details: DETAILS,
    rope: ROPE,
    // Bundles stay out of /shop grids, search groups, suggestions and the quiz's single matches.
    offer: true,
    single_handle: ROPE_CAP,
  }

  if (!(await productService.listProducts({ handle: "the-pair" })).length) {
    const variants = colors.flatMap((first) =>
      colors.map((second) => ({
        title: `${first} + ${second}`,
        sku: `ROPE-PAIR-${code(first)}-${code(second)}`,
        options: { "First cap": first, "Second cap": second },
        prices: [{ amount: PAIR_PRICE, currency_code: "usd" }],
        manage_inventory: true,
        // One entry per inventory item: the same colour twice is a quantity of 2.
        inventory_items:
          first === second
            ? [{ inventory_item_id: inventory[first], required_quantity: 2 }]
            : [
                { inventory_item_id: inventory[first], required_quantity: 1 },
                { inventory_item_id: inventory[second], required_quantity: 1 },
              ],
        metadata: { unit_cost: 21 },
      }))
    )
    const files = colors.map(lead)
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "The Pair",
            handle: "the-pair",
            subtitle: `Two Rope Caps for $${PAIR_PRICE}`,
            description:
              "Two Rope Caps in the colors you pick. Same mid crown, washed cotton and rope. $88 clears the free-shipping line.",
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfileId,
            weight: 220,
            thumbnail: img(files[0]),
            images: files.map((f) => ({ url: img(f) })),
            metadata: {
              ...shared,
              caps: 2,
              offer_path: "/offer/the-pair",
              compare_at: SINGLE_PRICE * 2,
              promise: "Two rope caps, $44 each.",
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
    await linkVariantImages(container, result[0].id, (o) => [...new Set([o["First cap"], o["Second cap"]])].map(lead))
    logger.info(`Created the-pair (${variants.length} kit variants at $${PAIR_PRICE}).`)
  }

  if (!(await productService.listProducts({ handle: "the-foursome" })).length) {
    const options = [...colors.map((c) => `4 × ${c}`), "One of each"]
    const variants = options.map((value) => ({
      title: value,
      sku: `ROPE-FOUR-${value === "One of each" ? "MIXED" : code(value.replace("4 × ", ""))}`,
      options: { Caps: value },
      prices: [{ amount: FOURSOME_PRICE, currency_code: "usd" }],
      manage_inventory: true,
      inventory_items:
        value === "One of each"
          ? colors.map((c) => ({ inventory_item_id: inventory[c], required_quantity: 1 }))
          : [{ inventory_item_id: inventory[value.replace("4 × ", "")], required_quantity: 4 }],
      metadata: { unit_cost: 42 },
    }))
    const files = colors.map(lead)
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "The Foursome",
            handle: "the-foursome",
            subtitle: `Four Rope Caps for $${FOURSOME_PRICE}`,
            description:
              "Four Rope Caps: four of one color, or one of each core color. For the group trip, the outing or a gift.",
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfileId,
            weight: 440,
            thumbnail: img(files[0]),
            images: files.map((f) => ({ url: img(f) })),
            metadata: {
              ...shared,
              caps: 4,
              offer_path: "/offer/the-pair#foursome",
              compare_at: SINGLE_PRICE * 4,
              promise: "Four rope caps, $38 each.",
            },
            options: [{ title: "Caps", values: options }],
            variants,
            sales_channels: [{ id: salesChannelId }],
          },
        ],
      },
    })
    await linkVariantImages(container, result[0].id, (o) =>
      o.Caps === "One of each" ? colors.map(lead) : [lead(o.Caps.replace("4 × ", ""))]
    )
    logger.info(`Created the-foursome (${variants.length} kit variants at $${FOURSOME_PRICE}).`)
  }
}

/** Hole 1's launch assets. A major release needs approved editorial to pass go/no-go. */
const HOLE_1_ASSETS = [
  { key: "pdp-photos-core", kind: "product_images", channel: "site", approved: true },
  { key: "editorial-links-launch", kind: "editorial", channel: "instagram", approved: true },
  { key: "tiktok-crown-ruler", kind: "short_video", channel: "tiktok", approved: true },
  { key: "launch-email", kind: "email", channel: "email", approved: true, optional: true },
]

/** Holes 1–4 as releases (G.8 item 6); Holes 5–6 live in the storefront's holes.ts. */
async function ensureHoles(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)
  const releaseService: ReleaseModuleService = container.resolve(RELEASE_MODULE)
  const productId = async (handle: string) => (await productService.listProducts({ handle }))[0]?.id

  const common = {
    owner: "Merchandising lead",
    backup_approver: "Founder",
    check_mobile_pdp: true,
    check_fulfillment: true,
    check_channel_links: true,
    check_tracking: true,
    fulfillment_cost_per_order: 5.5,
    selling_cost_rate: 0.03,
  }

  const [hole1Existing] = await releaseService.listReleases({ handle: "hole-1-rope-cap" })
  if (hole1Existing && ["held", "scheduled"].includes(hole1Existing.status as string)) {
    // An earlier run held it (e.g. before the editorial asset was approved): fix the assets and retry.
    await releaseService.updateReleases({ id: hole1Existing.id, assets: HOLE_1_ASSETS } as any)
    const { result: check } = await goLiveReleaseWorkflow(container).run({ input: { release_id: hole1Existing.id } })
    logger.info(check.ready ? "Hole 1 (The Rope Cap) is live." : `Hole 1 is still held: ${check.failures.join("; ")}`)
  }
  if (!hole1Existing) {
    const id = await productId(ROPE_CAP)
    if (id) {
      const { result: hole1 } = await createReleaseWorkflow(container).run({
        input: {
          data: {
            ...common,
            title: "Hole 1: The Rope Cap",
            handle: "hole-1-rope-cap",
            tier: "major",
            status: "scheduled",
            release_at: new Date(),
            story:
              "Hole 1 is the core cap: one rope cap in four colors that never run out. A mid crown, washed cotton twill and a braided rope in a contrast color.",
            product_promise: "One rope cap, properly: a mid crown that sits right.",
            proof: "A ruler on the crown next to a typical tall rope cap, then both worn.",
            hero_image: img(lead("Tour White")),
            assets: HOLE_1_ASSETS,
            capacity_hours: 40,
            launch_spend: 1200,
            contribution_floor: 1500,
          },
          product_ids: [id],
        },
      })
      const { result: check } = await goLiveReleaseWorkflow(container).run({ input: { release_id: hole1.id } })
      logger.info(check.ready ? "Hole 1 (The Rope Cap) is live." : `Hole 1 was held: ${check.failures.join("; ")}`)
    }
  }

  for (const e of EDITIONS) {
    if ((await releaseService.listReleases({ handle: e.handle })).length) continue
    const id = await productId(e.handle)
    if (!id) continue
    // Hole 3's editorial isn't approved yet, so it would be held if its date came today.
    const editorialApproved = e.hole !== 3
    await createReleaseWorkflow(container).run({
      input: {
        data: {
          ...common,
          title: `Hole ${e.hole}: ${e.name}`,
          handle: e.handle,
          tier: e.tier,
          status: "scheduled",
          release_at: new Date(e.release_at),
          story: `${e.promise} Released on its date and not remade.`,
          product_promise: e.promise,
          proof: `The ${e.name} rope next to the core Tour White, and the numbered label inside.`,
          hero_image: img(e.images[0]),
          assets: [
            { key: `pdp-photos-${e.name.toLowerCase()}`, kind: "product_images", channel: "site", approved: true },
            { key: `tiktok-${e.name.toLowerCase()}-reveal`, kind: "short_video", channel: "tiktok", approved: true },
            ...(e.tier === "major"
              ? [{ key: `editorial-${e.name.toLowerCase()}`, kind: "editorial", channel: "instagram", approved: editorialApproved }]
              : []),
          ],
          capacity_hours: e.tier === "major" ? 40 : 12,
          launch_spend: e.tier === "major" ? 800 : 150,
          contribution_floor: e.tier === "major" ? 1200 : 400,
        },
        product_ids: [id],
      },
    })
    logger.info(`Scheduled Hole ${e.hole} (${e.name}) for ${e.release_at}.`)
  }
}

/**
 * Free standard shipping at $85+ (G.8 item 7): a conditional $0 price on the
 * existing Standard option, keyed on the cart's item_total. Standard stays $6
 * below it and Express stays $15. Two $0 prices are added so the rule also wins
 * over the region-specific $6 (a price matching more rules ranks first).
 */
async function ensureFreeShipping(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricing = container.resolve(Modules.PRICING)
  const { data } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "prices.id", "prices.amount", "prices.currency_code", "prices.price_set_id", "prices.price_rules.attribute", "prices.price_rules.value"],
  })
  const standard = (data as any[]).find((o) => o.name === "Standard Shipping")
  if (!standard) {
    logger.warn("[seed] No Standard Shipping option; skipping free shipping.")
    return
  }
  const prices = (standard.prices ?? []) as any[]
  if (prices.some((p) => (p.price_rules ?? []).some((r: any) => r.attribute === "item_total"))) return
  const priceSetId = prices[0]?.price_set_id
  if (!priceSetId) {
    logger.warn("[seed] Standard Shipping has no price set; skipping free shipping.")
    return
  }
  const regionIds = [
    ...new Set(
      prices.flatMap((p) => (p.price_rules ?? []).filter((r: any) => r.attribute === "region_id").map((r: any) => r.value as string))
    ),
  ]
  const over = [{ operator: "gte" as const, value: FREE_SHIPPING_THRESHOLD }]
  await pricing.addPrices({
    priceSetId,
    prices: [
      { currency_code: "usd", amount: 0, rules: { item_total: over } },
      ...regionIds.map((region_id) => ({ currency_code: "usd", amount: 0, rules: { region_id, item_total: over } })),
    ],
  })
  logger.info(`Standard shipping is now free on orders of $${FREE_SHIPPING_THRESHOLD}+.`)
}

const OFFER_EXPERIMENT = {
  name: "Offer page: lead with the price or the saving",
  hypothesis:
    "Leading The Pair with the $8 saving (against two $48 singles) gets more visitors to add the pair than leading with the $88 price.",
  audience: "Everyone who lands on /offer/the-pair (mostly warm traffic: retargeting, email, the PDP and bag links).",
  change_description:
    "Control headline: \"Two rope caps. $88.\" Variant `saving`: \"Save $8 on two rope caps.\" Everything else on the page is identical.",
}

/** The offer page's headline test, re-pointed at The Pair (G.8 item 9): same split and minimum. */
async function ensureOfferExperiment(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const analytics: AnalyticsModuleService = container.resolve<AnalyticsModuleService>(ANALYTICS_MODULE)
  const key = "offer-headline"
  const [existing] = await analytics.listAnalyticsExperiments({ key })
  if (existing) {
    if ((existing as any).change_description !== OFFER_EXPERIMENT.change_description) {
      await analytics.updateAnalyticsExperiments({ id: existing.id, ...OFFER_EXPERIMENT } as any)
      logger.info("Re-pointed the offer-headline experiment at The Pair.")
    }
    return
  }
  await createExperimentWorkflow(container).run({
    input: {
      data: {
        key,
        ...OFFER_EXPERIMENT,
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
        notes: "The minimum sample is per variant; don't call it before then.",
      },
    },
  })
  logger.info(`Started the ${key} experiment.`)
}
