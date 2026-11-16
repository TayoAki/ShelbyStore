import { Platform, type TextStyle } from "react-native"
import { Easing, ReduceMotion } from "react-native-reanimated"

/**
 * Shelby v6: Allbirds' theme (APP_SPEC v5 §2) with the golf layer (Part G.2).
 * Letter-spacing values are points (= em × font size).
 */
export const colors = {
  black: "#212121", // text, primary CTA, footer, ticker
  white: "#FFFFFF", // cards, header pill, buy card, sheets
  naturalWhite: "#E0DACF", // badges, pills, progress track
  page: "#ECE9E2", // every screen background
  naturalWhite25: "#F5F4F1", // quiet panels
  charcoal: "#52525B", // long-form body
  muted: "#575757", // meta, breadcrumbs, fit notes
  mutedFill: "rgba(87, 87, 87, 0.19)",
  swatchRing: "rgba(87, 87, 87, 0.7)",
  stroke: "#CDCDCD",
  red: "#9C0F0F", // low stock only
  green: "#10714E", // in stock only, never golf green
  gray200: "#E5E7EB",
  gray300: "#D1D5DC",
  gray400: "#99A1AF",
  gray500: "#6A7282",
  gray600: "#4A5565",
  neutral800: "#262626",
  overlay: "rgba(33, 33, 33, 0.5)",
  overlayMenu: "rgba(33, 33, 33, 0.3)",
  tileVeil: "rgba(0, 0, 0, 0.15)",
  ringFill: "rgba(33, 33, 33, 0.1)",
  ringStroke2: "rgba(255, 255, 255, 0.7)",
  ringStroke3: "rgba(255, 255, 255, 0.4)",
  pillBorder: "rgba(33, 33, 33, 0.5)",
} as const

/** Part G.2: one golf-green band per screen, links and selected states. */
export const golf = {
  green: "#1E3B2F",
  greenPressed: "#104734",
  tint: "#EEF5E8",
  midnight: "#03143B",
  sage: "#B9B78D",
} as const

export type ColourwayGroup = "core" | "limited"
export type Colourway = { crown: string; rope: string; ropeName: string; group: ColourwayGroup }

/** web G.2.1: crown + rope per colourway (swatches, rope rule). */
export const colourways: Record<string, Colourway> = {
  "Tour White": { crown: "#F4F2EE", rope: "#1F2A44", ropeName: "Navy", group: "core" },
  "Clubhouse Navy": { crown: "#26314A", rope: "#F4F2EE", ropeName: "White", group: "core" },
  Pine: { crown: "#1E3B2F", rope: "#EDE6D6", ropeName: "Cream", group: "core" },
  Fescue: { crown: "#C9C1AE", rope: "#1F2A44", ropeName: "Navy", group: "core" },
  Azalea: { crown: "#F4F2EE", rope: "#D8648A", ropeName: "Azalea pink", group: "limited" },
  Cypress: { crown: "#2E4B4A", rope: "#CDBB98", ropeName: "Sand", group: "limited" },
  Haar: { crown: "#A7ABA8", rope: "#EDE6D6", ropeName: "Cream", group: "limited" },
}

export const CORE_COLOURWAYS = ["Tour White", "Clubhouse Navy", "Pine", "Fescue"] as const

/** Light crowns keep the swatch's inner ring so they show on white. */
export const LIGHT_CROWNS = new Set(["Tour White", "Azalea", "Haar", "Fescue"])

/** Image slug per colourway: /hats/rope-cap-<slug>-<n>.jpg */
export const colourwaySlug = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")

/**
 * Plus Jakarta Sans (Geograph's heading roles), Inter (Geograph body),
 * IBM Plex Mono (Akkurat Mono) and Libre Caslon Text (the serif role, G.2.3).
 * The family carries the weight: never set fontWeight or fontStyle with these.
 */
export const fonts = {
  display: "PlusJakartaSans_400Regular",
  displayMedium: "PlusJakartaSans_500Medium",
  displaySemi: "PlusJakartaSans_600SemiBold",
  serif: "LibreCaslonText_400Regular",
  serifItalic: "LibreCaslonText_400Regular_Italic",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodyBold: "Inter_700Bold",
  mono: "IBMPlexMono_400Regular",
  monoMedium: "IBMPlexMono_500Medium",
} as const

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 10, lg: 16, xl: 20, xxl: 24, xxxl: 32, section: 40 } as const

/** Allbirds' 10pt edge gutter for rounded blocks and its 20pt text padding. */
export const layout = {
  edge: 10,
  text: 20,
  pillTop: 20,
  pillHeight: 40,
  pillSide: 20,
  contentTop: 20 + 40 + 8,
  ticker: 32,
} as const

export const radius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  xxxl: 24,
  tile: 20,
  pill: 250,
  full: 9999,
} as const

const upper = "uppercase" as const
const tabular: TextStyle["fontVariant"] = ["tabular-nums"]

export const type = {
  heroEyebrow: { fontFamily: fonts.monoMedium, fontSize: 12, lineHeight: 20, letterSpacing: 1.2, textTransform: upper },
  hero: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32, letterSpacing: 0.6 },
  section: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32 },
  tile: { fontFamily: fonts.serifItalic, fontSize: 30, lineHeight: 38 },
  pdpTitle: { fontFamily: fonts.serifItalic, fontSize: 24, lineHeight: 32 },
  quote: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24 },
  kicker: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24 },
  articleH1: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 38, letterSpacing: -0.15 },
  tab: { fontFamily: fonts.monoMedium, fontSize: 16, lineHeight: 24, letterSpacing: 0.8, textTransform: upper },
  eyebrow: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: upper },
  subline: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: upper },
  label: { fontFamily: fonts.monoMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: upper },
  scoreLabel: { fontFamily: fonts.monoMedium, fontSize: 11, lineHeight: 16, letterSpacing: 2.2, textTransform: upper },
  scoreNumber: { fontFamily: fonts.monoMedium, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, fontVariant: tabular },
  edition: { fontFamily: fonts.monoMedium, fontSize: 12, lineHeight: 16, letterSpacing: 1.8, textTransform: upper, fontVariant: tabular },
  ticker: { fontFamily: fonts.mono, fontSize: 10, lineHeight: 16, letterSpacing: 2.0, textTransform: upper, fontVariant: tabular },
  holeNumber: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, letterSpacing: -0.32, fontVariant: tabular },
  cardHeading: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32 },
  menuItem: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 21, letterSpacing: 0.7, textTransform: upper },
  cardTitle: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: upper },
  cardMeta: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  price: { fontFamily: fonts.bodyMedium, fontSize: 18, lineHeight: 28, letterSpacing: 0.9 },
  priceSm: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  pricePill: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: upper },
  badge: { fontFamily: fonts.bodyMedium, fontSize: 10, lineHeight: 10, letterSpacing: 0.5, textTransform: upper },
  button: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 15, letterSpacing: 0.3, textTransform: upper },
  buttonLarge: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, letterSpacing: 0.35, textTransform: upper },
  size: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  bodyLong: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, letterSpacing: 0.35 },
  article: { fontFamily: fonts.body, fontSize: 16, lineHeight: 26 },
  meta: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  announcement: { fontFamily: fonts.body, fontSize: 10, lineHeight: 15, letterSpacing: 0.5 },
  empty: { fontFamily: fonts.body, fontSize: 20, lineHeight: 28 },
  tabBar: { fontFamily: fonts.bodyMedium, fontSize: 10, lineHeight: 12, letterSpacing: 0.5, textTransform: upper },
  wordmark: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 24, letterSpacing: -0.4 },
  countBadge: { fontFamily: fonts.bodyMedium, fontSize: 9, lineHeight: 13.5 },
  countdown: { fontFamily: fonts.display, fontSize: 40, lineHeight: 48, fontVariant: tabular },
} satisfies Record<string, TextStyle>

export const shadow = {
  /** Tailwind `shadow-sm`: header pill, buy card, discs. */
  sm: Platform.select({
    ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
    android: { elevation: 2 },
    default: { boxShadow: "0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a" },
  }),
  /** The floating-image shadow (web `0 .85rem 1rem rgba(0,0,0,.25)`). */
  float: Platform.select({
    ios: { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 13 } },
    android: { elevation: 10 },
    default: { boxShadow: "0 13.6px 16px #00000040" },
  }),
  /** Tailwind `shadow-xl`: sheets. */
  xl: Platform.select({
    ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 25, shadowOffset: { width: 0, height: 20 } },
    android: { elevation: 16 },
    default: { boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a" },
  }),
}

/** web §2.4.2: GSAP eases as Reanimated beziers. */
export const ease = {
  sineOut: Easing.bezier(0.61, 1, 0.88, 1),
  sineIn: Easing.bezier(0.12, 0, 0.39, 0),
  sineInOut: Easing.bezier(0.37, 0, 0.63, 1),
  power3Out: Easing.bezier(0.25, 1, 0.5, 1),
  power3In: Easing.bezier(0.5, 0, 0.75, 0),
  power3InOut: Easing.bezier(0.76, 0, 0.24, 1),
  tailwind: Easing.bezier(0.4, 0, 0.2, 1),
  linear: Easing.linear,
}

/** web §2.4.1 timing constants, in ms. */
export const dur = {
  section: 800,
  hover: 600,
  hoverDelay: 100,
  dropdown: 300,
  slide: 600,
  accordion: 300,
  carouselFade: 200,
  quickViewIn: 400,
  quickViewOut: 200,
  marquee: 10000,
  orbitMobile: 15000,
  sheetOverlay: 400,
  sheetPanel: 800,
  button: 200,
}

export const motion = { reduceMotion: ReduceMotion.System } as const
export const MAX_CONTENT_WIDTH = 720
