# Shelby storefront: complete site specification (v4, Melin style)

The single source of truth for building `web/`. **v4 rebuilds Shelby in the exact visual style of
melin.com**: layout, proportions, type, colour, spacing, components, interaction and page structure
follow Melin, measured to the pixel. Brand, products, words, prices, policies and photos stay
Shelby's (rules in §1.2). The builder never looks at melin.com; every value needed is in this file.

**How it was captured (2026-11-16)** with the site-clone workflow:
- Firecrawl: a full-format scrape of the home page (markdown, html, rawHtml, full-page screenshot,
  links), a 10-page crawl, and full-page scrapes of a collection, a cap PDP, the fit guide, the fit
  finder, the blog index, one article, the about page and the cart.
- Raw HTML curl of the home page, plus every stylesheet: the theme's `main.css` (Tailwind build
  plus components, 3,857 rules), Typekit CSS, inline `<style>` blocks.
- Playwright in Chromium at **390×844** (iPhone 13) and **1440×900**: `getComputedStyle` of every
  component and state, section geometry, and pixel sampling for colours and for text that Melin
  bakes into images.
- Earlier measurements are in `docs/research/teardowns/melin.md`. Raw captures stay in the session
  scratchpad, not in git.

Value notation: `desktop / mobile` when they differ. Sizes in px at 1440 and 390 wide.
Breakpoint: **lg = 1024px**. Everything below lg is the mobile layout.

---

## 1. Project overview

| | |
|---|---|
| Brand | **shelby**, a small DTC hat brand. The name is pending a trademark check (§11). |
| Tagline | "The core, always. Drops, often." |
| What the site does | Sells one always-in-stock core cap (**The Everyday Cap**, 4 colours) plus a few more shapes and scheduled drops. It also hosts the landing pages for social traffic: story, offer, listicle, advertorial and quiz. |
| Stack | Next.js 16 App Router (Cache Components, Partial Prefetching), React 19, Tailwind CSS 4, `@phosphor-icons/react`, `next/font/google`, Medusa v2 Store API (server-only via `src/lib/medusa.ts`), first-party analytics + Umami, Stripe Payment Element. **No new dependencies.** |
| Language | US English throughout ("Color", "Colors"), matching Melin's UI labels. |

### 1.1 What "exact style" means here

Use Melin's numbers for every token and component: colours, type scale, button boxes, radii,
gaps, grid columns, image ratios, header heights, drawer widths, motion. Page structure follows
Melin's page for the same job (home, collection, PDP, cart drawer, fit guide, blog index, article).
Shelby pages Melin lacks are derived from a named Melin page in each section.

### 1.2 What stays Shelby (rules)

1. **Name and mark:** the text wordmark **`shelby`** (lowercase, heading font, §6.0.2) sits where
   Melin's logo sits. Never Melin's logo, M-icon, seals or patches.
2. **Copy:** Shelby writes its own words in Melin's patterns: Title Case section headings
   ("Browse By Style"), UPPERCASE buttons and nav, short declarative lines. Melin's sentences,
   product names (A-Game, Hydro…), collab names and slogans are never reused.
3. **Products, prices, policies:** from Medusa and `src/lib/policy.ts` only.
4. **Photos:** Shelby's demo photos in `public/hats/` (§7). No Melin imagery.
5. **Icons:** Phosphor (§7.3) in place of Melin's icon artwork.
6. **No claims Shelby can't back.** Where Melin shows these, Shelby gives the equivalent below or
   omits the element. Never invent:

| Melin element | Shelby |
|---|---|
| Star ratings, review counts, "See What People Are Saying", reviews.io block, review fit slider | **Omitted** (no real reviews). Home slot → The Crush Test episode cards (§6.1.7). |
| Free-shipping threshold ($120), cart progress bar, "You're $41 away" | **Omitted** (flat $6 shipping). Drawer slot → the policy line (§6.7). |
| "Perfect Fit Promise", fit seal, "Limited Lifetime Warranty" | **Omitted.** Perks list uses true lines only (§6.4.13). |
| "Free & Easy Exchanges" | "30-Day Returns" (`POLICY.returns`). |
| Featured In press strip | **Omitted** → "In Stock Today" live-count band (§6.1.6). |
| Instagram carousel | **Omitted** (no feed). |
| 10%-off email offer, SMS signup | **Omitted** → "Get drop alerts" (§6.0.6). |
| Shop Pay "Buy it now" button, BNPL line | **Omitted** (§11). |
| Loyalty launcher, chat bubble, accessibility overlay | **Omitted.** |
| Account icon / login | **Omitted** (web has no accounts). |
| Wishlist heart | **Omitted.** |
| Fit quiz (third-party modal) | Shelby's own `/quiz` (§12.4), same entry points. |
| "View on Model" toggle | **Omitted** (no per-colour on-model photos yet). |
| "Previously Viewed" eye icon + drawer | **Kept**: local-only recently viewed (§6.0.4). |
| Search pill with rotating placeholder | **Kept**: client search over the catalog (§6.0.5). |

### 1.3 Evidence rules (unchanged from v3, all still apply)

No generated testimonials, reviews, ratings or customer counts. No fake timers, deadlines or
discounts. Price anchors are computed from live prices. Proof comes from live data (stock, price),
product facts (`metadata.details`, `fit_profile`), `policy.ts` or the content-series record. An
empty proof source removes its block (§12.0).

---

## 2. Design tokens

### 2.1 Color palette

Melin's merchant `:root` override is `--color-primary:#000; --color-secondary:#fff;
--color-tertiary:#e4e4e4; --color-light:#fff; --color-dark:#000; --color-body:#000`. Everything is
black on white with warm greys for secondary text and four greys for fills. **There is no accent
colour**: drops, low stock and countdowns use black. The only hue is the in-stock green dot.

| Token | CSS variable | Hex | Used for (Melin source) |
|---|---|---|---|
| Primary | `--color-primary` | `#000000` | Text, primary buttons, announcement bar, footer, selected states |
| Secondary | `--color-secondary` | `#ffffff` | Page, header, cards, text on black |
| Tertiary | `--color-tertiary` | `#e4e4e4` | Size-button borders, toggle tracks, inactive carousel dashes, quick-add border, accordion lines |
| Body | `--color-body` | `#000000` | Body text |
| Tab ink | `--color-ink-tab` | `#0e1311` | Inactive segmented-control text |
| Muted | `--color-muted` | `#736b67` | PDP product type, sticky-bar colour, breadcrumb current crumb, blog category |
| Muted card | `--color-muted-card` | `#726b67` | Card colour name and product type |
| Muted subtitle | `--color-muted-sub` | `#77706c` | Collection subtitle |
| Gray 500 | `--color-gray-500` | `#6b7280` | Fit-scale step labels (Tailwind `text-gray-500`) |
| Tile | `--color-tile` | `#f5f5f5` | Shape tiles, fit-guide cards, cart drawer body, mobile menu tiles, In Stock band |
| Band | `--color-band` | `#f8f8f9` | Search input, PDP lower bands (Details, Gallery, Also Like) |
| Mega | `--color-mega` | `#ededed` | Mega-menu panel, mobile menu panel, badges, progress tracks |
| Add-on | `--color-addon` | `#ececec` | PDP add-on card fill |
| Line | `--color-line` | `#e4e4e4` | 1px dividers, accordion borders, size buttons, qty pill |
| Line soft | `--color-line-soft` | `#eeeeee` | Style-pill borders, segmented-control outline |
| Line header | `--color-line-header` | `#e5e7eb` | Header bottom border, card image bottom border |
| Line add-on | `--color-line-addon` | `#dddddd` | Add-on card border |
| Line offer | `--color-line-offer` | `#cccccc` | Drawer suggestion card border |
| In stock | `--color-instock` | `#22c55e` | 10px status dot, "INCLUDED" in the drawer |
| Disabled fill | `--color-fill-disabled` | `#efefef` | Sold-out size button fill |
| Disabled text | `--color-text-disabled` | `#c2c2c2` | Sold-out size button text |
| Error | `--color-error` | `#c70000` | Form errors, sold-out notes (Melin's compare-at red) |
| Overlay | `--color-overlay` | `rgb(0 0 0 / 0.8)` | Behind the mega menu, drawer and dialogs (sampled: page × 0.2) |

**Gradients:** one, the fit-finder intro panel (§12.4): `linear-gradient(180deg, #ececec 0%,
#ffffff 100%)`. **Shadows:** one, the sticky buy bar (§2.3). Nothing else.

### 2.2 Typography

Melin loads **Avenir LT Pro** from Adobe Typekit (paid). It re-declares each weight as its own family
(`Avenir Book` n3, `Avenir Medium` n5, `Avenir Heavy` n7, `Avenir Black` n8) and always uses weight
400. Several blocks fall back to the **system stack** (`ui-sans-serif`). Campaign titles use Georgia
Pro (`--font-heading-georgia`).

Substitution, per the site-clone rule for paid fonts: **Plus Jakarta Sans** for the heading and
subheading roles, **Inter** for body. Weights carry the Avenir weight, because the substitutes are
single families. The system stack and Georgia are free and used **as is**.

| Melin variable | Melin family | Shelby family | Weight | next/font var | Tailwind class |
|---|---|---|---|---|---|
| `--font-heading-family`, `--font-bold` | Avenir Black | Plus Jakarta Sans | **800** | `--font-pjs` | `font-heading` |
| (hero text, baked in Melin's image) | Avenir Heavy | Plus Jakarta Sans | **700** | `--font-pjs` | `font-heavy` |
| `--font-subheading-family`, `--font-medium` | Avenir Medium | Plus Jakarta Sans | **500** | `--font-pjs` | `font-subheading` |
| `--font-body-family`, `--font-regular` | Avenir Book | Inter | **400** | `--font-inter` | `font-body` |
| (Tailwind preflight) | `ui-sans-serif` system stack | same stack, unchanged | 400 | none | `font-system` |
| `--font-heading-georgia` | Georgia Pro | `Georgia, "Times New Roman", serif` | 400 | none | `font-campaign` |

- **Loading** (`src/app/layout.tsx`):
  - `Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500","700","800"], variable: "--font-pjs", display: "swap" })`
  - `Inter({ subsets: ["latin"], weight: ["400"], variable: "--font-inter", display: "swap" })`
  - Put both variables on `<html>`.
- **Fallbacks:** `ui-sans-serif, system-ui, sans-serif` after each.
- **Rule:** headings and stat numbers are `font-heading`, never `font-bold` on body text.
- **Body default:** `body` is `font-system` 16px/24px, exactly like Melin's preflight. Components
  opt into `font-body` or `font-heading`.

**Type scale** (Melin's `.type-*` classes, exact; `--sm` / `--lg` modifiers in brackets). Line
heights are those Melin renders.

| Class | Family | Size / line height | Letter spacing | Case | Variants |
|---|---|---|---|---|---|
| `type-hero` | heading | 57.328px / 1 (3.583rem) | 0 | as written | sm 39.808px, lg 82.56px |
| `type-headline` | heading | 34px / 1.5 (51px) | 0 | | sm 26px, lg 40px |
| `type-subline` | subheading | 18px / 1.3 | 0 | | sm 16px, lg 22px |
| `type-section` | heading | 22px / 1.3 (28.6px) | 0 | Title Case | sm 18px, lg 26px |
| `type-item` | heading | 16px / 1.5 (24px) | normal | | sm 14px, lg 18px |
| `type-eyebrow` | body | 12px / 1.5 (18px) | 0.48px | | sm 10px, lg 16px |
| `type-body` | body | 15px / 1.5 (22.5px) | −0.12px | | sm 14px, lg 18px |
| `type-micro` | body | 13px / 15px | −0.1px | capitalize | |
| `type-nav` | heading | 12px / 18px | **3px** | UPPERCASE | mobile tabs: 11.2px/16.8px, ls 2.8px |
| `type-button` | heading | 14px / 21px | 1.3px | UPPERCASE | |
| `type-link` | heading | 13px / 19.5px | 0.4px | UPPERCASE, underline | |

**Where each size is used** (measured):

| Element | Spec |
|---|---|
| Announcement bar | system 14.08px/21.12px, white |
| Section H2 (Browse By Style, Shop By Color, Blog…) | `type-section` 22px/28.6px |
| Promo H2 ("Find Your Fit") | heading 26px/33.8px / 18px/23.4px |
| Collection title | heading 26px/39px, UPPERCASE, centred |
| Collection subtitle | body 13px/15px `#77706c`, capitalize, ls −0.1px |
| Card title | heading 16px/24px (2 lines max) / 16px/24px |
| Card price | body 14px/21px, ls 0.4px, right-aligned |
| Card meta (colour, type) | body 12px/18px `#726b67`, capitalize, ls 0.4px |
| Badge | body 15px/22.5px |
| PDP title | body **20px/25px UPPERCASE** |
| PDP price | body 18px/25px |
| PDP product type | body 15px/19.5px `#736b67` |
| Breadcrumb | body 12px/18px; current crumb `#736b67` |
| PDP description | system 16px/24px |
| PDP option label ("Color: Navy", "Choose your Size") | body 13px/19.5px |
| Size button label | body 14.08px/21.12px UPPERCASE |
| Segmented tab | body 13px/13px capitalize |
| Stock line | heading 14px/21px |
| Perk title / detail | subheading 14.08px/18.304px / body 12px/16px |
| PDP "Fit Guide" heading | heading 18px/23.4px |
| Fit-scale label / steps | body 13px UPPERCASE ls 0.65px / system 14px/20px `#6b7280` UPPERCASE |
| Sticky bar title / colour | body 18px/25px capitalize ls −0.38px / body 13px/25px ls 0.8px `#736b67` |
| Drawer "Your Bag" | heading 16px/24px |
| Drawer line title | subheading 14.08px/21px |
| Footer column heading | subheading 22px/24px white |
| Footer link | body 13px/24px white |
| Blog index hero H1 | `type-hero` 57.328px/57.328px UPPERCASE |
| Blog card meta / title | body 12px/18px ls 0.48px UPPERCASE / heading 16px/20.8px |
| Article meta | body 10px/15px ls 1px UPPERCASE, opacity 0.6 |
| Article H1 | subheading 34px/44.2px |
| Article paragraph | body 16px/25px ls −0.12px, margin-bottom 16px |
| Article H2 | heading 28.432px/36.962px ls −0.12px, margin 48px 0 22.08px |
| Fit-guide banner H1 / body | heading 34px/51px white / body 18px/27px white |
| Fit-guide card name | heading 22px/33px UPPERCASE |
| Fit-guide measurement heading | heading 18px/27px UPPERCASE |
| Home hero headline (live text) | heavy 44px/57px ls 3px UPPERCASE / 24px/32px ls 1.6px |
| Campaign title (live text) | campaign 48px/1 ls 3px UPPERCASE white / 32px |

### 2.3 Spacing, radius, shadows

**Containers:**
- `container-site`: max-width **1280px**, centred, padding-x 0. Used on the home page.
- `container-shop`: max-width **1220px**, padding-x **21.328px**. Used on the PDP, collection, cart page and checkout.
- `container-article`: max-width **672px**. Used on articles, story, listicle, advertorial and quiz.
- Header and footer are full width: padding-x **60px** for the header and **96px** for the footer columns, at lg.

**Fluid section padding** (Melin's three steps):
- `--space-section-sm` **28.432px** (mobile)
- `--space-section-md` **37.904px**
- `--space-section-lg` **50.512px** (lg+)

**Gaps:**
- `--gap` 14px (mobile and desktop)
- product grid 28.432px / 16px
- gallery 16px
- swatches 9px
- style pills 9px
- shape tiles 12px / 16px

**Radii:**

| Token | Value | Used on |
|---|---|---|
| `--radius-button` | 3px | buttons, size buttons |
| `--radius-tile` | 4px | style pills, shape tiles |
| `--radius-addon` | 8px | add-on card, dialogs (`--radius-dialog` 8px), drawer line images |
| `--radius-offer` | 6px | drawer suggestion card |
| `--radius-sort` | 22px | sort control |
| `--radius-pill` | 9999px | segmented control, toggle, qty stepper (50px), Filter+Sort pill, search pill |
| — | 50% | swatches |
| — | **0** | product images, badges, checkout button, campaign images |

**Shadows:** `--shadow-sticky: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`
(sticky buy bar, search results). Carousel arrow buttons: white 48px circles with
`0 1px 3px rgb(0 0 0 / 0.1)`. Nothing else has a shadow; separation is fills and 1px lines.

**Image ratios:** product images **1:1, contain, on white**. Shape and mega tiles show the photo
with `mix-blend-mode: multiply`, so the white photo backdrop takes the tile colour and reads as a
cut-out. Lifestyle images use cover: hero 16:9 desktop (1440×810) / 390×521 mobile, campaign
2:1 (1440×720) / 3:4 (390×520), Shop By Color 3:4, blog 4:3 (home) / 3:2 (index).

### 2.4 Motion

| What | Spec |
|---|---|
| Outline-button ink fill | `::before`: 400px circle, centred, `scale(0)`, opacity 0, the button's ink colour. Hover: `scale(1)`, opacity 1, `transition: transform .4s ease-out, opacity .3s ease, color .1s ease`. Hover out: `transform .25s ease, opacity .25s ease-out`. Text turns to the inverse colour and sits above the fill (`z-index: 1` on the text span). |
| Primary button | no hover change (Melin has none); `cursor:pointer` |
| Card hover | second image fades in, `opacity .3s ease`; the quick-add bar appears with `opacity .2s ease` |
| Mega menu | panel and overlay fade in, `opacity .2s ease`; no slide |
| Drawer | slides in from the right, `transform .3s cubic-bezier(.4,0,.2,1)`; overlay `opacity .3s` |
| Mobile header condense | on scroll down past 121px, the search row folds into the logo row (`height .3s ease`). On scroll up it expands again. |
| Announcement rotation | `opacity .4s` crossfade every 5s; static when there is one message |
| Carousels | native scroll-snap, `scroll-behavior: smooth`; dashes animate `background-color .2s` |
| Reduced motion | all of the above become instant |

---

## 3. Global styles (`src/app/globals.css`)

Use this file **as is**. Components use Tailwind utilities with these tokens.

```css
@import "tailwindcss";

/* Shelby storefront v4: Melin's style system. Values and sources: SITE_SPEC.md §2. */
@theme inline {
  --color-primary: #000000;
  --color-secondary: #ffffff;
  --color-tertiary: #e4e4e4;
  --color-body: #000000;
  --color-ink-tab: #0e1311;
  --color-muted: #736b67;
  --color-muted-card: #726b67;
  --color-muted-sub: #77706c;
  --color-gray-500: #6b7280;
  --color-tile: #f5f5f5;
  --color-band: #f8f8f9;
  --color-mega: #ededed;
  --color-addon: #ececec;
  --color-line: #e4e4e4;
  --color-line-soft: #eeeeee;
  --color-line-header: #e5e7eb;
  --color-line-addon: #dddddd;
  --color-line-offer: #cccccc;
  --color-instock: #22c55e;
  --color-fill-disabled: #efefef;
  --color-text-disabled: #c2c2c2;
  --color-error: #c70000;

  --font-heading: var(--font-pjs), ui-sans-serif, system-ui, sans-serif;
  --font-subheading: var(--font-pjs), ui-sans-serif, system-ui, sans-serif;
  --font-heavy: var(--font-pjs), ui-sans-serif, system-ui, sans-serif;
  --font-body: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-system: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
  --font-campaign: Georgia, "Times New Roman", serif;

  --radius-button: 3px;
  --radius-tile: 4px;
  --radius-addon: 8px;
  --radius-offer: 6px;
  --radius-sort: 22px;

  --shadow-sticky: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* Melin's variable names, for anyone reading the theme side by side. */
:root {
  --font-body-family: var(--font-body);
  --font-heading-family: var(--font-heading);
  --font-subheading-family: var(--font-subheading);
  --font-bold: var(--font-heading);
  --font-medium: var(--font-subheading);
  --font-regular: var(--font-body);
  --gap: 14px;
  --header-height: 61px;
  --header-height-mobile: 121px;
  --announcement-height: 36px;
  --space-section-sm: 28.432px;
  --space-section-md: 37.904px;
  --space-section-lg: 50.512px;
}

html {
  font-size: 100%;
  -webkit-text-size-adjust: 100%;
}

body {
  background: #ffffff;
  color: #000000;
  font-family: var(--font-system);
  font-size: 16px;
  line-height: 24px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: #000000;
  color: #ffffff;
}

:focus-visible {
  outline: 2px solid #000000;
  outline-offset: 2px;
}
.bg-primary :focus-visible {
  outline-color: #ffffff;
}

/* Families carry the Avenir weight (the substitutes are single families). */
@utility font-heading { font-family: var(--font-heading); font-weight: 800; }
@utility font-heavy { font-family: var(--font-heavy); font-weight: 700; }
@utility font-subheading { font-family: var(--font-subheading); font-weight: 500; }
@utility font-body { font-family: var(--font-body); font-weight: 400; }
@utility font-system { font-family: var(--font-system); font-weight: 400; }
@utility font-campaign { font-family: var(--font-campaign); font-weight: 400; }

/* Melin's type scale (.type-*), exact. */
@utility type-hero { font-family: var(--font-heading); font-weight: 800; font-size: 57.328px; line-height: 1; }
@utility type-hero-sm { font-family: var(--font-heading); font-weight: 800; font-size: 39.808px; line-height: 1; }
@utility type-headline { font-family: var(--font-heading); font-weight: 800; font-size: 34px; line-height: 1.5; }
@utility type-headline-sm { font-family: var(--font-heading); font-weight: 800; font-size: 26px; line-height: 1.5; }
@utility type-subline { font-family: var(--font-subheading); font-weight: 500; font-size: 18px; line-height: 1.3; }
@utility type-section { font-family: var(--font-heading); font-weight: 800; font-size: 22px; line-height: 1.3; }
@utility type-section-sm { font-family: var(--font-heading); font-weight: 800; font-size: 18px; line-height: 1.3; }
@utility type-section-lg { font-family: var(--font-heading); font-weight: 800; font-size: 26px; line-height: 1.3; }
@utility type-item { font-family: var(--font-heading); font-weight: 800; font-size: 16px; line-height: 1.5; }
@utility type-item-sm { font-family: var(--font-heading); font-weight: 800; font-size: 14px; line-height: 1.5; }
@utility type-item-lg { font-family: var(--font-heading); font-weight: 800; font-size: 18px; line-height: 1.3; }
@utility type-eyebrow { font-family: var(--font-body); font-weight: 400; font-size: 12px; line-height: 1.5; letter-spacing: 0.48px; }
@utility type-body { font-family: var(--font-body); font-weight: 400; font-size: 15px; line-height: 1.5; letter-spacing: -0.12px; }
@utility type-body-sm { font-family: var(--font-body); font-weight: 400; font-size: 14px; line-height: 1.5; letter-spacing: -0.12px; }
@utility type-body-lg { font-family: var(--font-body); font-weight: 400; font-size: 18px; line-height: 1.5; letter-spacing: -0.12px; }
@utility type-micro { font-family: var(--font-body); font-weight: 400; font-size: 13px; line-height: 15px; letter-spacing: -0.1px; text-transform: capitalize; }
@utility type-nav { font-family: var(--font-heading); font-weight: 800; font-size: 12px; line-height: 18px; letter-spacing: 3px; text-transform: uppercase; }
@utility type-link { font-family: var(--font-heading); font-weight: 800; font-size: 13px; line-height: 19.5px; letter-spacing: 0.4px; text-transform: uppercase; text-decoration-line: underline; text-underline-offset: 3px; }

/* Buttons (Melin .button / .button--*), see SITE_SPEC §5. */
.btn {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  height: 39px; padding: 0 18px; overflow: hidden; white-space: nowrap; cursor: pointer;
  border: 1px solid transparent; border-radius: 3px;
  font-family: var(--font-heading); font-weight: 800; font-size: 14px; line-height: 21px;
  letter-spacing: 1.3px; text-transform: uppercase;
}
.btn > * { position: relative; z-index: 2; }
.btn--primary { background: #000; border-color: #000; color: #fff; }
.btn--light, .btn--dark, .btn--highlight { background: transparent; }
.btn--light { border-color: #000; color: #000; }
.btn--dark { border-color: #fff; color: #fff; }
.btn--highlight { border-color: #fff; color: #fff; }
.btn--light::before, .btn--dark::before, .btn--highlight::before {
  content: ""; position: absolute; left: 50%; top: 50%; z-index: 1; width: 400px; height: 400px;
  border-radius: 50%; opacity: 0; pointer-events: none; transform: translate(-50%, -50%) scale(0);
  transition: transform .25s ease, opacity .25s ease-out, color .1s ease;
}
.btn--light::before { background: #000; }
.btn--dark::before, .btn--highlight::before { background: #fff; }
.btn--light:hover, .btn--dark:hover, .btn--highlight:hover { z-index: 1; }
.btn--light:hover { color: #fff; }
.btn--dark:hover, .btn--highlight:hover { color: #000; }
.btn--light:hover::before, .btn--dark:hover::before, .btn--highlight:hover::before {
  opacity: 1; transform: translate(-50%, -50%) scale(1);
  transition: transform .4s ease-out, opacity .3s ease, color .1s ease;
}
.btn--large { height: 56px; padding: 0 50px; border-width: 2px; }
.btn--hero { height: 48px; padding: 0 24px; border-width: 2px; font-size: 16px; letter-spacing: 2.4px; }
.btn--atc { height: 52px; }
.btn--checkout { height: 52px; border-radius: 0; }
.btn--small { height: 30px; padding: 0 12px; font-size: 11px; line-height: 16.5px; }
.btn--link {
  height: auto; min-height: 24px; padding: 0; border-width: 0; background: transparent; color: #000;
  font-size: 13px; letter-spacing: .4px; text-decoration-line: underline; text-underline-offset: 3px;
}
.btn--micro {
  height: auto; padding: 0; border-width: 0; background: transparent; color: #000;
  font-family: var(--font-body); font-weight: 400; font-size: 13px; line-height: 15px;
  letter-spacing: -.1px; text-transform: capitalize; text-decoration-line: underline;
}
.btn--action {
  height: 35px; border-color: #000; border-radius: 9999px; background: transparent; color: #000;
  font-family: var(--font-body); font-weight: 400; font-size: 13px; letter-spacing: 0;
  text-transform: capitalize;
}
.btn--w-icon { gap: .75rem; background: #000; border-color: #000; color: #fff; }
.btn[disabled], .btn--disabled {
  cursor: not-allowed; opacity: .2; background: #000; border-color: #eeeeee; color: #fff;
}
@media (max-width: 1023px) {
  .btn--large { height: 39px; padding: 0 18px; border-width: 1px; }
  .btn--hero { height: 28px; padding: 0 12px; border-width: 1.5px; font-size: 11px; letter-spacing: 1.6px; }
}

/* Thin scrollbars hidden on carousels. */
@utility scrollbar-none { scrollbar-width: none; &::-webkit-scrollbar { display: none; } }

/* Photos on tinted tiles read as cut-outs. */
@utility cutout { mix-blend-mode: multiply; }

@utility tabular { font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; scroll-behavior: auto !important; }
}
```

**Body classes:** `<body className="bg-white text-primary font-system antialiased">`.
**Selection:** black background, white text.

## 4. Tailwind config

Tailwind 4 is CSS-first: §3's `@theme inline` is the config. For tools that read a JS config,
`tailwind.config.ts` mirrors it:

```ts
import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000", secondary: "#ffffff", tertiary: "#e4e4e4", body: "#000000",
        "ink-tab": "#0e1311", muted: "#736b67", "muted-card": "#726b67", "muted-sub": "#77706c",
        tile: "#f5f5f5", band: "#f8f8f9", mega: "#ededed", addon: "#ececec",
        line: "#e4e4e4", "line-soft": "#eeeeee", "line-header": "#e5e7eb", "line-addon": "#dddddd",
        "line-offer": "#cccccc", instock: "#22c55e", error: "#c70000",
      },
      fontFamily: {
        heading: ["var(--font-pjs)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        campaign: ["Georgia", "Times New Roman", "serif"],
      },
      borderRadius: { button: "3px", tile: "4px", addon: "8px", offer: "6px", sort: "22px" },
      boxShadow: { sticky: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
      maxWidth: { site: "1280px", shop: "1220px", article: "672px" },
    },
  },
} satisfies Config
```

## 5. Button component (`src/components/ui/button.tsx`)

One component renders `<button>` or `<Link>` with the §3 classes. Props: `variant`, `size`,
`block`, `loading`, `track` (→ `data-track`), `icon` (Phosphor, 14px, left).

| Variant (class) | Default | Hover | Active | Disabled |
|---|---|---|---|---|
| `primary` (`btn btn--primary`) | `#000` fill, white text, 1px `#000` border | unchanged | unchanged | opacity .2, `cursor:not-allowed` |
| `light` (`btn btn--light`): outline on white | transparent, `#000` 1px border, `#000` text | black ink fill grows from the centre, text white (§2.4) | fill stays | opacity .2 |
| `dark` (`btn btn--dark`): outline on black | transparent, `#fff` 1px border, white text | white ink fill, text black | | opacity .2 |
| `highlight` (`btn btn--highlight`): outline over photos | transparent, `#fff` border and text | white fill, black text | | |
| `link` (`btn btn--link`) | heading 13px UPPERCASE underline, no box | none | | |
| `micro` (`btn btn--micro`) | body 13px/15px capitalize underline | none | | |
| `action` (`btn btn--action`): pill | 35px, 1px `#000`, radius 9999px, body 13px capitalize | none | | |
| `icon` (`btn btn--w-icon`) | `#000` fill, white text, 14px icon, 12px gap | none | | |

| Size (class) | Height | Padding-x | Border | Notes |
|---|---|---|---|---|
| default | **39px** | 18px | 1px | everywhere unless listed |
| `atc` (`btn--atc`) | **52px** | 18px | 1px | PDP add to cart, offer and quiz CTAs |
| `checkout` (`btn--checkout`) | **52px** | 18px | 1px, **radius 0** | drawer and cart checkout, place order |
| `large` (`btn--large`) | **56px / 39px** | 50px / 18px | **2px** / 1px | "Take The Quiz", quiz answers |
| `hero` (`btn--hero`) | **48px / 28px** | 24px / 12px | 2px / 1.5px | home hero only; 16px / 11px, ls 2.4px / 1.6px |
| `small` (`btn--small`) | **30px** | 12px | 1px | drawer "ADD" |

**Common base:** `btn` = inline-flex, centred, `overflow:hidden`, `white-space:nowrap`, radius 3px,
heading font 14px/21px, ls 1.3px, UPPERCASE. `block` = `w-full`. `loading` = text replaced by a 14px
spinner (2px border, `#fff` or `#000`, `animate-spin`) with the width kept.

---

## 6. Section-by-section spec

### 6.0 Global chrome

#### 6.0.1 Announcement bar (`announcement-bar.tsx`)

- `bg-primary text-white`, height **36px** (padding 8px 0, line 20px), full width. **Scrolls away**:
  it is not part of the sticky header.
- Text system 14.08px/21.12px, centred.
- **Messages (Shelby, true):** `POLICY.announcement` split into "Standard Shipping $6" and
  "30-Day Returns". When a drop is live, add "[Drop title] Is Live Now", linking to the drop
  (`announcement_drop`).
- They crossfade every 5s (§2.4), like Melin's rotating bar. With one message the bar is static.
  Pause on hover/focus. `aria-live="off"`.

#### 6.0.2 Desktop header (`header.tsx`, lg+)

- `sticky top-0 z-40 bg-white h-[61px] border-b border-line-header`. Inner: full width, padding-x
  **60px**, three blocks in a row, all 60px tall.
- **Logo block** (left, 155px wide, `justify-start`): the wordmark link to `/`.
  - The wordmark is the text **`shelby`**: heading font (Plus Jakarta Sans 800), 27px/1, ls
    −0.5px, lowercase, `#000`.
  - `aria-label="Shelby home"`.
- **Nav block** (centred, `flex-1 justify-center`): items in `type-nav` (heading 12px/18px, ls 3px,
  UPPERCASE), padding `0 16px`, each a 60px-tall `<button>`, or a link for direct ones.
  - The open or hovered item gets a **3px `#000` underline** flush with the header's bottom edge
    (`after:absolute after:bottom-[-1px] after:left-4 after:right-4 after:h-[3px] after:bg-primary`).
  - Items:

    | Item | Behaviour | data-track |
    |---|---|---|
    | `FEATURED` | mega menu (§6.0.3) | `nav_featured` |
    | `SHOP` | mega menu: shapes | `nav_shape` (tiles) |
    | `DROPS` | mega menu: live + upcoming + "All Drops" | `nav_drops` |
    | `FIT QUIZ` | link to `/quiz` | `nav_quiz` |
    | `EXPLORE` | mega menu: stories and guides | `nav_explore` |

  - Melin's two-line labels ("FIT / QUIZ") come from its narrow nav. Shelby's five items fit on one
    line, so labels never wrap (`whitespace-nowrap`).
- **Tools block** (right, `justify-end`, gap **25px**):
  - **Search pill** (§6.0.5): 197px block, input 153px × 30px.
  - **Recently viewed** (eye, §6.0.4): 24px icon button with a count badge.
  - **Bag**: 24px icon button with a count badge. It opens the drawer (§6.7).
  - Count badges: 16px black circle, white heading 10px/16px, at top −6px right −6px. Hidden at 0.

#### 6.0.3 Mega menus (desktop)

- Opens on hover (150ms intent delay), on focus, or on click of the nav item. Escape, an outside
  click or moving below the panel closes it.
- **Panel:** absolute under the header (`top: 61px`), full width, **`bg-mega` (#ededed)**,
  padding **37px 0 39px**.
  - Content is a centred row of **tiles**: each tile is 78×98. The image is 78×78
    (`object-contain cutout` on the panel colour). Under it, the label in heading 13px/19.5px
    UPPERCASE ls 0.4px, centred, ellipsis.
  - Tile pitch **99px** (gap 21px).
  - Below the row, 39px gap, then a centred `btn btn--light` (39px), e.g. "SHOP ALL".
- **Overlay:** the page below the header gets `fixed inset-0 top-[61px] bg-black/80 z-30`
  (Melin's dim, sampled ×0.2).
- **Shelby panels:**
  - **SHOP:** one tile per shape with published products, from `shapesFrom()`: Caps, Truckers,
    Beanies, Bucket Hats. Each tile uses the shape's lead photo, links to `/shop?shape=<handle>`
    (`nav_shape`). Then "SHOP ALL" → `/shop`.
  - **FEATURED:** tiles for The Everyday Cap (`/products/everyday-cap`), the live drop's product
    (if any), The Two-Pack (`/offer/everyday-two-pack`, image `everyday-cap-black-1.jpg`), and Fit
    Quiz (`/quiz`, image `everyday-cap-black-3.jpg`). Then "SHOP FEATURED" → `/shop`.
  - **DROPS:** live then upcoming releases, max 6 tiles (`hero_image`, title), then "ALL DROPS" →
    `/drops`. With none, the item links straight to `/drops`.
  - **EXPLORE:** The Crush Test (`/stories/<series>`, `story-crush.jpg`), Fit Guide
    (`/fit-guide`, `everyday-cap-black-3.jpg`), Why The Everyday Cap (`/reasons/everyday-cap`,
    `everyday-cap-black-1.jpg`), Shipping & Returns (`/help/shipping-returns`,
    `everyday-cap-black-2.jpg`). No button.

#### 6.0.4 Recently viewed (eye icon)

- `localStorage` key `shelby.viewed`: the last 12 product handles. Written on PDP view (try/catch;
  storage can be missing). The count badge shows how many entries there are.
- Click opens a **right drawer** with the same frame as the cart drawer (§6.7: 500px / full screen,
  `bg-white`).
  - Header row is 75px: "Previously Viewed" (heading 16px), "N Products" (body 13px `#736b67`),
    close ×.
  - Body is a 2-column grid of product cards (§6.2), with no quick add.
- Hidden when empty. `data-track="recently_viewed"`.

#### 6.0.5 Search

- **Input:**
  - Desktop: the 153px × 30px input sits in the tools block. `bg-band` (#f8f8f9), radius 9999px,
    padding 6px 6px 6px 28px. System font 12px/18px. A Phosphor `MagnifyingGlass` 12px at left 10px,
    colour `#000`.
  - Mobile: a full-width row (§6.0.7). Input is 36px tall, system 16px/24px, padding-left 32px, icon
    14px.
- **Placeholder** rotates every 2s: `Search`, `Search "cap"`, `Search "beanie"`,
  `Search "trucker"`, `Search "olive"`. The quoted term renders as part of the placeholder string.
- **Behaviour:** client-side filter over the published, non-offer catalog. The server passes a
  small JSON list (handle, title, shape, colours, thumbnail, price) in the header. Matching covers
  title, shape and colour names, case-insensitive.
- **Results panel:** under the header, full width on mobile and 420px wide desktop (right-aligned
  under the input). `bg-white shadow-sticky`, padding 16px.
  - Up to 6 rows. Each row is a 56px image (1:1), the title (heading 14px), and the colour count and
    price (body 12px `#726b67`).
  - Then "View All Results" (`btn--link`) → `/shop?q=<term>`.
  - Empty state: "No hats match "term"" (body 13px).
- `/shop` honours `?q=` (§6.3). Enter submits to `/shop?q=`. Escape closes.
- `data-track="search_result"` / `search_submit`.

#### 6.0.6 Newsletter block ("Join The List"), before every footer

Derived from Melin's "Join the family" block. Its offer is dropped (§1.2).

- `section` full width, white. Padding **50.512px 159.504px** / **28.432px 16px**. Content centred.
- H2 `type-section` UPPERCASE "JOIN THE SHELBY LIST", margin-bottom 10px.
- Body `type-body`: "Get an email the moment a drop goes live. Nothing else." Margin-bottom 32px.
- One `btn btn--w-icon` (`EnvelopeSimple` icon), 252×39: "GET DROP ALERTS".
  - Click reveals inline, in place: an email input (39px, 1px `#000`, radius 3px 0 0 3px, body 14px,
    width 280px) joined to a `btn--primary` "SIGN UP" (radius 0 3px 3px 0).
  - Submits the existing notify action for the **next upcoming release**
    (`src/lib/actions/notify.ts`). Success line: "You're on the list for [drop]." Melin's second
    button ("texts") and the 1px divider are omitted (no SMS).
- Hidden when there is no upcoming release. `data-track="notify_me"`.

#### 6.0.7 Mobile header (< lg)

- **Expanded (top of page): 121px**, `sticky top-0 z-40 bg-white border-b border-line-header`.
  - **Row 1** (61px, padding-x 16px):
    - left: hamburger (`List`, 24px), then the wordmark at x=56 (heading 24px/1);
    - right: eye, bag (24px icons, gap 16px).
  - **Row 2** (60px, padding 12px 16px): the full-width search pill (§6.0.5), 36px.
- **Condensed (after scrolling down past 121px): 61px.** One row: hamburger (left 16px), the search
  pill (flex-1, margin 0 12px), bag. It expands again on scroll up (§2.4).
- **Menu** (hamburger → `X`): a full-screen white sheet under the 36px announcement bar, scroll
  locked.
  - Rows 1–2 as above.
  - Then a horizontal **tab row**, 60px: FEATURED · SHOP · DROPS · EXPLORE, each in heading
    11.2px/16.8px ls 2.8px UPPERCASE, padding 0 10px 0 6px. The active tab gets a 3px `#000`
    underline as wide as its text. FIT QUIZ is the last tab and is a plain link.
  - Then the active panel, `bg-mega` full bleed: a **2-column grid** of tiles with padding 24px 16px,
    gap 24px 16px.
    - Each tile is an image 100% wide at a 4:3 box (`object-contain cutout`), then the label in
      heading 12px/18px UPPERCASE ls 0.4px, centred, 12px under the image.
    - Panels hold the same content as §6.0.3. Under them, the panel's button full width
      (`btn--light`).

#### 6.0.8 Footer (`footer.tsx`)

- `bg-primary text-white`. Padding **52px 96px 28.432px** / **28.432px**.
- **Desktop:** three column groups starting at x=96, gap 80px.
  - Each group: heading `font-subheading` 22px/24px, margin-bottom 18px. Then links in body
    13px/24px, padding-top 10px, padding-right 11.6px. Links sit in a 2-column sub-grid of 167px
    when there are more than 4.
  - Groups:

    | Group | Links |
    |---|---|
    | **Get Shelby** | Shop All · Caps · Truckers · Beanies · Bucket Hats · Drops · The Two-Pack |
    | **Customer Service** | Shipping & Returns · Fit Guide · Fit Quiz · Your Bag |
    | **Our Company** | The Crush Test · Why The Everyday Cap |

  - **Legal row:** right-aligned, margin-top 64px. Body 11px/16.5px white: "© 2026 Shelby. All
    Rights Reserved." Then `|`-separated links (Shipping & Returns).
- **Mobile:** groups become accordions with a 1px `rgba(255,255,255,.2)` bottom border and padding
  18px 0. The heading row (22px) has a `Plus` / `Minus` 16px icon. Links stack, one per row. The
  legal row is centred.

### 6.1 Home `/`

Melin's order, with Shelby content in each slot. Sections are full width with no gaps between
them unless stated. All headings are live DOM text, with one `<h1>` (the hero). Melin bakes its
hero text into the image and has no H1; Shelby does not copy that flaw.

| # | Melin section | Shelby section | data |
|---|---|---|---|
| 1 | Hero image (text baked in) | Hero, live text | core product |
| 2 | Browse By Style | Browse By Style | shapes |
| 3 | Seasonal campaign banner | Drop banner | live or next release |
| 4 | Find your Fit | Find Your Fit (quiz) | none |
| 5 | Shop By Color | Shop By Color | core colours |
| 6 | Featured In | In Stock Today | live stock |
| 7 | See What People Are Saying | From The Crush Test | content series |
| 8 | About Us | About Shelby | none |
| 9 | Blog | Stories | series + guides |
| 10 | Instagram | omitted | |
| 11 | Join the family | §6.0.6 | next release |
| 12 | Footer | §6.0.8 | |

**6.1.1 Hero** (`#hero`)
- **Box:** desktop **1440×810** full bleed (16:9). Image `/hats/lifestyle-hero.jpg`, `object-cover`,
  `object-position: 50% 50%`, `preload`. Mobile **390×521**, image `/hats/lifestyle-hero-mobile.jpg`,
  `object-position: 50% 70%`. The whole hero is not a link; only the button is.
- **Text block (desktop):** absolute, left **111px**, top **164px** (headline cap-top 261px from the
  page top under a 97px chrome), max-width 600px. Colour `#000`.
  - `<h1>` `font-heavy` **44px/57px, ls 3px, UPPERCASE**, three lines with `<br/>`:
    `ONE CAP.` / `EVERY COLOR.` / `ALWAYS IN STOCK.`
  - Then the **product line**, 32px under: body 18px/27px "The Everyday Cap · $38 · 4 colors".
    The price is live, from the core product. This keeps product and price in the first screen.
  - Then, 24px under, `btn btn--light btn--hero` **"SHOP NOW"** → `/products/everyday-cap`
    (`hero_shop_core`).
- **Text block (mobile):** absolute, left 20px, top 64px.
  - `<h1>` `font-heavy` **24px/32px, ls 1.6px** UPPERCASE, same 3 lines.
  - Product line body 14px/21px, 16px under.
  - `btn--hero` (28px), 16px under.
- No overlay gradient. The photos keep their light sky behind the text.

**6.1.2 Browse By Style** (`#shapes`)
- **Desktop:** section `bg-white`, height 311px. H2 `type-section` "Browse By Style" at x=21,
  y=+50px. Tiles row 57px below the H2 top: `flex justify-center gap-[12px]`.
  - Each tile is **133×153**, `bg-tile` (#f5f5f5), radius 4px.
  - The image sits at inset 21px, 91×91 (`object-contain cutout`).
  - Label below in heading 13px/19.5px UPPERCASE ls 0.4px, centred, 12px under the image.
  - Tiles: one per shape (`shapesFrom`), then **"SHOP ALL"**, whose image is the core product's
    second colour.
- **Mobile:** H2 at x=21. A 2-column grid, gap 16px, flush to the screen edges.
  - Tiles **187×207**, image 144×144 at inset 21px, label 13px.
- Tiles link to `/shop?shape=` (`shape_tile`).

**6.1.3 Drop banner** (`#drop`)
- **Box:** full bleed **1440×720** / **390×520**. Image `/hats/lifestyle-corduroy.jpg` (or the
  release's `hero_image` when it is a lifestyle image), `object-cover`, `object-position: 50% 35%`.
- A bottom-up scrim for legibility: `linear-gradient(0deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 55%)`.
- **Centred text block, 64px / 32px above the bottom:**
  - Eyebrow body 14px ls 4px UPPERCASE white:
    - live: "LIMITED RELEASE · LIVE NOW";
    - upcoming: "NEXT DROP · [FRI, NOV 21 · 9:00 AM PST]".
  - Title `font-campaign` **48px/1 ls 3px UPPERCASE** white (32px mobile), 12px under.
  - `btn btn--highlight`, 20px under:
    - live: "SHOP THE DROP" (`hero_shop_drop`) → `/drops/<handle>`;
    - upcoming: "GET NOTIFIED" → `/drops/<handle>#notify`.
- Hidden when there are no live or upcoming releases.

**6.1.4 Find Your Fit** (`#fit`)
- **Desktop:** 1440×480, two halves.
  - **Left 720×480:** `bg-tile`, `/hats/everyday-cap-black-3.jpg` 420×420 centred,
    `object-contain cutout`.
  - **Right 720×480:** white, content centred vertically, max-width 360px, centred text:
    - a 96px circle, 2px `#000` border, with a Phosphor `Ruler` 40px inside (Shelby's mark, not a
      seal);
    - 24px gap, then H2 heading **26px/33.8px** "Find Your Fit";
    - 12px gap, then `type-body` "Four questions about how you wear a hat. We'll match you to one
      style, a color that's in stock and, for sized hats, a size.";
    - 32px gap, then `btn btn--light btn--large` **228×56** "TAKE THE QUIZ" (`home_quiz`) →
      `/quiz`.
- **Mobile:** 390×544. The image fills the section (`bg-tile`, image 300×300 at the top 40px).
  Text below, centred: H2 18px/23.4px, body 14px, then `btn--light` 162×39 at 32px from the bottom.

**6.1.5 Shop By Color** (`#colors`)
- **Desktop:** H2 `type-section` "Shop By Color" at x=28, then a row of **4 tiles 335×447 (3:4)**,
  gap 15px, starting x=28, 40px under the H2. Mobile: a horizontal scroll-snap carousel, tiles
  **333×444**, gap 14px, padding-x 28px.
- **Tiles:** the Everyday Cap colours.
  - Background is the tonal colour, with the colour's first photo (`object-contain cutout`) at 80%
    width, centred, 10% from the bottom.
  - Label: heading 16px/24px **ls 4.8px** UPPERCASE, centred, 12% from the top. White on dark
    tiles, `#000` on Bone.

  | Color | Tile background | Label |
  |---|---|---|
  | Washed Black | `#2a2a2a` | white |
  | Navy | `#26314a` | white |
  | Bone | `#e4ddcc` | `#000` |
  | Olive | `#5e6440` | white |

- Link → `/products/everyday-cap?color=<Color>` (`shop_by_color`).

**6.1.6 In Stock Today** (`#stock`, replaces "Featured In")
- `bg-tile`, 1440×412 / auto (padding 40px 16px).
- H2 heading **34px/51px** UPPERCASE ls 2px, centred: "IN STOCK TODAY". 12px under, `type-micro`
  `#736b67`: "Live sellable stock for the Everyday Cap. Updated every visit."
- Then a row of 4 items (desktop: 4 columns, 220px each, gap 64px, centred; mobile: a 2×2 grid,
  gap 24px). Each item is centred:
  - a 42px swatch circle (§6.4.7);
  - 12px gap, then the colour in heading 16px UPPERCASE ls 1.3px;
  - 6px gap, then a 10px status dot (`#22c55e`, or `#000` when low) and the count in body
    14px/21px: "220 in stock", or "Only 3 left" when ≤5, or "Restocking" when sold out (dot
    `#c2c2c2`).
- Each item links to `/products/everyday-cap?color=` (`core_product`).
- Counts stream in `<Suspense>`; the skeleton shows 4 grey 14px bars.

**6.1.7 From The Crush Test** (`#series`, replaces "See What People Are Saying")
- Shown only when a content series is active (`/store/content-series`).
- **Desktop:** H2 `type-section` "From The Crush Test" at x=112. Then a row of up to 4 cards
  **292×508**, gap 16px, starting x=112, 40px under.
- **Card:**
  - title: the episode title in `font-subheading` 16px/24px;
  - meta: "Episode N · TikTok" in body 13px `#736b67`;
  - 12px gap, then an image **292×292**: episodes 1 and 3 use `story-crush.jpg` (cover); 2 and 4
    use the core photos `everyday-cap-black-3.jpg` and `everyday-cap-bone-1.jpg` (contain, white);
  - 12px gap, then the episode subject in body 14px/21px, 3 lines max;
  - 12px gap, then `btn--link` "SEE THE TEST" → `/stories/<handle>` (`story_episode`).
- **Mobile:** a carousel of 233×466 cards (image 233×233), gap 16px, padding-x 16px.
- Under the row, centred, 32px gap: `btn btn--light` "SEE THE FULL TEST" (`series_story`).

**6.1.8 About Shelby** (`#about`)
- Full bleed **1440×592** / **390×521**. Image `/hats/lifestyle-bucket.jpg`, `object-cover`
  (desktop `object-position: 50% 40%`), with a scrim `linear-gradient(90deg, rgba(0,0,0,.55) 0%,
  rgba(0,0,0,0) 60%)`.
- Text block left (x=72 / 20px), vertically centred, max-width 460px, white:
  - H2 heading **34px/44px ls 2px UPPERCASE** "ABOUT SHELBY";
  - 16px gap, then body 18px/27px: "We make one cap we never let run out, and a few small drops a
    year. We show you the stock count, and we fold every cap into a back pocket before we sign it
    off.";
  - 24px gap, then `btn btn--highlight` "WHY THE EVERYDAY CAP" → `/reasons/everyday-cap`
    (`home_reasons`).

**6.1.9 Stories** (`#stories`, Melin's Blog)
- H2 `type-section` "Stories" at x=51, then 2 posts side by side, each **670×251**: image
  **335×251** (4:3, cover) left, text right with padding 0 24px.
- **Text column:**
  - meta: `type-eyebrow` UPPERCASE "STORY | THE CRUSH TEST" or "GUIDE | FIT", 12px/18px;
  - 8px gap, then title `type-item` 16px/20.8px;
  - 8px gap, then excerpt body 14px/21px, 3 lines;
  - 16px gap, then `btn btn--light` **136×39** "READ MORE".
- **Posts:**
  1. The Crush Test story (`/stories/<series>`, `story-crush.jpg`, excerpt = the stance).
  2. "Fit Guide" (`/fit-guide`, `everyday-cap-black-3.jpg` contain on `bg-tile`, excerpt
     "Crown height, structure and the one-size range, hat by hat.").
- `data-track`: `home_story` / `fit_guide`.
- **Mobile:** stacked rows, each 333×133: image 133×133 left, text right, 16px gap between rows.

### 6.2 Product card (`src/components/product-card.tsx`)

Melin's `.product-item`, exact.

- **Image area:** a 1:1 square on white (`object-contain`), then 8px padding-bottom and a 1px
  bottom border `#e5e7eb`. Desktop 197.47×206 total (image 197.47); mobile 171×180.
- **In-card carousel:** horizontal scroll-snap over the **first colour's images** (up to 6).
  - The dash indicator row sits 4px above the image area's bottom: dashes **21×4px**, gap 8px,
    centred, active `#000`, inactive `#e4e4e4`, `transition: background-color .2s`.
  - `aria-label="Image n of N"`.
- **Desktop hover:** image 2 crossfades in (§2.4), and the **quick-add bar** appears.
  - The bar is absolute at left/right 16px and bottom 17px, 165×39 at the 197px card, `bg-white`,
    1px `#e4e4e4` border, radius 0. It reads "+ QUICK ADD" in heading 11px/16.5px ls 1.3px
    UPPERCASE with a 12px `Plus` icon.
  - One-size products add the first in-stock colour and open the drawer.
  - Sized products swap the bar for an inline size row: two 39px halves "S/M" | "L/XL", sold-out
    struck through and `#c2c2c2`. Picking one adds and opens the drawer.
  - `data-track="quick_add"`.
- **Mobile quick add:** a 48×48 button at top-right (inset 0), transparent. Its icon is a 32px
  circle (1px `#000` border, white fill) holding a 16px `Bag` icon, with a 14px black `+` badge at
  its top-right. Same behaviour as the bar (the size row opens as a 2-button popover under the
  icon).
- **Badge:** top-left at inset **14.08px** (.88rem), `bg-mega` (#ededed), body 15px/22.5px,
  padding 4px 8px, radius 0. Values: "Limited" (product of a live drop), "Core" (core collection),
  "Low Stock" (every in-stock variant ≤5), "Coming Soon" (upcoming drop). One badge only, in that
  priority.
- **Text** (starts 7px under the image area):
  - Row 1, `flex justify-between items-baseline gap-2`: title `type-item` 16px/24px (`line-clamp-2`)
    and price body 14px/21px ls 0.4px, `shrink-0`.
  - Row 2: the first colour's name, body 12px/18px `#726b67` capitalize ls 0.4px.
  - Row 3: the product type, same style. It comes from shape + structure, e.g. "Unstructured
    Strapback Cap", "Structured Snapback Trucker", "Knit Beanie", "Sized Bucket Hat", built from
    `fit_profile` and `details.Closure`.
  - Row 4: when there is more than one colour, "+N Colors" in the same style.
  - Melin's stars row is omitted (§1.2).
- Whole card links to the PDP. `data-track` is not set on the card (product_viewed covers it).

### 6.3 Collection `/shop`

Melin's collection page, exact.

- **Title band** (`container-shop`, centred text, padding-top 37.904px):
  - `<h1>` heading **26px/39px UPPERCASE**: "HATS" for all, or the shape name ("CAPS"), or
    `SEARCH: "TERM"` with `?q`.
  - 4px gap, then the subtitle body 13px/15px `#77706c` capitalize ls −0.1px. For all hats: "Shop
    Our Full Range Of Hats"; for a shape, its category description; for search: "N Results".
- **Style pills** (28.432px below):
  - A centred row, wrapping on desktop and a scroll row on mobile with padding-x 16px. Gap 9px.
  - Pills are 35px tall, min-width 85px, padding 0 16px, 1px `#eeeeee` border, radius 4px, body
    13px ls 1.3px, capitalize, `#000`.
  - Active pill: `bg-primary text-white border-primary`.
  - Pills: "View All" + each shape (`?shape=`), `data-track="shape_pill"`.
  - 28.432px below the pills, a 1px `#e4e4e4` divider, full container width.
- **Desktop layout** (`container-shop`, padding-top 28.432px): `grid grid-cols-[263px_1fr]
  gap-[78px]`.
  - **Sidebar 263px**, `flex flex-col gap-8`:
    - **Sort** control: 189×34, 1px `#e4e4e4` border, radius 22px, padding-left 12px. System
      14.08px: "Sort By" `#736b67` + " | " + the value + `CaretDown` 12px. Options: Featured (core
      first, then live drop, then others), Price: Low To High, Price: High To Low, Newest. Param
      `?sort=`.
    - **Facets:** `<details open>` accordions.
      - Summary: heading 14px UPPERCASE ls 1.4px, height 40px, with a `CaretUp` / `CaretDown` 14px
        at right. 1px `#e4e4e4` bottom border; 16px padding under the content.
      - **SIZE:** 45×45 boxes (1px `#e4e4e4`, radius 3px, body 12px) for "One Size", "S/M", "L/XL".
        Selected: black fill, white text. Matches sizes **in stock** only.
      - **COLOR:** a 4-column grid, gap 16px 8px. Each is a 32px circle swatch (§6.4.7 fills) with
        its label under it in body 12px/18px.
      - **SHAPE:** checkboxes (16px, 1px `#000`, radius 2px; checked = black with a white check),
        label body 14px.
      - Params `?size=&color=&shape=` (multi-select, comma-separated).
  - **Grid:** `grid-cols-4`, gap **28.432px**, cards 197.47px (§6.2). No pagination (small
    catalog); with more than 48 products, "Load More" `btn--light` centred.
- **Mobile:**
  - Under the divider, a row: a "Filter + Sort" pill (`btn--action`: radius 9999px, 1px `#000`,
    height 36px, padding 0 16px, body 13px capitalize, `SlidersHorizontal` 14px) and the result
    count body 13px `#736b67`.
  - The pill opens a **full-screen drawer**:
    - a 56px title bar (`bg-tile`, heading 14px UPPERCASE ls 1.4px "Filter + Sort", close ×);
    - Sort as a list of radio rows, then the same accordions;
    - a fixed footer with `btn--light` "CLEAR" and `btn--primary` "VIEW N RESULTS" side by side.
  - Grid `grid-cols-2 gap-4`, padding-x 16px.
- **Empty state:** centred, 80px padding: "No hats match those filters." (body 15px) +
  `btn--light` "VIEW ALL".
- Offer products are excluded (§12.1).

### 6.4 Product page `/products/[handle]`

Melin's PDP, exact, at `container-shop` (1220px).

**6.4.1 Layout:**
- **Desktop:** `grid grid-cols-[740px_370px] gap-[68px]` (gallery x=131, info x=939 at 1440),
  padding-top 21px.
- **Mobile:** stacked. Full-width gallery, then the info column with padding-x 21.5px.
- The info column is **not sticky**. Melin uses a sticky bar instead (§6.4.15).

**6.4.2 Gallery** (`gallery.tsx`, driven by the selected colour through `SelectionProvider`)
- **Desktop:** `grid grid-cols-2 gap-4`, **362×362 squares** (`object-contain`, white).
  - Images are the selected colour's photos (`imagesFor`), then the product-level images.
  - With an odd count, the last image spans nothing; the cell stays empty.
- **Mobile:** a full-width swipe gallery of **347×347** squares (390 − 2×21.5), scroll-snap, with
  a dash indicator 12px below (21×4 dashes, §6.2).
- **Badge** on image 1 (§6.2 values; for a drop product "Limited").
- `md.video_url`: desktop renders a 16:9 video (740×417) under the grid. Mobile shows a
  **"PLAY ▶" pill** on the gallery's bottom-right: `bg-white/90`, radius 9999px, padding 4px 10px,
  heading 11px ls 1.3px. It opens the video full screen.
- Changing colour resets to image 1 and writes `?color=` (`history.replaceState`). `?color=` on
  load selects that colour.

**6.4.3 Title row:** `flex justify-between items-baseline`. Left: `<h1>` body **20px/25px
UPPERCASE**, the product title, padding-right 10px. Right: price body **18px/25px**.

**6.4.4 Type row:** body 15px/19.5px `#736b67`, the product type (§6.2 row 3), margin-top 2px.
Melin's stars on the right are omitted.

**6.4.5 Breadcrumb:** margin-top 16px. Body 12px/18px: "Shop All > [Shape] > [Product]". Links are
`#000`; the current crumb is `#736b67`. The separator is " > ".

**6.4.6 Description:** margin-top 12px, system 16px/24px `#000`, 4 lines max. Then a 1px `#e4e4e4`
divider, margin 20px 0. On mobile the description moves below the perks list (§6.4.13).

**6.4.7 Colour:**
- **Segmented control** (only when the product's colours fall into more than one group: Core,
  Limited). 370×43, 1px `#eeeeee` border, radius 9999px, `flex justify-evenly`, margin-bottom 20px.
  - Tabs: 92×41, body 13px/13px capitalize, padding 14px.
  - Active tab: `bg-primary text-white` radius 9999px; inactive: `#0e1311` on white.
  - Tabs "All", "Core", "Limited" filter the swatches.
- **Label row** (margin-bottom 10px): body 13px/19.5px "Color: [Name]".
- **Swatches:** `grid grid-cols-7 gap-[9px]`. Each is a **42px circle** (1px transparent border,
  1px padding) filled with `swatchBackground(name)`. Two-tone names split diagonally (135°). Very
  light fills (Bone, Cream, Stone) carry an inner 1px `#e4e4e4` ring.
  - **Selected:** border 1px `#000`. The 1px padding leaves a white gap ring.
  - **Sold out:** a diagonal 1px `#000` strike from bottom-left to top-right over the circle,
    `aria-disabled`, still selectable to see photos.
  - Hover: `title` tooltip with the name.

**6.4.8 Size** (margin-top 24px):
- **Label row:** `flex justify-between`. Body 13px/19.5px "Choose your Size". Right: `btn--micro`
  "Size Guide", which opens the size dialog (§6.4.17).
- **Sized products** (S/M, L/XL): `grid gap-[9.5px]` with one equal column per size.
  - Buttons are **48px tall**, 1px `#e4e4e4` border, radius 3px, label body 14.08px/21.12px
    UPPERCASE.
  - **Selected:** `bg-primary text-white border-primary`.
  - **Sold out:** `bg-[#efefef] text-[#c2c2c2]`, a diagonal strike, `cursor:not-allowed`.
  - **Low (≤5):** a second line in body 11px "N LEFT" under the label.
  - No default selection (deviation from Melin, which preselects Small: wrong-size orders are the
    main return driver). The CTA reads "SELECT A SIZE" until one is chosen.
- **One-size products:** a single full-width 48px button "ONE SIZE", always selected (black). Under
  it, 8px gap, body 13px `#736b67`: "Fits 21.5–23.75 in (55–60 cm)". The range comes from
  `fit_notes` when it states one (the trucker's 21.5–24 in).

**6.4.9 Make It Two** (Melin's "Popular Add Ons"; only on a product that has an offer,
`single_handle`):
- Heading **18px UPPERCASE** "MAKE IT TWO", margin 24px 0 12px.
- Card: `bg-addon` (#ececec), 1px `#dddddd` border, radius 8px, padding 16px, `flex items-center
  gap-4`.
  - A 72px image (`everyday-cap-black-1.jpg`, contain, `cutout`).
  - Title body 15px "The Two-Pack", then body 13px `#736b67` "Any two colors".
  - Price heading 16px "$68" right, with "Save $8" body 12px under it (live).
  - `ArrowRight` 16px at the far right.
- The whole card links to `/offer/everyday-two-pack` (`pdp_offer`).

**6.4.10 Add to cart** (margin-top 20px): `btn btn--primary btn--atc` full width (370 / 347).
- Label:
  - "ADD TO CART";
  - "ADD TO CART - LOW INVENTORY" when the selected variant has ≤5 (real stock);
  - "SELECT A SIZE" (sized, none picked; click scrolls to and flashes the size row);
  - "SOLD OUT" (disabled style).
- After adding: the drawer opens (§6.7) and the label reads "ADDED" for 1.5s.
- `data-track="add_to_cart"`.

**6.4.11 SKU and stock** (margin-top 12px):
- SKU body 13px "SKU: CAP-EVERYDAY-NAVY-OS" (the variant SKU).
- 12px gap, then the **stock line**: a 10px circle (`#22c55e` in stock, `#000` low, `#c2c2c2` sold
  out) then heading **14px/21px**:
  - "In stock, ready to ship!";
  - "Only N left, ready to ship!";
  - "Sold out in [size/colour]".
- Live, in `<Suspense>`.
- **Drop products** add body 13px `#736b67` under it: `POLICY.limitedRun`.

**6.4.12 Fit quiz link:** `btn--micro` "Not sure? Take the 30-second fit quiz" (`pdp_quiz`),
margin-top 12px.

**6.4.13 Perks list** (Melin's promo rows; margin-top 24px; each row `flex items-center gap-4`,
padding 12px 0; the 48px icon is a Phosphor `light` weight icon, `#000`). Shelby's true rows only:

| Icon | Title (`font-subheading` 14.08px/18.3px) | Detail (body 12px/16px) |
|---|---|---|
| `Truck` | Standard Shipping $6 | `POLICY.dispatch` + ". Express $15." |
| `ArrowCounterClockwise` | 30-Day Returns | "Send it back within 30 days of delivery." |
| `Ruler` | One Size, Adjustable / Sized S/M & L/XL | The fit range or "Measure around your head just above the ears." |
| `Package` | Live Stock Counts | "The count you see is what we have on the shelf." |
| `Drop` | Product Care | `details.Care` |

**6.4.14 Fit Guide** (only with `metadata.fit_profile`; margin-top 24px; a 1px `#e4e4e4` divider
above, padding-top 24px):
- `<h4>` heading **18px/23.4px** "Fit Guide".
- Two scales, 20px apart. Each scale:
  - a label in body 13px UPPERCASE ls 0.65px ("CROWN HEIGHT", "STRUCTURE"), margin-bottom 8px;
  - a **track** 6px tall, `bg-mega` (#ededed), radius 9999px, with a black fill segment one third
    wide at the active step (left, middle or right third), radius 9999px;
  - the steps row 4px under: system 14px/20px `#6b7280` UPPERCASE, `flex justify-between`: "LOW ·
    MID · TALL" or "UNSTRUCTURED · SEMI · STRUCTURED". The active step is `#000`.
- Then `btn--micro` "Read the fit guide" → `/fit-guide#<handle>` (`fit_guide`).

**6.4.15 Sticky buy bar:**
- Appears when the main CTA scrolls above the header. It is `fixed` under the header: **top 61px**
  desktop, and under the condensed mobile header (61px). Full width, **97px** tall (mobile 80px),
  `bg-white shadow-sticky`, z-30.
- **Desktop** (`container-shop`, `flex justify-between items-center`):
  - Left: title body 18px/25px capitalize ls −0.38px, and under it the type body 13px `#736b67`.
  - Right: a 64px thumbnail (contain); price body 18px/25px over the colour (body 13px ls 0.8px
    `#736b67`); then `btn btn--primary` 39px "ADD TO CART", 16px gap.
- **Mobile:** a 56px thumbnail; price body 16px over the colour 12px; the button 39px right.
- `data-track="sticky_add_to_cart"`. Sized with none picked: the button reads "SELECT A SIZE" and
  scrolls up.

**6.4.16 Lower bands** (full width, `bg-band` #f8f8f9, padding 50.512px 0 / 28.432px 0, each
`container-shop` with H2 `type-section`, margin-bottom 22.08px):
1. **Details** (Melin's "Technology & Features"):
   - A row of 3 image cards, each 378px / full width stacked, gap 24px. Each card:
     - the photo (1:1, contain, white bg);
     - a caption 12px under: heading 16px UPPERCASE, then body 14px/21px.
   - Cards: "Crown" (side photo `-3`, `details.Crown`), "Closure" (back photo `-2`,
     `details.Closure` or `details.Knit`), "Fabric" (`-1`, `details.Fabric`).
   - Then a **features row:** each `details` entry as a tile, 5 columns / 2 columns, gap 24px.
     - Icon: Phosphor 32px light (Crown `Crown`, Brim `Baseball`, Closure `Buckle`, Fabric `Leaf`,
       Care `Drop`, Knit `Spiral`, fallback `Circle`).
     - Then label heading 12px UPPERCASE ls 1.3px, then value body 13px/19.5px.
2. **Gallery:** shown only when the product has a lifestyle photo (map: everyday-cap →
   `lifestyle-hero.jpg`, corduroy-cap → `lifestyle-corduroy.jpg`, bucket-hat →
   `lifestyle-bucket.jpg`). One full-container image, 16:9 / 4:5, cover.
3. **You May Also Like:** a carousel of product cards (§6.2), 4 visible / 2.2 visible, gap
   28.432px / 16px, other shapes first, with arrow buttons (white 48px circles, §2.3) at the edges
   on desktop. `data-track` on cards: `pdp_also_like`.
4. **Previously Viewed:** the same carousel from §6.0.4, excluding the current product. Hidden when
   empty.

**6.4.17 Size dialog** (`size-guide.tsx`):
- A `<dialog>` centred, max-width 560px, `bg-white`, radius 8px, padding 24px, overlay
  `bg-black/80`.
- Title heading 18px "Size Guide", close ×. Then the table: header row heading 12px UPPERCASE ls
  1.3px, rows body 14px, 1px `#e4e4e4` row borders, padding 10px 0. Then fit notes in body 13px.

**6.4.18 Accordions** (description on mobile, and the "Shipping & Returns" block under the perks):
- `details` with a 1px `#e4e4e4` top and bottom border.
- Summary row 48px: heading 14px UPPERCASE ls 1.3px, with a `Plus` 14px icon that rotates 45° when
  open.
- Panel body 14px/21px, padding-bottom 16px.

Events: `product_viewed` {product_id, handle, release_id}, `add_to_cart` {source "pdp"}.

### 6.5 Fit guide `/fit-guide`

Melin's fit-guide page, exact.

1. **Banner** (full bleed, 1440×189 / auto, `bg-primary`):
   - Text at x=240 / 20px, padding 40px 0, max-width 600px.
   - `<h1>` heading **34px/51px** UPPERCASE white "FIND YOUR FIT".
   - Body **18px/27px** white: "Most Shelby hats are one size: the strap or snap fits 21.5–23.75
     in (55–60 cm). Sized styles come in S/M and L/XL." Mobile: 16px/24px.
   - 16px gap, then `btn btn--highlight` "TAKE THE QUIZ" (`fit_guide_quiz`).
2. **Shape cards** (white, padding 38px 0):
   - A carousel of cards **311×294**, `bg-tile`, radius 0, gap 21px, starting x=67. Arrows on
     desktop (§2.3).
   - Each card, centred, padding-top 22px:
     - image 129×101 (contain, `cutout`);
     - 16px gap, then the name heading **22px/33px UPPERCASE**;
     - 6px gap, then a one-liner body 15px/22.5px (from `fit_notes`' first sentence), max-width
       269px;
     - 12px gap, then `btn--link` "LEARN MORE" → `#<handle>`.
   - One card per published, non-offer product with a `fit_profile`, plus the beanie.
3. **One module per product** (`id=<handle>`, white, height auto, padding 28px 0 56px, a 1px
   `#e4e4e4` top border):
   - **Desktop:** two columns inside a 960px box at x=241.
     - **Left (440px):** name heading **26px/33.8px UPPERCASE**; 12px gap; `type-body` description;
       12px gap; the fit note body 14px `#736b67`; 24px gap; `btn btn--light` "SHOP THE [NAME]" →
       PDP (`fit_guide_shop`).
     - **Right:** image **486×430** (the `-3` side photo, contain, white).
   - **Measurement cards**, 40px below: a row of 3 cards, **235px** wide, gap 98px, starting x=270.
     - Each card: a **235×159** image (`bg-tile`, contain, `cutout`); 12px gap; heading **18px/27px
       UPPERCASE**; then a table of rows, each `flex justify-between`, 1px `#e4e4e4` bottom border,
       padding 6px 0. Row label heading 14px/21px UPPERCASE, value body 14px.
     - **CROWN HEIGHT:** image `-3`. Rows: "PROFILE · [Low/Mid/Tall]", "STRUCTURE · [value]", and
       the 3-step scale (§6.4.14) under them.
     - **CIRCUMFERENCE:** image `-1`. Rows per size, for one size "ONE SIZE · 55–60 cm /
       21.5–23.75 in", for sized "S/M · 55–57 cm", "L/XL · 58–60 cm".
     - **BRIM:** image `-2`. Row "BRIM · [details.Brim]" and "CLOSURE · [details.Closure]".
   - **Mobile:** stacked. The image comes first, full width; then the text; then the cards as a
     horizontal carousel (235px cards, gap 16px).
4. **How To Measure** (Shelby; derived from the measurement module):
   - `bg-tile`, padding 50.512px 0.
   - Two columns at 960px: left, the 3 numbered steps (heading 14px number + body 15px); right, the
     size table (§6.4.17 style) with One Size (adjustable) 21.5–23.75 / 55–60 / 6⅞–7½, S/M 21.5–22.5
     / 55–57 / 6⅞–7⅛, L/XL 22.75–23.75 / 58–60 / 7¼–7½.
5. Newsletter block, footer.

### 6.6 Drops `/drops` and `/drops/[handle]`

**`/drops`**: derived from Melin's **blog index**.
1. **Featured hero** (full bleed, 1440×~330 / stacked):
   - Left half: the featured release's `hero_image`, cover, 720×330 / 390×293. The featured
     release is the live one, else the next upcoming.
   - Right half: white, content centred:
     - meta `type-eyebrow` UPPERCASE, with the first word `#736b67` 11px ("LIMITED RELEASE | LIVE
       NOW" or "NEXT DROP | FRI, NOV 21 · 9:00 AM PST");
     - 8px gap, then `<h1>` **`type-hero` 57.328px/57.328px UPPERCASE** (39.808px mobile), the
       title;
     - 8px gap, then the promise body 15px;
     - 20px gap, then `btn btn--light` "SHOP THE DROP" / "GET NOTIFIED" (`drop_hero`).
     - For an upcoming release, the **countdown** goes between the promise and the button
       (§6.6.1).
2. **Tabs** (centred, 32px below):
   - A segmented control 240×28, `bg-mega` track, radius 9999px. Two tabs, body 12px capitalize:
     "Live & Upcoming" | "Past". Active: a white pill with a 1px `#000` border.
   - Param `?tab=past`.
3. **Grid:**
   - `container-site`, `grid-cols-3 gap-[38px]` / `grid-cols-1 gap-8`, padding-x 28px.
   - Card (`flex flex-col gap-2`):
     - meta `type-eyebrow` UPPERCASE: "LIVE NOW | NOV 16, 2026", "DROPS | FRI, NOV 21" or "ENDED |
       OCT 2, 2026", with the first word in `#736b67` 11px;
     - the image 436×291 (**3:2**, cover; hero_image);
     - the title heading 16px/20.8px, margin-bottom 10px;
     - for upcoming releases, the countdown (small) and the inline notify form (§6.6.1).
   - Empty tab: body 15px "No drops here yet." centred, 80px padding.

**6.6.1 Countdown:** digits heading **22px/1 tabular**, `#000`, separated by " : ". Under each
number, a label body 10px UPPERCASE ls 1px `#736b67` (DAYS · HRS · MIN · SEC). The large variant
(hero) uses 34px digits. At zero it reads "Going live shortly" (heading 14px). Real `release_at`
only (§1.3).

**Notify form:** an email input 39px (1px `#000`, radius 3px 0 0 3px, body 14px) joined to
`btn--primary` "NOTIFY ME" (radius 0 3px 3px 0). Success text body 13px. `data-track="notify_me"`.

**`/drops/[handle]`**: derived from Melin's **article page**.
1. **Hero image:** full bleed **1440×412** / 390×260, cover, `hero_image`.
2. **Article column:** `container-article` (672px), padding-top 27px, `bg-white`.
   - meta: body 10px/15px ls 1px UPPERCASE, opacity 0.6, "LIMITED RELEASE | LIVE NOW", with
     padding-right 12px between the parts;
   - 12px gap, then `<h1>` **`font-subheading` 34px/44.2px**, the title;
   - 16px gap, then the story as article paragraphs (body 16px/25px ls −0.12px, mb 16px);
   - "What To Look For": article H2 (heading 28.432px/36.962px, margin 48px 0 22.08px) + the proof.
3. **By phase:**
   - **upcoming:** the countdown (large) + notify form;
   - **live:** a product grid (cards §6.2, `grid-cols-3` / 2, gap 16px) with live stock;
   - **past:** "This drop has ended." (heading 18px), then any products still on sale.
4. **Closing rule:** a 4px `#000` line full column width, margin 48px 0 24px. Then "← Back To
   Drops" (`btn--link`, 144×56 hit area, centred).

Event: `drop_viewed`.

### 6.7 Cart drawer and `/cart`

**Drawer** (`cart-drawer.tsx`, Melin's slider cart). It opens on every add to cart (PDP, quick add,
sticky bar, offer, quiz result, listicle, advertorial, story) and from the bag icon.

- **Frame:**
  - A `<dialog>`, fixed right, **500px** wide desktop / **100vw** mobile, full height, `bg-tile`
    (#f5f5f5), z-60.
  - Overlay `bg-black/80`.
  - It slides in (§2.4). Focus is trapped; Escape or the overlay closes it.
- **Header** (`bg-white`, padding 16px 16px 20px, centred):
  - close `X` 24px at top 16px right 16px;
  - a `Bag` 24px icon, then 4px gap, then "Your Bag" heading **16px/24px**;
  - 12px gap, then the **policy line** body 13px/15px ls −0.1px capitalize: "Standard Shipping $6
    · 30-Day Returns". Melin's free-shipping bar is omitted (§1.2).
- **Lines** (`ul`): each `li` is `bg-white`, padding 12px 16px, 1px `#e4e4e4` bottom border,
  `flex gap-4`.
  - Image **128×128** (contain, radius 8px), linking to the PDP.
  - Text column:
    - title `font-subheading` 14.08px/21px, margin-bottom 3px;
    - "Color / Size" body 13px `#736b67`;
    - for a two-pack, "First Cap / Second Cap" colours;
    - for a drop product, a "Limited" badge (§6.2 style, 12px).
  - **Qty stepper:** 114×34, `bg-white`, 1px `#e4e4e4` border, radius 50px, padding 2px 16px.
    `Minus` / `Plus` 12px icons with 44px hit areas; the count is body 16px centred.
  - Remove `X` 16px at the line's top-right.
  - Price body 14px, right, vertically centred.
- **Suggestions** (padding 24px 16px), Melin's "Complete Your Kit":
  - heading `font-subheading` 16px "Complete Your Look".
  - **Two-pack row**, when an Everyday Cap single is in the bag: the same card as §6.4.9, linking
    to the offer (`cart_offer`).
  - **Carousel** of suggestion cards, 1 visible with arrows (`CaretLeft` / `CaretRight` 16px at the
    edges), up to 3 hats not in the bag, other shapes first.
    - Card: 100% wide, `bg-tile`, 1px `#cccccc` border, radius 6px, padding 15px, `flex flex-col`.
    - Top row: a 72px image, title body 14.08px, colour body 12px `#736b67`, shape body 12px, price
      body 14px right.
    - Bottom right: `btn btn--primary btn--small` "ADD", width 50%.
    - One-size: adds the first in-stock colour (`cart_complete_look`). Sized: "CHOOSE SIZE" →
      PDP.
- **Summary**, fixed to the drawer bottom: `bg-white`, padding 16px, 1px `#e4e4e4` top border.
  - Row 1: a `CheckCircle` 16px `#22c55e` + body 14px "30-Day Returns", right heading 12px
    `#22c55e` "INCLUDED".
  - 12px gap, then row 2: heading **18px** "Summary" + heading 18px subtotal right.
  - 12px gap, then `btn btn--primary btn--checkout` full width **"CHECKOUT"** (`cart_checkout`).
  - 10px gap, then the trust line: heading 10px/15px ls 1px UPPERCASE centred, "STANDARD SHIPPING
    $6 - 30-DAY RETURNS - SECURE CHECKOUT".
- **Empty:** centred in the body, the `Bag` icon 48px, then heading 16px "Your Bag Is Empty", then
  `btn--primary` "SHOP THE EVERYDAY CAP".

**`/cart` page** (direct visits, checkout back links):
- `container-shop`, padding-top 37.904px, `<h1>` heading 26px/39px UPPERCASE "YOUR BAG" centred.
- Then `grid grid-cols-[1fr_370px] gap-[68px]` / stacked: left, the drawer's lines and suggestions;
  right, the summary block (not fixed).

### 6.8 Checkout `/checkout` and confirmation `/order/[id]`

Melin hands off to Shopify's checkout, which was not captured. Shelby's checkout keeps its flow and
takes Melin's tokens.

- **Checkout:** `container-shop`, `grid grid-cols-[1fr_420px] gap-[68px]` / stacked (summary first,
  collapsed to a "Show Order Summary · $76" bar on mobile).
  - **Left: three numbered steps**, unlocking in order (Contact & Address → Delivery → Payment).
    - Step header: heading 18px UPPERCASE ls 1.3px "1. CONTACT & ADDRESS". A completed step shows
      a body 13px summary and a `btn--micro` "Edit".
    - Inputs: 48px, `bg-white`, 1px `#e4e4e4` border (focus `#000`), radius 3px, padding 0 14px,
      system 16px.
    - Labels: body 13px/19.5px above, margin-bottom 6px. Errors: body 12px `#c70000`.
    - Delivery options are radio cards: 1px `#e4e4e4`, radius 3px, padding 14px; selected border
      `#000`. Label heading 14px, detail body 13px `#736b67`, price right body 14px.
    - Stripe Payment Element `appearance`: `{ theme: "stripe", variables: { colorPrimary: "#000000",
      colorText: "#000000", colorDanger: "#c70000", fontFamily: "Inter, ui-sans-serif, system-ui,
      sans-serif", borderRadius: "3px", spacingUnit: "4px" } }`.
    - **Place order:** `btn btn--primary btn--checkout` full width, "PLACE ORDER · $76"
      (`place_order`).
  - **Right: summary,** `bg-tile`, padding 24px, sticky top 85px.
    - Lines: a 64px image (contain, `bg-white`, radius 8px) with a qty badge (18px black circle,
      white heading 10px). Title `font-subheading` 14px, variant body 12px `#736b67`, price right.
    - Totals rows body 14px; total heading 18px. 1px `#e4e4e4` dividers.
- **Confirmation `/order/[id]`:** `container-article`, centred.
  - A `CheckCircle` 48px `#22c55e`.
  - `<h1>` heading 26px/39px UPPERCASE "THANK YOU".
  - body 15px "Order #N is confirmed. We'll email tracking when it ships."
  - The lines (drawer style) and totals.
  - `btn--light` "KEEP SHOPPING".

### 6.9 Story pages `/stories/[handle]`

Derived from Melin's **article page** (§6.6 detail layout) with Shelby's story modules. The
`story-headline` experiment and every `data-track` are unchanged.

1. **Hero image:** full bleed 1440×412 / 390×260, `story-crush.jpg`, cover.
2. `container-article`:
   - meta (article meta style) "THE CRUSH TEST | EPISODE N" or "THE CRUSH TEST";
   - `<h1>` `font-subheading` 34px/44.2px, the experiment headline. Above 80 characters it uses
     28px/36.4px.
   - The **"You just watched"** continuity line: body 13px `#736b67`, with a `Play` 12px icon.
3. **Modules** as article sections, each starting with an article H2 (heading 28.432px):
   - The Problem (paragraphs);
   - The Stance (a blockquote: border-left 4px `#000`, padding-left 20px, heading 22px/28.6px);
   - The Proof:
     - the episode list as rows (1px `#e4e4e4` borders, padding 14px 0): number heading 14px, title
       `font-subheading` 15px, subject body 13px `#736b67`, link `btn--link` "WATCH";
     - `story_see_proof` / `story_episode`.
4. **The offer:** a full-width block inside the column. `bg-band`, padding 24px, a 2-column grid:
   - left, the product image (1:1, contain);
   - right, the PDP buy box at small scale: title row (§6.4.3), swatches (§6.4.7), size (§6.4.8),
     CTA `btn--atc` (`story_shop`), stock line, perks (shipping and returns only).
   - The image follows the picked colour (no URL change).
5. **Your Turn:** `bg-primary text-white`, padding 24px. Heading 18px UPPERCASE "YOUR TURN", body
   15px with the participation prompt, body 13px white/70 "Reply on TikTok. Your answers shape the
   next episode."
6. **Closing:** the 4px rule, then `btn btn--primary btn--atc` full width "GET THE EVERYDAY CAP"
   (`story_close_cta`).

---

## 7. Assets

### 7.1 Product photos (`public/hats/`)

Square **1:1 on pure white #FFFFFF** (regenerated for v4), JPEG. Medusa image URLs point at
`${STOREFRONT_URL}/hats/<file>`. Product and variant images in the seed link each colour to its
own set.

| Slug | -1 | -2 | -3 | extras |
|---|---|---|---|---|
| `everyday-cap-{black,navy,bone,olive}` | ¾ front | back (strap) | side profile | black only: `-4` top-down, `-5` underside, `-6` buckle macro |
| `trucker-{black,bone}` | ¾ front | back (snap) | side | |
| `beanie-{charcoal,rust,cream}` | front | side | top-down (flat) | |
| `performance-cap-{black,stone}` | ¾ front | back | side | |
| `corduroy-cap-{tobacco,forest}` | ¾ front | back | side | |
| `bucket-hat-{sand,black}` | ¾ front | side | top-down | |
| `waxed-field-cap-olive` | ¾ front | back | side | |

**Rendering:**
- On white (cards, PDP, gallery, drawer): `object-contain`, no tile.
- On tinted tiles (`#f5f5f5`, `#ededed`, Shop By Color fills): add the `cutout` utility
  (`mix-blend-mode: multiply`).
- Hover image = image 2 of the same colour.

### 7.2 Lifestyle photos (unchanged)

`lifestyle-hero.jpg` (1376×768), `lifestyle-hero-mobile.jpg`, `lifestyle-corduroy.jpg`,
`lifestyle-bucket.jpg`, `story-crush.jpg` (928×1152). All `object-cover`.

### 7.3 Icons (Phosphor, `regular` weight unless stated)

| Use | Icon | Size |
|---|---|---|
| Hamburger / close | `List` / `X` | 24 |
| Search | `MagnifyingGlass` | 12 / 14 |
| Recently viewed | `Eye` | 24 |
| Bag | `Bag` | 24 |
| Accordions | `Plus` / `Minus` / `CaretUp` / `CaretDown` | 14–16 |
| Carousel arrows | `CaretLeft` / `CaretRight` | 20 |
| Perks | `Truck`, `ArrowCounterClockwise`, `Ruler`, `Package`, `Drop` (`light`) | 48 |
| Details row | `Crown`, `Baseball`, `Buckle`, `Leaf`, `Drop`, `Spiral` (`light`) | 32 |
| Email button | `EnvelopeSimple` | 14 |
| Filters | `SlidersHorizontal` | 14 |
| In the drawer | `CheckCircle` (`fill`) | 16 |
| Offer card | `ArrowRight` | 16 |
| Video | `Play` (`fill`) | 12 |

Server Components import from `@phosphor-icons/react/dist/ssr`, Client Components from
`@phosphor-icons/react`.

### 7.4 Wordmark and favicon

The wordmark is text (§6.0.2), with no image. The favicon stays as is.

### 7.5 Missing image

A `bg-tile` square with the product title in body 12px `#736b67`, centred.

## 8. Third-party integrations

- **First-party analytics** (`src/lib/analytics.ts`, `/api/e`): events, funnels, experiments,
  `page_type` on every event.
- **Umami** when `NEXT_PUBLIC_UMAMI_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` are set.
- **Stripe** Payment Element (appearance in §6.8).
- Melin's ~40 script hosts are **not** adopted: reviews.io, Rebuy, Klaviyo, Postscript, Rivo,
  Intelligems, Global-e, Redo, Corso, AfterShip, Shop Pay / Afterpay, Forter, NoFraud, Sierra chat,
  GTM, Clarity, mParticle, Noibu, ad pixels, ShopMy, Fondue, EqualWeb, GovX. Their UI slots are
  handled in §1.2.

## 9. Build instructions

The project already exists. **Do not** run `create-next-app`. Node 22, so the skill's Node 25
script fix is not needed.

```bash
cd web
npm install                 # no new dependencies
npm run dev                 # http://localhost:3000
npm run build
```

**Steps:**
1. Replace `src/app/globals.css` with §3.
2. In `layout.tsx`, swap Archivo and IBM Plex Mono for Plus Jakarta Sans (500/700/800) and Inter
   (400) (§2.2).
3. Rebuild every component from §5–§6 and §12. Keep data functions, server actions, Track/Exposure,
   SelectionProvider and the experiment hooks.
4. **New client islands:**
   - `cart-drawer.tsx` (driven by a `CartDrawerProvider` with `open()` exposed to every add-to-cart
     path);
   - `recently-viewed.tsx`;
   - `search.tsx` (header);
   - `mega-menu.tsx`;
   - `announcement-bar.tsx` (rotation).
5. Products need `*categories`, `*variants.images`, `+metadata` and `*collection` in Store API
   `fields`. The header search list comes from the cached catalog.

**Cache Components rules:** await `params`, `searchParams` and `cookies()` only inside
`<Suspense>`. Catalog reads use `"use cache"` + `cacheLife("minutes")`. Stock, cart, the countdown,
recently viewed and search are per request or client.

**Known compatibility notes:**
- `mix-blend-mode` on `next/image` needs the class on the `<img>` (`className`), not the wrapper.
- `<dialog>` + `showModal()` for the drawers needs a client component and an `inert` page behind
  (React 19 supports `inert`).

---

## 10. Landing pages, continuity and testing

Every page keeps `<ContinuityBanner />` in `<Suspense>`. Melin-styled, it is a full-width
`bg-mega` bar under the header: body 13px, `Play` icon, "You just watched: [episode]" + `btn--micro`
link.

**Tracked CTAs.** All v3 labels stay, plus the v4 additions:

| Group | Labels |
|---|---|
| Home | `hero_shop_core`, `hero_shop_drop`, `shape_tile`, `shop_by_color`, `core_product`, `home_quiz`, `home_reasons`, `home_story`, `series_story`, `story_episode`, `fit_guide` |
| Nav and search | `nav_shape`, `nav_featured`, `nav_drops`, `nav_explore`, `nav_quiz`, `shape_pill`, `search_result`, `search_submit`, `recently_viewed`, `announcement_drop` |
| Product | `quick_add`, `add_to_cart`, `sticky_add_to_cart`, `pdp_offer`, `pdp_quiz`, `pdp_also_like` |
| Drops | `notify_me`, `drop_hero` |
| Bag and checkout | `cart_complete_look`, `cart_offer`, `cart_checkout`, `checkout_details`, `place_order` |
| Story | `story_shop`, `story_see_proof`, `story_close_cta`, `continuity_story` |
| Fit guide | `fit_guide_quiz`, `fit_guide_shop` |
| Landing pages | `offer_*`, `listicle_*`, `advertorial_*`, `quiz_*` (§12) |

**Experiments:**
- `story-headline` (control: the viewer's question; variant `stance`).
- `offer-headline` (§12.7).
- Both are judged on the purchase funnel, with no verdict before 100 exposures per variant.

## 11. Open questions (business decisions, not built)

1. **Brand name.** "SHELBY" overlaps Carroll Shelby Licensing's marks on apparel and headwear. Run
   a trademark search before any embroidery.
2. **Free-shipping threshold.** Melin's is $120 against a $79–99 hat, with a cart progress bar.
   Shelby charges a flat $6. A threshold of about two hats would let the drawer show Melin's
   progress bar truthfully.
3. **Guarantee and free exchanges** (Melin: Perfect Fit Promise, free exchanges, a 2-year
   warranty). Shelby claims only 30-day returns until the business decides more.
4. **BNPL** (Shop Pay / Afterpay under the CTA and in the drawer). Stripe can offer Klarna or
   Afterpay in the Payment Element if enabled on the account.
5. **Reviews with fit, quality and value sliders,** once there are real reviews. Never seeded or
   invented.
6. **Accessories** ($10–49 add-ons, Melin's "Popular Add Ons" and "Complete Your Kit") to raise
   order value without a second hat.
7. **On-model photography** for the gallery's slot 2 and a "Product | View on Model" toggle.
8. **The two-pack price.** $68 is a demo price; confirm it against margin.

---

## 12. Landing page types

Source: the user's essay outline ("From Customer Insight to Conversion") [ES]. The functions, data,
events and evidence rules below are unchanged from v3. Only the visual layer moves to Melin's
system. The traffic map, brief and compliance check live in `docs/landing-pages/`.

### 12.0 Rules every landing page follows

- **Evidence:** §1.3. No generated proof. Empty sources drop their block.
- **Voice:** Shelby's brand voice ("we", "you"). Never a fictional customer or editor.
- **Structure:** shared blocks in `src/components/lp/` (AdLabel, Hook, ReasonBlock, ProofList,
  StockList, Faq, ClosingCta, StickyCta, ProductOffer, OfferCard), restyled with §2–§6:
  - article blocks use `container-article`;
  - buy blocks use the PDP buy box (§6.4.3–§6.4.13);
  - FAQ uses the PDP accordion (§6.4.18);
  - closing CTAs are `btn--primary btn--atc`.
- **SEO:** one H1 per page, `generateMetadata` title and description.
- **Continuity:** `<ContinuityBanner />` on every page; `?asset=` works everywhere.
- **Measurement:** every event carries `page_type` (home, collection, pdp, offer, listicle,
  advertorial, quiz, quiz_result, story, drops, fit_guide, cart, checkout, order, other). Every CTA
  has a `data-track` label, and each page fires one view event.
- **Purchase actions:** each add-to-cart adds the exact variant shown at its live price, then opens
  the drawer (§6.7).
- **StickyCta** (mobile): Melin's sticky buy bar (§6.4.15) at the top under the condensed header,
  80px. Thumbnail, price, and the page's CTA (39px).

### 12.1 Offer landing page `/offer/[handle]` (first: `/offer/everyday-two-pack`)

Derived from Melin's **PDP** (§6.4).

**Data** (unchanged):
- Product `everyday-two-pack` (`metadata.offer`, `offer_path`, `single_handle`, `compare_at`).
- 16 inventory-kit variants: First cap × Second cap.
- $68 is a demo price.
- The product is excluded from `/shop`, shape tiles, menus, the fit guide, home, search and
  suggestions. `/products/everyday-two-pack` redirects to the offer page.

1. Continuity banner.
2. **Above the fold** (§6.4.1 grid):
   - **Gallery:** two squares side by side (362×362 each, desktop), the first and second chosen
     caps' `-1` photos. Each has a caption under it, body 12px `#736b67`: "Cap 1 · Navy", "Cap 2 ·
     Olive". Then the selected colours' `-3` photos as a second row. Mobile: the two `-1` photos
     side by side, 2× 171px.
   - **Info column:**
     - title row: `<h1>` body 20px/25px UPPERCASE with the experiment text (control "TWO EVERYDAY
       CAPS. $68." / variant `saving` "SAVE $8 ON TWO EVERYDAY CAPS."). Right: the price "$68" body
       18px, with "$76" under it (line-through, body 14px `#736b67`).
     - type row: "The Two-Pack · Core" body 15px `#736b67`;
     - a badge "Save $8" (§6.2 badge), computed and hidden if ≤0;
     - description (system 16px): the promise and "Pick any two colors. Singles stay $38.";
     - divider;
     - **two swatch groups** (§6.4.7): "First Cap: Navy" and "Second Cap: Olive", each a 7-column
       grid of 42px circles. Sold-out kit options get the strike;
     - size: the one-size block (§6.4.8);
     - CTA `btn--atc` "ADD THE PAIR - $68" (`offer_add`; "- LOW INVENTORY" when the kit has ≤5);
     - stock line (§6.4.11, kit availability);
     - perks: Shipping, "30-Day Returns On The Pair", One Size.
3. **Lower bands** (`bg-band`, §6.4.16 frame):
   - **What's Included:** a features row of 4 tiles: Two Caps, One Size Each, the shared specs
     (`details`), One Shipping Charge.
   - **Why Two:** 3 use-case cards: A Dark One And A Light One · One For The Car Or Bag · You
     Already Know The Fit.
   - **Proof:** the In Stock Today row (§6.1.6 items); the crush-test stance (blockquote style,
     §6.9) linked to its story (`offer_story`); the fit scales (§6.4.14).
   - **FAQ:** §6.4.18 accordions: Will it fit? · Can I pick the same color twice? · Returns ·
     Shipping · Is this a sale? ("No. Two cost $68; singles stay $38.").
4. **Closing:** centred, padding 50.512px 0. Heading 22px "Pick Your Two", then `btn--primary
   btn--atc` 370px "PICK YOUR TWO" → top (`offer_close_cta`).
5. **StickyCta** (mobile, §12.0): "ADD THE PAIR - $68" (`offer_sticky_add`).

Events: `offer_viewed` {offer}, `add_to_cart` {source: "offer"}. Entry points: the PDP card
(§6.4.9), the drawer (§6.7), the FEATURED menu, the listicle, advertorial and quiz result.

### 12.2 Listicle `/reasons/[handle]` (first: `/reasons/everyday-cap`)

Derived from Melin's **article page** (§6.6 detail). Content is in `src/lib/landing/listicles.ts`.

1. Continuity banner. Hero image full bleed 1440×412 / 390×260: `everyday-cap-black-1.jpg` contain
   on `bg-tile` (`cutout`).
2. `container-article`:
   - meta "6 REASONS | THE EVERYDAY CAP";
   - `<h1>` `font-subheading` 34px/44.2px "6 Things That Make The Everyday Cap Different";
   - the dek as an article paragraph;
   - the **jump list:** an ordered list, 1px `#e4e4e4` top and bottom borders, rows 40px (number
     heading 14px + `btn--micro` link to `#reason-n`).
3. **Reasons** (ReasonBlock): an article H2 "1. Broken In On Day One" with `id="reason-1"`; the
   image full column width (1:1 contain on white, or cover for lifestyle), max-height 448px; 1–3
   article paragraphs; a "the fact" line in body 13px `#736b67` with a `CheckCircle` 14px.
   - The 6 reasons and their facts are unchanged from v3 (fabric, crown scales, the one-size range,
     the series stance, live stock, returns).
   - Reason 4 is omitted without an active series.
   - After reasons 3 and 6: `btn--primary btn--atc` full width "SHOP THE EVERYDAY CAP"
     (`listicle_mid_cta`, `listicle_end_cta`) → `#buy`.
4. **Buy block** (`#buy`): the §6.9 offer block (`bg-band`) with the BuyBox, then
   `btn--link` "OR GET TWO FOR $68" (`listicle_offer`).
5. Closing 4px rule. **StickyCta** "SHOP THE EVERYDAY CAP - $38" (`listicle_sticky`).

Event: `listicle_viewed` {listicle}.

### 12.3 Advertorial / presell `/read/[slug]` (first: `/read/one-cap`)

Derived from Melin's **article page**. Content is in `src/lib/landing/advertorials.ts`.

- **AdLabel**, in the meta slot above the H1: "ADVERTISEMENT | FROM SHELBY" (article meta style:
  10px UPPERCASE ls 1px, **opacity 1**, `#000`, with a 1px `#000` box, padding 2px 6px). At the end,
  the disclosure in body 13px `#736b67`: "This is an advertisement from Shelby, the company that
  makes the Everyday Cap."
- **Hero:** `story-crush.jpg` full bleed 1440×412.
- **Column:**
  - `<h1>` `font-subheading` 34px/44.2px;
  - the dek as an article paragraph at 18px/27px;
  - the byline in body 12px UPPERCASE ls 0.48px: "BY SHELBY | N MIN READ | [DATE]".
- **Five beats** as article H2 sections (problem → why it happens → what we changed → how we check
  it → the offer), with second-person paragraphs.
- **Figures:** column width with a `figcaption` in body 12px/18px `#736b67`, 8px under the image.
- **Inline CTAs** after the mechanism and proof beats: `btn--light` "SEE THE EVERYDAY CAP"
  (`advertorial_inline`).
- **OfferCard** at the end: `bg-band` padding 24px, a 2-column grid.
  - Left: the image (contain).
  - Right: title row (§6.4.3), live price, `btn--primary btn--atc` "SHOP THE EVERYDAY CAP"
    (`advertorial_offer_pdp`), `btn--link` "OR GET TWO FOR $68" (`advertorial_offer_pack`).
- Closing 4px rule. **StickyCta** (`advertorial_sticky`). Not linked in nav or footer (paid-traffic
  page).

Event: `advertorial_viewed` {slug}. Presell metric unchanged.

### 12.4 Quiz `/quiz` and result `/quiz/result`

Derived from Melin's **fit finder** (`/collections/fit-finder`).

**`/quiz`:**
- **Desktop:** `grid grid-cols-[1fr_2fr]` full width.
  - **Left panel:** sticky, `background: linear-gradient(180deg, #ececec 0%, #ffffff 100%)`,
    min-height `calc(100vh - 61px)`, padding 50.512px 51px.
    - H2 heading 26px/33.8px "Find Your Fit";
    - 12px gap, then body 13px/19.5px "Four questions about how you wear a hat. We'll match you to
      one style, a color that's in stock and, for sized hats, a size.";
    - 24px gap, then the 96px Ruler circle mark (§6.1.4);
    - `btn--micro` "Rather measure? Read the fit guide" (`quiz_fit_guide`).
  - **Right:** the flow, `max-w-[560px] mx-auto`, padding-top 50.512px.
    - **Progress:** 4 dashes in a row (each `flex-1`, 4px tall, gap 8px; done and current `#000`,
      rest `#e4e4e4`), then "1 of 4" body 12px `#736b67` right.
    - 32px gap, then `<h1>` heading **26px/33.8px**, the question.
    - 24px gap, then the answers as a column of `btn btn--light btn--large` full width (56px, 2px
      border, ink fill on hover), gap 12px, label heading 14px ls 1.3px UPPERCASE, `ArrowRight`
      16px at the right edge.
    - Under them, `btn--micro` "Back".
- **Mobile:** the left panel collapses to a 120px gradient band with the H2 and body. The flow
  follows with padding 28.432px 16px. Answers are 39px with a 1px border (§5 mobile `large`).
- Questions, events and scoring are unchanged from v3 (`use`, `fit`, `crown`, `colors`;
  `quiz_started`, `quiz_answered`; `src/lib/quiz.ts`).

**`/quiz/result`:** derived from Melin's **PDP**.
- `<h1>` above the grid, `container-shop`, padding-top 37.904px, centred:
  - meta in `type-eyebrow` UPPERCASE `#736b67`: "YOUR MATCH";
  - heading 26px/39px UPPERCASE: "THE EVERYDAY CAP IN OLIVE".
- **The §6.4.1 grid:**
  - the gallery of the matched colour;
  - the info column, which:
    - opens with **"Why It Fits You"**: a list in heading 14px UPPERCASE ls 1.3px, then rows of a
      `CheckCircle` 14px plus body 14px/21px, each pairing an answer with a fact;
    - then the buy box preselected (colour; size when tight or loose), `add_to_cart` with
      `source: "quiz"`;
    - then the Fit Guide scales (§6.4.14);
    - then the Make It Two card when the match is the Everyday Cap (§6.4.9).
- **Below** (`bg-band` band): "Runner-Up", one product card (§6.2) at 263px, then `btn--light`
  "RETAKE THE QUIZ" (`quiz_retake`).
- Event `quiz_completed`. Invalid parameters redirect to `/quiz`.

**Entry points:** home (§6.1.4, `home_quiz`), the PDP (§6.4.12, `pdp_quiz`), the fit guide
(`fit_guide_quiz`), the nav (`nav_quiz`), the FEATURED menu and the footer.

### 12.5 Story page `/stories/[handle]`

§6.9.

### 12.6 Homepage and PDP entry points

- **Home:** quiz (§6.1.4), reasons (§6.1.8), story (§6.1.7, §6.1.9).
- **PDP:** quiz link (§6.4.12), Make It Two (§6.4.9).
- **Drawer:** the two-pack row (§6.7).

### 12.7 Experiment

`offer-headline`:
- Seeded and running, 50/50 split, minimum sample 100 per variant.
- Primary metric `add_to_cart` with `page_type = offer`, then `order_completed`.
- Judge only after the minimum sample.
