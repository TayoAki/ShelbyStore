# Shelby app: complete specification (v4, Melin style)

The single source of truth for rebuilding the Expo app (`mobile/`) so it matches the website
(`web/SITE_SPEC.md` v4), which follows **melin.com's mobile-web style exactly**. This file translates
those tokens and patterns to React Native. Every value comes from the Melin capture described at the
top of `web/SITE_SPEC.md` (Firecrawl + Playwright at 390×844). Where this file is silent, the web
spec's mobile values apply.

Stack (unchanged): Expo SDK 58, React Native 0.88, expo-router (typed routes, `src/app`),
TanStack Query, `@medusajs/js-sdk`, `expo-image`, `@expo/vector-icons` (Ionicons),
`react-native-safe-area-context`, `react-native-reanimated`.

**New dependencies (JS-only, Expo-compatible):** `@expo-google-fonts/plus-jakarta-sans` and
`@expo-google-fonts/inter`. They are loaded with `expo-font` (already installed). Install them with
`npx expo install`.

---

## 1. Rules

1. **Brand:** wordmark `shelby` (lowercase, heading font). Shelby's own copy, products, prices,
   policies and photos. No Melin logo, imagery, product names or copy.
2. **No invented claims** (the full table is in web §1.2):
   - no stars or reviews, no free-shipping threshold, no fit promise or warranty, no 10%-off;
   - no "Buy it now" or BNPL;
   - no wishlist, loyalty or chat.
3. **Evidence rules** (web §1.3): proof only from live data, product facts and policy.
4. **US English UI labels** ("Color").
5. **Icons:** Ionicons outline set (already installed; no new native module). The mapping is in §6.
6. **Layout reference:** a 390pt-wide phone. Sizes are in points and scale with
   `useWindowDimensions().width` where noted as `W`.

---

## 2. Tokens (`src/constants/theme.ts`, replace the file)

```ts
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
  link: { fontFamily: fonts.heading, fontSize: 13, lineHeight: 19.5, letterSpacing: 0.4, textTransform: "uppercase" as const, textDecorationLine: "underline" as const },
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
```

**Font loading** (`src/app/_layout.tsx`):
- Load the fonts with `useFonts({ PlusJakartaSans_500Medium, PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold, Inter_400Regular })`.
- Keep the splash screen until they load.
- Set the root background `#FFFFFF`. In `app.json`, splash and adaptive-icon backgrounds become
  `#FFFFFF`.
- Text never uses `fontWeight` with these families; the family carries the weight.

`src/components/text.tsx` maps its `variant` prop onto `type.*`. Tones: `default` `#000`, `muted`
`#736B67`, `mutedCard` `#726B67`, `inverse` `#FFF`, `error` `#C70000`.

---

## 3. Components (`src/components/`)

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

## 4. App chrome

### 4.1 Header (`src/components/app-header.tsx`, used at the top of Home, Shop and Drops)

- White, bottom border 1pt `#E5E7EB`, under the safe area.
- **Row 1** (61pt, paddingHorizontal 16):
  - wordmark `shelby` (`fonts.heading` 24/24, ls −0.5), which navigates Home;
  - right: `eye-outline` (recently viewed, §5.8) and `bag-outline` (Bag tab), 24pt, gap 16;
  - count badges: 16pt black circle, white `fonts.heading` 10.
- **Row 2** (60pt, padding 12/16): SearchPill full width.
- **Condensed on scroll** (Home and Shop): when the scroll offset passes 121, row 2 folds into row 1
  (`withTiming` height 0.3s). Row 1 then shows the wordmark-less layout: SearchPill (flex 1) and the
  bag icon. Scrolling up expands it again.

### 4.2 Tabs (`src/app/(tabs)/_layout.tsx`)

- **Tabs:** Home · Shop · Drops · Bag · Account (order kept).
- **Bar:** `#FFFFFF`, top border 1pt `#E5E7EB`, height 56 + the safe area.
- **Labels:** `fonts.heading` 10, ls 1.3, UPPERCASE.
- **Colours:** active `#000`, inactive `#736B67`.
- **Icons** (outline; filled when focused): `home`, `grid`, `flash`, `bag`, `person`.
- **Bag badge:** `#000` background, white `fonts.heading` 10.

---

## 5. Screens

### 5.1 Home `(tabs)/index`

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

### 5.2 Shop `(tabs)/shop`

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

### 5.3 Product card (`product-card.tsx`)

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

### 5.4 Product `products/[handle]`

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

### 5.5 Bag `(tabs)/cart`

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

### 5.6 Added sheet (`src/components/added-sheet.tsx`)

Native stand-in for Melin's slide-in drawer, after any add to cart.
- A bottom-sheet `Modal`, white, top radius 8, over `rgba(0,0,0,0.8)`.
- Contents: `checkmark-circle` 16 `#22C55E` + "Added To Your Bag" (`fonts.heading` 14 UPPERCASE ls
  1.3); the added line (image 72, title, colour/size, price); Button `light` "KEEP SHOPPING" and
  Button `primary` "VIEW BAG", side by side.

### 5.7 Checkout `checkout` and order `order/[id]`

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

### 5.8 Recently viewed

- AsyncStorage key `shelby.viewed`: the last 12 handles, written on PDP view.
- The header eye icon opens a full-screen `Modal`: a 75pt header row ("Previously Viewed"
  `fonts.heading` 16, "N Products" `fonts.body` 13 `#736B67`, close), then a 2-column ProductCard
  grid.
- The badge shows the count; the icon is hidden at 0.

### 5.9 Drops `(tabs)/drops` and `drops/[handle]`

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

### 5.10 Account `(tabs)/account`

Restyled with the tokens:
- title `fonts.heading` 26/39 UPPERCASE "ACCOUNT";
- inputs per §5.7; Buttons `primary` "SIGN IN" / `light` "CREATE ACCOUNT";
- order rows: white, 1pt `#E4E4E4` bottom border, padding 14/16. Order number `fonts.heading` 14,
  date `fonts.body` 12 `#736B67`, total `fonts.body` 14 right, `chevron-forward`.

---

## 6. Hat-catalog behaviours the app lacks today (must ship)

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

## 7. Analytics (unchanged)

Keep `src/lib/analytics.ts` and attribution. Every event carries `page_type` mapped from the screen:
home, collection, pdp, offer (the two-pack screen), drops, cart, checkout, order, other.
`add_to_cart` carries `source` (`"app_pdp"`, `"app_quick_add"`, `"app_bag"`).

## 8. Verify

1. `npm run typecheck`.
2. `npx expo export --platform web` (the existing `export:web` script). Serve `dist/` and take
   Playwright screenshots at 390×844 of Home, Shop, a one-size PDP, a sized PDP, the two-pack, Bag
   and Drops.
3. Compare each screenshot with the matching web page at 390 wide (same tokens, same sizes).
