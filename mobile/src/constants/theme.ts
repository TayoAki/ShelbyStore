import { Easing, ReduceMotion } from "react-native-reanimated"
import { Platform } from "react-native"

/**
 * Shelby v8: Eastside Golf's style (APP_SPEC v8 Part V8; web SITE_SPEC v8 Part E).
 * White screens, #F6F6F6 image tiles and bands, black announcement strip and
 * footer band, one accent (golf green #207212) for buying. Monomakh section
 * titles, Montserrat product and page titles, Roboto for everything else.
 * Token names are kept from v6/v7 so every screen compiles; values are v8's.
 */
export const colors = {
  // Eastside palette (web E.2.1)
  text: "#212121",
  textStrong: "#000000",
  textLight: "#646464",
  bg: "#FFFFFF",
  tile: "#F6F6F6",
  sand: "#EEE9E3",
  bgBrighter: "#F2F2F2",
  surfaceSticky: "#FCFCFC",
  border: "#F0F0F0",
  hairline: "#F7F7F7",
  track: "#EEEEEE",
  fieldBorder: "#8C8C8C",
  green: "#207212",
  greenPressed: "#1A5C0F",
  greenDeep: "#0B3305",
  greenFade: "rgba(32, 114, 18, 0.05)",
  ink: "#000000",
  tabActive: "#141414",
  charcoalPressed: "#3B3B3B",
  blackPressed: "#1A1A1A",
  onInk: "#F7F7F7",
  onInkPressed: "rgba(247, 247, 247, 0.7)",
  linkPressed: "rgba(33, 33, 33, 0.7)",
  underlay: "rgba(0, 0, 0, 0.4)",
  heroOverlay: "rgba(0, 0, 0, 0.2)",
  error: "#721C24",
  errorBg: "#F8D7DA",
  errorBorder: "#F5C6CB",
  swatchBorder: "#E9E9E9",

  // v7 keys kept as aliases so existing screens compile; remap, then delete unused ones
  black: "#212121",
  white: "#FFFFFF",
  page: "#FFFFFF",
  board: "#FFFFFF",
  paper: "#FFFFFF",
  wash: "#F6F6F6",
  naturalWhite: "#F6F6F6",
  charcoal: "#212121",
  muted: "#646464",
  mutedFill: "#F0F0F0",
  stroke: "#F0F0F0",
  rule: "#F0F0F0",
  crease: "#F0F0F0",
  swatchRing: "#212121",
  overlay: "rgba(0, 0, 0, 0.4)",
  overlayMenu: "rgba(0, 0, 0, 0.4)",
  tileVeil: "rgba(0, 0, 0, 0)",
  ringFill: "rgba(32, 114, 18, 0.1)",
  pillBorder: "#212121",
  red: "#721C24", // sold-out / error text only
  // Ball Box inks retired: ink-as-navy, stripe, stripeTint, pine, pineInk, navy, fescue
} as const

export const golf = { green: "#207212", greenPressed: "#1A5C0F", tint: "rgba(32, 114, 18, 0.05)", midnight: "#000000", sage: "#F6F6F6" } as const

export type ColourwayGroup = "core" | "limited"
/**
 * `crown` and `rope` paint the ink chips; `panel`, `ink` and `edge` are the
 * colours a box panel is printed in when that colourway is chosen (the
 * colourway's ink floods the front panel). Design values, not measured.
 */
export type Colourway = {
  crown: string
  rope: string
  ropeName: string
  group: ColourwayGroup
  light: boolean
  panel: string
  ink: string
  edge: string
}

export const colourways: Record<string, Colourway> = {
  // The box inks opposite its cap so a white cap never sits white-on-white:
  // Tour White prints on navy with white knock-out type, Clubhouse Navy on white board.
  "Tour White": {
    crown: "#F4F2EE",
    rope: "#1F2A44",
    ropeName: "Navy",
    group: "core",
    light: true,
    panel: "#14213D",
    ink: "#FFFFFF",
    edge: "#14213D",
  },
  "Clubhouse Navy": {
    crown: "#26314A",
    rope: "#F4F2EE",
    ropeName: "White",
    group: "core",
    light: false,
    panel: "#FFFFFF",
    ink: "#14213D",
    edge: "#14213D",
  },
  Pine: {
    crown: "#1E3B2F",
    rope: "#EDE6D6",
    ropeName: "Cream",
    group: "core",
    light: false,
    panel: "#1E3B2F",
    ink: "#F1ECE0",
    edge: "#10241B",
  },
  Fescue: {
    crown: "#C9C1AE",
    rope: "#1F2A44",
    ropeName: "Navy",
    group: "core",
    light: true,
    panel: "#CFC3A6",
    ink: "#14213D",
    edge: "#14213D",
  },
  Azalea: {
    crown: "#F4F2EE",
    rope: "#D8648A",
    ropeName: "Azalea pink",
    group: "limited",
    light: true,
    panel: "#8E2B4E",
    ink: "#FFFFFF",
    edge: "#14213D",
  },
  Cypress: {
    crown: "#2E4B4A",
    rope: "#CDBB98",
    ropeName: "Sand",
    group: "limited",
    light: false,
    panel: "#2E4B4A",
    ink: "#F1E8D2",
    edge: "#1A2D2C",
  },
  Haar: {
    crown: "#A7ABA8",
    rope: "#EDE6D6",
    ropeName: "Cream",
    group: "limited",
    light: true,
    panel: "#4A4F4C",
    ink: "#FFFFFF",
    edge: "#14213D",
  },
}

const FALLBACK_COLOURWAY: Colourway = {
  crown: "#8C867C",
  rope: "#EDE6D6",
  ropeName: "",
  group: "core",
  light: true,
  panel: "#FFFFFF",
  ink: "#14213D",
  edge: "#14213D",
}

export const colourwayOf = (name: string | null | undefined): Colourway => (name && colourways[name]) || FALLBACK_COLOURWAY

export const CORE_COLOURWAYS = ["Tour White", "Clubhouse Navy", "Pine", "Fescue"] as const

/** Light crowns keep the chip's inner keyline so they show on white board. */
export const LIGHT_CROWNS = new Set(["Tour White", "Azalea", "Haar", "Fescue"])

/** Image slug per colourway: /hats/rope-cap-<slug>-<n>.jpg */
export const colourwaySlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")


export const fonts = {
  display: "Monomakh_400Regular",
  heading: "Montserrat_700Bold",
  headingMedium: "Montserrat_500Medium",
  headingSemi: "Montserrat_600SemiBold",
  body: "Roboto_400Regular",
  bodyItalic: "Roboto_400Regular_Italic",
  bodyMedium: "Roboto_500Medium",
  bodyBold: "Roboto_700Bold",
  // v7 aliases
  model: "Monomakh_400Regular",
  modelBold: "Monomakh_400Regular",
  label: "Roboto_500Medium",
  labelSemi: "Roboto_500Medium",
  bodySemi: "Roboto_500Medium",
  displayMedium: "Montserrat_500Medium",
  displaySemi: "Montserrat_700Bold",
  serif: "Monomakh_400Regular",
  serifItalic: "Roboto_400Regular_Italic",
  mono: "Roboto_500Medium",
  monoMedium: "Roboto_700Bold",
} as const

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 10, lg: 16, xl: 20, xxl: 24, xxxl: 32, section: 40 } as const

export const layout = {
  edge: 16, // Eastside mobile page gutter
  railEdge: 12, // rails and grids start at x = 12
  gap: 4, // rail and tile gap
  gridGap: 10, // two-column grid gap
  text: 16,
  header: 72, // Eastside mobile header
  announcement: 36,
  tabBar: 56,
  stickyBar: 116, // Eastside mobile sticky add-to-cart bar (incl. "Change color" row)
  hairline: 1,
  // v7 keys kept: keyline 1, panelPad 16, pillHeight 72, contentTop 72, ticker 36
  keyline: 1,
  panelPad: 16,
  pillTop: 0,
  pillHeight: 72,
  pillSide: 0,
  contentTop: 72,
  ticker: 36,
} as const

export const radius = { xs: 3, sm: 3, md: 3, lg: 4, xl: 4, xxl: 4, xxxl: 4, tile: 0, panel: 0, pill: 20, window: 0, button: 3, tab: 4, bar: 10, full: 9999 } as const

const upper = "uppercase" as const
const tabular = ["tabular-nums"] as ("tabular-nums")[]

export const type = {
  // Eastside roles (web E.2.3, mobile column)
  displayXl: { fontFamily: fonts.display, fontSize: 28, lineHeight: 29.4 },
  displayHero: { fontFamily: fonts.display, fontSize: 32.4, lineHeight: 38.88 },
  displayLg: { fontFamily: fonts.display, fontSize: 22, lineHeight: 23.1, textTransform: upper },
  displayMd: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26.4, textTransform: upper },
  displaySplash: { fontFamily: fonts.display, fontSize: 35, lineHeight: 36.75, letterSpacing: 0.35, textTransform: upper },
  wordmark: { fontFamily: fonts.display, fontSize: 26, lineHeight: 28, letterSpacing: 1, textTransform: upper },
  titlePage: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 31.2, textTransform: upper },
  titleProduct: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 21.6 },
  titleFeature: { fontFamily: fonts.headingMedium, fontSize: 48, lineHeight: 57.6 },
  titleSection: { fontFamily: fonts.headingMedium, fontSize: 38.4, lineHeight: 46.08 },
  titleBlog: { fontFamily: fonts.headingMedium, fontSize: 22.5, lineHeight: 27, textTransform: upper },
  titleCard: { fontFamily: fonts.headingMedium, fontSize: 16.8, lineHeight: 20.16 },
  titleDrawer: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 19.2 },
  faqQ: { fontFamily: fonts.headingMedium, fontSize: 16, lineHeight: 19.2 },
  headingRecs: { fontFamily: fonts.bodyBold, fontSize: 18, lineHeight: 21.6, textTransform: upper },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 25, letterSpacing: 1.6, textTransform: upper, color: "#207212" },
  eyebrowSm: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 25, letterSpacing: 1.4, textTransform: upper, color: "#207212" },
  bodyEastside: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.3 },
  bodyPdp: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 19.73 },
  bodyLongEastside: { fontFamily: fonts.bodyMedium, fontSize: 14.4, lineHeight: 25 },
  bodyEditorial: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  bodySplash: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  cardTitleEastside: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 15.12, color: "#000000" },
  priceProduct: { fontFamily: fonts.body, fontSize: 18, lineHeight: 24.75, color: "#207212", fontVariant: tabular },
  priceCard: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.64, color: "#646464", fontVariant: tabular },
  navLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 13.2, letterSpacing: 0.28, textTransform: upper },
  menuRow: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 18, letterSpacing: 0.99, textTransform: upper },
  announce: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.33, textTransform: upper },
  btn: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22 },
  btnAtc: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 16 },
  btnSticky: { fontFamily: fonts.body, fontSize: 18, lineHeight: 24.75 },
  btnSm: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16.5 },
  btnKit: { fontFamily: fonts.headingSemi, fontSize: 16, lineHeight: 16 },
  tabLabel: { fontFamily: fonts.body, fontSize: 14, lineHeight: 18, letterSpacing: 0.84 },
  tabLabelActive: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 18, letterSpacing: 0.84 },
  labelCaps: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 14, letterSpacing: 1.54, textTransform: upper },
  micro: { fontFamily: fonts.body, fontSize: 11, lineHeight: 13, letterSpacing: 0.55, textTransform: upper },
  breadcrumb: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17, color: "#646464" },
  accordionTitle: { fontFamily: fonts.bodyMedium, fontSize: 18, lineHeight: 19.73, textTransform: "capitalize" as const },
  footerHead: { fontFamily: fonts.bodyBold, fontSize: 12.6, lineHeight: 15.12, textTransform: upper },
  note: { fontFamily: fonts.bodyItalic, fontSize: 11, lineHeight: 14.7 },
  stripLabel: { fontFamily: fonts.body, fontSize: 12.25, lineHeight: 15.93, textTransform: upper },
  countdown: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 31.2, fontVariant: tabular },
  countdownSm: { fontFamily: fonts.bodyMedium, fontSize: 14.4, lineHeight: 18, fontVariant: tabular },
  holeNumeral: { fontFamily: fonts.display, fontSize: 72, lineHeight: 72 },

  // v7 role names, remapped to the Eastside roles above (screens keep compiling)
  model: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 21.6 }, // = titleProduct
  panelTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26.4, textTransform: upper }, // = displayMd
  pdpTitle: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 21.6 },
  hero: { fontFamily: fonts.display, fontSize: 32.4, lineHeight: 38.88 },
  section: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26.4, textTransform: upper },
  tile: { fontFamily: fonts.body, fontSize: 12.25, lineHeight: 15.93, textTransform: upper },
  cardHeading: { fontFamily: fonts.headingMedium, fontSize: 16.8, lineHeight: 20.16 },
  specLine: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.64, color: "#646464", fontVariant: tabular },
  digits: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 31.2, fontVariant: tabular },
  digitsSm: { fontFamily: fonts.bodyMedium, fontSize: 14.4, lineHeight: 18, fontVariant: tabular },
  holeNumber: { fontFamily: fonts.display, fontSize: 38, lineHeight: 40 },
  heroEyebrow: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 25, letterSpacing: 1.4, textTransform: upper },
  quote: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  kicker: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  tab: { fontFamily: fonts.body, fontSize: 14, lineHeight: 18, letterSpacing: 0.84 },
  eyebrowV7: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 25, letterSpacing: 1.4, textTransform: upper },
  subline: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.64, color: "#646464" },
  label: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 14, letterSpacing: 1.54, textTransform: upper },
  scoreLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 14, letterSpacing: 1.54, textTransform: upper },
  scoreNumber: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 19.73, fontVariant: tabular },
  edition: { fontFamily: fonts.body, fontSize: 11, lineHeight: 13, letterSpacing: 0.55, textTransform: upper, fontVariant: tabular },
  ticker: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.33, textTransform: upper },
  menuItem: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 18, letterSpacing: 0.99, textTransform: upper },
  cardTitle: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 15.12 },
  cardMeta: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.64 },
  price: { fontFamily: fonts.body, fontSize: 18, lineHeight: 24.75, fontVariant: tabular },
  priceSm: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.64, fontVariant: tabular },
  pricePill: { fontFamily: fonts.body, fontSize: 11, lineHeight: 13, letterSpacing: 0.55, textTransform: upper },
  badge: { fontFamily: fonts.body, fontSize: 11, lineHeight: 13, letterSpacing: 0.55, textTransform: upper },
  button: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22 },
  buttonLarge: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 16 },
  size: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 18 },
  body: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 19.73 },
  bodyLong: { fontFamily: fonts.bodyMedium, fontSize: 14.4, lineHeight: 25 },
  article: { fontFamily: fonts.bodyMedium, fontSize: 14.4, lineHeight: 25 },
  meta: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.64 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16.5 },
  announcement: { fontFamily: fonts.body, fontSize: 12.6, lineHeight: 17.33, textTransform: upper },
  empty: { fontFamily: fonts.headingMedium, fontSize: 16.8, lineHeight: 20.16 },
  tabBar: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 13, letterSpacing: 0.28, textTransform: upper },
  countBadge: { fontFamily: fonts.bodyBold, fontSize: 11, lineHeight: 13 },
} as const

export const shadow = {
  none: {},
  badge: Platform.select({
    ios: { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
    default: { elevation: 1 },
  }),
  arrow: Platform.select({
    ios: { shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    default: { elevation: 3 },
  }),
  sheet: Platform.select({
    ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: -2 } },
    default: { elevation: 4 },
  }),
  // v7 keys: no shadows on cards or buttons
  sm: {},
  float: {},
  xl: {},
} as const

const themeEase = Easing.bezier(0.215, 0.61, 0.355, 1)
export const ease = {
  theme: themeEase, // nav, menus, chevrons
  sweep: Easing.bezier(0.33, 0, 0, 1), // button press sweep
  css: Easing.bezier(0.25, 0.1, 0.25, 1), // CSS `ease`: drawers, quick add
  out: Easing.bezier(0, 0, 0.58, 1), // CSS `ease-out`: button colours, accordion fade, progress
  in: Easing.bezier(0.42, 0, 1, 1), // CSS `ease-in`: image fade, accordion slide
  inOut: Easing.bezier(0.42, 0, 0.58, 1), // CSS `ease-in-out`: bag sheet slide
  linear: Easing.linear,
  // v7 aliases
  sineOut: themeEase,
  sineIn: Easing.bezier(0.42, 0, 1, 1),
  sineInOut: Easing.bezier(0.42, 0, 0.58, 1),
  tailwind: themeEase,
} as const

/** The v7 "beat" is retired; BEAT stays exported for old imports and equals the colour change. */
export const BEAT = 250
export const dur = {
  colour: 250, // M1 colour/background/border, M3/M4 link and nav colour
  sweep: 500, // M1 sweep
  tab: 200, // M16
  quickAdd: 250, // M9 (static on touch; used only by the Added sheet content)
  image: 500, // M8/M11
  menu: 600, // M12
  bagSheet: 250, // M13
  underlay: 300, // M12/M13 (delay 100)
  underlayDelay: 100,
  rotate: 300, // M14/M15/M19
  accordion: 300, // M15
  sticky: 300, // M18
  progress: 300, // M20
  announce: 5000, // M7 interval
  announceFade: 500, // M7 fade (est.)
  reducedFade: 200, // sheets under Reduce Motion
  // v7 keys remapped
  section: 300,
  press: 250,
  sheetIn: 250,
  sheetOut: 250,
} as const

export const reduce = ReduceMotion.System

export const motion = { reduceMotion: ReduceMotion.System } as const
export const MAX_CONTENT_WIDTH = 720
