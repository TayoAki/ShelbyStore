# Shelby storefront: site specification

The single source of truth for building `web/`. Shelby has its own design. It isn't a clone of
any brand. The research behind each decision is cited inline:

- **[TD n/11]** counts patterns across the live teardowns of 11 top DTC apparel stores in
  `docs/research/teardowns/README.md`.
- **[UX §n]** points to graded evidence in `docs/research/ux-evidence.md`. The UX evidence wins when
  it disagrees with the majority pattern.
- **[EP]** is the Elwood product-drop playbook (`docs/playbook.md`). **[TL]** is the Tuan Le
  social-content playbook (stance, proof, participation; see `docs/analytics.md`).

## 1. Project overview

| | |
|---|---|
| Brand | **SHELBY**, a small DTC apparel brand |
| Tagline | "The core, always. Drops, often." (shared with the app) |
| Model | A signature core tee that is always in stock, plus small, scheduled drops [EP] |
| Traffic | Mostly short-form social video landing on **mobile** web (69.9% of traffic is mobile) [UX §1] |
| Storefront stance [TL] | **"Every core size, in stock. We show you the count."** The live stock count per size is the on-site proof. It passes the competitor-swap test: the store sites studied don't show live per-size counts on their core tee. |
| Stack | Next.js 16 App Router (Cache Components, Partial Prefetching), Tailwind CSS 4, `@phosphor-icons/react`, `next/font/google`, Medusa v2 Store API (server-only through `src/lib/medusa.ts`), Umami + PostHog (`docs/analytics.md`) |

**Performance budget [UX §2]:** pages render on the server from a cached shell. Live stock and cart
stream in. There's no video hero (video heroes were the slowest in the teardowns: home LCP
4.4–4.7s [TD]). Client JS stays limited to interactive islands: gallery, size picker, forms,
analytics.

## 2. Design tokens

### 2.1 Color

A white page plus one warm neutral surface [TD 11/11]. Text is a softened near-black [TD], and so
is the CTA [TD 7/11 (+2)]. There's one accent, used **only for drop moments**, so it keeps its
meaning (the app uses the same rule).

| Token | CSS variable | Hex | Use |
|---|---|---|---|
| Page | `--color-page` | `#FFFFFF` | Body background |
| Surface | `--color-surface` | `#F6F3EE` | Image backgrounds, cards, the core band, the footer |
| Surface 2 | `--color-surface-2` | `#ECE7DF` | Hover/pressed fills, skeletons |
| Ink | `--color-ink` | `#1A1917` | Text, primary CTA, active size button |
| Ink muted | `--color-ink-muted` | `#6B665E` | Secondary text (5.6:1 on white, 5.1:1 on surface) |
| Ink faint | `--color-ink-faint` | `#A29C92` | Disabled text, sold-out sizes |
| Line | `--color-line` | `#E4DED4` | Borders, dividers, inputs |
| Accent | `--color-accent` | `#B4532A` | LIVE badges, release dates, drop eyebrows (4.9:1 on white) |
| Accent soft | `--color-accent-soft` | `#F3E2D8` | Accent badge background |
| Stock OK | `--color-ok` | `#2F6B3F` | "In stock" dot and text |
| Stock low | `--color-low` | `#9A5B13` | "Only N left" (an honest count, never faked [UX §5]) |
| Danger | `--color-danger` | `#A3271F` | Errors |

No gradients. Shadows only on overlays: `--shadow-overlay: 0 12px 40px rgba(26,25,23,0.18)`.

### 2.2 Typography

Every site studied uses a sans for UI [TD 11/11]. Brand personality comes from **one display face**
[TD]. Shelby uses a heavy condensed display (the streetwear/drop register shared by 4/11 sites,
including Elwood) and **mono** for proof numbers, such as stock counts and drop times. That gives
the stance its look.

| Role | Font (Google, via `next/font`) | CSS var | Tailwind | Weights |
|---|---|---|---|---|
| Display | **Archivo** (variable, `wdth` axis), uppercase, `font-stretch: 72%` | `--font-archivo` | `font-display` | 800 |
| UI / body | **Inter** (variable) | `--font-inter` | `font-sans` (default) | 400, 500, 600 |
| Mono (proof) | **IBM Plex Mono** | `--font-plex-mono` | `font-mono` | 500 |

All fonts use `display: swap` and the latin subset.

Type scale. Mobile body is 15px, within the 12–15px range used by 8/10 measured sites [TD].

| Name | Mobile | Desktop (≥1024) | Line-height | Tracking | Class |
|---|---|---|---|---|---|
| Hero display | 52px | 104px | 0.9 | -0.01em | `text-hero` |
| Section display | 32px | 56px | 0.95 | -0.005em | `text-section` |
| Product title (PDP) | 24px | 30px | 1.15 | -0.01em | `text-2xl lg:text-3xl font-semibold` |
| Card title | 14px | 15px | 1.35 | 0 | `text-sm font-medium` |
| Body | 15px | 16px | 1.55 | 0 | `text-[15px] lg:text-base` |
| Small | 13px | 13px | 1.45 | 0 | `text-[13px]` |
| Eyebrow / label | 11px mono, uppercase | 12px | 1.2 | 0.08em | `text-eyebrow` |
| Button | 13px, uppercase, 600 | 13px | 1 | 0.08em | in `Button` |

Uppercase CTA labels follow [TD 8/11].

### 2.3 Spacing, radius, layout

- Container: `max-w-[1440px]`, gutters `px-4` (16px) on mobile, `md:px-6`, `lg:px-10`.
- Section rhythm: `py-12` on mobile, `lg:py-24`.
- Radius: `--radius-sm: 2px` for buttons, inputs, size buttons and badges [TD 9/11 ≤2px]. Images
  are square-cornered (radius 0).
- Product grid: **2 columns on mobile, 4 on desktop** [TD 8/10, 7/10]. Gaps are `gap-x-3 gap-y-8` on
  mobile and `lg:gap-x-5 lg:gap-y-10` on desktop.
- Image ratio: **4:5 portrait** [TD 8/11], set with `aspect-[4/5]` and `object-cover` on
  `bg-surface`.
- Tap targets are at least 44×44px. The primary CTA is **48px** tall (the median of 38–54 is
  about 46 [TD]).

### 2.4 Motion

- Color and border transitions are `150ms ease-out`. The card's second image cross-fades in
  `300ms`.
- The mobile pinned buy bar slides up in `200ms`.
- There's no parallax and no auto-advancing carousels. All motion is disabled under
  `prefers-reduced-motion`.

## 3. Global styles

`src/app/globals.css` holds the Tailwind 4 `@import "tailwindcss"`, the tokens above in
`@theme inline`, and these rules:

- `body { background: var(--color-page); color: var(--color-ink) }` with the Inter stack and
  `-webkit-font-smoothing: antialiased`.
- `::selection { background: var(--color-accent-soft); color: var(--color-ink) }`.
- `:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px }` everywhere.
- Utilities: `text-hero`, `text-section`, `text-eyebrow`, `font-display` (Archivo 800,
  uppercase, `font-stretch: 72%`), and `scrollbar-none`.
- Light mode only. The brand is light and editorial, the same as the app.

## 4. Tailwind config

This is Tailwind CSS 4 in CSS-first mode. All tokens are defined in `@theme inline` in
`globals.css`. The skill also asks for a `tailwind.config.ts`, but that only applies to Tailwind 3
and isn't used here. Token names: `page`, `surface`, `surface-2`, `ink`, `ink-muted`, `ink-faint`,
`line`, `accent`, `accent-soft`, `ok`, `low`, `danger`. Fonts are `font-sans`, `font-display` and
`font-mono`.

## 5. Button component (`src/components/ui/button.tsx`)

Base classes: `inline-flex items-center justify-center gap-2 rounded-[2px] font-sans text-[13px]
font-semibold uppercase tracking-[0.08em] transition-colors duration-150 disabled:cursor-not-allowed`.

| Variant | Default | Hover | Active | Disabled |
|---|---|---|---|---|
| `primary` | `bg-ink text-white` | `bg-black` | `translate-y-px` | `bg-surface-2 text-ink-faint` |
| `secondary` | `border border-ink text-ink bg-transparent` | `bg-ink text-white` | `translate-y-px` | `border-line text-ink-faint` |
| `ghost` | `text-ink underline underline-offset-4` | `text-ink-muted` | — | `text-ink-faint` |

Sizes: `md` is `h-12 px-6` (48px), `sm` is `h-10 px-4`, and `block` adds `w-full`. A `loading` state
keeps the width and shows a three-dot pulse.

## 6. Section-by-section spec

### 6.0 Global chrome (all pages)

**Announcement bar** (`bg-ink text-white`, 32px tall, 12px mono uppercase, centered). This is the
reassurance promise, not a promotion [TD 8/11 state shipping or returns here]. The copy comes
from `src/lib/policy.ts`: "Standard shipping $6 · 30-day returns". **Confirm the policy before
launch.** No free-shipping threshold is configured in Medusa, so none is claimed.

**Header.** Sticky on every page [TD 11/11], solid white with a bottom `border-line`. It isn't
transparent over the hero; solid gives safer contrast and is the skill's default.
- Mobile, row 1 (56px): the bag sits on the right with its item count. The **SHELBY** wordmark
  (display, 22px) is centered [TD 10/11]. The left slot is empty.
- Mobile, row 2 (40px, scrollable): **visible links** Core · Drops · Shop. There are only three
  destinations, and hidden navigation cuts discoverability by more than 20% on mobile (57% vs 86%
  usage) [UX §3, NN/g]. This deliberately departs from the hamburger used by most sites.
- Desktop (64px): links on the left (Core, Drops, Shop), wordmark centered, bag on the right. The
  Drops link shows a small accent dot when a drop is live.
- The bag count is read per request inside `<Suspense>`.

**Footer** (`bg-surface`, `py-16`): the wordmark, the tagline, and three link columns (Shop: Core,
Drops, All; Help: Shipping & returns, Contact; Shelby: The 30-Wash Test). It also carries the
policy line and "© Shelby".

### 6.1 Home `/`

Order and purpose:

1. **Drop hero.** Full-bleed. The image is the live drop's `hero_image` on `bg-surface`: 4:5 on
   mobile, a 50/50 split at 1440 on desktop with copy on the left.
   - Eyebrow: accent `● LIVE NOW` mono badge.
   - Title: the release title in display `text-hero`.
   - Promise: `product_promise` as body text.
   - CTA: primary "Shop the drop" → `/drops/[handle]`.
   - With no live drop, the hero falls back to the core tee: eyebrow "THE CORE", title "THE
     EVERYDAY TEE", CTA "Shop the core".
   - A campaign hero rather than a sale [TD 7/11]. No video [UX §2].
2. **The core: proof band** (`bg-surface`). This section carries the [TL] stance and its proof.
   - Eyebrow "THE CORE". Section display "EVERY SIZE. IN STOCK." Body "The tee we never let run
     out. Here's today's count."
   - Proof: a row of size tiles. Each shows the size and its **live count** in mono ("M · 140"),
     with an OK dot. A low size shows "Only N left" in `low`. A sold-out size shows "Restocking"
     in muted text.
   - Per color, each core product is a card linking to its PDP.
   - Live stock streams in `<Suspense>` with a skeleton.
3. **Drop calendar.** Section display "NEXT DROPS". It lists upcoming releases in date order.
   Each row shows:
   - The thumbnail (4:5, 96px).
   - Title and tier ("New silhouette" or "New colour").
   - Release time in **mono accent**: "THU NOV 20 · 9:00 AM PT", plus a coarse relative time ("in
     5 days").
   - The promise, and a **Notify me** inline email form (`notify_me_submitted`).
   - No ticking countdown. 0/11 sites show one, and the evidence says timers only work as honest
     release-time information [TD; UX §6]. A held release shows "Date coming soon".
4. **The series: participation [TL].** Driven by `/store/content-series`.
   - Eyebrow `THE 30-WASH TEST` (the series title).
   - The stance as a large quote, the proof line, and "Watch the series" linking to episodes
     (`post_url` when set).
   - A "Your turn" card holding the `participation_prompt`.
   - Hidden when no series is active.
5. **Recently dropped.** A 2/4-column grid of products from past releases that are still on
   sale, each with a "From [drop]" badge.

### 6.2 Product card (`src/components/product-card.tsx`)

- 4:5 image on `bg-surface`. On desktop, the second image cross-fades in on hover [TD 6/9].
- A status badge sits top-left [TD 8/10]: `CORE` (ink outline), `LIVE DROP` (accent),
  `LAST DROP` (muted).
- Below the image: title (14px, medium), price, and a **size strip**. Each size shows its
  availability, with sold-out sizes struck through in `ink-faint`. Shoppers learn about sold-out
  sizes too late on 39% of sites [UX §5]. This is uncommon among the studied sites, but the
  evidence supports it.
- No quick add. Baymard cautions against add-to-cart on list items, and the catalog is small
  [UX §7].

### 6.3 Shop `/shop`

- Title "SHOP" (section display) and a product count [TD 7/10].
- Filters: **Size** and **Color**, multi-select [UX §7]. On mobile they sit behind a "Filter"
  button that opens a bottom drawer [TD 10/10]. On desktop they're an inline chip row.
  - The URL carries `?size=M&color=Black`.
  - The size filter matches products with **that size in stock**, because availability is what
    shoppers filter for [UX §5].
- Grid: the core first, then the live drop, then past drops.

### 6.4 Product page `/products/[handle]`

The mobile skeleton follows the 11/11 consensus [TD]: gallery, title and price, color, size, CTA,
reassurance, accordions.

1. **Gallery.**
   - Mobile: a full-width horizontal scroll-snap gallery at 4:5, with dots [TD 11/11; UX §4 56% of
     shoppers look at images first].
   - Desktop: a two-column image grid on the left (7/12 width) [TD 6/11]. The info column is
     sticky at `top-28`.
   - If `metadata.video_url` exists, it goes in slot 2 as a muted, looping, `playsInline` video
     (+14.5% apparel sales [UX §4]).
2. **Badge row**: `CORE` or `FROM THE DROP: <title>` (accent).
3. **Title** and **price**.
4. **Promise** (`metadata.promise`) as an italic quote line.
5. **Color.** Swatch buttons labeled by name. The heading says "Core colours" or "Limited" [TD
   5/6 core-plus-limited brands split these]. A drop product is "Limited".
6. **Size.**
   - The row header pairs "Size" with a **"Size guide"** link on the same row [TD 10/11]. It opens
     a dialog with the fit notes, `metadata.model_info`, and a measurements table from
     `metadata.size_chart` when present.
   - **Size buttons in a grid** [TD 10/11; UX §4 57% of sites lack them]. Low stock shows a
     small `N left` under the size. Sold-out sizes are struck through and disabled.
   - Model info appears as one caption line under the sizes when present [TD 5/11; UX §4 42%
     judge size from images].
7. **Stock line** after a size is picked. Live, from request-time stock.
   - "● In stock · Ships in 1–2 business days"
   - "● Only 3 left in L" (low), or "Sold out in L".
   - Drops add "Limited run. Restocked only if it sells through." Scarcity copy is for drops only
     [UX §5 ASU].
8. **CTA.** Primary, block, 48px.
   - The label reads **"Select a size"** (disabled) until a size is chosen [TD 6/11], then "Add
     to bag · $32".
   - After adding: an inline confirmation ("Added. View bag →") and the header count updates.
9. **Reassurance** directly under the CTA, as two lines with icons [TD 10/11; UX §4 60% and 67%]:
   - "Standard shipping $6 · Express $15"
   - "30-day returns"
10. **Pinned buy bar** on mobile. It appears when the main CTA scrolls out of view [TD 7/11] and
    shows the title, the selected size (or "Select size") and the CTA. The evidence is mixed
    [UX §4], so it sits behind the PostHog flag `pdp-sticky-atc`, default **on**.
11. **Accordions** [TD 10/11]: Details (description), Fit (fit notes and model info), Shipping &
    returns. "Fit" starts open.
12. **"Pairs with"** [TD 8/11]: up to 4 other products as product cards.

Events: `product_viewed` on mount and `add_to_cart` on success, both carrying `release_id` and
`asset`.

### 6.5 Drops `/drops`

- Title "DROPS". Body: "Small releases, on a calendar. The core never leaves."
- Sections: **Live now** (a large card), **Coming up** (the same rows as the home calendar) and
  **Past** (a grid with "Ended <date>").

### 6.6 Drop page `/drops/[handle]`

A campaign block per release [TD 6/11].

- Hero: the image, a phase badge (`LIVE NOW` accent, or `DROPS THU NOV 20 · 9:00 AM PT`), the title
  in display type, the story, the promise as a quote, and a **"What to look for"** card showing
  the proof.
- Live: a product grid with stock. Upcoming: a teaser grid (thumbnails, not purchasable) and
  Notify me. Past: "This drop has ended", plus any products still available.
- Event: `drop_viewed`.

### 6.7 Bag `/cart`

- Lines: a 4:5 thumbnail, title, variant, a quantity stepper (44px targets) and remove.
- Summary: subtotal, "Shipping calculated at checkout: $6 standard", the policy line, and the
  primary **"Checkout"** button. Guest is the default; no account wall [UX §8, 18% abandon over
  forced accounts].
- Empty state: "Your bag is empty" with "Shop the core".

### 6.8 Checkout `/checkout`

One page with three numbered sections that unlock in order [UX §8]. It has about 9 visible
fields against an ideal of 12–14 (the average is 23.48).

1. **Contact & delivery:** email, first and last name, address, apartment (optional), city,
   state, ZIP. US only. `autocomplete` attributes on every field.
2. **Delivery:** shipping option radios with prices.
3. **Payment:** a test-provider notice (until Stripe), and "Place order · $total".

The order summary is always visible, with the **total shown at every step** (12% abandon when
they can't see it) [UX §8]. Event: `checkout_started`.

### 6.9 Order confirmation `/order/[id]`

"Thanks. Your order is in." Shows the order number, items, total and shipping address, then
"Keep shopping".

## 7. Assets

- Product and drop images come from Medusa (`thumbnail`, `images`, `hero_image`).
- The logo is a text wordmark in the display face, so there's no image asset.
- When an image is missing, show a `bg-surface` 4:5 block with the product title in muted mono.
- No stock photography and no imagery from other brands.

## 8. Third-party integrations

- **Umami:** `<Script defer src={NEXT_PUBLIC_UMAMI_URL + "/script.js"} data-website-id=…>`. Keep
  the query string, so no `data-exclude-search`.
- **PostHog:** `posthog-js` initialised from `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`,
  with the feature flag `pdp-sticky-atc`. The distinct id goes into cart metadata as
  `analytics_id`.
- Both are optional. With no env vars, there's no tracking.

## 9. Build instructions

```bash
cd web
cp .env.example .env.local   # MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, NEXT_PUBLIC_* analytics
npm install
npm run dev -- --port 3001
npm run build
```

Dependencies: `next@16`, `react@19`, `tailwindcss@4`, `@medusajs/js-sdk@2.22.7`,
`@phosphor-icons/react`, `posthog-js`.

Notes:
- Node 22 is used here; the skill's Node 25 script workaround isn't needed.
- Cache Components rules apply. Await `params` / `searchParams` / `cookies()` only inside
  `<Suspense>`. Catalog reads use `"use cache"` with `cacheLife("minutes")`. Stock and the cart are
  read per request.

## 10. Landing pages, continuity and testing (v2)

Added from the DTC landing-page outline. [`docs/research/landing-page-learnings.md`](../docs/research/landing-page-learnings.md)
maps each of its lessons to a decision. **[LP]** marks those decisions below.

### 10.1 Match the page to the visitor's awareness [LP §2]

Episode links bring **cold** traffic: viewers who just met the brand in a video. They land on a
**story page**, `/stories/[handle]`, built from the content series. The product page is for
visitors who already know what they want. Content episodes now set `landing_path` to the story page.

### 10.2 Story page modules [LP §5]

Each section answers the question a reader has at that point, in order:

1. **Hook.** Continue the video's promise. The eyebrow names the series and, from the visitor's
   `?asset=`, the episode they just watched. The headline is the viewer's question, with the
   stance as the subhead (or the reverse, see 10.4). CTAs: "Shop the …" and "See the proof".
2. **Problem:** the series `audience`, in the customer's words.
3. **Stance:** "Our rule", shown large on ink.
4. **Proof:** the `proof` line and every published episode, with the one they watched highlighted [LP §6].
5. **Offer:** a working buy box for the core tee: live stock, size guide, add to bag. The
   decision happens on this page [LP §8].
6. **Participation:** the series prompt (the Tuan Le playbook).
7. **Closing action:** the question again, then the CTA.

No generated testimonials or unsupported claims: every line comes from the series record [LP §5 nuance].

### 10.3 Ad-to-page continuity [LP §3]

`<ContinuityBanner />` sits on the home and product pages. When the visitor's `?asset=` matches
an episode, it shows "From The 30-Wash Test · <episode title> · See the full test".

### 10.4 Measure, then test one hypothesis against a control [LP §9]

- Every key CTA carries `data-track`, so clicks land as `cta_click` in first-party analytics:
  - `hero_shop_drop`, `hero_shop_core`
  - `core_product`
  - `notify_me`
  - `add_to_cart`, `sticky_add_to_cart`
  - `cart_checkout`, `checkout_details`, `place_order`
  - `story_shop`, `story_see_proof`, `story_close_cta`, `story_episode`
  - `series_story`, `continuity_story`
- The tracker also records time on page and scroll depth, through `$pageleave`.
- **Experiment `story-headline`** (Admin → Analytics → Experiments):
  - Control: the headline is the viewer's question.
  - Variant `stance`: the headline is the stance.
  - Judged on the purchase funnel `story_viewed → add_to_cart → checkout_started →
    order_completed`, not on clicks.
  - There's no verdict until each variant has 100 or more exposures.
- The experiment record is the experiment log [LP §10]: hypothesis, audience, change, result,
  decision and notes.

### 10.5 Payments

The checkout payment step uses Stripe's Payment Element, which shows cards, plus Apple Pay and
Google Pay where available (ux-evidence §8). Payments are captured at checkout.
