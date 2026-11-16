import { Platform } from "react-native"

/** Melin's style system for Shelby (web/SITE_SPEC.md §2). Black on white, no accent. */
export const colors = {
  primary: "#000000",
  secondary: "#FFFFFF",
  tertiary: "#E4E4E4",
  text: "#000000",
  textTab: "#0E1311",
  textMuted: "#736B67",
  textMutedCard: "#726B67",
  textMutedSub: "#77706C",
  textSteps: "#6B7280",
  textInverse: "#FFFFFF",
  background: "#FFFFFF",
  tile: "#F5F5F5",
  band: "#F8F8F9",
  mega: "#EDEDED",
  addon: "#ECECEC",
  line: "#E4E4E4",
  lineSoft: "#EEEEEE",
  lineHeader: "#E5E7EB",
  lineAddon: "#DDDDDD",
  lineOffer: "#CCCCCC",
  inStock: "#22C55E",
  fillDisabled: "#EFEFEF",
  textDisabled: "#C2C2C2",
  error: "#C70000",
  overlay: "rgba(0, 0, 0, 0.8)",
} as const

export const fonts = {
  heading: "PlusJakartaSans_800ExtraBold", // Avenir Black
  heavy: "PlusJakartaSans_700Bold", // Avenir Heavy (hero)
  subheading: "PlusJakartaSans_500Medium", // Avenir Medium
  body: "Inter_400Regular", // Avenir Book
  system: Platform.select({ ios: "System", android: "sans-serif", default: "system-ui" }) as string,
  campaign: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }) as string,
}

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const

/** Melin's fluid section padding at mobile width, the 14pt gap and the 21.5pt PDP gutter. */
export const layout = { section: 28.432, gap: 14, gutter: 16, pdpGutter: 21.5 } as const

export const radius = { none: 0, button: 3, tile: 4, offer: 6, addon: 8, sort: 22, pill: 999 } as const

export const type = {
  hero: { fontFamily: fonts.heavy, fontSize: 24, lineHeight: 32, letterSpacing: 1.6, textTransform: "uppercase" as const },
  headline: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 39 },
  section: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28.6 },
  promo: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 23.4 },
  item: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 24 },
  itemSm: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 21 },
  subline: { fontFamily: fonts.subheading, fontSize: 16, lineHeight: 20.8 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22.5, letterSpacing: -0.12 },
  bodySm: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, letterSpacing: -0.12 },
  micro: { fontFamily: fonts.body, fontSize: 13, lineHeight: 15, letterSpacing: -0.1 },
  eyebrow: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, letterSpacing: 0.48, textTransform: "uppercase" as const },
  meta: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, letterSpacing: 0.4 },
  nav: { fontFamily: fonts.heading, fontSize: 11.2, lineHeight: 16.8, letterSpacing: 2.8, textTransform: "uppercase" as const },
  button: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 21, letterSpacing: 1.3, textTransform: "uppercase" as const },
  link: {
    fontFamily: fonts.heading,
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
    textDecorationLine: "underline" as const,
  },
  system: { fontFamily: fonts.system, fontSize: 16, lineHeight: 24 },
  campaign: { fontFamily: fonts.campaign, fontSize: 32, lineHeight: 32, letterSpacing: 3, textTransform: "uppercase" as const },
}

export const shadow = {
  sticky: Platform.select({
    ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } },
    android: { elevation: 8 },
    default: { boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
  }),
}

export const MAX_CONTENT_WIDTH = 720
