# Shelby app: complete specification (v8, Shelby in Eastside Golf's style; v6 behaviours)

> **v8 is the binding visual layer** (Part V8, below). It replaces every visual value in Part G, v5
> and Appendix A, and the v7 Ball Box layer. Behaviour, data, analytics and verification stay as
> Part G → v5 → Appendix A, all kept verbatim after Part V8.

**What this file covers.** It is the source of truth for the Expo app (`mobile/`). It mirrors
`web/SITE_SPEC.md` v8 Part E: Eastside Golf's tokens, type and patterns, from the capture described
at the top of that file. That capture includes Playwright at the iPhone 13 profile (390×664), so
the mobile values below are Eastside's **measured mobile values**, 1px = 1pt.

**Native translation.** The native tab bar, the stack navigation, the edge-swipe back gesture,
haptics and safe areas stay native. Where Eastside relies on hover (the button sweep, the card
image swap, the quick-add slide), the app uses the touch form given in V8.4.

**Stack (unchanged):**
- Expo SDK 58, React Native 0.88, expo-router (typed routes, `src/app`);
- TanStack Query, `@medusajs/js-sdk`;
- `expo-image`, `expo-haptics`, `react-native-svg`;
- `@expo/vector-icons` (Ionicons; the app's icon set stays);
- `react-native-safe-area-context`;
- **`react-native-reanimated` 4.7** (all motion).

**Fonts** (JS-only packages, installed with `npx expo install`):

| Package | Version | Faces |
|---|---|---|
| `@expo-google-fonts/monomakh` | 0.4.0 | `Monomakh_400Regular` |
| `@expo-google-fonts/montserrat` | 0.4.2 | `Montserrat_500Medium`, `Montserrat_600SemiBold`, `Montserrat_700Bold` |
| `@expo-google-fonts/roboto` | 0.4.3 | `Roboto_400Regular`, `Roboto_400Regular_Italic`, `Roboto_500Medium`, `Roboto_700Bold` |

**Remove** the three `@expo-google-fonts/sofia-sans*` packages and their imports.

---

# Part V8: Eastside's style (visual layer, binding over G, v5 and A for visuals)

## V8.1 Rules

- **Corners:**
  - 3pt on buttons, fields and selects;
  - 4pt on tabs and the sticky add button;
  - 20pt on badge pills;
  - round on swatches and arrows;
  - **0** on images, tiles, cards, sheets and bands.
- **Grounds:** white screens, #F6F6F6 image tiles and bands, black for the announcement strip, the
  order thanks band and the account footer band.
- **Colour:** one accent, golf green #207212, used for buying (Add to bag), prices on product,
  offer and bag screens, eyebrows, progress fills and the selected tab-bar item.
- **Shadows:** none, except the badge pill and the round carousel arrows (V8.2).
- **Casing:**
  - Section titles, nav-like labels, badges and tab-bar labels are UPPERCASE (`textTransform`).
  - Product names are Title Case with the colour first ("Pine Rope Cap").
  - Buttons are Title Case ("Add To Bag").
- **Nothing under 11pt.** Eastside's 9.9–10.8px labels render at 11pt.
- **WCAG AA** on every pair (the web's E.2.2 table applies). Light swatches get a #8C8C8C ring.
- **Proof and urgency:**
  - No stars, review counts, discount offers, "Best seller" or "Sale".
  - No partner, collab or UGC sections.
  - No Eastside logo, figure, imagery or copy (web E.1.2 lists each and its Shelby replacement).
- **Touch targets** are at least 44×44pt.

## V8.2 Tokens (`src/constants/theme.ts`)

Keep the export names (`colors`, `golf`, `fonts`, `spacing`, `layout`, `radius`, `type`, `shadow`,
`ease`, `dur`, `BEAT`) so the screens keep compiling, and change their values as below. Keep
`colourways`, `colourwayOf`, `CORE_COLOURWAYS`, `LIGHT_CROWNS` and `colourwaySlug` unchanged:
they are product colours. Their `panel`, `ink` and `edge` fields stay in the type but no screen
styles with them any more.

```ts
import { Easing, ReduceMotion } from "react-native-reanimated"
import { Platform } from "react-native"

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
```

**Load the fonts in `src/app/_layout.tsx`.** `useFonts` takes the 8 faces from the font table in
the header (Monomakh 400; Montserrat 500, 600, 700; Roboto 400, 400 italic, 500, 700). The splash
stays up until they load (unchanged logic).

**Status bar:** `style="light"` while the black announcement strip sits under it on Home, and
`dark` everywhere else. The Stack `contentStyle` is `colors.bg`.

## V8.3 Components (`src/components/`, restyle in place; keep names and props)

- **`button.tsx`:** the web E.5.1 variants as a `variant` prop.

  | Variant | Fill | Border | Text | Height | Corners |
  |---|---|---|---|---|---|
  | `primary` | #207212 | 1pt #207212 | `btnAtc`, #fff, capitalized | 52 | 3 |
  | `secondary` | #212121 | — | `btn`, #fff | 48 | 3 |
  | `black` | #000 | — | #fff | 50 (checkout) | 3 |
  | `white` | #fff | — | #000 | 44, or 33 with `small` (`btnSm`) | 3 |
  | `outline` | transparent | 1pt #212121 | #212121 | 44 | 3 |
  | `outlineWhite` | transparent | 1pt #fff | #fff | 40 | 3 |
  | `kit` | #fff | 1pt #212121 | `btnKit` (Montserrat 600 16), #000 | 38 | 3 |
  | `sticky` | #207212 | — | `btnSticky` (18) | 47 | 4 |

  - Disabled is opacity .5, with no press feedback.
  - Loading shows an `ActivityIndicator` (size small, the label colour) beside the label.
  - Press feedback is V8.4 M1.
- **`text.tsx`:** add the Eastside role names (`displayXl` … `note`) as `variant`s. Keep the old
  names; they now resolve to the remapped styles.
- **`product-card.tsx`:** the web E.5.2 card, with no hover states.
  - **Tile:** 5:6, #F6F6F6, 0 radius.
    - Image: `expo-image`, `contentFit="cover"` on a tile asset or `"contain"` on a square asset
      (web E.7.1).
    - Badge pill at top-left 5/5.
  - **Info:** padding 8/8/2.
    - Title `cardTitleEastside` (12.6 #000).
    - Price `priceCard` (#646464) 5pt below.
    - 20pt swatch dots at a 10pt gap.
  - **Quick add:** a static 44pt white row under the tile with the `micro` label "+ Quick add" and
    a 1pt #F0F0F0 top rule. Behaviour, haptic and the `quick_add` label are unchanged.
  - **Widths:**

    | Where | Card width |
    |---|---|
    | Rails | 164pt at a 4pt gap |
    | Two-column grid | (screen − 12×2 − 10) / 2 |

- **`swatch.tsx`:**
  - **Card dot:** 20pt round, 1pt #E9E9E9 border (#8C8C8C on light crowns). The crown fill has a
    rope band across the lower third (a View at 62–76% height).
  - **Picker swatch:** 32pt in a 44pt hit area. Selected is a 2pt white gap plus a 1pt #212121
    ring.
  - The light haptic on select stays.
- **`edition-badge.tsx`:**
  - The white pill: 11pt `badge` text, padding 2/8, radius 20, `shadow.badge`. Reads "No. 02".
  - A `dark` prop gives #212121/#fff for "Sold out".
- **`segmented-control.tsx`:** the web tab (E.5.5) as a horizontal row.
  - Each segment has a 1pt #212121 border, radius 4, padding 4/16, 44pt min height and `tabLabel`.
  - Active is #141414 with #fff `tabLabelActive`.
  - The row scrolls sideways at an 8pt gap.
- **`accordion.tsx`:**
  - Rows 48pt+ with padding 14/30/14/0, title `accordionTitle`, a 1pt #F0F0F0 rule under each.
  - An Ionicons `add` 16pt that turns 45° when open.
  - Body `bodyPdp` with 16pt bottom padding.
- **`free-shipping-progress.tsx`:**
  - A centred `bodyPdp` message: "You're $37.00 away from free shipping." or "You've got free
    standard shipping."
  - An 8pt bar, radius 10, track #EEE, fill #207212 (V8.4 M20). The threshold is the real $85.
- **`text-field.tsx` and `search-pill.tsx`:**
  - Fields are 44pt with padding 10/12, 1pt #8C8C8C, radius 3 and 16pt text.
  - The focus border goes #212121 plus a 2pt #207212 outer ring.
  - Errors show in an error box (#F8D7DA, 1pt #F5C6CB, #721C24 12.6pt text, radius 3).
  - The search pill becomes a 44pt field with a leading `search` icon. It is not a pill: radius 3.
- **`quantity-stepper.tsx`:**
  - `remove` and `add` icons (12pt) in 44pt hit areas, the count in 14.4 tabular, no outer border.
  - "Remove" (`micro`) below.
- **`announcement-bar.tsx`:**
  - 36pt, #000, `announce` text #F7F7F7, centred, with real ticker items only.
  - Fades per M7.
  - A 24pt `pause`/`play` button at the right edge.
  - Under Reduce Motion, autoplay stops and 24pt `chevron-back`/`chevron-forward` buttons show at
    both ends.
  - `ticker_item` is unchanged.
- **`app-header.tsx`:** Eastside's mobile header, 72pt, white.
  - Left: search, 44pt. The tab bar replaces Eastside's hamburger.
  - Centre: the `wordmark` "SHELBY" (Monomakh 26, 0.04em).
  - Right: recently viewed (`eye-outline`), 44pt.
  - No border. It pins at the top of each scroll view (sticky header index), as Eastside's sticky
    header does.
- **`sheet.tsx`:**
  - A bottom sheet, white, 0 radius, with `shadow.sheet` and a 1pt #F0F0F0 top edge.
  - The head is 64pt: a `labelCaps` title and a 34pt close `close` 24pt icon.
  - The underlay is #000 at .4.
- **`countdown.tsx`:** `countdown` (Montserrat 700 26, tabular), or `countdownSm` in lines. Only to
  a real release time.
- **`notify-me.tsx`** (the tee sheet): an email field and a `secondary` button stacked, plus the
  `meta` line "One email when Hole 02 opens. Nothing else." `notify_me` is unchanged.
- **`stock-line.tsx`:** `meta` (#646464) "143 left", from live stock only. Sold out shows the dark
  badge.
- **`crown-compare.tsx`:** keeps its react-native-svg drawing, restyled.
  - On #F6F6F6.
  - The Rope Cap filled in its crown colour with a 3pt rope stroke.
  - The 12 cm crown as a 1.5pt dashed #646464 outline.
  - The ruler in #646464 with 11pt labels.
- **`value-tile.tsx` and `bundle-rows.tsx`:** E.5.2 kit cards (The Pair "$88.00 · $44 a cap", The
  Foursome "$152.00 · $38 a cap").
- **`state-views.tsx`:** loading skeletons are #F6F6F6 blocks with no shimmer. Empty and error
  states use `titleCard` and `bodyPdp` with a `secondary` button.
- **`box.tsx`, `box-faces.tsx` and `front-panel.tsx`:** replaced by the screen sections in V8.5.
  - Delete the files once no screen imports them.
  - `InkStripes` becomes the V8.3 swatch picker.
  - `confirmHaptic` moves to `src/lib/haptics.ts`, unchanged.

**Tab bar** (`src/app/(tabs)/_layout.tsx`):
- White, 56pt plus the safe area, a 1pt #F0F0F0 top hairline.
- Ionicons outline/filled pairs, as today, at 22pt.
- Inactive #212121; active #207212 with the filled glyph.
- Labels in `tabBar` (11pt uppercase).
- The bag badge is a 16pt #207212 circle with an 11pt #fff count.
- The "bouncy" press stays as V8.4 M16.

## V8.4 Motion map (web E.2.5 → Reanimated 4)

Every timing below is `withTiming(value, { duration, easing, reduceMotion: ReduceMotion.System })`.
Screens also read `useReducedMotion()` for anything that would move without a timing (autoplay,
scroll-driven pinning).

| Web | Native trigger | Reanimated | Reduce Motion |
|---|---|---|---|
| M1 button sweep (hover) | **Press in** on `Button` | A skewed (`skewX: '30deg'`) overlay View, 120pt wider than the button, `translateX` from −(w+120) to 0, **500ms `ease.sweep`**. Fill: the pressed colour (#1A5C0F, #3B3B3B, #1A1A1A, #F2F2F2), or `currentColor` at .1 for outlines. On **press out**, its opacity goes 1→0 in **250ms `ease.out`**, then it resets. | No overlay. The background switches to the pressed colour at once and back on release. |
| M2 arrow nudge | Press in | Arrow `translateX` 0→5, **250ms `ease.out`** | Off |
| M3/M4 link and nav colour | Press in on text links and header icons | Colour → `linkPressed` (on black, `onInkPressed`), **250ms `ease.theme`** | Instant |
| M5 mega menu | Not used | The tab bar is the nav | — |
| M6 sticky header | Scroll | `stickyHeaderIndices` pins the header (no animation) | Same |
| M7 announcement | Every **5000ms** | Cross-fade the next item, opacity 0→1 over **500ms `ease.css`** (*est.*) while the old one goes 1→0 | Autoplay off; arrows shown |
| M8 card image swap (hover) | Not used on touch | — | — |
| M9 quick-add slide (hover) | Not used on touch: the bar is static | — | — |
| M10 card title colour | Press in on a card | Title colour → `linkPressed`, **250ms** | Instant |
| M11 image load fade | Image load | `expo-image` `transition={{ duration: 500, timing: "ease-in", effect: "cross-dissolve" }}` | `transition={0}` |
| M12 menu drawer | Shop filter drawer and search panel (left/top sheets) | `translateX` −w→0, **600ms `ease.css`**; underlay opacity 0→.4, **300ms**, delay **100ms**. Close reverses in 600ms. | Opacity 0→1 in **200ms**, no translate |
| M13 cart flyout | The **Added sheet** and the bag's edit sheets | `translateY` h→0, **250ms `ease.inOut`**; the underlay as M12. New bag lines enter with opacity 0→1 and `translateY` 15→0, **250ms `ease.css`**. A removed line runs `withTiming` on opacity 1→0 and height →0, **250ms**, via `Layout`/`exiting` (`FadeOut.duration(250)`). | Sheet opacity **200ms**; lines without translate |
| M14 close icon | Press in on ✕ | `rotate` 0→90°, **300ms `ease.out`** | Off |
| M15 accordion | Toggle | Body opacity 0→1 in **300ms `ease.out`** and `translateY` −8→0 in **300ms `ease.in`**; icon `rotate` 0→45°, **300ms `ease.out`** | Instant |
| M16 tabs and segments | Select | Fill and text colour, **200ms `ease.out`**. The tab-bar icon press: scale 1→0.92→1, 100ms + 100ms `ease.out`. | Instant; no scale |
| M17 carousel arrows | Not used on touch; rails swipe | — | — |
| M18 sticky buy bar | The main Add button leaves the viewport (measured with `onLayout` and the scroll offset) | Bar opacity 0→1, **300ms `ease.out`**; `pointerEvents` follows | Instant |
| M19 chevron | Filter group or "Change color" toggle | `rotate` 0→180°, **300ms `ease.theme`** | Instant |
| M20 progress fill | Bag subtotal change | Width (as `scaleX` with a left origin), **300ms `ease.out`** | Instant |
| M21 smooth scroll | "Get a quote", "Pick your two" | `scrollTo({ animated: true })` | `animated: false` |

**Haptics** (unchanged):
- a light impact on swatch, segment and tab select;
- success on Add to bag (`confirmHaptic`);
- none on scroll.

**`src/lib/motion.tsx`:**
- Keep `useMountProgress`.
- Delete `TurnFace`, `RevealScrollView`/`Reveal` (Eastside has no scroll reveals; see the web
  capture notes), `circlePoint` and `stadiumPoint` once unused.
- Add `usePressSweep(width)`, which returns the animated style for M1.
- Add `useStickyBar(threshold)` for M18.

**useReducedMotion rule:** every component that animates imports `useReducedMotion` from
`react-native-reanimated` and branches to the "Reduce Motion" column above. Timings also carry
`ReduceMotion.System`, so a missed branch still settles instantly.

## V8.5 Screens (behaviour unchanged from G/v5/A; Eastside's mobile patterns)

1. **Home `(tabs)/index`** (web E.6.1, mobile column). One scroll view:
   - **Announcement and header:** the announcement strip, then the sticky header.
   - **Colour strip:** #EEE9E3, padding 19/0/9.
     - 79pt squares (#F6F6F6, product shot `contain`) at a 4pt gap from x = 14, each with a
       `stripLabel` 7pt below.
     - Tiles: Tour White, Navy, Pine and Fescue (`shop_by_color`), Holes (`home_scorecard`) and
       Pair (`home_pair`).
   - **Hero:** full width, 650pt (cap at the window height minus the tab bar).
     - `rope-lifestyle-hero-mobile.jpg`, cover.
     - The copy block sits bottom-right, 16pt in from the edges, 220pt wide, right-aligned, on a
       radial backdrop.
       - React Native has no radial gradient: use react-native-svg `RadialGradient` from #000 at
         .2 opacity to transparent at 70%, as an absolutely positioned SVG behind the copy.
       - `displayHero` #fff "The Rope Cap".
       - `bodyEastside` #fff line.
       - An `outlineWhite` "Shop the Rope Cap" button (`core_product`, the app's existing label
         for opening the core product; the web's `hero_shop_core` is not added to the app).
       - An underlined 12.6 line "The Pair is $88" (`hero_shop_pair`).
   - **The Rope Cap rail:**
     - `displayLg` title at x = 12.
     - A segmented row: Core colors / Numbered holes / Kits.
     - 24pt below, a horizontal `FlatList` of 164pt cards at a 4pt gap (snap to card).
     - Core cards carry `core_product` and quick add; holes carry `card_hole` (live:
       `hero_shop_drop`); kits carry `home_pair` and `home_foursome`.
   - **Shop by color:**
     - #F6F6F6 band, padding 40/0.
     - `displayMd` title at x = 12.
     - A rail of 5:7 tiles 179×251 plus a 27pt label row: the four colours (`shop_by_color`) and
       The Card (`home_scorecard`).
   - **The Card rail:** `displayMd` "The Card" plus a "See all six holes" link (`home_scorecard`),
     then the edition cards (`card_hole`, live `hero_shop_drop`; upcoming ones show the tee sheet
     row, `notify_me`).
   - **Crown story:**
     - A 390×390 image (`story-crush.jpg`, `home_story`).
     - Then a #F6F6F6 block, padding 24:
       - `displayXl` "Sits right the first time.";
       - `bodyEditorial` text;
       - a `black small` "See the crown test" button (`series_story`);
       - a "Six reasons" link (`home_reasons`).
     - When the story is a web page, the existing link behaviour applies.
   - **Quiz splash:**
     - 403pt `rope-clubhouse.jpg` with a bottom gradient (#0000000d→#0000004d at .5).
     - Centred: `displaySplash` "Find your color", `bodySplash` text and a `white small` "Take
       the Quiz" button (`home_quiz`; opens the web quiz as today).
   - **Footer band:** a black band, padding 48/0/34, with the wordmark at 32 centred (#F7F7F7).
     Under it, the tee sheet block on black (`notify_me`) and "© Shelby 2026" at opacity .5.
2. **Shop `(tabs)/shop`** (web E.6.2):
   - **Header:** breadcrumb, `titlePage` "Shop" centred.
   - **Filter bar:** 56pt, 1pt #F0F0F0 rules.
     - "Show filters" opens a left sheet (M12) with Group (All, Core, Numbered, Kits; the existing
       group control, `color_pill`, `page_type: collection`) and Color.
     - "Sort by" opens a bottom sheet.
   - **Grid:** two columns at a 10pt gap, 12pt edges.
     - Order: core colour cards, editions, holes without products (`card_hole`), the Pair and the
       Foursome (`home_pair`/`home_foursome` with `page_type: collection`).
   - **FAQ:** the four collection-FAQ accordions with real answers.
3. **Product `products/[handle]`** (web E.6.3):
   - **Title block:** breadcrumb, `titleProduct`, then "Free shipping on $85+" (12.6), then
     `priceProduct` (#207212).
   - **Gallery:** a 390×468 paging gallery on #F6F6F6, with 6pt dots (#212121 / #BDBDBD) under it
     and the badge at top-left.
   - **Buy block:**
     - edition meta (`eyebrowSm`, stock line, `pdp_edition_link`);
     - the colour picker ("Color: Pine" plus 32pt swatches, `color_pill`);
     - the `primary` "Add To Bag" (`add_to_cart`), or "Sold out" disabled plus the tee sheet;
     - the "The Pair is $88" link (`pdp_offer`; `pdp_foursome`);
     - the policy lines (`meta`);
     - the description and bold bullets (`bodyPdp`, bullets in Roboto 700);
     - accordions: Fit (crown compare, fit-guide link `fit_guide`), Details, Shipping, Returns;
     - "Take the quiz" (`pdp_quiz`).
   - **Below:**
     - "You may also like" (`headingRecs`), a rail of 4:5 cards at 164pt (`pdp_also_like`);
     - the story teaser (`series_story`);
     - recently viewed.
   - **Sticky bar:** once the Add button leaves view (M18), a bottom bar shows.
     - #FCFCFC, padding 8/14 plus the safe area, above the tab bar.
     - A "Change Color ˄" row (40pt; M19 chevron, expands the swatch row inline).
     - Then the `sticky` "Add To Bag" (47pt, radius 4; `sticky_add_to_cart`).
4. **Offer `offer/[handle]`** (web E.6.10):
   - A 2×2 (or 1×2) grid of 5:6 #F6F6F6 tiles of the picked colours.
   - Then the buy block: breadcrumb, `titleProduct` (the **offer-headline** variant and exposure,
     unchanged), the shipping line, `priceProduct` "$88.00" plus "$44 a cap".
   - Picker rows "Cap 1" and "Cap 2" (`offer_add`).
   - The Foursome in a #F6F6F6 band (`offer_foursome_add`).
   - The story link (`offer_story`).
   - The sticky bar's add emits `offer_add`, the same action and label as the main button. The
     web-only `offer_close_cta` and `offer_sticky_add` are not added to the app.
   - The close splash (a `white small` "Pick Your Two" that scrolls to the top) carries no label.
5. **The Card `(tabs)/card` and `card/[handle]`** (web E.6.7):
   - **List:**
     - `titlePage` "The Card" plus the intro.
     - The next hole as an editorial block: a 390×390 tile (edition photo, or a #F6F6F6 tile with
       the `holeNumeral`) then a #F6F6F6 text block with `eyebrowSm` "Next · Hole 03",
       `displayXl` name, date, `countdown` (real dates only) and the tee sheet (`notify_me`).
     - The six holes as a one-column list of hole cards: a 4:3 tile, `titleCard`, the meta line
       and the phase action (`card_hole`).
   - **Detail:**
     - The same editorial hero (the image is not a link in the app, as today).
     - The phase action: countdown plus tee sheet; `primary` "Shop Hole 03"; or "Sold out".
     - Accordions: The color, The release, Shipping.
     - The other holes as a rail.
   - `drops/*` routes keep redirecting as today.
6. **Bag `(tabs)/cart`** (web E.6.4):
   - `titlePage` "Your bag".
   - The free-shipping progress.
   - **Lines:** a 92×110 #F6F6F6 tile, title 14.4/500, meta 12.6 #646464, price 14.4 tabular,
     stepper and Remove. 1pt #F0F0F0 rules between lines.
   - **Complete the look:** `titleDrawer`, then a rail of 140pt mini cards with `kit` "Add"
     buttons (`cart_complete_look`).
   - **Summary:** a #F6F6F6 block, padding 24:
     - "Subtotal" `labelCaps` and the amount at 21.6/500;
     - the policy `meta` line;
     - a `black` "Checkout" 50pt (`cart_checkout`);
     - the `note` "Taxes calculated at checkout.".
   - **Bundle rows** ("Make it two", today's `bundle-rows.tsx` in the bag) as kit cards
     (`cart_offer`).
   - **Empty:** "Your bag is empty." plus a `secondary` "Shop the Rope Cap" (no label, as today) and
     the colour cards.
7. **Added sheet** (`added-sheet.tsx`, web M13):
   - A bottom sheet with the head "Added to bag" (`labelCaps`) and ✕.
   - The line: an 80×96 tile, title and price.
   - The free-shipping progress.
   - `black` "Checkout" and `outline` "View Bag".
   - Complete the look: one row of 2 mini cards (`cart_complete_look`).
8. **Checkout `checkout` and order `order/[id]`** (web E.6.5):
   - **Checkout:**
     - A collapsible #F6F6F6 summary bar: "Show order summary · $96.00" with a chevron (M19).
     - Sections Contact, Delivery and Payment, each with a `titleCard` heading.
     - Fields per V8.3.
     - Shipping radio cards: 1pt #F0F0F0, radius 3; selected 1pt #212121 plus `greenFade`.
     - `secondary` "Continue" and `primary` "Place Order".
     - The `checkout_started` event is unchanged.
   - **Order:**
     - a black band (padding 32/16) with a `checkmark-circle` 40pt #F7F7F7, `titlePage` "Thank
       you" in #fff and the order line in 14.4 #F7F7F7;
     - then the lines and totals on white;
     - the numbered-inside note for editions;
     - an `outline` "Keep Shopping".
9. **Custom `custom`** (web E.6.8):
   - Editorial block: `rope-clubhouse.jpg` 390×390, then #F6F6F6 text with `eyebrow` "Custom
     orders", `displayXl` "Your crest, our cap." and the terms line.
   - Three facts (`eyebrowSm` label plus `titleSection` value, stacked).
   - Three steps (Monomakh 38 #207212 numbers).
   - The quote form, `secondary` "Send Request" (`custom_submit`; `custom_quote_submitted`
     unchanged).
10. **Account `(tabs)/account` and not-found:**
    - **Account:** `titlePage` "Account".
      - Rows 52pt in `menuRow` style (14.4 uppercase 0.07em, 1pt #F0F0F0 rules, `chevron-forward`
        at the right): orders, reminders, Fit guide, The story, Why the Rope Cap, The quiz,
        Shipping & returns, Custom orders. The web links open as today.
      - Then the black footer band with the wordmark.
    - **Not-found:** `displayXl` "Out of bounds.", "That page isn't here." and a `primary` "Shop
      the Rope Cap".
11. **Search sheet** (from the header):
    - A top sheet (M12, from the top).
    - A 44pt field (V8.3), then results as a two-column card grid.
    - Behaviour and events are unchanged.

## V8.6 Kept behaviour (verify list)

- Catalog, edition and kit logic; cart; checkout; The Card and tee-sheet opt-in; push reminders;
  custom quotes; recently viewed; deep links; attribution.
- **Analytics:**
  - `page_type` and `source` on every event.
  - `cta_click` labels (`trackTap`), exactly the 36 the app emits today (grepped 2026-11-16):

    | Area | Labels |
    |---|---|
    | Home | `shop_by_color`, `core_product`, `hero_shop_pair`, `home_pair`, `home_foursome` (with `page_type: collection` on Shop), `home_scorecard`, `home_story`, `series_story`, `home_reasons`, `home_quiz` |
    | The Card | `card_hole`, `hero_shop_drop` |
    | PDP | `pdp_offer`, `pdp_foursome`, `pdp_also_like`, `pdp_edition_link`, `fit_guide`, `pdp_quiz`, `color_pill`, `add_to_cart`, `sticky_add_to_cart`, `quick_add` |
    | Bag | `cart_offer`, `cart_complete_look`, `cart_checkout` |
    | Offer | `offer_add`, `offer_foursome_add`, `offer_story` |
    | Everywhere else | `notify_me`, `ticker_item`, `recently_viewed`, `search_submit`, `search_result`, `nav_custom`, `footer_custom`, `custom_submit` |

  - The restyle adds no label and drops none. Check by grepping `src/` for `trackTap(` before and
    after.
  - The events `add_to_cart`, `checkout_started`, `product_viewed`, `drop_viewed`,
    `notify_me_submitted` and `custom_quote_submitted`, and the offer-headline exposure.
- Attribution and deep links are unchanged.

## V8.7 Verify

- `npm run typecheck` and `npm run lint` pass.
- **No font left over:** `grep -r "SofiaSans" src` is empty.
- **No text under 11pt:** a check over `type` finds no `fontSize` below 11.
- **Tracking:** the `cta_click` label set and the event set match the pre-restyle grep exactly.
- **Web-export capture:**
  - An `expo export -p web` build, served behind the store-API proxy, captured with Playwright at
    390×844.
  - It covers Home, Shop (filters open), PDP with a colour switch and the sticky bar, Offer, Bag,
    the Added sheet, The Card and Account.
  - Plus one run with `reducedMotion: "reduce"`.
  - The shots go to `.impeccable/review/app/`.
- **Limits of the web export:** it is evidence for layout, type and colour only. The press sweep,
  haptics, gestures, the native tab bar and iOS/Android Reduce Motion need a simulator or a device.

---

# Functional contract (v6, kept verbatim)

Everything below is the v6 app specification, unchanged.

- **Still binding:** screens, data, behaviour, analytics and verification.
- **Superseded by Part V8:** its visual values (colour, font, size, radius, height and motion, the
  Allbirds base and the v6 golf-layer look).

# Part G: v6, the golf layer and the single Rope Cap (overrides v5 where they conflict)

The app mirrors **web/SITE_SPEC.md Part G** (read it first: G.1 positioning, voice and avoid rules,
G.1.5 evidence rules, G.2 tokens, G.5 components, G.6 pages, G.8 data). This part gives only the
native mapping. **Precedence:** Part G → v5 §1–§7 → Appendix A. v5's Allbirds tokens, components and
Reanimated motion stay the base.

## G.1 Rules (add to v5 §1)
1. **One product:** The Rope Cap ($48, four core colours), numbered editions ($52), The Pair ($88),
   The Foursome ($152). Prices, threshold and holes come from Medusa and the web Part G data; never
   hard-coded except `POLICY.freeShippingThreshold` (85), which mirrors the Medusa rule.
2. **Voice and avoid rules:** web G.1.3 and G.1.4 verbatim (no puns, no heritage claims, no
   tournament or club marks, no golf clip art, no popups, no fake scarcity).
3. **No app-only drops and no early access.** Push alerts fire at a hole's real `release_at`, the
   same moment the web goes live (web G.11 item 9).
4. **Scorecard metaphor:** hole, The Card, the tee sheet, the scorecard (web G.1.2).

## G.2 Tokens (add to `src/constants/theme.ts`; v5 §2 stays)

```ts
export const golf = {
  green: "#1E3B2F", // one band per screen, links, selected states
  greenPressed: "#104734",
  tint: "#EEF5E8", // colour-tile backdrops, quiet green panels
  midnight: "#03143B", // The Card headings, edition badge
  sage: "#B9B78D", // colour-tile backdrops
} as const

/** web G.2.1: crown + rope per colourway (swatches, rope rule). */
export const colourways = {
  "Tour White": { crown: "#F4F2EE", rope: "#1F2A44", ropeName: "Navy", group: "core" },
  "Clubhouse Navy": { crown: "#26314A", rope: "#F4F2EE", ropeName: "White", group: "core" },
  Pine: { crown: "#1E3B2F", rope: "#EDE6D6", ropeName: "Cream", group: "core" },
  Fescue: { crown: "#C9C1AE", rope: "#1F2A44", ropeName: "Navy", group: "core" },
  Azalea: { crown: "#F4F2EE", rope: "#D8648A", ropeName: "Azalea pink", group: "limited" },
  Cypress: { crown: "#2E4B4A", rope: "#CDBB98", ropeName: "Sand", group: "limited" },
  Haar: { crown: "#A7ABA8", rope: "#EDE6D6", ropeName: "Cream", group: "limited" },
} as const

// fonts (add): Libre Caslon Text fills the serif role (web G.2.3)
//   serif: "LibreCaslonText_400Regular",
//   serifItalic: "LibreCaslonText_400Regular_Italic",

// type (add or override; letter-spacing in points = em × size)
//   pdpTitle:    { fontFamily: fonts.serifItalic, fontSize: 24, lineHeight: 32 }            // override
//   tile:        { fontFamily: fonts.serifItalic, fontSize: 30, lineHeight: 38 }            // override
//   quote:       { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24 }            // override
//   kicker:      { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24 }
//   articleH1:   { fontFamily: fonts.serif, fontSize: 30, lineHeight: 38, letterSpacing: -0.15 }
//   scoreLabel:  { fontFamily: fonts.monoMedium, fontSize: 11, lineHeight: 16, letterSpacing: 2.2, textTransform: "uppercase" }
//   scoreNumber: { fontFamily: fonts.monoMedium, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, fontVariant: ["tabular-nums"] }
//   edition:     { fontFamily: fonts.monoMedium, fontSize: 12, lineHeight: 16, letterSpacing: 1.8, textTransform: "uppercase", fontVariant: ["tabular-nums"] }
//   ticker:      { fontFamily: fonts.mono, fontSize: 10, lineHeight: 16, letterSpacing: 2.0, textTransform: "uppercase", fontVariant: ["tabular-nums"] }
//   holeNumber:  { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, letterSpacing: -0.32, fontVariant: ["tabular-nums"] }
//   cardHeading: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32 }               // colour golf.midnight
```

- **New dependency (JS-only):** `@expo-google-fonts/libre-caslon-text` via `npx expo install`. Load
  `LibreCaslonText_400Regular` and `LibreCaslonText_400Regular_Italic` in `_layout.tsx` with the v5
  fonts; keep the splash until all load. Italic is a separate family: never set `fontStyle`.
- `src/components/text.tsx` adds variants `kicker`, `scoreLabel`, `scoreNumber`, `edition`,
  `ticker`, `holeNumber`, `cardHeading`, `articleH1`, and the tone `golf` (`#1E3B2F`).
- **Selected states → golf green** (web G.2.2): Swatch selected ring, SegmentedControl active
  segment (`golf.green` fill, white label), tab underline, FitScale active segment, checkbox fill,
  quiz progress, the `link` button variant label. CTAs (`secondary` `#212121`), badges, stock colours
  and the dark footer card are unchanged.
- **One golf-green band per screen** (named in G.5). On it: white text, `primary` (white) and
  `outlineWhite` buttons.

## G.3 Components (`src/components/`)

| Component | v6 spec |
|---|---|
| **Scorecard** (`scorecard.tsx`) | A bordered table built from Views: outer `borderWidth 1 #212121`, radius 12, `overflow: hidden`, white. Head row height 40, `golf.green`, three cells: "NO." · "SPEC" (`type.scoreLabel` white) · the title (`type.kicker` white). Body rows min-height 44, `borderTopWidth 1 #212121`; cells padding 12/14; number column width 44 (`type.scoreNumber` `#575757`), label column 104 (`type.scoreLabel`), value flex 1 (`type.body` `#212121`); vertical separators `borderLeftWidth 1 rgba(33,33,33,.2)`. Rows and order exactly web G.5.2 (missing values dropped, numbering closes up). Rows reveal with stagger (G.4 M35). |
| **RopeRule** (`rope-rule.tsx`) | A container height 4, radius 9999, `overflow: hidden`, `borderWidth: StyleSheet.hairlineWidth` `rgba(33,33,33,.15)`. Inside, a row of `ceil(width / 8) + 2` segments, each a View 8 wide × 12 tall, `transform: [{ skewX: "-45deg" }]`, alternating rope (first) and crown colours, positioned with `marginLeft: -2`, vertically centred. Colours from `colourways[name]`. Draw-in M36; colour change M36a (two stacked rules, the new one fades in). |
| **Ticker** (`announcement-bar.tsx`, replaces v5's crossfade) | Bar height **32**, `#212121`. Content: web G.5.3 items (real data only, same order and wording) in `type.ticker` white, separated by a 4pt `rgba(255,255,255,.6)` dot with 32pt gaps, rendered twice side by side. Crawl M34. Long-press pauses; release resumes. Tapping an item opens its target (hole → Card detail, core → PDP). `accessibilityRole="text"`, `accessibilityLabel` = the items joined by ", "; the duplicate copy is `importantForAccessibility="no-hide-descendants"`. Reduced motion: no crawl; one item with v5's chevrons. |
| **HoleCard** (`hole-card.tsx`) | v5 ProductCard box (white, radius 16): top row padding 16 with "HOLE 02" (`type.scoreLabel`) and the status Badge (LIVE · UPCOMING · ANNOUNCED · SOLD OUT · ENDED); image square contain on white (announced holes: a `golf.tint` square with the hole number in `type.holeNumber` centred); body padding 16, gap 4: name `type.kicker`, date `type.scoreLabel` "05 APR 2027 · 10:00 AM PT", RopeRule, EditionBadge, price `type.priceSm`; CTA row as web G.5.5 (live `secondary` small "SHOP AZALEA"; upcoming `outlineBlack` small "JOIN THE TEE SHEET"; announced: `type.meta` `#575757` "Announced. Details closer to the date."). Sold-out holes stay visible. Press: scale .98 (150, `ease.tailwind`). |
| **EditionBadge** | height 24, paddingHorizontal 10, radius 9999, `borderWidth 1 golf.midnight`, white, `type.edition` `golf.midnight`: "EDITION OF 200" / "143 OF 200 LEFT" (live stock). |
| **Swatch** (v5, extended) | Fill = crown; a rope band View at `top: 62%`, height 3 (36pt swatch) / 2 (20pt card swatch), `left/right: 18%`, radius 9999, rope colour; M38 on select. Selected ring `golf.green`. Light crowns keep the inner ring. Limited swatches that belong to another product are Pressables that navigate, with a `type.badge` `#575757` date under upcoming ones. |
| **TeeSheet** (`notify-me.tsx`, restyled) | v5 pill input + `primary` "JOIN"; eyebrow `type.eyebrow` "JOIN THE TEE SHEET"; placeholder "Email for Hole [n], [Name]"; success `type.meta` "You're on the tee sheet for Hole [n]. We'll email you when it goes live." Also offers a push opt-in row (`notifications-outline` 16 + `type.meta` "And send me a push at release time" toggle) that registers the existing release reminder (`src/lib/push.ts`, `use-reminders`) for that release. |
| **BundleRows** | web G.5.9 as native rows (`#F5F4F1` radius 16 padding 12, a 56pt thumbnail composed of 2 or 4 `-1` photos, `type.cardTitle` "THE PAIR · $88", `type.meta` `#575757` "Any two colors, $44 each.", `chevron-forward` 16). Navigate to the offer screen (Pair, or Foursome scrolled to its band). |
| **FreeShippingProgress** | `type.meta` "Add $[85 − subtotal] for free shipping." / `checkmark-circle-outline` 16 `golf.green` + "Free shipping unlocked."; track height 7 radius 4 `#E0DACF`, fill `golf.green` `scaleX` progress (`transformOrigin: "left"`, 600 `power3InOut`, web M21). |
| **CredibilityStrip** | Hidden while `CREDIBILITY` (mirrors web `src/lib/credibility.ts`, empty) has no items. |

## G.4 Motion map additions (web G.2.5 → Reanimated; v5 §5.2–§5.4 stay)

| Web | Native element | Trigger | Animation |
|---|---|---|---|
| M34 ticker | Ticker track | mounted and focused screen | `translateX` 0 → −copyWidth, `withRepeat(withTiming(-copyWidth, { duration: copyWidth / 40 * 1000, easing: ease.linear }), -1)` (40pt per second, minimum 20000 ms); `cancelAnimation` on long-press and on blur, resume from the current offset |
| M35 scorecard rows | Scorecard body rows | the scorecard's `<Reveal>` fires | opacity 0 → 1, 800 `sineOut`, `withDelay(i × 50)` |
| M36 rope rule draw | RopeRule | its section's `<Reveal>` | `scaleX` 0 → 1 (`transformOrigin: "left"`), 800 `power3Out`, `withDelay(200)` |
| M36a rope colour | RopeRule | colourway change | new layer opacity 0 → 1, 200 `sineInOut` |
| M37 hole card | HoleCard | press-in / out | scale 1 → .98, 150 `ease.tailwind` (no hover lift on touch) |
| M38 swatch band | Swatch rope band | select | `scaleX` .6 → 1, 200 `ease.tailwind` |

**Reduced motion** (`useReducedMotion()`): ticker static (chevrons only), rows visible, rope rule
full width, no scale feedback, progress jumps.

## G.5 Screens (functions from web G.6; boxes from v5 §5.1)

| Screen | v6 changes | Golf-green band |
|---|---|---|
| **Tabs** | Home · Shop · **Card** · Bag · Account. The Drops tab becomes **Card** (route `(tabs)/drops` renamed `(tabs)/card`; keep a redirect from the old path for deep links). Icons outline/filled: `home`, `grid`, **`reader`**, `bag-handle`, `person` (no flag or golf clip-art icon). | — |
| **Home** | Web G.6.2 order: Hero (`rope-lifestyle-hero-mobile.jpg`, eyebrow "THE ROPE CAP · HOLE 1 · OUT NOW", `type.hero` "One rope cap. Made properly.", `type.kicker` white line, "The Rope Cap · $48 · 4 colors", buttons "SHOP THE ROPE CAP" / "THE PAIR · $88"); **Pick a color** (v5 centred-slide carousel; tiles alternate `golf.sage` / `golf.tint`; the photo sits in a white disc at 72% width with `shadow.sm`, never `mixBlendMode`; `outlineBlack` "SHOP [COLOR]"; a `link` "Not sure? Take the 30-second quiz" opens the web quiz); **The next hole** (v5 brand pill on `golf.green`, white disc with the edition `-1`, hole number + kicker, the Countdown, TeeSheet); **The build** (v5 ring, `rope-clubhouse.jpg`, centre the rope macro `-5`, callouts CROWN · ROPE · BRIM · CLOSURE, `primary` "SEE THE SCORECARD" → PDP scrolled to the scorecard); **One, two or four** (v5 promo tiles, three: single / pair / foursome with live prices and per-cap prices); In stock today (G.3 swatches); From The Crown Test; About Shelby (pill window, `rope-brim.jpg`, serif italic quote); CredibilityStrip (hidden); ValueTiles (web G.6.1 copy); footer card with the TeeSheet. | The next hole |
| **Shop** | Banner `rope-lifestyle-hero-mobile.jpg`, `type.section` "The Rope Cap", description and count (web G.6.4). SegmentedControl "ALL · CORE · LIMITED · BUNDLES" (no filter sheet). Grid: one colourway card per core colour (title "The Rope Cap", meta "Tour White · Navy rope", swatch row with this colour selected, "ADD" adds one-size directly), then editions (upcoming cards: "JOIN THE TEE SHEET"), then the Bundles band. | Bundles band |
| **Product** | Web G.6.3 in v5's native buy card: badge (CORE or EditionBadge), `type.pdpTitle` (serif italic), sub-line, price + pill "+ ANY TWO SHIP FREE", **RopeRule**, colour groups (SegmentedControl ALL · CORE · LIMITED; CORE swatches in-screen; LIMITED swatches navigate), one-size line + fit guide link (web), crown-height FitScale "Mid · about 11–11.5 cm", CTA "ADD TO BAG – $48" (upcoming editions: "JOIN THE TEE SHEET" instead), stock and edition lines, BundleRows (core only), quiz link (web), **scorecard band**, ring, You may also like (other colourways and live editions), sticky bar. | Scorecard band |
| **Offer** (`the-pair`, `the-foursome`) | Web G.6.5: two pickers with RopeRules, "$88" + struck "$96" + "SAVE $8", CTA "ADD THE PAIR – $88"; the **Foursome band** with SegmentedControl "FOUR OF ONE COLOR · ONE OF EACH", "$152" + struck "$192" + "SAVE $40", CTA `primary` "ADD THE FOURSOME – $152". `add_to_cart` `source: "app_offer"`. | Foursome band |
| **Card** `(tabs)/card` | Web G.6.7: banner `rope-clubhouse.jpg` with `type.cardHeading` white "The Card" and the description; **next-hole band**; a scorecard-style header row (`type.scoreLabel` "HOLE · NAME · DATE · EDITION · STATUS", horizontally scrollable) over HoleCards for Holes 1–6 (2 columns, gap 10; Holes 5–6 from the shared `holes` config). | Next-hole band |
| **Card detail** `card/[handle]` | v5 drop detail with `type.cardHeading` in `golf.midnight` on the white article card; by phase: upcoming → Countdown + TeeSheet; live → the edition buy card; ended → "This hole has been played." + a link to The Rope Cap. | none |
| **Custom** `custom` (new stack screen, reachable from Account, the Home footer card and deep link `/custom`) | Web G.6.10 natively: hero card, the facts **Scorecard** on a green band, three ValueTiles (how it works), and the quote form (v5 inputs): name, email, club or organisation, quantity (≥ 24), four colour quantity steppers in twelves (total must match), needed-by date (native date picker, optional), artwork link (optional), notes, the required "I have the right to use this artwork" checkbox, and a hidden honeypot. `secondary` `atc` "REQUEST A QUOTE" posts to `POST /store/custom-quotes` with the publishable key; success copy as web. `page_type: "custom"`; event `custom_quote_submitted`. | Facts band |
| **Bag** | FreeShippingProgress under the header; header line "Free shipping on $85+ · 30-day returns"; BundleRows when a single core cap is in the bag; complete-the-look = other core colourways ("ADD · $48"); line meta per web G.6.8 (Pair "Navy + Pine", Foursome "4 × Pine" / "One of each", edition badge "HOLE 2"). | none |
| **Checkout / Order** | Shipping options show Medusa's live price ($0 Standard at $85+). Order adds "Your edition number is printed inside the cap." only for editions with `numbered_inside: true`. | none |
| **Web pages** | Quiz, fit guide, listicle, advertorial and the Crown Test story open the web routes (`/quiz`, `/fit-guide`, `/reasons/rope-cap`, `/read/the-rope-cap`, `/stories/crown-test`) as in v5. | — |
| **Not found** | ValueTile: `type.eyebrow` "404" + `type.empty` "This page wandered off." (no golf wordplay, G.1.3) + `secondary` "SHOP THE ROPE CAP". | — |

## G.6 Catalog behaviours (replace v5 §6 / Appendix A §6 where they conflict)
1. Lists show **colourway cards** of The Rope Cap (one per core colour), then editions; bundles
   (`metadata.offer`) appear only in the Bundles band, BundleRows and deep links.
2. Colour groups come from `colourways[name].group` (core / limited); limited editions are separate
   products linked from the CORE/LIMITED picker.
3. Upcoming editions (draft until their release is live, or a scheduled release with a future
   `release_at`) never show add to bag; they show the TeeSheet.
4. `metadata.edition` drives hole numbers, edition size and the order-page line; live counts come
   from variant inventory.
5. Free-shipping copy and progress use `POLICY.freeShippingThreshold` (85); the charged price is
   always Medusa's.
6. Image URLs (`/hats/rope-cap-*`) resolve against `EXPO_PUBLIC_STOREFRONT_URL` (v5 rule).

## G.7 Analytics
`page_type` adds `custom`; the Card screens keep `drops`. `add_to_cart` sources add `app_offer`.
Tracked taps mirror the web labels where a web equivalent exists (`ticker_item`, `card_hole`,
`pdp_edition_link`, `pdp_foursome`, `color_pill`, `custom_submit`).

## G.8 Verify (adds to v5 §7 and Appendix A §8)
- `npm run typecheck`, `npm run lint`.
- Web export screenshots at 390×844 of: Home (top, next-hole band, Pick a color), Shop (each group),
  the Rope Cap PDP (Tour White and Pine, the scorecard band), an upcoming edition PDP (tee sheet, no
  add to bag), the Pair and Foursome, Card, a Card detail, Custom (form filled, success), Bag below
  and above $85.
- Ticker crawl speed and long-press pause; a run with Reduce Motion on.
- A custom-quote submission that appears in the web admin list.

---

# Part V5: the Allbirds base (binding except where Part G overrides)

## 1. Rules

1. **Brand:** the wordmark `shelby` (lowercase, display font) sits where Allbirds' logo sits. Shelby's
   own copy, products, prices, policies and photos. No Allbirds logo, artwork, imagery, product or
   material names, sustainability claims or copy (web §1.2).
2. **No invented claims:**
   - no stars or reviews, no free-shipping threshold or progress bar, no "Final Sale" or sale
     prices;
   - no BNPL, no AI assistant, no SMS or email popups.
3. **Evidence rules** (web §1.4): proof only from live data, product facts, policy and the
   content-series record.
4. **US English** ("Color", "Bag"). Casing per web §1.3: UPPERCASE buttons, labels, card titles and
   mono eyebrows; sentence case headlines.
5. **Icons:** Ionicons outline set (installed). Mapping in §3.
6. **Layout reference:** 390pt-wide phone. Sizes in points; `W` = `useWindowDimensions().width`.
7. **Motion:** every animation in §5 uses Reanimated with `reduceMotion: ReduceMotion.System`, plus a
   `useReducedMotion()` check that renders end states directly (§5.4).

---

## 2. Tokens (`src/constants/theme.ts`, replace the file)

```ts
import { Easing, ReduceMotion } from "react-native-reanimated"
import { Platform } from "react-native"

/** Allbirds' theme for Shelby (web/SITE_SPEC.md v5 §2). */
export const colors = {
  black: "#212121", // text, primary CTA, footer, selected states
  white: "#FFFFFF", // cards, header pill, buy card, sheets
  naturalWhite: "#E0DACF", // badges, pills, segmented active text, progress track
  page: "#ECE9E2", // natural-white-60: every screen background
  naturalWhite25: "#F5F4F1", // quiet panels
  charcoal: "#52525B", // long-form body
  muted: "#575757", // light-charcoal: meta, breadcrumbs, fit notes
  mutedFill: "rgba(87, 87, 87, 0.19)", // light-charcoal-0.3: pressed size/option fill
  swatchRing: "rgba(87, 87, 87, 0.7)", // light-charcoal-0.7
  stroke: "#CDCDCD", // size / option borders
  red: "#9C0F0F", // low stock only
  green: "#10714E", // in stock
  gray200: "#E5E7EB", // disabled fill (oklch 92.8% .006 264.531)
  gray300: "#D1D5DC", // disabled border (oklch 87.2% .01 258.338)
  gray400: "#99A1AF", // disabled text (oklch 70.7% .022 261.325)
  gray500: "#6A7282", // placeholder (oklch 55.1% .027 264.364)
  gray600: "#4A5565", // filter label (oklch 44.6% .03 256.802)
  neutral800: "#262626", // captions (oklch 26.9% 0 0)
  overlay: "rgba(33, 33, 33, 0.5)", // bg-black/50: sheets and modals
  overlayMenu: "rgba(33, 33, 33, 0.3)", // bg-black/30
  tileVeil: "rgba(0, 0, 0, 0.15)",
  ringFill: "rgba(33, 33, 33, 0.1)",
  ringStroke2: "rgba(255, 255, 255, 0.7)",
  ringStroke3: "rgba(255, 255, 255, 0.4)",
  pillBorder: "rgba(33, 33, 33, 0.5)", // #21212180
  tileSlate: "#5D7283", // Caps
  tileUmber: "#554B4A", // Truckers
  tileRose: "#8D6B67", // Beanies
  tileSage: "#80887E", // Bucket Hats
} as const

/**
 * Geograph (heading roles) and Self Modern (serif display) → Plus Jakarta Sans.
 * Geograph (body/UI) → Inter. Akkurat Mono → IBM Plex Mono.
 * See web §2.2.
 */
export const fonts = {
  display: "PlusJakartaSans_400Regular",
  displayMedium: "PlusJakartaSans_500Medium",
  displaySemi: "PlusJakartaSans_600SemiBold", // wordmark
  serif: "PlusJakartaSans_400Regular", // Self Modern role (web §11 item 9)
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodyBold: "Inter_700Bold",
  mono: "IBMPlexMono_400Regular",
  monoMedium: "IBMPlexMono_500Medium",
}

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 10, lg: 16, xl: 20, xxl: 24, xxxl: 32, section: 40 } as const

/** Allbirds' 10pt edge gutter for rounded blocks and its 20pt text padding. */
export const layout = {
  edge: 10,
  text: 20,
  pillTop: 20,
  pillHeight: 40,
  pillSide: 20,
  contentTop: 20 + 40 + 8, // under the floating pill
} as const

export const radius = {
  xs: 2, // size buttons
  sm: 4, // progress track, footer card
  md: 6, // sticky bar top corners
  lg: 8, // gallery images
  xl: 12, // header pill, buy card, option rows
  xxl: 16, // product cards, value tiles, banners, carousel images
  xxxl: 24, // promo tiles, bands
  tile: 20, // hero, category tiles (rest)
  pill: 250, // category tile active
  full: 9999,
} as const

/** Letter-spacing in points = em × font size (web §2.2). */
export const type = {
  heroEyebrow: { fontFamily: fonts.monoMedium, fontSize: 12, lineHeight: 20, letterSpacing: 1.2, textTransform: "uppercase" as const },
  hero: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32, letterSpacing: 0.6 },
  section: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32 },
  tile: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 45 },
  pdpTitle: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 32 },
  quote: { fontFamily: fonts.serif, fontSize: 14, lineHeight: 20 },
  tab: { fontFamily: fonts.monoMedium, fontSize: 16, lineHeight: 24, letterSpacing: 0.8, textTransform: "uppercase" as const },
  eyebrow: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: "uppercase" as const },
  subline: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: "uppercase" as const },
  label: { fontFamily: fonts.monoMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: "uppercase" as const },
  menuItem: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 21, letterSpacing: 0.7, textTransform: "uppercase" as const },
  cardTitle: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: "uppercase" as const },
  cardMeta: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  price: { fontFamily: fonts.bodyMedium, fontSize: 18, lineHeight: 28, letterSpacing: 0.9 },
  priceSm: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  pricePill: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: "uppercase" as const, fontStyle: "italic" as const },
  badge: { fontFamily: fonts.bodyMedium, fontSize: 10, lineHeight: 10, letterSpacing: 0.5, textTransform: "uppercase" as const },
  button: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 15, letterSpacing: 0.3, textTransform: "uppercase" as const },
  buttonLarge: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, letterSpacing: 0.35, textTransform: "uppercase" as const },
  size: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  bodyLong: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, letterSpacing: 0.35 },
  article: { fontFamily: fonts.body, fontSize: 16, lineHeight: 26 },
  meta: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  announcement: { fontFamily: fonts.body, fontSize: 10, lineHeight: 15, letterSpacing: 0.5 },
  empty: { fontFamily: fonts.body, fontSize: 20, lineHeight: 28 },
  tabBar: { fontFamily: fonts.bodyMedium, fontSize: 10, lineHeight: 12, letterSpacing: 0.5, textTransform: "uppercase" as const },
  wordmark: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 24, letterSpacing: -0.4 },
  countBadge: { fontFamily: fonts.bodyMedium, fontSize: 9, lineHeight: 13.5 },
}

export const shadow = {
  /** Tailwind `shadow` / `shadow-sm`: header pill, buy card. */
  sm: Platform.select({
    ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
    android: { elevation: 2 },
    default: { boxShadow: "0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a" },
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
  orbitDesktop: 4000,
  sheetOverlay: 400,
  sheetPanel: 800,
  button: 200,
}

export const motion = { reduceMotion: ReduceMotion.System } as const
export const MAX_CONTENT_WIDTH = 720
```

**Font loading** (`src/app/_layout.tsx`):
- Load with `useFonts`:
  - `PlusJakartaSans_400Regular`, `_500Medium`, `_600SemiBold`;
  - `Inter_400Regular`, `_500Medium`, `_700Bold`;
  - `IBMPlexMono_400Regular`, `_500Medium`.
- Keep the splash until they load.
- Root background `colors.page` (`#ECE9E2`). In `app.json`, the splash and adaptive-icon
  backgrounds become `#ECE9E2`.
- The family carries the weight; never set `fontWeight` with these families.

`src/components/text.tsx` maps `variant` onto `type.*`. Tones: `default` `#212121`, `muted`
`#575757`, `charcoal` `#52525B`, `inverse` `#FFFFFF`, `error` `#9C0F0F`, `success` `#10714E`.

---

## 3. Components (`src/components/`, restyle in place; keep names and props)

| Component | v5 spec |
|---|---|
| **Button** | `Pressable` + `Animated.View`. Base: height **33**, paddingHorizontal 16, radius **9999**, borderWidth 1, centred, `type.button`. Colour change on press-in/out: `withTiming(…, { duration: 200, easing: ease.sineInOut })` (web M11). |
| ↳ `primary` (light) | white fill and border, `#212121` label. Pressed: `#212121` fill and border, white label. |
| ↳ `secondary` (main CTA) | `#212121` fill and border, white label. Pressed: `#575757` fill and border. |
| ↳ `outlineBlack` | transparent, `#212121` border and label. Pressed: `#212121` fill, white label. |
| ↳ `outlineWhite` | transparent, white border and label (over photos). Pressed: white fill, `#212121` label. |
| ↳ `icon` | circle 40 (or 32), 1pt border, Ionicon 16. Pressed: filled. Disabled: opacity .5. |
| ↳ `link` | no box, `type.meta` (or `type.body`) underlined. |
| ↳ size `small` | height 33, paddingHorizontal 12, label 11 |
| ↳ size `large` | height **42**, paddingHorizontal 14, `type.buttonLarge` |
| ↳ size `atc` | height **49**, full width |
| ↳ disabled | fill `#E5E7EB`, border `#D1D5DC`, label `#99A1AF` |
| ↳ loading | `ActivityIndicator` (white or `#212121`), width kept. |
| **Badge** | `#E0DACF` fill (white variant on PDP photos), radius 9999, padding 8, `type.badge` `#212121`. Values: Core · Limited · New · Low Stock · Coming Soon. Top 10, left 10 on images. |
| **Swatch** | 36pt circle: a 3pt white border around the colour fill (hex from `swatchColor(name)`; two-tone = two half-circles split on a 135° diagonal, built from 2 rotated half Views), plus a 1pt inner ring `rgba(87,87,87,.7)`. Selected: an extra 1pt `#212121` outer ring (a 38pt wrapper with borderWidth 1). Card variant: 20pt. Change: `withTiming` 200, `ease.tailwind`. |
| **SizeButton** | height **42**, radius **2**, borderWidth 1 `#CDCDCD`, `type.size`, flex 1 in a 7-column row (gap 8). Pressed: fill `rgba(87,87,87,.19)`. Selected: `#212121` fill and border, white label. Sold out: label `#99A1AF`, opacity .7, a 1.6pt diagonal line (rotated View, `rgba(0,0,0,.5)`) corner to corner. Low stock: a second line `type.badge` `#9C0F0F` "3 left". Colour transitions 200 `ease.sineInOut`. |
| **SegmentedControl** | pill: borderWidth 1 `#212121`, radius 9999, padding 4, gap 4. Segments are `Button` size small. Active: `#212121` fill, label `#ECE9E2`. Inactive: transparent, `#212121`. |
| **FitScale** | label row `type.label` + value `type.meta`. Track: 3 segments, gap 4, each height 7, radius 4, `#E0DACF`; active `#212121`. Step labels `type.badge` `#575757` under it, 4 below. |
| **StockLine** | 6pt dot + `type.meta`: green `#10714E` "In stock · ships in 1–2 business days"; red `#9C0F0F` "Only N left in S/M"; `#575757` "Sold out in …". |
| **PerkRow** → **ValueTile** | `#FFFFFF` card, radius 16, paddingTop 40, paddingBottom 32, paddingHorizontal 20, gap 20: `type.eyebrow` + `type.body`. |
| **Accordion** | row height 56, bottom 1pt `#ECE9E2`: `type.menuItem` + `add` Ionicon 16 rotating 45° (`withTiming` 300 `ease.power3InOut`). Body height animates 0 → measured (300 `ease.power3InOut`); `type.bodyLong` `#52525B`, paddingBottom 20. |
| **QuantityStepper** | height 32, radius 9999, 1pt `#CDCDCD`, `remove`/`add` 14pt with 44pt hit slop, count `type.priceSm` centred, width 96. |
| **Dashes** → **ScrollThumb** | a 2pt track `#E0DACF`, full width minus 20, with a `#212121` thumb (width = track ÷ N) whose `translateX` follows the slider's scroll offset (`useAnimatedScrollHandler`). |
| **SearchPill** | height 42, radius 9999, white, 1pt `#212121`, paddingLeft 40, `search` icon 18 at left 14, `type.body` 16. Placeholder rotation kept (every 2s). |
| **AnnouncementBar** | `#212121`, paddingVertical 8, paddingHorizontal 32, `type.announcement` white centred (two lines max, so 46pt tall). Chevrons 24pt at the edges. Messages crossfade every **5s** (`withTiming` opacity 300). With one message: static. |
| **Icons** | search `search-outline`, bag `bag-handle-outline`, recently viewed `eye-outline`, chevrons `chevron-back` / `chevron-forward`, circled chevron `chevron-forward-circle-outline`, add `add`, remove `remove`, close `close`, filter `options-outline`, check `checkmark-circle-outline`, play `play-circle-outline`, ruler `resize-outline`. |

---

## 4. App chrome

### 4.1 Header pill (`src/components/app-header.tsx`; Home, Shop, Drops, Product)
- **Floating, Allbirds style:** `position: absolute`, top = safe-area top + 20 (+ 46 when the
  AnnouncementBar shows), left 20, right 20, height **40**, `#FFFFFF`, radius **12**, `shadow.sm`,
  paddingHorizontal 10. zIndex 80.
- **Contents:**
  - left: no hamburger in the app (tabs handle navigation). An `eye-outline` 24 (recently viewed,
    hidden when empty) sits at the left instead.
  - centre: wordmark `shelby` (`type.wordmark`), absolutely centred, max-width 75; tap → Home.
  - right: `search-outline` 24 (opens §4.3), `bag-handle-outline` 24 (Bag tab), gap 8.
  - Count badges: 14pt `#212121` circle, `type.countBadge` white, top 6, right −2; opacity
    `withTiming` 50 `ease.sineIn` on 0 ↔ ≥1.
- Screens start their content at the pill's bottom + 8 (`layout.contentTop`). Home's hero starts
  10pt under the AnnouncementBar so the pill floats over the photo.
- The pill stays put while scrolling (Allbirds' captured state; no hide).

### 4.2 Tabs (`src/app/(tabs)/_layout.tsx`)
- Tabs: Home · Shop · Drops · Bag · Account (order kept).
- Bar: `#FFFFFF`, no top border, top corners radius 12, `shadow.sm`, height 56 + safe area.
- Labels `type.tabBar`: active `#212121`, inactive `#575757`.
- Icons outline (filled when focused): `home`, `grid`, `flash`, `bag-handle`, `person`.
- Bag badge `#212121` with `type.countBadge`.
- Focus change: icon scale 1 → 1.08 → 1 (`withSequence`, 150 + 150, `ease.sineOut`).

### 4.3 Search sheet
- The search icon opens a top sheet under the pill.
  - Sheet: `#ECE9E2`, bottom radius 12, `shadow.xl`, paddingTop `layout.contentTop`.
  - Contents: the SearchPill, then result rows (56pt white radius 8 thumbnail, `type.cardTitle`,
    `type.meta` `#575757`) and "View all results" `link`.
- Motion M17 (§5.2): sheet `scaleY` 0 → 1 from the top (`transformOrigin: "top"`, 300
  `ease.power3InOut`). Overlay `rgba(33,33,33,.3)` opacity 0 → 1 (240 `ease.sineOut`). Content opacity
  at +150 (150 `ease.sineOut`).

---

## 5. Screens and motion

### 5.1 Screen styling (functions in Appendix A §5)

| Screen | v5 visual (web reference) |
|---|---|
| **Home** `(tabs)/index` | Page `#ECE9E2`. Order and data from Appendix A §5.1. **Hero** (web §6.1.1): `W−20 × (screenHeight − 132 − 46)`, margin 10, radius 20, `lifestyle-hero-mobile.jpg` cover with the banner veil `rgba(0,0,0,.2)` → transparent (`expo-linear-gradient` is not installed: use RN 0.88's `experimental_backgroundImage: "linear-gradient(0deg, rgba(0,0,0,.2), rgba(0,0,0,0))"` on an absolute View; raise the first stop to `.35` if white-text contrast is below 4.5:1). Copy bottom-left, padding 32, paddingTop 80: `type.heroEyebrow` white, `type.hero` white "One cap. Every color. Always in stock.", `type.body` white "The Everyday Cap · $38 · 4 colors", then 2 `primary` buttons in a 2-column row (gap 8). **Browse By Style** (web §6.1.2): horizontal `FlatList` `snapToInterval`, item width `W/1.4`, centred, gap 10; tile aspect 0.77, radius 20 → 250 when centred (M5). Background tone per shape; photo `contentFit="contain"` with `tintColor` none on a white-backdrop photo, so wrap the image in a View with `mixBlendMode: "multiply"` (RN 0.88 supports `mixBlendMode`). **Drop banner** (§6.1.3): radius 12, aspect 0.63, pill outline + orbiting dots + marquee (M27). **Find Your Fit** (§6.1.4): radius 12, height `min(W×1.75, screenH×.98)`, ring (M26) with the centre text and `primary` "TAKE THE QUIZ" (opens the web quiz, Appendix A), callouts stacked 2×2 under the ring. **Shop By Color** (§6.1.5): carousel of 7:10 tiles, width `W×.8`, radius 24, colour fill + multiply photo, `type.tile` title, `outlineWhite` (`outlineBlack` on Bone/Cream) "SHOP [COLOR]". **In Stock Today** (§6.1.6): `type.tab` title with a 2pt underline, then a 2×2 grid of ValueTiles with Swatch + StockLine. **From The Crush Test** (§6.1.7): `type.tab` header, carousel of cards (image 4:5 radius 16, `type.eyebrow`, `type.cardTitle`, `type.caption`), captions rise in (M29). **About Shelby** (§6.1.8): pill window (M28) with `type.quote` white, then `secondary` "WHY THE EVERYDAY CAP" (opens web). **Stories** (§6.1.9): `type.section` centred, 2 cards (image 5:4, `type.body` 18/28 title, `type.meta` excerpt). Then ValueTiles (3) and a dark footer card (`#212121`, radius 16, margin 10: `type.eyebrow` white "GET DROP ALERTS" + the NotifyMe pill input + `link`s). |
| **Shop** `(tabs)/shop` | Banner (web §6.3 item 1): radius 16, aspect 1, image by shape, veil, breadcrumb + `type.section` white + `type.body` `#E0DACF` description + count. Then a row: `outlineBlack` "FILTER AND SORT" (`options-outline` 16) + SegmentedControl of shapes (horizontal scroll). Filter sheet: bottom sheet, white, top radius 16, padding 20 (M23). Grid: 2 columns, gap 10, padding 10, ProductCards. |
| **ProductCard** | `#FFFFFF`, radius 16. Image 1:1 (top radius 16) `contain` on white; Badge top-left 10. Info padding 16, gap 4: `type.cardTitle`, `type.cardMeta` (colour), `type.priceSm`, swatches (20pt, max 5 + "+N" `type.priceSm` underlined), then the row `type.meta` `#575757` "One size" / "2 sizes" + a `bag-handle-outline` 16 + "ADD" `type.cardTitle` button (adds one-size; opens the size sheet for sized). Press feedback: the card scales 0.98 (`withTiming` 150 `ease.tailwind`). |
| **Product** `products/[handle]` | Page `#ECE9E2`. Breadcrumb `type.meta` `#575757` (margin 20, top = `layout.contentTop` + 40). **Gallery** (web §6.4.2 mobile): full-width paging slider, slides W×W, white, radius 16, images `contain`; ScrollThumb under it. A colour change fades the slider (opacity 0 → 1, 200 `ease.sineOut`) and resets to page 0. **Buy card** (web §6.4.3): margin 10, white, radius 12, padding 20, gap 24. Contents in order: `type.pdpTitle`; `type.subline` `#575757`; price row (`type.price` + the price pill `#E0DACF`); Make It Two row (`#F5F4F1` radius 16, padding 12); Color label row (`type.label` "COLOR:" + `type.meta` value + "(Core)"); swatches 36pt, gap 4; size (SizeButtons 7-column) or the one-size line; fit note + `link` "Fit guide"; `secondary` size `atc` "ADD TO BAG – $38"; centred `type.meta` policy; StockLine; limited-run line; quiz `link`; FitScales. **Details band** (§6.4.5): white, radius 12, padding 20; image 3:2 radius 12; three blocks `type.label` + `type.bodyLong` `#52525B`. **Material ring** (§6.4.7) when there are ≥4 details. **You May Also Like** and **Previously Viewed**: `type.tab` + carousel of ProductCards (width `W/1.3`, gap 10, inset 10). **Brand pill** (§6.4.10). **Sticky buy bar** (§6.4.4): absolute bottom (above the tab bar's absence on this stack screen: bottom = safe area), white, top radius 6, paddingHorizontal 28, paddingVertical 20: centred `type.body` title + price, then the CTA; opacity 0 → 1 when the main CTA scrolls off (`withTiming` 150 `ease.tailwind`). |
| **Two-pack** (offer) | The Product layout with two colour pickers ("FIRST CAP:", "SECOND CAP:"), price row "$68" + struck "$76" (`type.priceSm`, opacity .65, line-through) + pill "SAVE $8", the CTA "ADD THE PAIR – $68". |
| **Bag** `(tabs)/cart` | Page `#ECE9E2`. Header row: `type.cardTitle` "BAG (N)" + `type.meta` `#575757` policy line. Lines in a white radius 16 card (85pt image radius 20 on `#F5F4F1`, `type.cardTitle`, `type.meta` variant, QuantityStepper, `type.priceSm`). Make It Two row, "COMPLETE THE LOOK" (`type.eyebrow`) mini cards (`#F5F4F1` radius 16, `secondary` small "ADD · $34"). Footer card (white, radius 16): subtotal, note, `secondary` `atc` "CHECKOUT", "Guest checkout. No account needed." Empty: `type.empty` centred "Your bag is empty." + stacked `secondary` buttons (gap 20, width W−80). |
| **Added sheet** | Allbirds' drawer as a native bottom sheet. Overlay `rgba(33,33,33,.5)`; white sheet, top radius 16, `shadow.xl`: "ADDED TO YOUR BAG" `type.label` with `checkmark-circle-outline` `#10714E`, the line (85pt image), then `outlineBlack` "KEEP SHOPPING" + `secondary` "VIEW BAG" (row, gap 10). Motion M20 (§5.2). |
| **Checkout / Order** | Page `#ECE9E2`; numbered section cards (white radius 16 padding 24, `type.eyebrow` "1 · CONTACT"…); inputs: height 42, radius 9999, 1pt `#212121`, white, paddingHorizontal 16, `type.body` 16; labels `type.label`; errors `type.meta` `#9C0F0F`; shipping options as rows radius 12 1pt `#CDCDCD` (selected `#212121`); `secondary` `atc` "PLACE ORDER". Order: white radius 24 card, `type.eyebrow` "ORDER CONFIRMED", `type.section` "Thanks, [name].", lines, `secondary` "KEEP SHOPPING". |
| **Recently viewed** | Bottom sheet (Added-sheet frame), title `type.cardTitle` "PREVIOUSLY VIEWED (N)", 2-column ProductCards. |
| **Drops** `(tabs)/drops` | `type.tab` tabs "LIVE & UPCOMING" / "PAST" with the 2pt underline (`withTiming` 300). Live/upcoming: promo tiles (web §6.6) width W−20, aspect 7:10, radius 24, release image, `type.tile` title, `type.heroEyebrow` phase/date, the Countdown (digits `type.section` 40/48 `fontVariant: ["tabular-nums"]` white; units `type.badge` white 80%), `outlineWhite` "SHOP THE DROP" / "GET NOTIFIED". Past: 2-column white cards with "ENDED" Badge. **Drop detail** `drops/[handle]`: hero (Home hero box), white radius 24 article card (`type.article` `#52525B`), then by phase (countdown ValueTile + NotifyMe / product carousel / ended). |
| **Account** | Page `#ECE9E2`; white radius 16 cards with `type.label` headings and Accordion rows. |
| **Not found** | ValueTile centred: `type.eyebrow` "404" + `type.empty` "This page wandered off." + `secondary` "SHOP ALL HATS". |

### 5.2 Motion map (web §2.4.3 → Reanimated)

Every entry: `withTiming(value, { duration, easing, reduceMotion: ReduceMotion.System })` unless
noted. "Trigger" is the native event.

| Web | Native element | Trigger | Animation |
|---|---|---|---|
| M1 section reveal | each Home / Product section wrapped in `<Reveal>` | the section's top crosses 85% of the window height while scrolling (§5.3), once | opacity 0 → 1, `dur.section` (800), `ease.sineOut` |
| M2 category row | Browse By Style | top crosses 100% of the window | opacity 0 → 1, 800, `ease.sineOut`, `withDelay(800)` |
| M3 hero | Home hero container, then its copy | on mount | container opacity 0 → 1 (800, `sineOut`); copy `withDelay(300)` opacity 0 → 1 (800, `sineOut`) |
| M4 title stagger | category tile titles | Browse By Style top crosses 75% | opacity 0 → 1, 800, `sineOut`, `withDelay(i × 150)` |
| M5 tile morph | the centred category tile (the `FlatList` viewable item with the most area) | becomes centred: play; stops being centred: reverse | `borderRadius` 20 → 250 (600, `power3InOut`); hover image opacity 0 → 1 (600, `sineOut`); title border colour white → transparent (`interpolateColor`, 300, `sineIn`); text block `translateY` 30% of its height → 0 (600, `power3InOut`); CTA opacity 0 → 1 (600, `sineOut`), `pointerEvents` on when done. Reverse uses `power3InOut` / `sineIn` / `sineOut`. |
| M6 promo zoom | Shop By Color tile image | press-in (touch has no hover; Allbirds mobile web shows no zoom) | scale 1 → 1.04 (300, `ease.tailwind`), back on press-out. The web's 1.08 / 900ms hover zoom is not used on touch. |
| M7 promo content | Shop By Color veil + labels | after M1 of the section | opacity 0 → 1, 800, `sineOut`, `withDelay(800 + i × 50)` |
| M8–M10 card hover / flip | ProductCard | — | Not on touch (Allbirds' mobile web uses the static "N sizes · ADD" row). Press feedback: scale 0.98 (150, `ease.tailwind`). |
| M11 buttons | Button | press-in / press-out | background, border and label colours via `interpolateColor` on a 0 → 1 progress, 200, `sineInOut` |
| M12 size / option | SizeButton, quiz options | press / select | colours, 200, `sineInOut` |
| M13 swatch | Swatch | select | outer ring opacity 0 → 1, 200, `ease.tailwind` |
| M14 checkbox | filter checkboxes | toggle | inner square scale 0 → 1, 50, `ease.tailwind` |
| M15 tab underline | `type.tab` titles | active | underline opacity 0 → 1 and `scaleX` 0 → 1 (`transformOrigin: "left"`), 300 |
| M17 dropdown | Search sheet (§4.3), Filter top variant | open / close | overlay opacity (240 `sineOut` / 240 `sineIn`); sheet `scaleY` 0 → 1 (300 `power3InOut`, `transformOrigin: "top"`); content opacity `withDelay(150)` 150 `sineOut` |
| M19 accordion | Accordion | toggle | height 0 ↔ measured (300 `power3InOut`); icon rotate 0 ↔ 45° (300 `power3InOut`) |
| M20 drawer → sheet | Added sheet, Recently viewed sheet, Filter sheet, size sheet | open | overlay opacity 0 → 1 (400, `sineOut`); sheet `translateY` 100% → 0 (800, `power3Out`) |
| M20b close | same | close / swipe down / overlay tap | sheet `translateY` → 100% (800, `power3In`; a fast fling uses `withSpring({ velocity })` with damping 20 instead); overlay → 0 (400, `sineIn`) |
| M21 progress | quiz progress (web quiz; in-app checkout step bar uses the same) | step change | fill `scaleX` → step/total, `transformOrigin: "left"`, 600, `power3InOut` |
| M22 modal | size chart | open | overlay 0 → 1 (300, `sineOut`); dialog opacity 0 → 1 and scale .95 → 1 (400, `power3Out`, `withDelay(100)`) |
| M23 quick view | search results, quick-add size sheet content swap | in / out | in: opacity 0 → 1 and `translateY` 10% → 0 (400, `sineOut`); out: opacity → 0, `translateY` → 10% (200, `sineIn`) |
| M24 crossfade | AnnouncementBar; PDP gallery on colour change | every 5000 ms / colour change | opacity crossfade 300 (bar) / 200 `sineOut` (gallery) |
| M25 carousel | horizontal lists | swipe / arrow | native `FlatList` paging with `snapToInterval` (`decelerationRate="fast"`) |
| M26 material ring | Find Your Fit band, Product ring band | band reveal | band opacity 0 → 1 (800 `sineOut`). 3 circles (Views, radius 9999, sizes 140/160/180 of a 200-unit box scaled to the ring width): scale 0 → 1 + opacity 0 → 1 (1500 `sineOut`). 4 dots (3pt Views): progress `p` from `s + .15` to `s` (1500 `sineOut`, `withDelay(800 + i × 400)`), placed by §5.3's `circlePoint`, scale 0 → 1. Callouts in order 4, 3, 1, 2: opacity 0 → 1 (500 `sineOut`, `withDelay(1600 + k × 400)`). Centre content opacity 0 → 1 (600 `sineOut`, `withDelay(1400)`). |
| M27 brand pill | Drop banner, Product brand pill | section reveal | content opacity 0 → 1 (800 `sineOut`) and `translateY` 16 → 0 (800 `power3Out`). 3 dots orbit the stadium path: `withRepeat(withTiming(1, { duration: 15000, easing: linear }), -1)` on a phone (the mobile value). Marquee: two copies side by side, `translateX` 0 → −copyWidth, `withRepeat(withTiming(…, { duration: 10000, easing: linear }), -1)`. |
| M28 pill window | About Shelby, story stance | section reveal | container opacity 0 → 1 (300 `sineOut`). Pill `scale` .01 → 1 (2200 `power3Out`, `withDelay(800)`) with the image inside counter-scaled by `1 / scale` in the same `useAnimatedStyle` (Allbirds' technique). 2 border pills `scale` 0 → 1 (2200 `power3Out`, `withDelay(800)`). Quote opacity 0 → 1 (1500 `sineOut`, `withDelay(1700)`). |
| M29 caption rise | Crush Test cards | section reveal | caption `translateY` 100% → 0 (800 `power3Out`) and opacity 0 → 1 (800 `sineOut`), `withDelay(400)` |
| M30 skeleton | loading blocks | while loading | `withRepeat(withSequence(withTiming(.5, 1000, ease.tailwind), withTiming(1, 1000, ease.tailwind)), -1)` (the 2s pulse) |
| M31 spinner | Button loading | while pending | `ActivityIndicator` (native) |
| M32 badge | header count badges | 0 ↔ ≥1 | opacity, 50, `sineIn` |
| M33 sticky bar | Product sticky buy bar | main CTA leaves the viewport (measure with `onLayout` + scroll offset) | opacity 0 → 1 and `pointerEvents` on, 150, `ease.tailwind` |

### 5.3 Motion helpers (`src/lib/motion.ts`)

- **`<RevealScrollView>`:** an `Animated.ScrollView` that publishes `scrollY`
  (`useAnimatedScrollHandler`) and `viewportH` through context.
- **`<Reveal threshold={0.85} delay={0} once>`:** records its `y` from `onLayout`, relative to the
  scroll content. A `useAnimatedReaction` on `scrollY` fires `withDelay(delay, withTiming(1, …))`
  when `scrollY + viewportH × threshold >= y`. Once fired, it stays.
- **`circlePoint(p, cx, cy, r)`** (worklet): Allbirds' path `M 100,10 a 90,90 0 1,0 0.01,0` starts at
  the top and runs counter-clockwise.
  - `θ = -π/2 - 2πp`; return `{ x: cx + r cos θ, y: cy + r sin θ }`.
  - Check: `p = .681` gives (181.69, 137.83) in the 200-unit box, matching the captured dot.
- **`stadiumPoint(p, w, h)`** (worklet): a point at fraction `p` of the perimeter of a stadium
  (radius `w/2`, two straight sides of `h − w`), starting at the top centre and running clockwise.
  Used for the brand pill's dots (the web pill is drawn rotated 90° on desktop; on phones it is
  upright).
- **`useCentredItem(listRef)`:** the viewable item with the largest visible area, for M5.
- All helpers read `useReducedMotion()`.

### 5.4 Reduced motion

When `useReducedMotion()` is true (iOS Reduce Motion / Android "Remove animations"):
- every `<Reveal>` renders at opacity 1;
- the hero shows immediately;
- dots sit at their resting points (`p = s`);
- marquee and orbit loops do not start (the first copy is shown static);
- the AnnouncementBar does not auto-rotate (chevrons only);
- sheets appear and disappear without translate (opacity only, duration 0);
- the M5 morph jumps to its end state for the centred tile.

Every `withTiming` also passes `reduceMotion: ReduceMotion.System`.

---

## 6. Hat-catalog behaviours (unchanged; Appendix A §6)

All v4 behaviours stay:
- per-colour galleries from variant images;
- one-size hats with no size pick, sized S/M and L/XL with stock;
- fit-profile scales and spec lists;
- the two-pack excluded from lists but reachable, with two pickers;
- `/hats/` image URLs resolved against `EXPO_PUBLIC_STOREFRONT_URL`;
- `page_type` on every event and `source` on `add_to_cart`;
- the recently-viewed store.

## 7. Verify

Appendix A §8, plus:
- screenshots at 390×844 of every screen, after each motion settles;
- one recording per motion family (hero reveal, centred tile morph, Added sheet open/close, ring
  band, pill window), sampled at 0 / 300 / 900ms against §5.2;
- a run with Reduce Motion on, confirming that content is visible and static.

---

# Appendix A: v4 app structure and behaviour (verbatim, binding for function; visuals superseded)

The text below is mobile/APP_SPEC.md v4 §3–§8 exactly as committed in `02852f5`. Screens, data,
behaviour, analytics and verification stay binding. Every visual value inside it (colours, fonts,
sizes, radii, heights, motion) is replaced by v5 §1–§5 above. Headings are prefixed `A.`, so v4's
§5.4 is A.5.4. References in the main body to "Appendix A §5.1" mean A.5.1.

## A.3. Components (`src/components/`)

| Component | Spec |
|---|---|
| **Button** | `Pressable`. Base: height **39**, paddingHorizontal 18, borderRadius **3**, borderWidth 1, centred, label in `type.button`. |
| ↳ variant `primary` | `#000` fill and border, white label. Pressed: `opacity 0.85`. |
| ↳ variant `light` | transparent, `#000` border and label. Pressed: fill `#000`, label white (the native equivalent of Melin's ink fill; animate the fill with Reanimated `withTiming(1, {duration: 250})`). |
| ↳ variant `highlight` | transparent, white border and label, over photos. Pressed: white fill, black label. |
| ↳ variant `link` | no box, `type.link`. |
| ↳ variant `micro` | no box, `type.micro`, underline, capitalize. |
| ↳ variant `action` | pill: height 36, radius 999, 1px `#000` border, `type.micro` 13 label, optional 14pt icon. |
| ↳ size `atc` | height **52** |
| ↳ size `checkout` | height **52**, radius **0** |
| ↳ size `large` | height **39** on phones (Melin's mobile override of 56) |
| ↳ size `hero` | height **28**, paddingHorizontal 12, borderWidth 1.5, label 11 / ls 1.6 |
| ↳ size `small` | height **30**, label 11 / lh 16.5 |
| ↳ disabled | `opacity 0.2` |
| ↳ loading | `ActivityIndicator` (white or black), width kept |
| **Badge** | `#EDEDED` fill, radius 0, paddingVertical 4, paddingHorizontal 8, label `fonts.body` 15/22.5 `#000`. Values: Limited · Core · Low Stock · Coming Soon. Placed at top 14, left 14 on images. |
| **Swatch** | 42pt circle: borderWidth 1 (transparent; `#000` when selected), padding 1, inner circle filled with the colour hex (`swatchColor(name)`, the same table as `web/src/lib/swatches.ts`); two-tone names render two half circles rotated 45°. Light fills (Bone, Cream, Stone) get a 1pt `#E4E4E4` inner border. Sold out: a 1pt black diagonal line over the circle. Grid: 7 per row, gap 9. |
| **SizeButton** | height **48**, radius 3, borderWidth 1 `#E4E4E4`, label `fonts.body` 14.08/21.12 UPPERCASE. Selected: `#000` fill and border, white label. Sold out: `#EFEFEF` fill, `#C2C2C2` label, diagonal line. Low (≤5): second line `fonts.body` 11 "N LEFT". Row: equal columns, gap 9.5. |
| **SegmentedControl** | height 43, borderWidth 1 `#EEEEEE`, radius 999, padding 1. Tabs `flex:1`, height 41, label `fonts.body` 13 capitalize. Active: `#000` pill, white label; inactive `#0E1311`. |
| **FitScale** | label `fonts.body` 13 UPPERCASE ls 0.65, margin-bottom 8; track height 6, radius 999, `#EDEDED`, with a black fill one third wide at the active step; steps row 4 under: `fonts.system` 14/20 `#6B7280` UPPERCASE, `space-between`, active step `#000`. |
| **StockLine** | 10pt dot (`#22C55E` in stock / `#000` low / `#C2C2C2` sold out) + `fonts.heading` 14/21: "In stock, ready to ship!" / "Only N left, ready to ship!" / "Sold out in …". |
| **PerkRow** | row, gap 16, paddingVertical 12: Ionicon 40 (`#000`) + title `fonts.subheading` 14.08/18.3 + detail `fonts.body` 12/16. |
| **Accordion** | top/bottom 1pt `#E4E4E4`, header row 48: `fonts.heading` 14 UPPERCASE ls 1.3 + `add` icon 14 that rotates 45° when open (Reanimated); body `type.bodySm`, paddingBottom 16. |
| **QuantityStepper** | 114×34, white, 1pt `#E4E4E4`, radius 50, paddingHorizontal 16: `remove` / `add` icons 12 with 44pt hit slop, count `fonts.body` 16 centred. |
| **Dashes** (carousel indicator) | dashes 21×4, gap 8, active `#000`, inactive `#E4E4E4`. |
| **SearchPill** | height 36, radius 999, `#F8F8F9`, paddingLeft 32: `search` icon 14 at left 10, `fonts.system` 16. The placeholder rotates every 2s: Search · Search "cap" · Search "beanie" · Search "trucker" · Search "olive". |
| **AnnouncementBar** | height 28 (app), `#000`, `fonts.system` 13 white centred. The policy messages ("Standard Shipping $6", "30-Day Returns", "[Drop] Is Live Now") crossfade every 5s. Home screen only, above the header. |

---

## A.4. App chrome

### A.4.1 Header (`src/components/app-header.tsx`, used at the top of Home, Shop and Drops)

- White, bottom border 1pt `#E5E7EB`, under the safe area.
- **Row 1** (61pt, paddingHorizontal 16):
  - wordmark `shelby` (`fonts.heading` 24/24, ls −0.5), which navigates Home;
  - right: `eye-outline` (recently viewed, §5.8) and `bag-outline` (Bag tab), 24pt, gap 16;
  - count badges: 16pt black circle, white `fonts.heading` 10.
- **Row 2** (60pt, padding 12/16): SearchPill full width.
- **Condensed on scroll** (Home and Shop): when the scroll offset passes 121, row 2 folds into row 1
  (`withTiming` height 0.3s). Row 1 then shows the wordmark-less layout: SearchPill (flex 1) and the
  bag icon. Scrolling up expands it again.

### A.4.2 Tabs (`src/app/(tabs)/_layout.tsx`)

- **Tabs:** Home · Shop · Drops · Bag · Account (order kept).
- **Bar:** `#FFFFFF`, top border 1pt `#E5E7EB`, height 56 + the safe area.
- **Labels:** `fonts.heading` 10, ls 1.3, UPPERCASE.
- **Colours:** active `#000`, inactive `#736B67`.
- **Icons** (outline; filled when focused): `home`, `grid`, `flash`, `bag`, `person`.
- **Bag badge:** `#000` background, white `fonts.heading` 10.

---

## A.5. Screens

### A.5.1 Home `(tabs)/index`

The web home (§6.1 of `web/SITE_SPEC.md`) at phone size, in the same order, with live data:

1. **AnnouncementBar**, then **AppHeader**.
2. **Hero:**
   - `W × 521·W/390`, `expo-image` `lifestyle-hero-mobile.jpg`, `contentFit="cover"`,
     `contentPosition={{ top: "70%" }}`.
   - Text overlay at left 20, top 64:
     - `type.hero` (24/32, ls 1.6) in three lines: `ONE CAP.` / `EVERY COLOR.` / `ALWAYS IN
       STOCK.`;
     - 16 below, `type.bodySm` "The Everyday Cap · $38 · 4 colors" (live price);
     - 16 below, Button `light` size `hero` "SHOP NOW" → `/products/everyday-cap`.
   - The image URL is `${STOREFRONT_URL}/hats/lifestyle-hero-mobile.jpg`. Add
     `EXPO_PUBLIC_STOREFRONT_URL` to `config.ts` and `.env.example`.
3. **Browse By Style:**
   - `type.section` heading at left 21, margin 28/0/16.
   - A 2-column grid, gap 16, no side padding. Tiles `(W−16)/2` wide, height `tile × 207/187`,
     `#F5F5F5`, radius 4.
   - Each tile: the image at inset 21, size `tile − 42` square (`contentFit="contain"`), then the
     label `fonts.heading` 13 UPPERCASE ls 0.4 centred, 12 under the image.
   - Tiles are one per product category with published products, plus "SHOP ALL". They link to
     Shop with that category selected.
   - **Cut-out look:** expo-image has no `mix-blend-mode`. Render tile photos on a `#F5F5F5` tile
     with a 1-pixel inset `#FFFFFF` square behind the photo (photo backgrounds are white). On web
     builds (`Platform.OS === "web"`), set `style={{ mixBlendMode: "multiply" }}`.
4. **Drop banner:**
   - `W × 520·W/390`, cover image of the live release's `hero_image`, else `lifestyle-corduroy.jpg`.
   - Bottom scrim: `expo-linear-gradient` is not installed, so use a `View` with
     `backgroundColor: "rgba(0,0,0,0.35)"` over the bottom 45%.
   - Centred text 32 above the bottom:
     - eyebrow `fonts.body` 14 ls 4 UPPERCASE white;
     - `type.campaign` 32 white;
     - Button `highlight`: "SHOP THE DROP" → `/drops/[handle]`, or "GET NOTIFIED".
   - Hidden with no live or upcoming release.
5. **Find Your Fit:**
   - `#F5F5F5` block, image `everyday-cap-black-3.jpg` 300×300 centred at top 40.
   - Then, centred, `type.promo` "Find Your Fit", `type.bodySm` copy (web §6.1.4), and Button
     `light` "TAKE THE QUIZ". It opens `${STOREFRONT_URL}/quiz` with `Linking.openURL`; the quiz is
     a web page.
6. **Shop By Color:**
   - `type.section` heading at left 28.
   - Horizontal `FlatList`, `snapToInterval` 347 (tile 333 + gap 14), paddingHorizontal 28. Tiles
     333×444 with the tonal backgrounds `#2A2A2A` / `#26314A` / `#E4DDCC` / `#5E6440`.
   - Each tile: the colour's `-1` photo, 80% width, contain, centred 10% from the bottom; the label
     `fonts.heading` 16 ls 4.8 UPPERCASE, 12% from the top, white (Bone: black).
   - Tap → PDP with `color` param.
7. **In Stock Today:**
   - `#F5F5F5` block, padding 40/16. Title `fonts.heading` 26/39 UPPERCASE ls 2 centred; under it,
     `type.micro` `#736B67`.
   - A 2×2 grid of items, each centred: Swatch 42 (not pressable), the colour in `fonts.heading`
     16 UPPERCASE ls 1.3, then a 10pt dot and the count in `type.bodySm`.
   - Counts come from variant `inventory_quantity`.
8. **From The Crush Test:**
   - Shown when a content series is active. Fetch `GET /store/content-series`.
   - Horizontal list of cards 233×466, gap 16, paddingHorizontal 16. Each card:
     - title `type.subline` 16;
     - meta `type.micro` `#736B67` "Episode N · TikTok";
     - image 233×233;
     - the subject in `type.bodySm`, 3 lines;
     - Button `link` "SEE THE TEST", which opens the web story URL.
9. **About Shelby:**
   - `W × 521·W/390`, `lifestyle-bucket.jpg` cover, with `rgba(0,0,0,0.45)` over the left 70%.
   - Text left 20, vertically centred, white: `fonts.heading` 26/34 ls 2 UPPERCASE "ABOUT SHELBY";
     the body copy (web §6.1.8) in `fonts.body` 15/22.5; Button `highlight` "WHY THE EVERYDAY CAP",
     which opens the web `/reasons/everyday-cap`.
10. **Stories:**
    - `type.section` "Stories", left 28.
    - Two rows, each image 133×133 left (`story-crush.jpg`, `everyday-cap-black-3.jpg`) and text
      right: meta `type.eyebrow`, title `type.item`, excerpt `type.bodySm` 2 lines, Button `light`
      "READ MORE".
    - Rows open the web story and the fit guide.
11. **Join The Shelby List:**
    - White, padding 28.432/16, centred: `type.section` UPPERCASE heading, then `type.body`.
    - Then `NotifyMe` for the next upcoming release, restyled: email input 39 (1pt black border,
      radius 3 left only) joined to Button `primary` "SIGN UP" (radius 3 right only).
    - Hidden with no upcoming release.

### A.5.2 Shop `(tabs)/shop`

Replaces "core + live drops" with the full catalog, like web `/shop`.

1. **AppHeader**, with SearchPill filtering this screen client-side by title, category and colour
   names.
2. **Title band** (centred, paddingTop 28): `fonts.heading` 26/39 UPPERCASE ("HATS" or the category
   name), then `type.micro` `#77706C` capitalize subtitle (category description, or "Shop Our Full
   Range Of Hats").
3. **Style pills** (horizontal ScrollView, paddingHorizontal 16, gap 9, marginTop 28):
   - pills 35 tall, minWidth 85, paddingHorizontal 16, 1pt `#EEEEEE` border, radius 4,
     `fonts.body` 13 ls 1.3;
   - "View All" + categories; active pill `#000` with a white label;
   - then a 1pt `#E4E4E4` divider, marginTop 28.
4. **Toolbar row** (marginVertical 16, paddingHorizontal 16): Button `action` "Filter + Sort" with
   an `options-outline` icon, plus the result count in `type.micro` `#736B67`.
   - It opens a full-screen `Modal`:
     - a 56pt title bar `#F5F5F5` ("Filter + Sort" `fonts.heading` 14 UPPERCASE ls 1.4, close `close`
       24);
     - **Sort** radio rows (Featured, Price: Low To High, Price: High To Low, Newest);
     - **Size** 45×45 boxes (One Size, S/M, L/XL, matching in-stock sizes);
     - **Color** 4-column swatch grid (32pt circles + 12 labels);
     - a fixed footer with Button `light` "CLEAR" and `primary` "VIEW N RESULTS".
5. **Grid:** 2 columns, gap 16, paddingHorizontal 16. Cards per §5.3.
6. **Data:**
   - `sdk.store.product.list({ region_id, fields: PRODUCT_FIELDS + ",*categories,*collection,*options,*options.values,*variants.options,*variants.images,*images", limit: 100 })`.
   - Drop `metadata.offer === true` products.
   - Order: core first, then products of live releases, then others.

### A.5.3 Product card (`product-card.tsx`)

- **Image area:** width `(W − 48)/2` (171 at 390), square, white, `contentFit="contain"`, with a 1pt
  `#E5E7EB` bottom border and 8 paddingBottom.
  - A horizontal paging `FlatList` of the **first colour's images** (variant images; fallback
    product images) with Dashes 4 above the border.
- **Badge** at top 14 / left 14 (§3 values and priority from web §6.2).
- **Quick add:** a 48×48 Pressable at the top-right corner.
  - The icon is a 32pt circle (1pt `#000` border, white fill) with `bag-outline` 16, plus a 14pt
    black circle with a white "+" (`fonts.heading` 10) at its top-right.
  - One-size: adds the first in-stock colour and opens the Added sheet (§5.6).
  - Sized: a small popover with two 39pt buttons "S/M" | "L/XL" under the icon.
- **Text** (marginTop 7):
  - row: title `type.item` (2 lines max) and price `fonts.body` 14/21 ls 0.4, right;
  - then `type.meta` `#726B67` lines: colour name, product type (from `fit_profile` structure +
    closure + category, e.g. "Unstructured Strapback Cap"), and "+N Colors" when there is more
    than one colour.

### A.5.4 Product `products/[handle]`

The web PDP (§6.4) at phone size. Gutter 21.5.

1. **Gallery:**
   - Full-width paging `FlatList`, square `W − 43` (347 at 390), white, contain, centred. Dashes 12
     under it.
   - Images are the **selected colour's variant images**, then product-level images. Changing the
     colour resets to image 1.
   - The badge sits on image 1.
2. **Title row:** `fonts.body` **20/25 UPPERCASE** title (flex 1) + price `fonts.body` 18/25.
3. **Type:** `fonts.body` 15/19.5 `#736B67`.
4. **Breadcrumb:** `fonts.body` 12/18, "Shop All > Caps > The Everyday Cap" (last part `#736B67`),
   marginTop 16. Crumbs navigate.
5. **Colour** (marginTop 20):
   - SegmentedControl only when colours fall into more than one group;
   - "Color: Navy" `fonts.body` 13/19.5, marginBottom 10;
   - Swatch grid.
   - The selected colour also drives the route param `color` (`router.setParams`).
6. **Size** (marginTop 24): label row "Choose your Size" (`fonts.body` 13) + Button `micro` "Size
   Guide", which opens a bottom-sheet `Modal` with the size chart.
   - **Sized:** SizeButtons; none preselected.
   - **One size:** one full-width selected SizeButton "ONE SIZE", then `fonts.body` 13 `#736B67`
     "Fits 21.5–23.75 in (55–60 cm)" (the range from `fit_notes` when stated).
7. **Make It Two** (only on a product with an offer, `metadata.single_handle` on the offer):
   - heading `fonts.heading` 18 UPPERCASE;
   - a card: `#ECECEC`, 1pt `#DDDDDD`, radius 8, padding 16, a 72pt image, "The Two-Pack" and "Any
     two colors", price "$68" with "Save $8" (live), and `chevron-forward`;
   - it navigates to `/products/everyday-two-pack`.
8. **Add to cart:** Button `primary` size `atc` full width.
   - Labels: "ADD TO CART"; "ADD TO CART - LOW INVENTORY" (≤5); "SELECT A SIZE"; "SOLD OUT"
     (disabled).
   - On success it opens the Added sheet (§5.6).
9. **SKU** `fonts.body` 13, then **StockLine** (marginTop 12). Drop products add `type.micro`
   `#736B67` "Limited run. Restocked only if it sells through."
10. **Perks** (marginTop 24): PerkRows with the true lines from web §6.4.13. Ionicons:
    `car-outline`, `return-down-back-outline`, `resize-outline`, `cube-outline`, `water-outline`.
11. **Description** (moved below the perks, like Melin mobile): `type.system` 16/24.
12. **Fit Guide** (with `metadata.fit_profile`): a divider, then `fonts.heading` 18/23.4 "Fit
    Guide", two FitScales 20 apart, and Button `micro` "Read the fit guide", which opens the web
    `/fit-guide#handle`.
13. **Accordions:**
    - "Details": the `metadata.details` rows, label `fonts.heading` 12 UPPERCASE ls 1.3 over the
      value in `fonts.body` 13.
    - "Shipping & Returns".
14. **You May Also Like:** a `#F8F8F9` band, padding 28.432/0, `type.section` heading at left 16.
    Then a horizontal list of ProductCards (width 171, gap 16, paddingHorizontal 16), other
    categories first, excluding offers.
15. **Sticky buy bar** (Animated, appears once the ATC scrolls under the header):
    - absolute top under the header, height 80, white, `shadow.sticky`, paddingHorizontal 16;
    - a 56pt thumbnail;
    - price `fonts.body` 16 over the colour in `fonts.body` 12 ls 0.8 `#736B67`;
    - Button `primary` 39 "ADD TO CART" at the right. Sized with no size: "SELECT A SIZE", which
      scrolls up.

**Two-pack** (`everyday-two-pack`, `metadata.offer`): the same screen. Its options "First cap" and
"Second cap" render as two swatch groups ("First Cap: Navy", "Second Cap: Olive"). The gallery shows
the two chosen colours' `-1` photos side by side (2 × `(W−59)/2`). Under the title it shows a "Save
$8" badge and "$76" struck through (`fonts.body` 14 `#736B67`, `textDecorationLine:
"line-through"`), computed from the single's live price. The CTA reads "ADD THE PAIR - $68". It is
excluded from every list (Shop, Home, You May Also Like, suggestions) and reachable only through
Make It Two and deep links.

### A.5.5 Bag `(tabs)/cart`

Melin's cart drawer as a full screen, on a `#F5F5F5` background.

1. **Header** (white, padding 16/16/20, centred): `bag-outline` 24, then "Your Bag" `fonts.heading`
   16/24, then the policy line `type.micro` capitalize "Standard Shipping $6 · 30-Day Returns".
2. **Lines** (white rows, padding 12/16, 1pt `#E4E4E4` bottom border, gap 16):
   - image 128×128 (contain, radius 8);
   - title `fonts.subheading` 14.08/21; "Color / Size" `fonts.body` 13 `#736B67` (two-pack: "First
     Cap / Second Cap" colours); a "Limited" Badge at 12 for drop products;
   - QuantityStepper;
   - `close` 16 remove at the top-right;
   - price `fonts.body` 14 right.
3. **Complete Your Look** (padding 24/16): heading `fonts.subheading` 16.
   - The two-pack card (§5.4 item 7) when an Everyday Cap single is in the bag.
   - Then a paging list of suggestion cards (up to 3 hats not in the bag, other categories first).
     Each card: `#F5F5F5`, 1pt `#CCCCCC`, radius 6, padding 15; a 72pt image, title `fonts.body`
     14.08, colour and category `fonts.body` 12 `#736B67`, price 14; Button `primary` size `small`
     "ADD" at 50% width, right. Sized products show "CHOOSE SIZE", which opens the PDP.
4. **Summary** (fixed bottom, white, padding 16, 1pt `#E4E4E4` top border):
   - row: `checkmark-circle` 16 `#22C55E` + `fonts.body` 14 "30-Day Returns", and on the right
     `fonts.heading` 12 `#22C55E` "INCLUDED";
   - row: `fonts.heading` 18 "Summary" + subtotal;
   - Button `primary` size `checkout` "CHECKOUT" → `/checkout`;
   - the trust line `fonts.heading` 10/15 ls 1 UPPERCASE centred.
5. **Empty:** `bag-outline` 48, `fonts.heading` 16 "Your Bag Is Empty", then Button `primary` "SHOP
   THE EVERYDAY CAP".

### A.5.6 Added sheet (`src/components/added-sheet.tsx`)

Native stand-in for Melin's slide-in drawer, after any add to cart.
- A bottom-sheet `Modal`, white, top radius 8, over `rgba(0,0,0,0.8)`.
- Contents: `checkmark-circle` 16 `#22C55E` + "Added To Your Bag" (`fonts.heading` 14 UPPERCASE ls
  1.3); the added line (image 72, title, colour/size, price); Button `light` "KEEP SHOPPING" and
  Button `primary` "VIEW BAG", side by side.

### A.5.7 Checkout `checkout` and order `order/[id]`

Melin hands off to Shopify; Shelby keeps its three-step flow with these tokens (web §6.8).
- **Step headers:** `fonts.heading` 18 UPPERCASE ls 1.3 "1. CONTACT & ADDRESS".
- **Inputs:** 48 tall, white, 1pt `#E4E4E4` (focused `#000`), radius 3, paddingHorizontal 14,
  `type.system` 16. Labels `fonts.body` 13 above, 6 gap. Errors `fonts.body` 12 `#C70000`.
- **Delivery options:** radio cards, 1pt `#E4E4E4` (selected `#000`), radius 3, padding 14.
- **Summary** in a `#F5F5F5` block: 64pt images with qty badges, totals.
- **Place order:** Button `primary` size `checkout` "PLACE ORDER · $76".
- Payment stays on Medusa's test provider in the app (Stripe React Native is out of scope; see
  README).
- **Order confirmation:** `checkmark-circle` 48 `#22C55E`, `fonts.heading` 26/39 UPPERCASE "THANK
  YOU", the lines and totals, Button `light` "KEEP SHOPPING".

### A.5.8 Recently viewed

- AsyncStorage key `shelby.viewed`: the last 12 handles, written on PDP view.
- The header eye icon opens a full-screen `Modal`: a 75pt header row ("Previously Viewed"
  `fonts.heading` 16, "N Products" `fonts.body` 13 `#736B67`, close), then a 2-column ProductCard
  grid.
- The badge shows the count; the icon is hidden at 0.

### A.5.9 Drops `(tabs)/drops` and `drops/[handle]`

- **Drops** (web §6.6, blog-index style):
  - **Featured hero:** the image `W × 293·W/390` (cover). Then, centred and padded 24/16:
    - meta `type.eyebrow` UPPERCASE with the first word `#736B67` 11;
    - title `fonts.heading` 39.8/39.8 UPPERCASE;
    - promise `type.body`;
    - for upcoming: the Countdown (large);
    - Button `light` "SHOP THE DROP" / "GET NOTIFIED".
  - **Tabs:** SegmentedControl 240 wide, 28 tall, on `#EDEDED`: "Live & Upcoming" | "Past".
  - **Cards:**
    - meta `type.eyebrow`;
    - image `(W−32)` × 2/3 of that (3:2);
    - title `fonts.heading` 16/20.8, marginBottom 10;
    - upcoming cards add the Countdown (small) and NotifyMe;
    - gap 32, paddingHorizontal 16.
- **Countdown:**
  - Digits `fonts.heading` 22 (large 34) with `fontVariant: ["tabular-nums"]`, " : " separators.
  - Labels `fonts.body` 10 UPPERCASE ls 1 `#736B67`: DAYS · HRS · MIN · SEC.
  - At zero it shows "Going live shortly". Real `release_at` only.
- **Drop detail** (web article style):
  - hero image `W × 260·W/390`;
  - column padding 27/16: meta `fonts.body` 10/15 ls 1 UPPERCASE opacity 0.6, title
    `fonts.subheading` 26/34;
  - story paragraphs `fonts.body` 16/25 ls −0.12, marginBottom 16;
  - "What To Look For" heading `fonts.heading` 22/28.6, marginTop 32;
  - by phase: Countdown + NotifyMe (upcoming), a product grid (live), or "This drop has ended."
    (past);
  - a 4pt black rule and Button `link` "← BACK TO DROPS".

### A.5.10 Account `(tabs)/account`

Restyled with the tokens:
- title `fonts.heading` 26/39 UPPERCASE "ACCOUNT";
- inputs per §5.7; Buttons `primary` "SIGN IN" / `light` "CREATE ACCOUNT";
- order rows: white, 1pt `#E4E4E4` bottom border, padding 14/16. Order number `fonts.heading` 14,
  date `fonts.body` 12 `#736B67`, total `fonts.body` 14 right, `chevron-forward`.

---

## A.6. Hat-catalog behaviours the app lacks today (must ship)

1. **Variant images per colour:** request `*variants.images,*images` and port `imagesFor`,
   `colorOption`, `colorThumbs` and `detailsOf` from `web/src/lib/product.ts` into
   `mobile/src/lib/product.ts`.
2. **One-size hats:** no size pick, auto-selected (§5.4 item 6).
3. **Sized hats:** S/M and L/XL, with the sort order `ONE SIZE, XXS, XS, S, S/M, M, L, L/XL, XL…`.
4. **Fit profile:** `metadata.fit_profile.crown` / `.structure` drive the FitScales and the card
   product type.
5. **Two-pack offer:** excluded from lists via `metadata.offer`, reachable via Make It Two and deep
   links. It is an inventory kit, so variant availability already reflects the core stock.
6. **Image URLs:** product image URLs are absolute (`${STOREFRONT_URL}/hats/...`) and load directly
   in `expo-image`.
7. **Categories** for Browse By Style and the Shop pills: `sdk.store.category.list({ fields: "id,name,handle,description" })`.

## A.7. Analytics (unchanged)

Keep `src/lib/analytics.ts` and attribution. Every event carries `page_type` mapped from the screen:
home, collection, pdp, offer (the two-pack screen), drops, cart, checkout, order, other.
`add_to_cart` carries `source` (`"app_pdp"`, `"app_quick_add"`, `"app_bag"`).

## A.8. Verify

1. `npm run typecheck`.
2. `npx expo export --platform web` (the existing `export:web` script). Serve `dist/` and take
   Playwright screenshots at 390×844 of Home, Shop, a one-size PDP, a sized PDP, the two-pack, Bag
   and Drops.
3. Compare each screenshot with the matching web page at 390 wide (same tokens, same sizes).
