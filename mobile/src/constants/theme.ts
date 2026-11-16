import { Platform, type TextStyle } from "react-native"
import { Easing, ReduceMotion } from "react-native-reanimated"

/**
 * Shelby v7: The Ball Box (APP_SPEC v7; web `.impeccable/surfaces/web-src-app-page-tsx.md`).
 * The app is a golf-ball box printed flat: coated white board, two-ink print
 * (navy base ink plus each colourway's own ink), heavy printed keylines,
 * die-cut photo windows, compressed model type. Token names are kept from v6
 * so every screen re-inks from here; values are the box world's.
 * Letter-spacing values are points (= em × font size).
 */
export const colors = {
  // the box's inks and board (new names)
  ink: "#14213D", // base ink: text, keylines, primary blocks
  ink2: "#3F4A64", // long-form body on board
  ink3: "#5D667C", // meta (6.1:1 on white board)
  board: "#FFFFFF", // board-white: every screen is the flattened box's board
  paper: "#FFFFFF", // panels
  wash: "#E7E9EE", // disabled fills, quiet rows
  crease: "rgba(20, 33, 61, 0.35)", // dieline creases
  rule: "rgba(20, 33, 61, 0.15)", // hairlines inside panels
  stripe: "#C8302A", // sleeve red: numbered editions only
  stripeTint: "#FBE9E7",
  pine: "#1E3B2F",
  pineInk: "#F1ECE0",
  navy: "#1B2A4A",
  fescue: "#CFC3A6",

  // v6 names, re-pointed into the box world
  black: "#14213D",
  white: "#FFFFFF",
  naturalWhite: "#E7E9EE",
  page: "#FFFFFF",
  naturalWhite25: "#F8F9F7",
  charcoal: "#3F4A64",
  muted: "#5D667C",
  mutedFill: "rgba(20, 33, 61, 0.15)",
  swatchRing: "rgba(20, 33, 61, 0.6)",
  stroke: "rgba(20, 33, 61, 0.25)",
  red: "#A3341F", // low stock only
  green: "#1D6A44", // in stock only
  gray200: "#E7E9EE",
  gray300: "#C9CED8",
  gray400: "#6B7488",
  gray500: "#5D667C",
  gray600: "#3F4A64",
  neutral800: "#0B1427",
  overlay: "rgba(11, 20, 39, 0.5)",
  overlayMenu: "rgba(11, 20, 39, 0.3)",
  tileVeil: "rgba(0, 0, 0, 0.15)",
  ringFill: "rgba(20, 33, 61, 0.1)",
  ringStroke2: "rgba(255, 255, 255, 0.7)",
  ringStroke3: "rgba(255, 255, 255, 0.4)",
  pillBorder: "rgba(20, 33, 61, 0.5)",
} as const

/** v6 golf names; in the box the "golf" ink is Pine, and midnight is the base ink. */
export const golf = { green: "#1E3B2F", greenPressed: "#142A21", tint: "#E9EEE9", midnight: "#14213D", sage: "#CFC3A6" } as const

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

/**
 * One superfamily, set the way a box's print is set: Sofia Sans Extra
 * Condensed for model names and every numeral, Semi Condensed for printed
 * labels and controls, Sofia Sans for running copy. There is no serif and no
 * mono in this world; the v6 role names point at the box faces.
 * The family carries the weight: never set fontWeight or fontStyle with these.
 */
export const fonts = {
  model: "SofiaSansExtraCondensed_800ExtraBold",
  modelBold: "SofiaSansExtraCondensed_700Bold",
  label: "SofiaSansSemiCondensed_700Bold",
  labelSemi: "SofiaSansSemiCondensed_600SemiBold",
  body: "SofiaSans_400Regular",
  bodyMedium: "SofiaSans_500Medium",
  bodySemi: "SofiaSans_600SemiBold",
  bodyBold: "SofiaSans_700Bold",
  // v6 role names
  display: "SofiaSansExtraCondensed_800ExtraBold",
  displayMedium: "SofiaSansExtraCondensed_700Bold",
  displaySemi: "SofiaSansExtraCondensed_800ExtraBold",
  serif: "SofiaSans_400Regular",
  serifItalic: "SofiaSans_500Medium",
  mono: "SofiaSansSemiCondensed_600SemiBold",
  monoMedium: "SofiaSansSemiCondensed_700Bold",
} as const

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 10, lg: 16, xl: 20, xxl: 24, xxxl: 32, section: 40 } as const

/**
 * The flat header bar (the box's top flap) is 52pt under the status bar with a
 * 2pt keyline; panels sit 12pt in from the screen edge with 20pt padding.
 * The v6 pill names are kept for the screens that read them.
 */
export const layout = {
  edge: 12,
  text: 20,
  panelPad: 20,
  gap: 12,
  keyline: 2,
  header: 52,
  pillTop: 0,
  pillHeight: 52,
  pillSide: 0,
  contentTop: 52 + 12,
  ticker: 32,
} as const

/** Board is cut square: panels and controls have square corners; only windows are die-cut round. */
export const radius = { xs: 0, sm: 0, md: 0, lg: 0, xl: 0, xxl: 0, xxxl: 0, tile: 0, panel: 0, pill: 0, window: 28, full: 9999 } as const

const upper = "uppercase" as const
const tabular: TextStyle["fontVariant"] = ["tabular-nums"]

/** Text roles. Nothing below 11pt; Text keeps allowFontScaling so sizes follow the system setting. */
export const type = {
  // box roles
  model: { fontFamily: fonts.model, fontSize: 56, lineHeight: 50, letterSpacing: -0.5, textTransform: upper },
  panelTitle: { fontFamily: fonts.model, fontSize: 40, lineHeight: 38, letterSpacing: -0.2, textTransform: upper },
  specLine: { fontFamily: fonts.label, fontSize: 15, lineHeight: 20, letterSpacing: 1.5, textTransform: upper, fontVariant: tabular },
  digits: { fontFamily: fonts.model, fontSize: 44, lineHeight: 44, fontVariant: tabular },
  digitsSm: { fontFamily: fonts.model, fontSize: 28, lineHeight: 28, fontVariant: tabular },
  // v6 role names, re-set in the box faces
  heroEyebrow: { fontFamily: fonts.label, fontSize: 13, lineHeight: 18, letterSpacing: 1, textTransform: upper },
  hero: { fontFamily: fonts.model, fontSize: 40, lineHeight: 38, letterSpacing: -0.2, textTransform: upper },
  section: { fontFamily: fonts.model, fontSize: 34, lineHeight: 33, letterSpacing: -0.1, textTransform: upper },
  tile: { fontFamily: fonts.model, fontSize: 30, lineHeight: 30, textTransform: upper },
  pdpTitle: { fontFamily: fonts.model, fontSize: 56, lineHeight: 50, letterSpacing: -0.5, textTransform: upper },
  quote: { fontFamily: fonts.bodyMedium, fontSize: 17, lineHeight: 26 },
  kicker: { fontFamily: fonts.body, fontSize: 17, lineHeight: 26 },
  articleH1: { fontFamily: fonts.model, fontSize: 40, lineHeight: 38, textTransform: upper },
  tab: { fontFamily: fonts.label, fontSize: 15, lineHeight: 20, letterSpacing: 1, textTransform: upper },
  eyebrow: { fontFamily: fonts.label, fontSize: 13, lineHeight: 18, letterSpacing: 1, textTransform: upper },
  subline: { fontFamily: fonts.label, fontSize: 13, lineHeight: 18, letterSpacing: 1.2, textTransform: upper },
  label: { fontFamily: fonts.label, fontSize: 13, lineHeight: 18, letterSpacing: 1, textTransform: upper },
  scoreLabel: { fontFamily: fonts.label, fontSize: 12, lineHeight: 16, letterSpacing: 1, textTransform: upper },
  scoreNumber: { fontFamily: fonts.label, fontSize: 15, lineHeight: 20, letterSpacing: 0.5, fontVariant: tabular },
  edition: { fontFamily: fonts.label, fontSize: 13, lineHeight: 18, letterSpacing: 1.3, textTransform: upper, fontVariant: tabular },
  ticker: { fontFamily: fonts.label, fontSize: 12, lineHeight: 16, letterSpacing: 1, textTransform: upper, fontVariant: tabular },
  holeNumber: { fontFamily: fonts.model, fontSize: 40, lineHeight: 40, fontVariant: tabular },
  cardHeading: { fontFamily: fonts.model, fontSize: 28, lineHeight: 28, textTransform: upper },
  menuItem: { fontFamily: fonts.label, fontSize: 17, lineHeight: 22, letterSpacing: 1, textTransform: upper },
  cardTitle: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 21 },
  cardMeta: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19 },
  price: { fontFamily: fonts.model, fontSize: 30, lineHeight: 30, fontVariant: tabular },
  priceSm: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 20, fontVariant: tabular },
  pricePill: { fontFamily: fonts.label, fontSize: 13, lineHeight: 18, letterSpacing: 1, textTransform: upper },
  badge: { fontFamily: fonts.label, fontSize: 12, lineHeight: 14, letterSpacing: 1.2, textTransform: upper },
  button: { fontFamily: fonts.label, fontSize: 15, lineHeight: 18, letterSpacing: 1, textTransform: upper },
  buttonLarge: { fontFamily: fonts.label, fontSize: 17, lineHeight: 20, letterSpacing: 1.1, textTransform: upper },
  size: { fontFamily: fonts.label, fontSize: 15, lineHeight: 18, letterSpacing: 0.9 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyLong: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25 },
  article: { fontFamily: fonts.body, fontSize: 17, lineHeight: 27 },
  meta: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  announcement: { fontFamily: fonts.label, fontSize: 12, lineHeight: 16, letterSpacing: 1, textTransform: upper },
  empty: { fontFamily: fonts.bodyMedium, fontSize: 22, lineHeight: 28 },
  tabBar: { fontFamily: fonts.label, fontSize: 11, lineHeight: 13, letterSpacing: 0.8, textTransform: upper },
  wordmark: { fontFamily: fonts.model, fontSize: 26, lineHeight: 28, letterSpacing: 1.6, textTransform: upper },
  countBadge: { fontFamily: fonts.label, fontSize: 11, lineHeight: 13 },
  countdown: { fontFamily: fonts.model, fontSize: 48, lineHeight: 48, fontVariant: tabular },
} satisfies Record<string, TextStyle>

/** Printed board barely casts a shadow: only sheets and the sticky strip lift off it. */
export const shadow = {
  sm: Platform.select({
    ios: { shadowColor: "#0B1427", shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 2 },
    default: { boxShadow: "0 2px 4px #0b14271f" },
  }),
  float: Platform.select({
    ios: { shadowColor: "#0B1427", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
    android: { elevation: 8 },
    default: { boxShadow: "0 8px 12px #0b14272e" },
  }),
  xl: Platform.select({
    ios: { shadowColor: "#0B1427", shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: -6 } },
    android: { elevation: 16 },
    default: { boxShadow: "0 -6px 18px #0b142729" },
  }),
}

/**
 * One motion grammar: a single beat on one exponential ease-out (web
 * `--ease-box`). Every v6 ease name points at it so nothing moves on its own clock.
 */
const box = Easing.bezier(0.16, 1, 0.3, 1)
const boxInOut = Easing.bezier(0.65, 0, 0.35, 1)
export const ease = {
  box,
  boxInOut,
  sineOut: box,
  sineIn: Easing.bezier(0.7, 0, 0.84, 0),
  sineInOut: boxInOut,
  power3Out: box,
  power3In: Easing.bezier(0.7, 0, 0.84, 0),
  power3InOut: boxInOut,
  tailwind: box,
  linear: Easing.linear,
}

/** The beat (web `--beat: .42s`) and the quick press beat, in ms. */
export const BEAT = 420
export const dur = {
  beat: BEAT,
  section: BEAT,
  hover: 180,
  hoverDelay: 0,
  dropdown: BEAT,
  slide: BEAT,
  accordion: BEAT,
  carouselFade: BEAT,
  quickViewIn: BEAT,
  quickViewOut: 200,
  marquee: 10000,
  orbitMobile: 15000,
  sheetOverlay: BEAT,
  sheetPanel: BEAT,
  button: 180,
}

export const motion = { reduceMotion: ReduceMotion.System } as const
export const MAX_CONTENT_WIDTH = 720
