import { z } from "@medusajs/framework/zod"

export const CORE_COLORS = ["Tour White", "Clubhouse Navy", "Pine", "Fescue"] as const

/** Custom orders: 24 caps minimum, each colour in multiples of 12 (web SITE_SPEC G.6.10). */
export const StoreCreateCustomQuote = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    organisation: z.string().trim().min(1).max(160),
    quantity: z.number().int().min(24).max(10000),
    /** Caps per core colour; colours left out mean none. */
    colors: z.object(
      Object.fromEntries(CORE_COLORS.map((c) => [c, z.number().int().min(0).max(10000).optional()])) as Record<
        (typeof CORE_COLORS)[number],
        z.ZodOptional<z.ZodNumber>
      >
    ),
    needed_by: z.string().date().optional().nullable(),
    artwork_url: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
    notes: z.string().trim().max(2000).optional().nullable(),
    rights_confirmed: z.literal(true),
    /** Honeypot: real people never fill it. */
    company_website: z.string().optional().nullable(),
    source: z.record(z.string(), z.unknown()).optional().nullable(),
  })
  .refine((d) => Object.values(d.colors).every((n) => (n ?? 0) % 12 === 0), {
    message: "Each color is ordered in multiples of 12.",
    path: ["colors"],
  })
  .refine((d) => Object.values(d.colors).reduce<number>((a, b) => a + (b ?? 0), 0) === d.quantity, {
    message: "The colors must add up to the quantity.",
    path: ["colors"],
  })

export type StoreCreateCustomQuoteType = z.infer<typeof StoreCreateCustomQuote>

export const AdminUpdateCustomQuote = z.object({
  status: z.enum(["new", "quoted", "won", "lost"]),
})
export type AdminUpdateCustomQuoteType = z.infer<typeof AdminUpdateCustomQuote>
