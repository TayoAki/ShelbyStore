# Goorin Bros. — teardown

Captured 2026-11-16 as a logged-out US visitor. Shelby is pivoting to hats, so this teardown feeds Shelby's own hat-store `SITE_SPEC.md`. We studied the site for patterns and exact values. **We are not copying Goorin's logo, imagery, copy, animal characters or overall look.**

**Method:** phases 1 and 2 of the site-clone workflow, adapted for research as in [README.md](README.md). No Firecrawl key was available, so pages were rendered in Chromium with Playwright and raw HTML, CSS and Shopify JSON were fetched with curl.

**Viewports:** mobile 390×844 (iPhone 13 profile) and desktop 1440×900.

**Values:** tokens are `getComputedStyle` readings or the theme's own `:root` block. Screenshots stay in the session scratchpad and are not committed.

**Pages (12 browser loads, no retries):**
- `/`: mobile and desktop, ×2 on desktop.
- `/collections/shop-all-truckers`: mobile ×2 and desktop ×2.
- `/products/panther-trucker-1`: an Animal Farm trucker, one-size, mobile and desktop. The mobile pass also added it to the cart to read the cart drawer. Checkout was never opened.
- `/products/norwood`: a sized, USA-made cut-and-sew flat cap, mobile and desktop.
- `/pages/size-guide`: reached from the PDP size link.
- `/pages/fridaydrop`: mobile.

**curl fetches:** `/`, `theme.css`, `/products.json` (3 pages, 504 products), 4 collection `products.json` feeds, `/pages/fridaydrop` and `/products/norwood`.

**Caveats:**
- **Holiday timing.** The capture fell in the Black Friday run-up. The announcement bar ran a Thanksgiving patch promo, and a "LIMITED TIME 10%" email tab was live.
- **Popups were dismissed, so some details are missing.** The cookie banner was accepted and a Klaviyo email popup that appeared after scrolling was closed. Its offer was not recorded.
- **Some things could not be read:**
  - The fit-guide scale positions are graphics.
  - The mobile pinned bar's button has no text label.
  - The theme loads Yotpo/Okendo/Stamped/Loox strings, so the PDP review-provider sniff gave false positives. The rendered widget is **Klaviyo Reviews** (`kl_reviews__*` classes).
- **LCP is directional only.** It was measured unthrottled from a datacenter.

**Platform:** Shopify. The Online Store 2.0 theme has Tailwind-style utility classes, `product-sticky-form` and `sticky-header` custom elements, and LayoutHub page-builder sections.

**Positioning:**
- **Two businesses under one roof.**
  - **Trucker caps:** loud, character-patch truckers, mostly the "Animal Farm" line. 225 of 504 products are OG Truckers.
  - **Heritage hats:** fedoras, flat caps and straws, including a "USA Workshop" line made in its New Jersey factory.
- **A weekly numbered Friday drop** with a countdown sits on top of both.

---

## 1. Design tokens

### 1.1 Color (exact values from the theme `:root` and computed styles)

| Role | Value | Where |
|---|---|---|
| **Page background** ("custom-light-brown", a warm putty) | `#d6d2c4` (`--color-base-background: 214 210 196`) | Body, header, cards, drawers, PDP. It is the **only** light surface. |
| **Ink** ("custom-black", a blue-black) | `#101820` (`--color-base-text: 16 24 32`) | All text on putty, the announcement bar bg, footer bg, the collection breadcrumb band, the 2px header and PDP rules. |
| Primary button | `#171717` bg / `#ffffff` text (`--color-base-button: 23 23 23`) | Add to cart, Filter By, Apply. The drawer's Check out uses `#d6d2c4` text. |
| **Accent green** | `#00c65e` (`--custom-green`) | Campaign CTAs (with `#101820` text), campaign headline "Oi", text links ("SHOP TRUCKERS →"), footer arrows |
| Media placeholder / card image well | `#fafafa` (`--color-placeholder: 250 250 250`) | Behind product images on desktop cards |
| Highlight | `#ffddbf` (`--color-base-highlight`) | Announcement highlight |
| Eyebrow peach | `#e0a580` | Letter-spaced eyebrow over the brand film ("… SINCE 1895") |
| Sale / sale tag | `#e11d48` on `#ffffff` | Sale badges and countdown buttons on cards. **No sale cards were seen.** |
| Rating stars | `#f59e0b` | Klaviyo reviews stars and histogram |
| Success | `#4d7c0f` on `#f7fee7` | Form states |
| Error | `#be123c` on `#fff1f2` | Form states |
| Info | `#b45309` on `#fffbeb` | Form states |
| Keyboard focus | `#0b61cd` | Focus ring |
| Overlay | `#171717` at 40% | Behind drawers and the mobile menu |
| Card shadow | `rgba(16, 24, 32, 0.1) 0 0 6px 2px` | Product cards (radius 0, no border) |
| Off-brand third party | `#00249c` | Klaviyo Reviews "Write a review" and "Show more" buttons |

**Palette logic:** two brand neutrals carry the whole site.
- Putty (`#d6d2c4`) and blue-black ink (`#101820`) swap roles: ink-on-putty for shopping, putty-on-ink for the announcement bar, footer and breadcrumb band.
- One saturated green is reserved for campaign CTAs and links.
- Studio product shots are shot on a near-matching warm grey, so images blend into the page.

### 1.2 Typography

Every font is **self-hosted on Shopify's CDN** (`/cdn/shop/files/*.ttf|otf`) and declared in an inline `@font-face` block with `font-display: swap`. There is no Typekit or Google font for the visible type. Inter (Shopify font picker, preloaded) and Noto Sans (Google Fonts, pulled in by an app) also load, but neither is the visible type.

| Theme variable | Family | Files | Used for |
|---|---|---|---|
| `--font-family-heading-2` → `--font-heading-family` | **TAY Lennon** | 1 OTF (400; rendered at 500/700) | All display headings, product titles (PDP and card), mobile menu, section headings, cart title. Letter-spacing `-0.03em`, line-height `1`. |
| `--font-family-heading-1` | **Outfit** | 500, 600, 700, 900 TTF | Desktop nav only (900, 12px). Also the mega-menu tile labels. |
| `--font-family-body-1` → `--font-body-family` | **Red Hat Mono** | 400, 400 italic (+500/700 rendered) | UI: announcement bar, buttons, prices, color names, accordion labels, footer links, breadcrumb, cart lines. Line-height `1.2`. |
| `--font-family-body-2` | **Palatino** | 400 TTF | Long-form copy: PDP descriptions, bullet specs, size values, the Afterpay line |

**Type scale (measured):**

| Element | Mobile 390 | Desktop 1440 | Notes |
|---|---|---|---|
| Hero campaign headline (h2) | TAY Lennon 40px / 40px, ls −1.6px | **68.1px** / 68.1px, ls −2.72px | `#101820` on the putty hero |
| Hero subline (h3) | Red Hat Mono 700 24px | 36.4px | |
| Campaign banner h2 | 32px | 48.5px | Putty or green on imagery |
| Brand-film h2 | 24px | 36.4px | |
| Collection tile label | TAY Lennon 18px | 22px, ls −1.1px | `#d6d2c4` over the photo, with → |
| PDP title (h1) | TAY Lennon 500 **24px** / 30px, UPPERCASE, ls −0.72px | **40px** / 40px, ls −1.2px | |
| PDP price | Red Hat Mono 400 **18px** | 22px | `#101820`. No currency code. |
| PDP description | Palatino 16px / 25.6px | 16px / 25.6px | |
| PDP block labels ("DESCRIPTION", "COLOR SELECTION", accordions) | ~16px bold sans, UPPERCASE | same | Rendered heavy and condensed |
| Afterpay line | Palatino 12px, weight 300, ls 0.45px | same | |
| Card title | TAY Lennon 500 **14px** / 15.4px, UPPERCASE | 14px | |
| Card color name | Red Hat Mono 12px | 13.1px | Left-aligned under the title |
| Card price | Red Hat Mono 12px | 12px | Right-aligned on the color row |
| Nav (desktop) | — | **Outfit 900 12px**, uppercase copy | |
| Mobile menu items | TAY Lennon 18px | — | |
| Announcement bar | Red Hat Mono 13px | 13px | Sentence case |
| Buttons | Red Hat Mono 500 **12px**, sentence case ("Add to cart") | 12px | Campaign CTAs use UPPERCASE copy ("THIS FRIDAY →") |
| Section heading ("YOU MIGHT ALSO LIKE") | TAY Lennon 700 24px | 36.4px | |
| Footer links | Red Hat Mono ~13–14px, UPPERCASE | same | |

**Theme size variables** (`--text-*`): 3xs 10px, 2xs 11px, xs 12px, 2sm 13px, sm 14px, base 16px, lg 18px, xl 20px, 2xl 24px, 3xl 30px, 4xl 36px, 5xl 48px, 6xl 60px, 7xl 72px, 8xl 96px.

Fluid sizes:
- **Product:** `clamp(0.75rem, 0.873rem + 0.3175vw, 1rem)`.
- **Nav:** `clamp(0.75rem, 0.748rem + 0.3174vw, 0.625rem)`, which resolves to 12px.

### 1.3 Spacing, layout and radius

| Token | Value |
|---|---|
| `--page-width` | **1900px** |
| `--page-padding` | **20px** (< 1024px), 36px (≥ 1024), **48px** (≥ 1280), then centered beyond 1900 |
| Product grid | **4 × 327px, gap 12px** at 1440; **2 × 169px, gap 12px** at 390. CSS grid, 12px between rows too. |
| Section spacing | Very tight: home sections use 12px top and bottom padding, so full-bleed bands sit 12px apart |
| Header padding | 8px 48px at the top of the page; **6px 48px once scrolled** (`header-scrolled`) |
| Header height | 62px desktop / 58px mobile, plus a **2px solid `#101820`** bottom rule |
| Announcement bar | 48px tall (wraps to 3 lines on mobile) |
| Spacing scale | `--sp-1` 4px through `--sp-100` 512px, in 4px steps (with half steps: `--sp-2d5` 10px, `--sp-7d5` 30px …) |
| Radius | **Buttons 0, cards 0, blocks 0**. Inputs **12px** (`--rounded-input: 0.75rem`), e.g. the footer email field. Color swatches **5px**. Reviews filter chips 24px. Chat and accessibility bubbles are pills. The mobile cart drawer is a bottom sheet with rounded top corners. |
| Borders | Buttons 2px (`--buttons-border-width`). PDP block dividers **2px `#000000`** (`product-info-divider`). Accordion rules use the foreground at 10%. |
| Icons | Line icons, stroke `1.5px` (`--icon-weight`) |
| Diagonal clip | `--clip-amount-base: 10vw` with `polygon()` clip paths, used by the "slanted swiper" campaign carousel |

### 1.4 Motion
- **Card hover:** a second image crossfades in with `opacity 0.5s cubic-bezier(0.3, 1, 0.3, 1)` plus transform. For truckers that image is a **macro close-up of the patch** (`…-D01.jpg`). Verified visually at 1440.
- **Primary-button hover:** a fill sweep (`.btn-fill`). The background becomes the button-text color and the text takes the button color, so dark becomes light.
- **Headlines** sit in `animate-element` wrappers (word-by-word reveal).
- **Marquee** keyframes (`scrolling-left`) exist in the theme. None were running on the captured pages.

---

## 2. Header and navigation

- **Announcement bar:** one static message on `#101820` with `#d6d2c4` text. It scrolls away; it is not sticky. During the capture it was a holiday promo tied to a $5 patch add-on.
- **Header** (all pages):
  - **Behavior:** sticky, with a 2px `#101820` bottom rule. It never hides on scroll down. It only tightens its padding from 8px to 6px.
  - **Home:** the header carries `header-transparent` and overlays the hero. The hero's putty backdrop makes it read as solid.
  - **Other pages:** solid `#d6d2c4`, in normal flow.
- **Desktop:**
  - Wordmark left (75×12).
  - Nav centered: **SHOP · TRUCKERS · USA WORKSHOP · DROPS · LAST CHANCE** in Outfit 900 12px.
  - Utilities right as **words, not icons**: SEARCH · LOGIN · CART.
- **Mobile:** hamburger left, wordmark centered, search / account / bag icons right. A count badge appears on the bag after adding.
- **Mega menus** open on hover as full-width putty panels.

| Panel | Contents |
|---|---|
| **SHOP** | **Silhouette tiles**: black product cut-outs, each labelled with the style name. The Original Trucker · Low Profile Trucker · Papa Cap · Tailored Baseball · Flatcaps · Fedoras · Buckets · Beanies · Flat Brim · Accessories. Below: "SHOP ALL →". |
| **TRUCKERS** | *Collections*: The Original Trucker, Low Pro Trucker, Kids, Hat Accessories. *Seasonal highlights*: Black Out, Badlands, Circle of Life, Microsuede, Denim, Ridgeline, "Check, Mate". Shop All. Also links Patch Corners. |
| **DROPS** | *Friday Drops*: This Friday, Archive, Join the Club. *Online Exclusives*: Renaissance, 7 Strikes, Mixtape, S.O.S., Outsiderland, Disruption, Through the Storm. **Four image cards**, the first dated ("11.20.2026 – Extinction Burst", "Oi!", "Neo Noir", "Mixtape"). CTA "FRIDAY DROPS →". |

- **Mobile menu:** a full-width accordion over a dimmed page. Items are SHOP, TRUCKERS, USA WORKSHOP, DROPS and LAST CHANCE in TAY Lennon 18px, separated by 2px ink rules, with chevrons on the expandable ones.

---

## 3. Homepage (in order)

There is **no product grid and no price** anywhere on the homepage. The whole page routes visitors to campaigns and collections.

| # | Section | Layout | Background | Content pattern |
|---|---|---|---|---|
| 1 | Announcement bar | Full width, 48px | `#101820` | One promo sentence plus "Click here" |
| 2 | Header | Sticky, transparent over the hero | putty | — |
| 3 | **Campaign hero** | Full bleed. 912px tall on desktop; on mobile a ~0.71 (w:h) portrait (`--ratio-percent: 141.45%`). | A product still on putty | A big TAY Lennon headline naming the current capsule, plus a mono subline. **No button.** |
| 4 | **Collection tiles, row 1** | 4 portrait model tiles on desktop (grid, 12px gaps); a swipe carousel with peek on mobile | putty | A capsule name in putty TAY Lennon over the photo, with → bottom right |
| 5 | Full-bleed campaign banner | Image band ~510px desktop | Art direction (green/black) | A short headline in green plus a **green CTA** (`#00c65e`, 56px desktop / 54px mobile, uppercase copy and →) |
| 6 | **Category tiles, row 2** | Same as row 1 | putty | Category tiles: USA Workshop · Straws · Fedoras · Flatcaps |
| 7 | **Drop countdown banner** | Full-bleed illustration | Art | The drop name plus a **live countdown, DD : HH : MM : SS**, with labels DAYS / HOURS / MINS / SECS, then a green CTA "THIS FRIDAY →" |
| 8 | **Brand film** | Full-bleed video with a play button | Video | Peach letter-spaced eyebrow, a heritage-year headline, outline CTA "WATCH ALL VIDEOS →" |
| 9 | Footer | 3 link columns plus a signup column; a **giant full-width wordmark** at the bottom | `#101820` | See §8 |

**Mobile:** the same order. Tile rows become horizontal carousels with one full card plus a peek.

---

## 4. Collection (`/collections/shop-all-truckers`)

- **Header band:** a 118px `#101820` band with a home icon and the breadcrumb "Shop All Truckers" in Red Hat Mono 16px putty. There is **no H1 heading, no description and no product count.**
- **Toolbar:**
  - **Desktop:** right-aligned. **"Filter By"** is a black button (149×56, sliders icon, mono 12px). **"Sort by"** is an outlined button (180×56).
  - **Mobile:** a **floating "Filter By" button pinned bottom-center** replaces the toolbar.
- **Filter drawer:** slides in from the left, 576px wide on desktop, titled "FILTER AND SORT". The rows are dark (`#101820`) accordion bars:
  - **Shop by Animal**, with character chips such as Panther, Cock, Goat, Black Sheep, Lone Wolf, King and Lion
  - Sort by (Featured · Most relevant · Best selling · A–Z · Z–A · Price ↑ · Price ↓ · Date old→new · Date new→old)
  - Price (from/to range), Fabric, Size, Color
  - **In stock only** toggle
  - Animal
  - A black **Apply** button
- **Grid:** 2 columns on mobile (169px, gap 12px) and **4 columns on desktop** (327px, gap 12px).
- **Card** (`variant-card`):
  - **Box:** putty background, radius 0, a soft all-round shadow (`0 0 6px 2px` at 10% ink), no border.
  - **Media:** a **4:5 frame** (327×409) holding a **square 1:1 studio shot** with `object-fit: contain` on a `#fafafa` well. Every hat sits front-facing, centered, on matching warm grey.
  - **Below the image:** the title (TAY Lennon 14px uppercase), then a row with the **color name** left and the **price** right (both Red Hat Mono 12–13px).
  - **Hover (desktop):** crossfades to a patch close-up.
  - **What cards lack:** badges, swatches, quick add and star ratings. There were also no sale prices on page 1.
  - **Each colorway is its own card.** The recommendations, for example, show the same Lone Wolf hat three times in Edge, Void and Palm.
- **Paging:** about 21 products per page with **numbered pagination**: dark square page buttons and a "Next →" button, 10 pages. Infinite scroll is not used. A 3-up lifestyle image strip follows the grid.

---

## 5. Product page

### 5.1 Layout
- **Desktop:**
  - **Gallery (left):** a **2-column image grid** of 4:5 tiles, 440×550 each. It mixes a front studio shot, model shots, and a **macro of the patch embroidery**.
  - **Info (right):** a 518px column starting at x=874.
- **Mobile:**
  - **Gallery:** a full-width swipe gallery of **square 1:1** studio shots, with dot pagination and a round "expand" (zoom) button top right.
  - **Info:** follows below the gallery.

### 5.2 Info column (identical order on both viewports)
1. **Title.** TAY Lennon, uppercase, 24px mobile / 40px desktop.
2. **Price.** Mono 18px / 22px.
3. 2px rule.
4. **Afterpay line.** "or 4 interest-free payments of $10" plus the logo and an ⓘ, in Palatino 12px.
5. 2px rule.
6. **DESCRIPTION.** An open accordion. A paragraph of character-voice copy in Palatino 16px/25.6px. Heritage hats add a bullet list (Chassis: 100% Wool · Profile: color · Origin: hand-cut and sewn in the USA at our New Jersey factory).
7. **COLOR SELECTION.** The selected color name sits right-aligned, in Palatino uppercase as written. **Image swatches** are thumbnails of each colorway: 40px mobile / 48px desktop, radius 5px, the selected one with a 2px ink ring.
8. **MORE VIEWS.** An open accordion holding a thumbnail grid of the remaining **angle shots**: front, ¾, side, top, **underside/sweatband**, back (closure).
9. **SIZE SELECTION.** The selected size sits right-aligned. A **"Size" link with a ruler icon** goes to the Fit Guide page. Size options are outlined boxes:
   - one-size hats show a single "One Size" box;
   - sized hats show **Small · Medium · Large · X-Large · XX-Large** as words;
   - the selected box has a 2px ink border;
   - **sold-out sizes are struck with a diagonal line in a light rose-red tint** (the theme's sale/error red family).
10. **Add to cart.**
    - Size and color: `#171717`, full width, **48px mobile / 60px desktop**, radius 0.
    - Type and padding: Red Hat Mono 500 12px, sentence case, 18px 26px padding.
    - On a sold-out drop it reads **"Sold Out"**, disabled.
11. **"1-Year Guarantee"** with a shield icon, directly under the CTA.
12. **Accordions:**
    - **MATERIALS & SPECIFICATIONS:** "Fabric: 57% polyester, 43% cotton · Origin: Made in Vietnam".
    - **FREE US SHIPPING $75+:** the full policy: continental US ground, free returns on eligible orders, 30-day exchange or return from fulfilment, international final sale. On drops it adds "*FREE MX/CA SHIPPING $99+".
13. **Star rating plus "21 reviews"**, anchoring to the review widget. It sits **below** the accordions, not next to the title.

### 5.3 Below the fold (in order)
1. A UGC/lifestyle carousel: 3-up 4:5 photos on desktop, 1-up with peek on mobile, each with →.
2. **"YOU MIGHT ALSO LIKE"**: a carousel of variant cards with prev/next arrows.
3. A brand block: a black video panel with the wordmark, and an "it's genuine" manifesto. It ties to a "Genuine Goorin" anti-counterfeit page in the footer.
4. **Klaviyo Reviews:**
   - **Summary:** "4.9 / 5" with stars, 21 reviews, a 5→1 star histogram (amber bars) and a customer-photo strip.
   - **Controls:** search, "Most relevant" sort, a rating filter, "With media", and a blue "Write a review".
   - **Each review:** stars, name, a "Verified buyer" badge, relative date and text.
   - **Missing:** no fit or size question, since the hats are one-size.
5. Footer.

### 5.4 Pinned buy bar
- **Mobile:** a bottom bar (`product-sticky-form`) with the product name (mono), the variant ("VOID / One Size") and a **square black bag-icon button**. It is absent from the first-paint fold and appears once the page scrolls.
- **Desktop:** a **floating card bottom right** appears after scrolling past the CTA. It shows a thumbnail, name, variant, price and a black "Add to cart" button.

### 5.5 Cart drawer (mobile, after adding a $40 trucker)
- **Shell:** a **bottom sheet** with rounded top corners and a grab handle.
- **Header:** "← CONTINUE SHOPPING" and **"YOUR CART¹"** (TAY Lennon, count as a superscript).
- **Line item:**
  - a 2px ink-bordered square thumbnail;
  - name in mono uppercase, then color and size in muted mono;
  - a rounded quantity box, a price, and an underlined "Remove".
- **Free-shipping progress:** "Spend **$35.00** more to reach free shipping!" with a black fill bar ($75 threshold).
- **Discount line:** a GovX ID line ("Military, First Responder, Government Employee and Teacher discount available").
- **Totals:** Subtotal in bold sans, $40.00 in mono. Below it the Afterpay installments line and "Taxes and shipping calculated at checkout".
- **CTA:** **Check out**, `#171717` with putty text, 48px.
- **No cross-sell showed**, although a BOGO/upsell cart app is installed.

---

## 6. Hat-specific patterns (the part that matters for Shelby)

**Taxonomy is silhouette first, then story.**
- The SHOP menu is the hat **shape**: Original Trucker, Low Profile Trucker, Papa Cap, Tailored Baseball, Flatcap, Fedora, Bucket, Beanie, Flat Brim, shown as black silhouette cut-outs.
- The second layer is the **story or capsule** (seasonal names, online exclusives, drops), plus a filter facet for the patch character ("Shop by Animal").
- Product types in the feed, in order of count: OG Trucker, Baseball, Knit, Kids, Cut & Sew, Papa Cap, Flatcap, Fedora (felt, straw, cut-and-sew), Bucket, Beanie, Add-Ons.

**Fit is explained by crown and structure, not just size.**
- The **Fit Guide** (`/pages/size-guide`) gives each silhouette (Trucker, Low Pro, Papa Cap, Fedora):
  - a sentence on how it sits;
  - a 3-step **crown HEIGHT** scale (Short · Mid · Tall);
  - a 3-step **STRUCTURE** scale (Low · Medium · Full);
  - a "SHOP …" link.
- The marked step on each scale is a graphic and was not read.
- The Low Pro copy even tells people not to pull the hat down flat.
- **Hat size table** (one per site):

| | XS | S | M | L | XL | XXL | One Size |
|---|---|---|---|---|---|---|---|
| Hat size | 6¾ | 6⅞ | 7⅛ | 7⅜ | 7⅝ | 7⅞ | 6⅞–7⅝ |
| Inches | 21.250 | 21.625 | 22.500 | 23.250 | 24.000 | 24.875 | 21.625–24.000 |
| Centimeters | 54 | 55.5 | 57 | 59 | 61 | 63 | 55–61 |

**One size dominates.** In the catalog feed:
- 184 of 188 products with a Size option are **"One Size"**: truckers, baseball caps and knits, all with snapback or adjustable closures.
- Only heritage hats are sized. Most use Small through XX-Large; some use two sizes, Small/Medium and Large/X-Large.
- One-size truckers carry no fit-risk messaging at all.

**Colorways have their own names.**
- House color names: Void (black), Dust (white), Edge, Palm, Chalk, Guard, Wax, Biscuit, Heat.
- Two-tone truckers are written **crown / mesh**, e.g. "DUST / VOID".
- The color name prints on every card and in the cart.

**Imagery is a fixed, consistent set.**
- Every hat gets the same studio set on warm grey: front, ¾, side, top, underside (sweatband and label), back (closure).
- On top of that come a **macro detail of the patch or fabric** and model or lifestyle shots.
- Typical image counts: 4 for a trucker (median), 7–11 for flat caps and papa caps, 22–33 for fedoras.
- The card's hover image is the macro detail.

**Materials and origin are short, separate facts.**
- "Fabric: 57% polyester, 43% cotton · Origin: Made in Vietnam" for truckers, against "Hand-cut and sewn in the USA at our New Jersey factory" for USA Workshop caps at $98.
- They sit apart from the mood copy, which carries the "story". 83 of the first 250 products are tagged `AI-Text-Generated`.

**Price ladder (feed of 504 products, first-variant prices):**

| Type | n | Min | Median | Max |
|---|---|---|---|---|
| OG Trucker | 225 | $30 | **$45** | $65 |
| Baseball | 52 | $17.50 | $42.50 | $125 |
| Knit (beanies) | 47 | $40 | $40 | $62.50 |
| Kids | 37 | $35 | $35 | $35 |
| Cut & Sew (USA Workshop flat caps etc.) | 35 | $37.50 | **$98** | $125 |
| Papa Cap | 25 | $25 | $55 | $125 |
| Flatcap | 8 | $32.50 | $47.25 | $98 |
| Fedoras (felt / straw / cut & sew) | 11 | $125 | ~$160 | $280 |
| Bundles (all shown with a compare-at price) | 48 | $99 | $99 | $199 |
| **Add-ons** (patches, pins) | 10 | **$5** | $15 | $16 |

- The core animal trucker is **$40**.
- Suede, "Rodeo Drive" and multi-patch truckers run $55–60. "NeoBrand" premium truckers are $65. The weekly drop hat was $65.
- **Attach items:** $5 patches and $15 enamel pins of each animal. "Patch Corners" is its own collection.

---

## 7. Drops, scarcity and retention

**Weekly Friday Drop:**
- `/pages/fridaydrop` opens with a full-bleed illustrated hero. It shows a **running drop number** (# 349) and the release date (11/20/2026) in small green mono, then the drop name and a **live DD:HH:MM:SS countdown**.
- Below the hero is the previous drop's PDP, embedded inline. It reads "🚨FRESH FRIDAY DROP🚨" and **"All sales are final. Limit 2 per order."**, and shows **Sold Out**.
- Then three cards: **Friday Drop Archive**, **Download and Play** (the Goorin Drops app) and **Join the Club** (signup).
- The same countdown repeats on the homepage (section 7) and as the first card in the DROPS mega menu.
- This is the **first live countdown in any teardown so far.** The README's pattern matrix had 0/11.

**Other drop and scarcity devices:**
- **Online Exclusives:** named capsules with their own pages.
- **Blind Box:** mystery packs with printed odds ("regular / rare / mystery edition").
- A **Drops app.** Product tags include `app_exclusive`, `limited_edition`, `badge_limited`, `limit_2` and `friday_drop`.
- Seasonal tags: FW25, FW26, SS26, SS27.

**Last Chance:** a nav item for end-of-run stock instead of a "Sale" item.

**Retention and trust:**
- **Email:** a Klaviyo popup appears after scrolling, plus a vertical **"LIMITED TIME 10%"** teaser tab on the right edge (desktop).
- **SMS:** Attentive.
- **Wishlist:** Swym.
- **Footer signup:** "SIGN UP FOR EXCLUSIVE UPDATES", a dark input with 12px radius and a round white arrow button.
- **Loyalty:** **none surfaced.** A visible 4★ review asks for a rewards program.
- **Guarantee and authenticity:** a 1-Year Guarantee on every PDP. A "Genuine Goorin" anti-counterfeit page.
- **Physical retail:** a store locator and a retail locations page. "USA Workshop" heritage storytelling with a factory film.

---

## 8. Footer

- **Background:** `#101820` with putty text. Column titles are TAY Lennon.
- **Link columns:**
  - **Sitemap:** Home, Truckers, Classics, Online Exclusives →.
  - **Support:** Customer Support, Genuine Goorin Page, Policies, Order Status, Returns + Exchanges, Cookie Settings, Withdraw Contract.
  - **Discover:** Download Goorin Drops App, Gift Cards, Store Locator, About Us, Size Guide →.
- **Signup column:** the email field described in §7.
- **Bottom bar:**
  - © line, a language selector and a country/currency selector. The currency selector covers ~64 markets with local currencies.
  - Then the **wordmark across the full page width**, ~245px tall at 1440.
- **Mobile:** the link columns collapse into accordions inside bordered boxes.

---

## 9. Third-party scripts (hosts seen)

| Category | Services |
|---|---|
| Email / SMS | Klaviyo (forms, tracking, **Reviews**), Attentive (`cdn.attn.tv`) |
| Payments / BNPL | Shop Pay (`shop.app`), Afterpay (PDP, cart), PayPal and Apple Pay via dynamic checkout |
| Returns | Loop Returns (theme extension) |
| Discounts | GovX ID (military, first responder, teacher) |
| Cart | Discos Smart BOGO cart upsell |
| Wishlist | Swym |
| Affiliates | Refersion |
| Analytics / CX | Google Tag Manager, Meta pixel, Google Ads, Lucky Orange (session replay), Lexer (CDP), first-party `mi.goorin.com` |
| Page building | LayoutHub, a design-packs app, ShareThis |
| Accessibility / support | Accessibly widget (bottom-left pill), a chat bubble (`support.goorin.io`) |
| Other | A product-quiz asset on S3, Avada |

About 30 distinct script hosts load on a PDP (510 resources on the desktop PDP).

---

## 10. Performance (directional, unthrottled)

| Page | Mobile LCP | Desktop LCP |
|---|---|---|
| Home | 0.77s | 1.52s |
| Collection (truckers) | 1.20s | 1.42s |
| PDP, trucker | 1.92s | 0.83s |
| PDP, flat cap | 1.83s | 1.14s |
| Friday Drop page | 0.96s | — |

---

## 11. What Shelby should take / avoid

**Take:**
1. **Shop by silhouette first.** Make the top shopping axis the hat's shape (e.g. snapback, low-profile, dad cap, trucker, beanie), shown as uniform product cut-outs in the menu and as filter chips. Story and collection names come second.
2. **A real fit guide for hats.** For each silhouette:
   - one sentence on how it sits;
   - a **crown height** and a **structure** scale;
   - one hat-size table in fractional size, inches and cm;
   - the **one-size range** stated plainly (Goorin: 6⅞–7⅝ / 55–61 cm).

   Link it from the size row on every PDP. For a one-size core cap this answers the main fit question without size buttons.
3. **One consistent studio angle set per hat:** front, ¾, side, back/closure, top and underside, plus one **macro of the defining detail** (patch, stitching, fabric). Use that macro as the card hover image.
4. **Each colorway as its own card, with the color name printed on it.** Write two-tone hats as "crown / mesh", using a small set of house color names.
5. **Keep material and origin facts separate from mood copy:** "Fabric … · Origin …". Tell the origin story where it's true.
6. **Make the drop a ritual.**
   - Run a numbered, regular drop with a **real countdown to a real release time** on the home page, the drop page and the nav.
   - Add an archive of past drops and a "join the list" signup.
   - State any per-order limit or final-sale terms on the PDP. This maps directly onto Shelby's release module and go/no-go checks.
7. **Use a "Last Chance" item for end-of-run stock** rather than a permanent "Sale".
8. **Use the free-shipping threshold to sell a second hat.**
   - At $40 a hat against a $75 threshold, the drawer's progress bar ("Spend $35 more…") is effectively a second-hat prompt.
   - Pair it with low-cost **attach items**: patches and pins at $5–15.
9. **Put the guarantee and BNPL at the decision point:** the BNPL line under the price and in the cart subtotal; a guarantee line directly under Add to cart.
10. **Add a pinned buy bar:** name, variant and a bag button on mobile; a floating mini card on desktop.
11. **Build the visual system from two neutrals.**
    - A warm putty page color matched to the studio backdrop, with a blue-black ink used for both text and dark bands. That gives a calm, continuous canvas for colorful hats.
    - One saturated accent reserved for campaign CTAs.
    - Square corners and 12px gutters.

**Avoid:**
1. **A homepage with no products or prices.** Shelby's core cap and price should be visible above the fold or one swipe below (earlier evidence in `successful-stores.md` and `SITE_SPEC.md`).
2. **Collection pages with no H1, description or product count**, just a breadcrumb band. They are weak for SEO and give no context.
3. **Four display and text families plus two unused web fonts.** TAY Lennon, Outfit (nav only), Red Hat Mono and Palatino all render, while Inter and Noto Sans load without being used. Use two families at most.
4. **Widget clutter:**
   - accessibility and chat bubbles overlapping the bottom-left of every page;
   - an off-brand blue review button;
   - a side discount tab, a popup and a cookie bar at once;
   - ~30 script hosts.
5. **Mood copy instead of fit facts.** Many descriptions are character prose, and 83 of the first 250 products are tagged as AI-written. Shelby's PDP copy should lead with crown height, structure, closure, brim and fabric.
6. **Low-contrast states.** The rose-tinted sold-out sizes and the muted grey variant text in the cart are hard to read on putty.
7. **Hiding final-sale terms inside the description.** If Shelby runs final-sale or limit-per-order drops, show those terms next to the CTA so they don't undercut the returns reassurance elsewhere.
8. **Character IP as the brand.** The animal patches are Goorin's identity. Shelby needs its own hero detail, not a copy.
