# Shelby storefront: site specification (v3, hats)

The single source of truth for building `web/`. Shelby is now a **hat brand**. This version replaces
the apparel spec (v2). Shelby has its own design: we studied other stores for patterns and
measurements, and copy none of their logos, imagery, words, product or colour names, or look.

Evidence is cited inline:

- **[MG]** the two live hat-store teardowns, Melin and Goorin Bros, in
  `docs/research/teardowns/melin.md` and `goorin.md`. "[MG 2/2]" means both do it.
- **[TD n/11]** the pattern matrix of 11 DTC apparel stores in `docs/research/teardowns/README.md`.
- **[UX §n]** graded evidence in `docs/research/ux-evidence.md`. It wins when it disagrees with a
  majority pattern.
- **[RR]** the research report `reports/Most successful ecommerce brands.md`.
- **[LP §n]** `docs/research/landing-page-learnings.md`. **[EP]** the product-drop playbook
  (`docs/playbook.md`). **[TL]** the social-content playbook (`docs/analytics.md`).

## 1. Project overview

| | |
|---|---|
| Brand | **SHELBY**, a small DTC hat brand. The name is pending a trademark check (see §11). |
| Tagline | "The core, always. Drops, often." (unchanged, shared with the app) |
| Model | One signature cap that is always in stock (**The Everyday Cap**, 4 core colours), a few more shapes, and small scheduled drops [EP] |
| Traffic | Mostly short-form social video landing on **mobile** web [UX §1] |
| Storefront stance [TL] | **"Every core colour, in stock. We show you the count."** Live per-colour stock on the home page and PDP is the proof. It passes the competitor-swap test: neither hat store studied shows live counts; Melin only appends "Low inventory" to its CTA [MG]. |
| Price position | $34–$52. The core cap is **$38**: at Goorin's core trucker level ($40) and well under Melin's $79–$99 [MG], inside the social-commerce sweet spot for hero products [RR]. |
| Why hats fit the data | One-size hats remove most of apparel's fit risk, the main driver of its ~23–25% online return rate [RR]. 184/188 of Goorin's sized products are one size [MG]. |
| Stack | Next.js 16 App Router (Cache Components, Partial Prefetching), Tailwind CSS 4, `@phosphor-icons/react`, `next/font/google`, Medusa v2 Store API (server-only via `src/lib/medusa.ts`), first-party analytics + Umami (`docs/analytics.md`), Stripe Payment Element |

**Performance budget [UX §2]:** server-rendered from a cached shell; live stock, cart and
countdowns stream in or hydrate as small islands. No video hero. Both hat stores carry 30–40+
third-party script hosts and a ~3.2s PDP LCP [MG]; Shelby keeps its lean first-party stack.

## 2. Design tokens

### 2.1 Color

Two neutrals carry the site, and the page **is** the photo backdrop, so studio shots of hats read as
cut-outs on the page [MG: Goorin shoots on a near-matching warm grey]. The canvas value is the
measured mean of the top background band of all 19 studio photos in `public/hats` (`#DBD7CF`),
rounded to `#DCD8D0`. One saturated accent marks live drops and countdowns only.

| Token | CSS variable | Hex | Use | Contrast |
|---|---|---|---|---|
| Page (canvas) | `--color-page` | `#DCD8D0` | Body, header, image wells | — |
| Paper | `--color-paper` | `#EFECE6` | Inputs, dialogs, cart summary, notify field | — |
| Surface | `--color-surface` | `#D2CDC3` | Bands (core, fit strip), tiles' hover, skeletons | — |
| Surface 2 | `--color-surface-2` | `#C6C0B5` | Pressed fills, skeleton pulse, disabled CTA | — |
| Ink | `--color-ink` | `#1C2023` | Text, primary CTA, dark bands, selected states | 11.5:1 on page |
| Ink muted | `--color-ink-muted` | `#545049` | Secondary text | 5.6:1 page, 5.1:1 surface |
| Ink faint | `--color-ink-faint` | `#8C867C` | Disabled, sold-out strike, input borders (not body text) | 3.1:1 on paper |
| Line | `--color-line` | `#BDB7AC` | Dividers, card rules | decorative |
| Accent ("blaze") | `--color-accent` | `#F2652A` | LIVE badge fill, countdown digits on ink, live dot | ink on accent 5.2:1; accent on ink 5.2:1 |
| Accent ink | `--color-accent-ink` | `#9A360C` | Accent-coloured small text on the canvas (drop dates) | 5.1:1 page |
| Accent soft | `--color-accent-soft` | `#F4C9B2` | Text selection | — |
| On ink, muted | `--color-ink-inverse-muted` | `#A9A398` | Secondary text on ink bands | 6.6:1 on ink |
| Stock OK | `--color-ok` | `#255A33` | "In stock" | 5.7:1 page |
| Stock low | `--color-low` | `#7A450B` | "Only N left" (honest counts only [UX §5]) | 5.5:1 page |
| Danger | `--color-danger` | `#9E2219` | Errors | 5.5:1 page |

Rules: the accent is never a CTA colour (both hat stores keep CTAs black/near-black [MG]; a
competing second CTA colour is an avoid [MG: Melin's blue "Buy it now"]). Accent fills always carry
**ink** text (white on accent is only 3.8:1). No gradients except the hero image scrim (none
needed with the split layout). Shadow only on overlays: `--shadow-overlay: 0 12px 40px
rgba(28,32,35,0.22)`.

### 2.2 Typography

Two families, both free on Google Fonts via `next/font`. **Substitution recorded:** v2 used three
(Archivo, Inter, IBM Plex Mono). Inter is dropped and Archivo now sets the UI too, so the site
meets the two-family rule (Goorin renders four families plus two unused ones; Melin mixes Avenir
with a system fallback: both are avoids [MG]).

| Role | Font | CSS var | Tailwind | Settings |
|---|---|---|---|---|
| Display | **Archivo** variable (`wdth` + `wght` axes) | `--font-archivo` | `font-display` | 800, `font-stretch: 72%`, uppercase |
| UI / body | **Archivo** (same file) | `--font-archivo` | `font-sans` (default) | 400 / 500 / 600 at normal width |
| Mono (proof) | **IBM Plex Mono** | `--font-plex-mono` | `font-mono` | 500. Prices, stock counts, drop times, countdown, eyebrows |

Type scale (mobile → desktop at 1024px):

| Name | Mobile | Desktop | Line-height | Tracking | Class |
|---|---|---|---|---|---|
| Hero display | 48px | 96px | 0.9 | -0.01em | `text-hero` |
| Section display | 30px | 52px | 0.95 | -0.005em | `text-section` |
| PDP title | 32px | 44px | 0.95 | 0 | `font-display text-[32px] lg:text-[44px]` (display, uppercase, like both hat stores' PDP titles [MG]) |
| Card title | 14px / 500 | 15px | 1.3 | 0 | `text-sm font-medium lg:text-[15px]` |
| Body | 15px | 16px | 1.55 | 0 | `text-[15px] lg:text-base` |
| Small | 13px | 13px | 1.45 | 0 | `text-[13px]` |
| Eyebrow / label | 11px mono, uppercase | 12px | 1.2 | 0.08em | `text-eyebrow` |
| Price | 14px mono (cards 13px) | 15px | 1.2 | 0 | `font-mono` |
| Button | 13px / 600, uppercase | 13px | 1 | 0.08em | in `Button` (uppercase CTAs [TD 8/11; MG 2/2]) |

### 2.3 Spacing, radius, layout

- Container `max-w-[1440px]`, gutters `px-4` / `md:px-6` / `lg:px-10` (Goorin 20/36/48px [MG]).
- Section rhythm `py-12` mobile, `lg:py-20`.
- Radius **2px** for buttons, inputs, badges, swatches (Melin 3px, Goorin 0 [MG]; ≤2px [TD 9/11]).
  Images and tiles 0. Card dots and the live dot are circles.
- Product grid: **2 columns mobile, 4 desktop** [MG 2/2; TD 8/10, 7/10] with **12px gutters**
  (`gap-x-3`, Goorin 12px [MG]) and `gap-y-8 lg:gap-y-10` for the text under images.
- Image ratio **4:5 portrait** (`aspect-[4/5]`, `object-cover`) on the page colour. Our photos are
  928×1152 (4:5). Melin uses 1:1, Goorin contains 1:1 inside a 4:5 frame [MG]; 4:5 matches [TD 8/11]
  and fills the frame on mobile.
- Tap targets ≥ 44px. Primary CTA 48px; the PDP add-to-bag is **52px** (Melin 52px [MG]).

### 2.4 Motion

- Colour and border transitions `150ms ease-out`; the card's second image cross-fades in `300ms`.
- The mobile pinned buy bar slides up in `200ms`. The countdown updates once a second without
  animation.
- No parallax, no auto-advancing carousels, no word-by-word headline reveals. Everything respects
  `prefers-reduced-motion`.

## 3. Global styles (`src/app/globals.css`)

- `@import "tailwindcss"` and the tokens in `@theme inline` (§4).
- `body { background: var(--color-page); color: var(--color-ink); font-family: var(--font-sans) }`,
  antialiased.
- `::selection { background: var(--color-accent-soft); color: var(--color-ink) }`.
- `:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px }`. On ink bands the
  outline uses `currentColor`.
- Utilities: `font-display`, `text-hero`, `text-section`, `text-eyebrow`, `scrollbar-none`,
  `tabular` (`font-variant-numeric: tabular-nums`) for the countdown and counts.
- Light only. `themeColor` `#DCD8D0`.

## 4. Tailwind config

Tailwind CSS 4 in CSS-first mode: every token lives in `@theme inline` in `globals.css`; there is no
`tailwind.config.ts`. Colour names: `page`, `paper`, `surface`, `surface-2`, `ink`, `ink-muted`,
`ink-faint`, `ink-inverse-muted`, `line`, `accent`, `accent-ink`, `accent-soft`, `ok`, `low`,
`danger`. Fonts: `font-sans` and `font-display` (both Archivo), `font-mono` (Plex Mono).

## 5. Button component (`src/components/ui/button.tsx`)

Base: `inline-flex items-center justify-center gap-2 rounded-[2px] font-sans text-[13px]
font-semibold uppercase tracking-[0.08em] transition-colors duration-150 select-none
whitespace-nowrap disabled:cursor-not-allowed`.

| Variant | Default | Hover | Active | Disabled |
|---|---|---|---|---|
| `primary` | `bg-ink text-page` | `bg-black` | `translate-y-px` | `bg-surface-2 text-ink-muted` |
| `secondary` | `border border-ink text-ink bg-transparent` | `bg-ink text-page` | `translate-y-px` | `border-line text-ink-faint` |
| `inverse` (on ink bands) | `bg-page text-ink` | `bg-paper` | `translate-y-px` | — |
| `ghost` | `text-ink underline underline-offset-4`, sentence case | `text-ink-muted` | — | `text-ink-faint` |

Sizes: `lg` `h-[52px] px-6` (PDP CTA), `md` `h-12 px-6`, `sm` `h-10 px-4`; `block` adds `w-full`.
`loading` keeps the width and shows a three-dot pulse.

## 6. Section-by-section spec

### 6.0 Global chrome

**Announcement bar** (`bg-ink text-page`, 32px, `text-eyebrow`, centred): the reassurance line from
`src/lib/policy.ts`, "Standard shipping $6 · 30-day returns" [TD 8/11; MG 2/2 state shipping or
returns here]. Static, not rotating (Melin rotates four messages; one honest line is enough).

**Header** (sticky [TD 11/11; MG 2/2], `bg-page`, bottom `border-line`; never transparent).
- **Desktop (64px):** left nav **Shop ▾ · Drops · Fit guide · Stories**; wordmark centred; bag right
  with count.
  - **Shop ▾** opens a full-width **shape menu** panel on hover, focus or click (shape-first
    navigation with product cut-outs [MG 2/2]): one tile per shape that has products (Caps,
    Truckers, Beanies, Bucket Hats), each a 4:5 cut-out photo on the page colour, the shape name and
    "N styles · from $X", plus "Shop all hats →" and "Fit guide →". Escape and outside clicks close it.
  - **Drops** shows an accent dot when a drop is live.
- **Mobile (56px + 40px):** row 1 is wordmark centred and bag right. Row 2 is a horizontally
  scrollable row of **visible links**: All hats · Caps · Truckers · Beanies · Bucket hats · Drops ·
  Fit guide. Visible links instead of a hamburger keep discoverability [UX §3, NN/g 57% vs 86%].
  Shapes with no products are left out.
- Bag count reads per request inside `<Suspense>`.

**Footer** (`bg-ink text-page`, `py-16`): wordmark, tagline, policy line, then columns **Shop**
(each shape, Drops, All hats), **Help** (Fit guide, Shipping & returns, Your bag), **Shelby** (the
active content series story). "© Shelby". Mobile stacks the columns (no accordions needed for
three short lists).

### 6.1 Home `/`

Products and prices are visible above the fold on mobile. Both hat stores fail this (Goorin's home
has no product or price at all; Melin's hero text is baked into the image and the page has no H1)
[MG avoids].

1. **Hero** (`#hero`). Data: the core product (The Everyday Cap).
   - Mobile: the lifestyle photo `/hats/lifestyle-hero-mobile.jpg` at `aspect-square`,
     `object-position: 50% 75%`, then on the canvas: eyebrow `THE CORE · ALWAYS IN STOCK`, H1 =
     product title in `text-hero`, promise (`metadata.promise`), a price row (`$38` mono + "One size ·
     4 colours"), CTA primary **"Shop the Everyday Cap"** (`hero_shop_core`) and ghost **"All hats"**.
     At 390×844 the H1, price and CTA sit above the fold.
   - Desktop: a 5/7 split. Copy on the left, `/hats/lifestyle-hero.jpg` (16:9 source) on the right at
     `aspect-[16/11]`, `object-cover`.
   - When a drop is live, a second CTA **"Shop the drop"** (`hero_shop_drop`) appears and the
     eyebrow adds "· [Drop] is live".
   - The text is live DOM text (an H1), never baked into the image [MG avoid].
2. **Shop by shape** (`#shapes`). Section display "Shop by shape". A 2×2 (mobile) / 4-up (desktop)
   grid of **shape tiles** [MG 2/2]: each tile is the shape's lead product photo (first colour's
   first image) at 4:5 on the canvas, the shape name in display type, and "N styles · from $X" in
   mono. Links to `/shop?shape=<handle>` (`data-track="shape_tile"`). When there is an upcoming
   drop, the last tile is **"Next drop"**: the release's image, title and date, linking to the drop.
3. **The core: proof band** (`#core`, `bg-surface`). The [TL] stance and its proof.
   - Eyebrow "The core". Section display **"Every colour. In stock."** Body "The cap we never let run
     out. Here's today's count."
   - Left: the product image for the selected colour (4:5) linking to the PDP (`core_product`).
   - Right: one row per colour: an image swatch (40px), the colour name, and the **live count**
     in mono with a status dot ("● 220 in stock"; low: "Only 3 left"; sold out: "Restocking").
     Then "One size · fits 21.5–23.75 in (55–60 cm)" with a **Fit guide** link, the price and a
     primary **"Shop the Everyday Cap"**.
   - Counts stream in `<Suspense>` with a skeleton. Small print: "Counts are live sellable stock."
4. **Drops** (`#drops`, `bg-ink text-page`).
   - **Live now:** the live release's image (4:5), `LIVE NOW` accent badge, title (display),
     promise, and "Shop the drop" (`inverse` button, `hero_shop_drop`).
   - **Next drop countdown:** the soonest upcoming release with a real `release_at`: title, the
     absolute time ("Fri Nov 21 · 9:00 AM PST") and a **live DD : HH : MM : SS countdown** in accent
     mono digits with DAYS / HRS / MIN / SEC labels, plus the Notify me form (`notify_me`).
     - Goorin runs a weekly countdown [MG 1/2]; 0/11 apparel stores do [TD]. Shelby shows one only
       because the time is real: it counts to the release module's `release_at`. No evergreen or
       resetting timers [UX §6]. At zero it reads "Going live shortly" (a held release stays
       upcoming until it passes its go/no-go checks [EP]).
   - **Coming up:** any further upcoming releases as compact rows (date in accent, title, link).
   - Hidden entirely when there are no live or upcoming releases.
5. **The series** (`#series`). Driven by `/store/content-series`. Image `/hats/story-crush.jpg`
   (4:5), the series title as eyebrow, the stance as a large quote, the proof line, "See the full
   test →" (`series_story`) to `/stories/[handle]`, the episode list and the "Your turn" card with
   the participation prompt [TL]. Hidden when no series is active.
6. **Fit promise strip** (`bg-surface`, 4 items with Phosphor icons): "One size, adjustable: fits
   21.5–23.75 in" · "Sized styles in S/M and L/XL" · "30-day returns" · "Not sure? Read the fit
   guide →". Fit help at the decision point is a constant of both hat stores [MG 2/2].

### 6.2 Product card (`src/components/product-card.tsx`)

- 4:5 image on the page colour. The **first colour's** photos lead; on desktop hover the same
  colour's second photo cross-fades in [TD 6/9; MG 2/2].
- Badge top-left [TD 8/10; MG: Melin]: `CORE` (ink outline), `LIMITED` (accent fill, ink text) for a
  live drop's product, `LOW STOCK` (paper fill, `low` text) when every in-stock variant has ≤5 left,
  `FROM <DROP>` (muted) for past drops.
- Below: title and price on one row; then the **colour row**: up to 4 colour dots (10px circles
  from `SWATCH_HEX`; two-tone names like "Bone / Brown" render as split dots) and the first colour's
  name, plus "+N" when there are more colours [TD 4/10 swatches on cards].
- Sized products (more than one size) keep the **size strip** (S/M · L/XL, struck through when sold
  out) [UX §5]. One-size products skip it.
- No quick add on cards (catalog is small [UX §7]); the cart offers a second hat instead (§6.7).

### 6.3 Shop `/shop`

- **H1** = "All hats" or the shape name ("Caps"), a one-sentence shape description, and the
  **product count** [TD 7/10]. Goorin's collection has no H1, description or count [MG avoid].
- **Shape chips** (links, `?shape=<category handle>`): All · Caps · Truckers · Beanies · Bucket Hats,
  the active chip filled ink [MG: Melin's style pills].
- **Filters:** Colour and Size (multi-select, `?color=&size=`); size matches only sizes **in stock**
  [UX §5, §7]. Mobile: behind a "Filter" button in a bottom drawer [TD 10/10]; desktop: inline
  chips.
- Grid order: core first, then the live drop, then others.
- Empty state: "Nothing matches those filters right now." with a link back to All hats.

### 6.4 Product page `/products/[handle]`

Order follows the shared skeleton [TD 11/11; MG 2/2]: gallery, title/price, colour, size, CTA,
reassurance, details.

1. **Gallery** driven by the selected colour (Medusa variant images; the shared
   `SelectionProvider`). Mobile: full-width 4:5 swipe with dots [TD 11/11]; desktop: 2-column grid at
   7/12 width [MG 2/2: both use a 2-column grid]. Changing colour resets to photo 1.
2. **Badge row:** `CORE` or `LIMITED · <drop title>` (accent).
3. **Title** (display, uppercase) and **price** (mono 15px). Under it, the shape and fit in muted text:
   "Caps · One size" or "Caps · Sized".
4. **Promise** (`metadata.promise`) as one italic line. Mood copy stays short; fit facts lead
   [MG avoid: character prose instead of fit facts].
5. **Colour.** Label "Colour" (core products: "Core colours"; drop products: "Limited") with the
   selected name right-aligned, then **image swatches**: 48px squares cropped from each colour's
   first photo, 2px ink ring when selected [MG: Goorin's image swatches]. Selecting a colour swaps
   the gallery and writes `?color=` to the URL (`history.replaceState`), so every colour has a
   shareable, attributable URL [TD 9/11; MG 2/2 colourway URLs]. The page honours `?color=` on load.
6. **Size.**
   - **One-size** products show no size buttons: a line "**One size** · fits 21.5–23.75 in (55–60 cm)"
     (the range is read from `metadata.fit_notes` when it states one, e.g. the trucker's 21.5–24 in;
     otherwise the store-wide range) and a **Fit guide** link to `/fit-guide#<handle>` [MG: Goorin's
     single "One Size", Melin's guide link].
   - **Sized** products show S/M and L/XL buttons (grid, 48px) with low-stock counts under the
     size, struck-through sold-out sizes, a **Size chart** dialog (`metadata.size_chart`) and the
     Fit guide link on the same row [TD 10/11].
7. **Stock line** (live): "● In stock · Ships in 1–2 business days" / "● Only N left in L/XL" /
   "Sold out in …". Drop products add the limited-run line **next to the CTA**: "Limited run.
   Restocked only if it sells through." Terms are never buried in the description [MG avoid].
8. **CTA** (`lg`, 52px, block): "Select a size" until a size is chosen (sized products only), then
   "Add to bag · $38". After adding: "Added. View bag →".
9. **Reassurance directly under the CTA** [TD 10/11; MG 2/2]: shipping and returns lines with
   icons (`POLICY`).
10. **Fit profile** (when `metadata.fit_profile` exists): two 3-step scales, **Crown height** (Low ·
    Mid · Tall) and **Structure** (Unstructured · Semi · Structured), the active step filled ink
    [MG: Goorin's crown/structure scales, Melin's depth bars].
11. **Accordions** [TD 10/11]: **Details**, open by default (description, then a spec list from
    `metadata.details` in a fixed order: Crown, Brim, Closure, Fabric, Care, kept separate from mood
    copy [MG]), **Fit** (fit notes and a fit-guide link), **Shipping & returns**.
12. **Complete the look** [TD 8/11]: up to 4 other hats, preferring other shapes.
13. **Pinned buy bar** on mobile once the CTA scrolls away [TD 7/11; MG 2/2].

Events: `product_viewed`, `add_to_cart` (with `release_id`).

### 6.5 Fit guide `/fit-guide`

Both hat stores run a dedicated fit page linked from every PDP [MG 2/2]. Ours is data-driven from
published products.

1. H1 "Fit guide" and the plain statement: "Most Shelby hats are one size. The adjustable strap or
   snap fits heads from 21.5 to 23.75 in (55–60 cm). Sized styles come in S/M and L/XL."
2. **How to measure** (3 numbered steps): wrap a soft tape around your head just above the ears and
   about a finger above the eyebrows; read where it meets; between sizes, size up.
3. **Size table** (one table for the site [MG: Goorin]): Size · Inches · Centimetres · Fitted size —
   One size (adjustable) 21.5–23.75 / 55–60 / 6⅞–7½; S/M 21.5–22.5 / 55–57 / 6⅞–7⅛; L/XL
   22.75–23.75 / 58–60 / 7¼–7½.
4. **By style:** one card per published product with a `fit_profile` (anchor `#<handle>`): photo, name,
   shape, the fit note, the crown-height and structure scales, the size line, and "Shop the …".
   Beanies get a one-line note (stretch knit, one size).

### 6.6 Drops `/drops` and `/drops/[handle]`

- `/drops`: H1 "Drops", "Small releases, on a calendar. The core never leaves." Live now (large
  card, accent badge), **Next drop countdown** (same component as home), Coming up rows, Past drops.
- `/drops/[handle]`: hero (image, phase badge, title, story, promise, "What to look for" proof
  card). Upcoming drops show the countdown and Notify me; live drops a product grid with stock;
  past drops "This drop has ended" and any products still on sale. Event `drop_viewed`.

### 6.7 Bag `/cart`

- Lines: 4:5 thumbnail, title, "Colour / Size", quantity stepper (44px targets), remove.
- Summary (`bg-paper`): subtotal, "Shipping is chosen at checkout: standard $6 · express $15", the
  returns line, **Checkout** (`cart_checkout`), "Guest checkout. No account needed." [UX §8].
- **Complete the look:** up to 2 hats not in the bag, other shapes first. One-size hats get an
  inline **"Add · $34"** button (adds the first in-stock colour; `cart_complete_look`); sized hats
  link to the PDP ("Choose size"). Both hat stores push a second item in the cart [MG 2/2: Melin's
  "Complete Your Kit", Goorin's free-shipping bar]. Shelby has no accessories yet, so the second
  item is a hat.
- Empty: "Your bag is empty." with "Shop the Everyday Cap".

### 6.8 Checkout `/checkout` and confirmation `/order/[id]`

Unchanged from v2: one page, three numbered sections that unlock in order, ~9 fields, total visible
at every step [UX §8], Stripe Payment Element (cards, Apple Pay, Google Pay where available),
payment captured at checkout. Inputs sit on `bg-paper` with `ink-faint` borders.

### 6.9 Story pages `/stories/[handle]`

The landing page for cold social traffic [LP §2, §5]. Same modules as v2 (hook, problem, stance,
proof, offer with a working buy box, participation, closing action), restyled with the v3 tokens.
The hook image is `/hats/story-crush.jpg`; CTAs say "Shop the Everyday Cap" / "Get the Everyday
Cap". The offer's image follows the colour picked in its buy box (no URL change on this page). A
headline longer than 80 characters (the stance variant) steps down a size. The `story-headline` experiment and every `data-track` stay as they are (§10).

## 7. Assets

- Product photos: Medusa product and variant images. The demo set in `public/hats/` is
  AI-generated, carries no marks, and is replaced by real photography uploaded in the admin.
  - Gap vs both hat stores: they shoot a fixed 6-angle set per colour plus a macro of the defining
    detail [MG 2/2]. Ours has 1–3 per colour. Before launch, shoot front, ¾, side, back/closure,
    underside, and one macro (stitching/strap) per colour, and use the macro as the hover image.
- Lifestyle: `lifestyle-hero.jpg` (16:9), `lifestyle-hero-mobile.jpg`, `lifestyle-corduroy.jpg`,
  `lifestyle-bucket.jpg`, `story-crush.jpg` (4:5).
- Logo: the text wordmark in the display face. No image logo.
- Missing image: a `bg-surface` 4:5 block with the product title in muted mono.
- `SWATCH_HEX` in `src/lib/swatches.ts` maps colour names to dot colours; unknown names fall back to
  `ink-faint`.

## 8. Third-party integrations

- **First-party analytics** (`src/lib/analytics.ts`, `/api/e`): events, funnels, experiments.
- **Umami** script when `NEXT_PUBLIC_UMAMI_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` are set.
- **Stripe** Payment Element when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set.
- Nothing else. Reviews, BNPL, SMS and loyalty are open questions (§11), not script tags.

## 9. Build instructions

```bash
cd web
cp .env.example .env.local   # MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, NEXT_PUBLIC_*
npm install
npm run dev                  # http://localhost:3000
npm run build
```

- Node 22; Next 16 Cache Components rules apply: await `params` / `searchParams` / `cookies()`
  only inside `<Suspense>`; catalog reads use `"use cache"` + `cacheLife("minutes")`; stock, cart
  and the countdown are per request / client.
- Products need `*categories` and `*variants.images` in the Store API `fields`.
- Demo photos are absolute URLs to this site's `/hats/` folder; `next.config.ts` allows that path.

## 10. Landing pages, continuity and testing

Unchanged from v2 (story pages, continuity banner, experiments). Tracked CTAs:

- `hero_shop_core`, `hero_shop_drop`, `shape_tile`, `nav_shape`, `core_product`, `fit_guide`
- `notify_me`, `add_to_cart`, `sticky_add_to_cart`, `cart_complete_look`
- `cart_checkout`, `checkout_details`, `place_order`
- `story_shop`, `story_see_proof`, `story_close_cta`, `story_episode`, `series_story`,
  `continuity_story`

Experiment `story-headline` (control: the viewer's question; variant `stance`) judged on the purchase
funnel, no verdict before 100 exposures per variant.

## 11. Open questions (business decisions, not built)

1. **Brand name.** "SHELBY" on hats overlaps Carroll Shelby Licensing's marks on apparel and
   headwear. Run a trademark search before any embroidery.
2. **Free-shipping threshold.** Both hat stores set it above one hat's price ($75 vs a $40 hat; $120
   vs $79–99) and show a progress bar in the cart [MG 2/2]. Shelby charges a flat $6. A threshold of
   about two hats (e.g. $75) would make the cart's second-hat prompt stronger. Needs a margin check;
   then a Medusa shipping-option price rule on `item_total` and a cart progress bar.
3. **Guarantee and exchanges.** Both stores put a guarantee or fit promise under the CTA [MG 2/2]
   (Goorin "1-Year Guarantee", Melin "Perfect Fit Promise" + free exchanges). Shelby only claims what
   `policy.ts` states: 30-day returns.
4. **BNPL.** 7/11 apparel stores and both hat stores show it [TD; MG]. Stripe can offer Klarna or
   Afterpay in the Payment Element if enabled on the account.
5. **Reviews with a fit slider** (Melin) once there are real reviews. Never seeded or invented.
6. **Accessories** ($5–49 patches, pins, cases [MG 2/2]) to raise order value without a second hat.
7. **Photography** to the full angle set (§7).
