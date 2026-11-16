# Shelby storefront: complete site specification (v6, one golf rope cap on the Allbirds theme)

The single source of truth for building `web/`. **v6 = Part G (the golf layer and the single Rope
Cap, below) on top of v5 (Shelby's structure reskinned in the visual theme and motion of
allbirds.com, §1–§11) and Appendix A (v4 functions).** Precedence: Part G → v5 §1–§11 →
Appendix A. The builder never looks at allbirds.com, Melin or any golf brand's site; every value
needed is in this file. The Expo app follows the same layers from `mobile/APP_SPEC.md` v6.

**v6 inputs (2026-11-16):** `reports/Golf brand rope cap positioning.md` and its notes in
`research_notes/Golf brand rope cap positioning/` (golf brand landscape, visual identity measured
from 13 live sites, the rope cap market, single-product merchandising, channels). The Allbirds
capture below is v5's and is unchanged.

**How it was captured (2026-11-16)**, with the user's site-clone workflow:
- **Firecrawl** (all four skill operations):
  - a full-format scrape of the home page (markdown, html, rawHtml, full-page screenshot, links);
  - a crawl of 10 pages, polled to completion (10/10);
  - full-page html + screenshot scrapes of a collection (`/collections/mens`), a shoe PDP
    (`/products/mens-runner-nz-slip-on`), two editorial pages (`/pages/our-story`,
    `/pages/sustainability`), search (`/search?q=runner`) and the cart.
- **curl:** the raw home, collection, PDP and story HTML. Every stylesheet: `theme.css` (a Tailwind 4
  build, 275,898 bytes, with a `@layer theme` token block and a `@layer components` block),
  `ab-quick-add.css`, `cart-drawer-section.css`, `accelerated-checkout-backwards-compat.css`, and the
  two inline `<style>` blocks.
- **The motion source itself:** the theme's ES modules, i.e. the GSAP + ScrollTrigger timelines in
  `animations.js` (every duration and ease constant), `base-section.js` (in-view trigger options),
  `full-bleed-hero.js`, `category-row.js`, `standard-product-carousel.js`, `3x-promo-tiles.js`,
  `header.js`, `use-sticky-scroll-behavior.js`, `cart-drawer-section.js`, `use-post-atc-modal.js`,
  `use-master-product-card.js`, `product-material-hero-feature.js`, `brand-message.js`,
  `product-social-proof.js`, `ugc-scroll.js`, `product-details.js`, `recommendations-carousel.js`.
- **Playwright** (pre-installed Chromium) at **390×664** (iPhone 13 device profile; its CSS viewport
  is 390×664) and **1440×900**:
  - `getComputedStyle` + class lists of every visible element on home, collection, PDP and story
    (370–880 elements per page);
  - state probes: hover (category tiles, product cards, promo tiles, size buttons, add-to-cart),
    mega menu open, mobile menu open, add-to-cart → cart drawer;
  - time sampling mid-transition (hero reveal at 100ms steps, tile hover at 300ms and 1.2s, drawer at
    150/500/1700ms, menu at 150/1050ms) to confirm each timeline's duration and curve.
- Raw captures stay in the session scratchpad (`scratchpad/allbirds-clone/`), never in git.

Value notation: `desktop / mobile` when they differ. px at 1440 and 390 wide. Breakpoints are
Tailwind's: **md = 768px**, **lg = 1024px**, xl = 1280px, 2xl = 1536px.

---

# Part G: v6, the golf layer and the single Rope Cap (overrides v5 where they conflict)

Source for every decision in Part G: `reports/Golf brand rope cap positioning.md` ("the report"),
section "Shelby's plan" unless another section is named. Part G is written in the skill's
structure (overview, tokens, globals, Tailwind, components, section-by-section, assets,
integrations, build, open questions). **Precedence:** Part G → v5 §1–§11 → Appendix A. v5's
Allbirds tokens, components and motion stay the visual base. Appendix A's data sources,
`data-track` names, `page_type` values, experiments and evidence rules stay binding, except where
Part G changes structure (G.6.0 lists every renamed, new and retired label).

## G.1 Project overview

| | |
|---|---|
| Brand | **shelby**, a hat-led golf brand. Name pending a trademark search (G.11). |
| What it sells | **One product: The Rope Cap.** Four core colours always in stock at **$48**; numbered limited editions ("holes") at **$52**; two bundles, **The Pair** ($88, any two core colours, $44 a cap) and **The Foursome** ($152, $38 a cap); custom club and outing orders at **$40 a cap**, 24 minimum (quoted, G.6.10). Every price is a research-recommended demo value (G.11). |
| Who it is for | People who play and the larger crowd around the game: the range regular, the simulator league, the muni foursome, the friend who never keeps score (report, "Positioning"). |
| Positioning line | **Shelby makes one rope cap, properly**: washed cotton, a mid crown that sits right, a rope worth looking at, and a new numbered colour when the golf season turns. |
| Segment | Hat-led brand with modern-golf styling (Malbon, Students, Metalwood are the reference brands, never copied), on v5's calm Allbirds base. |
| Stack | Unchanged from v5 §1. One added font (Libre Caslon Text, `next/font/google`), one small backend module (custom quotes, G.6.10). No new npm dependency on web. |
| Mobile | `mobile/APP_SPEC.md` v6 Part G mirrors this part. |

### G.1.1 Which source governs what in v6

| Concern | Source |
|---|---|
| Catalog, prices, bundles, shipping threshold, holes and dates, page inventory and routes | **Part G** |
| Golf tokens (green, midnight, sage, rope colours), the serif face, scorecard, rope rule, ticker, edition badge, hole card | **Part G** |
| Every other visual value and every motion | **v5 §2–§6** (Part G names which v5 component each new element reuses) |
| Data plumbing, server/client split, caching, events, experiments, evidence rules, continuity | **Appendix A**, with Part G's renames |

### G.1.2 The scorecard metaphor (whole-site system)

One metaphor runs through the site (report, "Positioning"):

| Golf word | Shelby meaning | Where |
|---|---|---|
| **Hole** | One numbered release on the 2027 calendar. Hole 1 is the core launch. | The Card, ticker, PDP badges, home band |
| **The Card** | The drop archive and calendar (was "Drops"), route `/card` | Nav, footer, G.6.7 |
| **The tee sheet** | The waitlist / notify list for the next hole (was "Get drop alerts" / "Notify me") | Every notify form |
| **The scorecard** | The PDP spec table, ruled like a scorecard | G.5.2, PDP, home, fit guide |

The metaphor is used as structure and labels only. No golf puns anywhere.

### G.1.3 Voice rules (binding)

- Allbirds-plain and warm, with dry wit (Students-style). Short sentences. "We" and "you".
- **Never:** puns ("fore", "hole in one", "par for the course", "tee-rific", "drive" wordplay…);
  "since 19xx" or any heritage a new brand cannot back; "members only", "exclusive", "elite";
  claims about specific 1980s players or tour sightings (unverified history, report "Three
  revivals").
- **No tournament, tour or club marks** in product names, copy, image alt text or metadata: no
  Masters, Augusta, Azalea Bowl, PGA, PGA Tour, LIV, Ryder Cup, U.S. Open, The Open, St Andrews,
  Pebble Beach, Pinehurst or any club name or logo. Calendar moments are described neutrally:
  "the first major week", "the national championship weekend", "the links major", "the team match
  in September", "the holidays". "Azalea", "Cypress", "Haar", "Away Match" and "Winter Rules" are
  colour and edition names, not marks.
- UI strings stay US English ("Color", "Bag"). Casing per v5 §1.3.

### G.1.4 Avoid (from the report's "Avoid" row and the golf visual-identity research)

1. Discount popups or any modal over the hero.
2. Anton-style shouting: condensed all-caps display headlines. Headlines stay sentence case (v5 §1.3).
3. Pun graphics, crossed clubs, golf-ball dimple textures, flag clip art, argyle, tartan.
4. Crest pastiche, faux badges, "est." dates, laurel wreaths.
5. Specific 1980s player claims or retro-tour imagery.
6. Saturated party prints. The palette is v5 neutrals plus G.2.1's golf tokens only.
7. A free-shipping progress bar that lies: it shows only the real $85 threshold (G.6.8).
8. Fake scarcity: no countdown without a real `release_at`, no "only N left" without live stock, no
   "selling fast", no invented edition numbers (G.1.5).

### G.1.5 Evidence rules added in v6 (with v5 §1.4, all still apply)

- **Ticker:** real data only (G.5.3). An item with no data source is not shown.
- **Edition counts:** "Edition of 200" comes from the edition product's `metadata.edition.size`;
  "N left" is live sellable stock. The site never assigns a buyer a specific number ("No. 041"); the
  order page says only that the number is printed inside (G.6.9), and only for products whose
  `metadata.edition.numbered_inside` is `true` (a production requirement, G.11).
- **Countdowns:** only to a release's real `release_at` (v4 rule), or to the announced date of
  Holes 5–6 from `src/lib/holes.ts` (labelled "Announced", no countdown until a release exists).
- **Credibility strip:** hidden until `src/lib/credibility.ts` holds at least one item, and every item
  needs a `source` (a URL or a dated note). No press logos, quotes or counts are invented.
- **Crown height:** "about 11–11.5 cm" is the product spec (`metadata.crown_cm`), stated as a target
  spec until the factory sample is measured (G.11).

---

## G.2 Design tokens (additions; v5 §2 stays)

### G.2.1 Colour

| Token | CSS variable | Value | Use |
|---|---|---|---|
| Golf green | `--color-golf-green` | `#1E3B2F` | **One band per page** (G.6 names it), the `link` text colour, selected states (G.2.2) |
| Golf green hover | `--color-golf-green-hover` | `#104734` | Hover on golf-green fills and links |
| Golf tint | `--color-golf-tint` | `#EEF5E8` | Colour-tile backdrops (G.6.2), quiet green panels |
| Midnight | `--color-midnight` | `#03143b` | **Activated** (was "not used" in v5): headings on The Card and hole pages, the edition badge |
| Sage | `--color-sage` | `#B9B78D` | Colour-tile backdrops (G.6.2) |
| In stock (unchanged) | `--color-green` | `#10714e` | In-stock dot and text only. **Never** used as golf green, and golf green is never used for stock. |

**Rope Cap colourways** (swatches render crown + rope, G.5.6). Hexes are design values for the
swatches, not measured from the photos.

| Colourway | Group | Crown | Crown hex | Rope | Rope hex | Strap |
|---|---|---|---|---|---|---|
| Tour White | Core | White | `#F4F2EE` | Navy | `#1F2A44` | Self-fabric, antique-brass slide |
| Clubhouse Navy | Core | Navy | `#26314A` | White | `#F4F2EE` | same |
| Pine | Core | Forest | `#1E3B2F` | Cream | `#EDE6D6` | same |
| Fescue | Core | Stone | `#C9C1AE` | Navy | `#1F2A44` | same |
| Azalea | Limited, Hole 2 | White | `#F4F2EE` | Azalea pink | `#D8648A` | Tan leather, brass buckle |
| Cypress | Limited, Hole 3 | Coastal green | `#2E4B4A` | Sand | `#CDBB98` | Tan leather, brass buckle |
| Haar | Limited, Hole 4 | Fog grey | `#A7ABA8` | Cream | `#EDE6D6` | Tan leather, brass buckle |

`--color-rope-*` variables carry the rope hexes: `--color-rope-navy #1F2A44`, `--color-rope-white
#F4F2EE`, `--color-rope-cream #EDE6D6`, `--color-rope-azalea #D8648A`, `--color-rope-sand #CDBB98`.
The swatch lookup (`src/lib/swatches.ts`) adds the seven colourways by name and returns
`{ crown, rope }`.

### G.2.2 Selected states move to golf green

| Element (v5 reference) | v5 | v6 |
|---|---|---|
| Selected swatch ring (§2.3) | `0 0 0 1px #212121` | `0 0 0 1px #1E3B2F` |
| Segmented control active segment (§6.3) | `bg-black text-natural-white-60` | `bg-golf-green text-white` |
| Quiz option selected (§6.13) | `bg-black text-white border-black` | `bg-golf-green text-white border-golf-green` |
| `.tab-title` active / hover underline (§3) | `#212121` | `#1E3B2F` |
| `.checkbox:checked::before` (§3) | `#212121` | `#1E3B2F` |
| Quiz progress fill, fit-scale active segment (§6.4.3 item 11) | `bg-black` | `bg-golf-green` |
| `link` variant text (§5) | inherits | `#1E3B2F`, hover `#104734`, underline thickness 2px on hover (v5 rule) |

**Unchanged:** every CTA button (`btn-secondary` `#212121`), the footer (`#212121`), the
announcement / ticker bar (`#212121`), size buttons, badges, stock colours.

**One golf-green band per page.** A "band" is a full-width or rounded section whose background is
`--color-golf-green`. Each page gets exactly one (named in G.6). Text on it is white; buttons on it
are `btn-primary` (white) or `btn-outline-white`; links are white.

### G.2.3 Typography

**Serif role filled.** v5 §11 item 9 is resolved: Allbirds' Self Modern role becomes **Libre Caslon
Text** (a free Google Font, loaded directly per the skill's rule for Google Fonts):

| Role | Font | Load | Variable | Class |
|---|---|---|---|---|
| Serif (v5 "serif-role": PDP title, tile titles, pill quotes, article H1s) and **kickers** | **Libre Caslon Text** 400, normal + italic | `next/font/google` `Libre_Caslon_Text`, `weight: ["400"]`, `style: ["normal", "italic"]` | `--font-caslon` → `--font-serif` | `font-serif` |
| Display, sans, mono | unchanged from v5 §2.2 | | | |

Fallbacks for `--font-serif`: `ui-serif, Georgia, serif`. `font-display: swap`. Never synthesize a
bold: Caslon is only ever weight 400.

**v6 type additions and overrides** (all other rows of v5 §2.2 stand)

| Role | Font | Size / line-height | Style | Tracking | Case | Colour |
|---|---|---|---|---|---|---|
| PDP title (overrides v5) | serif | 30/36 / 24/32 | **italic** | normal | Title | `#212121` |
| Serif tile title (overrides v5) | serif | 40/48 / 30/38 | italic | normal | Title | per tile (G.6.2) |
| Pill quote (overrides v5) | serif | 24/40 (lg) · 18/32 (md) · 16/24 | italic | normal | Sentence | white |
| Article H1 (overrides v5 §6.12) | serif | 40/48 (md) · 30/38 | normal | −.005em | Sentence | `#212121` |
| **Kicker** (new) | serif | 18/26 / 16/24 | italic | normal | Sentence | inherits (`#575757` on light, `#EEF5E8` on golf green) |
| **Scorecard label** (new) | mono 500 | 11/16 | normal | **.2em** (2.2px) | UPPER | `#212121` |
| **Scorecard number** (new) | mono 500 | 12/16 | `tabular-nums` | .1em | | `#575757` |
| **Edition line** (new) | mono 500 | 12/16 | `tabular-nums` | .15em (1.8px) | UPPER | `#03143b` |
| **Ticker** (new) | mono 400 | 11/16 / 10/16 | `tabular-nums` | .2em | UPPER | white |
| **Hole number** (new) | display 400 | 40/48 / 32/40 | `tabular-nums` | −.01em | | `#03143b` (white on golf green) |
| **Card heading** (new, The Card H1 and hole titles) | display 400 | 30/36 / 24/32 | normal | normal | Sentence | `#03143b` |

### G.2.4 Spacing, radius, layout additions

- **Scorecard grid:** number column 44px, label column 140px (md) / 104px, value column `1fr`; rows
  min-height 44px; cell padding 12px 14px; outer radius 12px (`rounded-xl`, v5 token) on a 1px
  `#212121` border; inner rules 1px `#212121` horizontal, 1px `rgba(33,33,33,.2)` vertical.
- **Rope rule:** 4px tall, radius 9999px, full width of its container; stripe period 8px (G.5.4).
- **Ticker bar:** height 32px (one line, all widths); item gap 32px; separator dot 4px.
- **Hole card:** see G.5.5. **Edition badge:** height 24px, padding 0 10px, radius 9999px, 1px border.
- **Colour tile inner disc:** a white circle at 72% of the tile width, centred at 46% from the top
  (G.6.2).

### G.2.5 Motion additions (v5 §2.4 stays; same easing tokens; same reduced-motion rules)

| # | Effect | Element | Trigger | Property: from → to | Duration · ease · delay |
|---|---|---|---|---|---|
| M34 | Ticker crawl | Ticker track (two copies of the item list) | always, while in view | `translateX(0)` → `translateX(-50%)` | **linear**, duration = one copy's width ÷ **40px/s** (set as `--ticker-duration` from a ResizeObserver; minimum 20s), infinite. `animation-play-state: paused` on `:hover` / `:focus-within`. |
| M35 | Scorecard rows | Scorecard `tr` (`data-reveal-child`) | the scorecard's band reveal (M1) | opacity 0 → 1 | 0.8 · sine.out · `--i × 0.05` (M7 stagger) |
| M36 | Rope rule draw | Rope rule | its container's reveal (M1) | `scaleX(0)` → `scaleX(1)`, `transform-origin: left` | 0.8 · power3.out · 0.2 (`ELEMENT.SCROLL_BAR`) |
| M36a | Rope rule colour | Rope rule stripes | colourway change | background crossfade via an opacity swap of two stacked layers | 0.2 · sine.in-out (M11 timing) |
| M37 | Hole card lift | Hole card (G.5.5) on hover-capable devices | `:hover` | image `scale 1 → 1.04`; card `translateY(0) → translateY(-4px)` | 0.6 · power3.in-out (`ELEMENT.HOVER.DEFAULT`) |
| M38 | Swatch rope band | Swatch rope band (G.5.6) | select | band `scaleX(.6) → scaleX(1)` | 0.2 · ease-in-out (M13 timing) |

**Reduced motion:** M34 stops (static first item with the v5 announcement chevrons, G.5.3); M35
rows render visible; M36 renders full width; M37 and M38 are instant.

---

## G.3 Global styles (append to v5 §3 `globals.css`)

```css
@theme inline {
  --font-serif: var(--font-caslon), ui-serif, Georgia, serif; /* overrides v5 §3 */

  --color-golf-green: #1E3B2F;
  --color-golf-green-hover: #104734;
  --color-golf-tint: #EEF5E8;
  --color-midnight: #03143b;
  --color-sage: #B9B78D;
  --color-rope-navy: #1F2A44;
  --color-rope-white: #F4F2EE;
  --color-rope-cream: #EDE6D6;
  --color-rope-azalea: #D8648A;
  --color-rope-sand: #CDBB98;

  --animate-ticker: ticker var(--ticker-duration, 60s) linear infinite;
}

@layer components {
  /* G.2.2 selected states */
  .swatch[aria-checked="true"] { box-shadow: 0 0 0 1px var(--color-golf-green); }
  .tab-title[aria-selected="true"], .tab-title:hover { border-bottom-color: var(--color-golf-green); }
  .checkbox::before { box-shadow: inset 1em 1em var(--color-golf-green); }
  .link { color: var(--color-golf-green); text-decoration: underline; text-underline-offset: 2px; }
  @media (hover: hover) { .link:hover { color: var(--color-golf-green-hover); text-decoration-thickness: 2px; } }
  .band-golf { background: var(--color-golf-green); color: #fff; }
  .band-golf .link { color: #fff; }

  /* G.2.3 */
  .kicker { font-family: var(--font-serif); font-style: italic; font-size: 1rem; line-height: 1.5rem; }
  @media (min-width: 48rem) { .kicker { font-size: 1.125rem; line-height: 1.625rem; } }
  .label-score { font-family: var(--font-mono); font-weight: 500; font-size: 11px; line-height: 1rem; letter-spacing: .2em; text-transform: uppercase; }
  .edition { font-family: var(--font-mono); font-weight: 500; font-size: .75rem; line-height: 1rem; letter-spacing: .15em; text-transform: uppercase; font-variant-numeric: tabular-nums; color: var(--color-midnight); }

  /* G.5.2 scorecard */
  .scorecard { width: 100%; border: 1px solid var(--color-black); border-radius: .75rem; overflow: hidden; background: #fff; border-collapse: separate; border-spacing: 0; }
  .scorecard th, .scorecard td { padding: 12px 14px; vertical-align: middle; text-align: left; }
  .scorecard tr + tr > * { border-top: 1px solid var(--color-black); }
  .scorecard tr > * + * { border-left: 1px solid rgba(33, 33, 33, .2); }
  .scorecard thead th { background: var(--color-golf-green); color: #fff; }

  /* G.5.4 rope rule */
  .rope-rule {
    height: 4px; border-radius: 9999px; transform-origin: left;
    background: repeating-linear-gradient(135deg, var(--rope) 0 4px, var(--crown) 4px 8px);
    box-shadow: inset 0 0 0 1px rgba(33, 33, 33, .15);
  }

  /* G.5.5 edition badge */
  .badge-edition { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 9999px; border: 1px solid var(--color-midnight); background: #fff; }
}

@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

@media (prefers-reduced-motion: reduce) {
  .animate-ticker { animation: none !important; transform: none !important; }
}
```

Body class string and selection are unchanged (v5 §3).

---

## G.4 Tailwind config and fonts

Tailwind stays CSS-first (v5 §4). `src/app/layout.tsx` adds the serif:

```tsx
import { IBM_Plex_Mono, Inter, Libre_Caslon_Text, Plus_Jakarta_Sans } from "next/font/google"
const caslon = Libre_Caslon_Text({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-caslon", display: "swap" })
// <html lang="en" className={`${inter.variable} ${jakarta.variable} ${plexMono.variable} ${caslon.variable}`}>
```

---

## G.5 Components

### G.5.1 Buttons
v5 §5 unchanged. Add `link` colours from G.2.2. On a golf-green band use `btn-primary` (white fill,
`#212121` text, hover `#212121` fill + white text) and `btn-outline-white`.

### G.5.2 Scorecard spec table (`src/components/scorecard.tsx`, server)
- `<table class="scorecard">` with `<caption class="sr-only">The Rope Cap specs</caption>`.
- **Head row** (golf green, white): three `th`: "NO." · "SPEC" · the product title in `.kicker`
  (e.g. *The Rope Cap*), all `.label-score` except the title.
- **Body rows**, numbered like holes, in this fixed order; a row whose value is missing is dropped
  and the numbering closes up:

  | No. | Label | Value source |
  |---|---|---|
  | 01 | CROWN | `details.Crown` (e.g. "Mid profile, about 11–11.5 cm, lightly structured front") |
  | 02 | PANELS | `details.Panels` |
  | 03 | ROPE | `details.Rope`, plus " · [rope colour]" for the selected colourway |
  | 04 | BRIM | `details.Brim` |
  | 05 | CLOSURE | `details.Closure` |
  | 06 | FABRIC | `details.Fabric` |
  | 07 | SWEATBAND | `details.Sweatband` |
  | 08 | FIT | "One size · 21.5–23.75 in (55–60 cm)" (`POLICY.oneSize`) |
  | 09 | ORIGIN | `details.Origin` (absent until the factory is chosen, G.11; the row is dropped) |
  | 10 | EDITION | limited editions only: "Edition of [size] · [N] left" (`.edition`) |

- Cells: number `td` `.label-score` `tabular-nums` `#575757` (44px column); label `th scope="row"`
  `.label-score`; value `td` Inter 14/20 `#212121`.
- Mobile: same table, label column 104px, value wraps.
- Motion: the band reveals (M1); rows stagger in (M35).

### G.5.3 Ticker (`announcement-bar.tsx`, replaces the v5 crossfade content; keeps v5 §6.0.1's box)
- Box: v5 §6.0.1 (`sticky top-0 z-[85] bg-black text-white`), fixed at **32px** (one line on every
  width; the v5 46px two-line state is gone). Sets `--global-banner-height: 32px`.
- Track: `flex w-max animate-ticker`, the item list rendered **twice** (`aria-hidden` on the copy).
  Each item: `.label-score`-style text in the **Ticker** type role (G.2.3), white, with
  `tabular-nums`; items separated by a 4px `bg-white/60` dot with 32px gaps.
- **Items (real data only, in this order; each hidden when its source is empty):**
  1. Next hole: "HOLE [n] · [NAME] · [DD MON YYYY] · [h:mm A] PT" from the soonest upcoming release
     (`release_at`, `STORE_TIMEZONE`) and its product's `metadata.edition.hole`.
  2. Each **live** numbered edition: "[NAME] · [N] OF [size] LEFT" (live stock; `size` from
     `metadata.edition.size`).
  3. Each **upcoming** numbered edition: "[NAME] · EDITION OF [size]".
  4. Core: "THE ROPE CAP · $[price] · [k] CORE COLORS IN STOCK" (live price; `k` = core colourways
     with stock > 0).
  5. Policy: "FREE SHIPPING ON $85+" and "30-DAY RETURNS" (`POLICY`).
- Items 1–3 link to `/card/[handle]` (`data-track="ticker_item"`); item 4 to `/products/rope-cap`.
- Motion M34; pause on hover / focus. **Reduced motion:** no crawl; one item at a time with v5's
  prev/next chevrons (no autoplay).
- `aria-label="Shelby leaderboard"`, `role="region"`; the duplicate copy is `aria-hidden`.

### G.5.4 Rope rule (`src/components/rope-rule.tsx`, client)
- A `div.rope-rule` with `style={{ "--crown": crownHex, "--rope": ropeHex }}` from the selected
  colourway (G.2.1). Stripes: `repeating-linear-gradient(135deg, rope 0 4px, crown 4px 8px)`, the
  look of braided cord. The 1px inset ring keeps white-on-white stripes visible.
- Placement: PDP buy card between the price row and the colour picker (G.6.3); offer page under each
  picker (G.6.5); hole cards under the title (G.5.5).
- Motion M36 on reveal, M36a on colour change (two stacked layers; the new one fades in).
- `role="presentation"`.

### G.5.5 Hole card (`src/components/hole-card.tsx`)
- v5 product-card box (`rounded-2xl bg-white`, M9) with:
  - top row `flex justify-between p-4`: **hole number** "HOLE 02" (`.label-score`) and the status
    badge (v5 `.badge`): `LIVE` · `UPCOMING` · `ANNOUNCED` · `SOLD OUT` · `ENDED`;
  - image `aspect-square` `object-contain` on white (the edition's `-1`), or for announced holes with
    no product a `bg-golf-tint` square with the hole number in the **Hole number** role, centred;
  - body `p-4 flex flex-col gap-1`: the edition name in `.kicker` (e.g. *Azalea*), the date
    `.label-score` "05 APR 2027 · 10:00 AM PT", the rope rule (G.5.4), the edition line
    `.badge-edition .edition` "EDITION OF 200" (or "143 OF 200 LEFT" when live), price Inter 12/16
    500;
  - CTA row: live → `btn btn-secondary btn-small` "SHOP [NAME]"; upcoming → `btn btn-outline-black
    btn-small` "JOIN THE TEE SHEET" (opens the inline tee-sheet form, G.5.7); announced → no button,
    `#575757` Inter 12/16 "Announced. Details closer to the date."; sold out / ended → "SOLD OUT"
    badge, card stays visible (sold-out state left visible, report "The Card").
  - `data-track="card_hole"`. Motion M37 on hover-capable devices.

### G.5.6 Swatch with rope band (extends v5 §6.4.3 item 5 and §6.2 swatches)
- The fill is the **crown** hex; a **rope band** crosses the lower third: an absolutely positioned
  bar at `top: 62%`, height **3px** (36px swatch) / **2px** (20px card swatch), inset 18% left and
  right, radius 9999px, filled with the rope hex, `transform-origin: center` (M38 on select).
- Light crowns (Tour White, Azalea, Haar, Fescue) keep v5's `inset-ring` so they show on white.
- Selected ring: golf green (G.2.2). Sold out: v5 `.crossed-bg` over the swatch.
- Limited-edition swatches that belong to another product (G.6.3 item 6) are links styled as
  swatches, with a 10px mono date under upcoming ones.

### G.5.7 Tee sheet form (replaces "Notify me" / "Get drop alerts" copy; v5 §6.0.8 form box)
- Same pill input + `btn-primary` box as v5 §6.0.8. Label (mono eyebrow) "JOIN THE TEE SHEET";
  placeholder "Email for Hole [n], [Name]"; button "JOIN"; success Inter 12/16 "You're on the tee
  sheet for Hole [n]. We'll email you when it goes live." Function and `data-track="notify_me"`
  unchanged (Appendix A §6.0.6: the next upcoming release).

### G.5.8 Credibility strip (`src/components/credibility-strip.tsx`, server)
- Renders only when `CREDIBILITY.length > 0` (`src/lib/credibility.ts`, exported as an **empty
  array** in v6). Item type `{ label: string; href?: string; source: string }`.
- Box: `mx-2.5 my-10 rounded-2xl bg-white px-5 py-6 flex flex-wrap items-center justify-center
  gap-x-10 gap-y-4`; eyebrow `.label-score` "AS SEEN" + items as `.label-score` text (links when
  `href`). No logos.

### G.5.9 Bundle row (replaces v5's "Make It Two" row, §6.4.3 item 4)
- Two rows stacked, each the v5 row box (`rounded-2xl bg-natural-white-25 p-3 flex items-center
  gap-3`):
  1. 56px thumbnail (two `-1` photos side by side), Inter 12/16 500 UPPERCASE "THE PAIR · $88",
     12/16 `#575757` "Any two colors, $44 each." (`pdp_offer` → `/offer/the-pair`).
  2. 56px thumbnail (2×2 of the four core `-1` photos), "THE FOURSOME · $152", "Four caps, $38
     each." (`pdp_foursome` → `/offer/the-pair#foursome`).
- Prices and per-cap figures are live (`price ÷ caps`), hidden if the bundle is unavailable.

---

## G.6 Section-by-section (v6)

### G.6.0 Routes, redirects and tracking changes

**Routes (v6):**

| Route | Page | `page_type` |
|---|---|---|
| `/` | Home | home |
| `/shop` | The Rope Cap collection (colourways + editions + bundles) | collection |
| `/products/rope-cap` | The Rope Cap PDP | pdp |
| `/products/rope-cap-azalea`, `-cypress`, `-haar` | Edition PDPs | pdp |
| `/offer/the-pair` (and `/offer/the-foursome`, same template, Foursome first) | Offer | offer |
| `/card`, `/card/[handle]` | The Card and hole pages | drops (value kept for continuity) |
| `/custom` | Custom club and outing orders | custom (**new value**) |
| `/fit-guide` | Fit guide (one cap) | fit_guide |
| `/reasons/rope-cap` | Listicle | listicle |
| `/read/the-rope-cap` | Advertorial | advertorial |
| `/quiz`, `/quiz/result` | Color and bundle finder | quiz, quiz_result |
| `/stories/crown-test` | Story (new series) | story |
| `/cart`, `/checkout`, `/order/[id]`, `/help/shipping-returns` | unchanged | unchanged |

**Permanent redirects (308)** in `next.config.ts` `redirects()`:
`/drops` → `/card`; `/drops/:handle` → `/card/:handle`; `/products/everyday-cap`,
`/products/trucker`, `/products/ribbed-beanie`, `/products/performance-cap`,
`/products/corduroy-cap`, `/products/bucket-hat`, `/products/waxed-field-cap`,
`/products/everyday-two-pack` → `/products/rope-cap`; `/offer/everyday-two-pack` →
`/offer/the-pair`; `/reasons/everyday-cap` → `/reasons/rope-cap`; `/read/one-cap` →
`/read/the-rope-cap`; `/stories/crush-test` → `/stories/crown-test`. Old order pages keep working
(they read order lines, not products).

**Tracking labels.** Every Appendix A label whose function survives keeps its name.

| Change | Labels |
|---|---|
| **Kept** (same function) | `hero_shop_core`, `hero_shop_drop` (hole CTA), `shop_by_color`, `core_product`, `home_quiz`, `home_reasons`, `home_story`, `series_story`, `story_episode`, `fit_guide`, `nav_drops` (THE CARD item), `nav_explore`, `nav_quiz`, `search_result`, `search_submit`, `recently_viewed`, `quick_add`, `add_to_cart`, `sticky_add_to_cart`, `pdp_offer` (The Pair row), `pdp_quiz`, `pdp_also_like`, `notify_me` (tee sheet), `drop_hero` (hole page hero), `cart_complete_look`, `cart_offer`, `cart_checkout`, `checkout_details`, `place_order`, `story_shop`, `story_see_proof`, `story_close_cta`, `continuity_story`, `fit_guide_quiz`, `fit_guide_shop`, all `offer_*`, `listicle_*`, `advertorial_*`, `quiz_*` |
| **New** | `hero_shop_pair`, `home_pair`, `home_foursome`, `home_scorecard`, `color_pill`, `pdp_foursome`, `pdp_edition_link`, `ticker_item`, `card_hole`, `nav_shop`, `nav_custom`, `footer_custom`, `custom_submit`, `offer_foursome_add`, `quiz_bundle` |
| **Retired** (no shapes, no FEATURED menu) | `shape_tile`, `nav_shape`, `shape_pill`, `nav_featured`, `announcement_drop` (→ `ticker_item`) |

**Events added:** `custom_quote_submitted` {quantity, colors, needed_by}. Page views carry
`page_type: "custom"` on `/custom`. All other events unchanged.

### G.6.1 Global chrome (v5 §6.0 with these changes)
- **Announcement bar → ticker** (G.5.3).
- **Header nav items (desktop), in order:** **SHOP** (mega, `nav_shop`) · **THE CARD** (mega,
  `nav_drops`, with v5's 6px dot after the label while a hole is live) · **CUSTOM** (link →
  `/custom`, `nav_custom`) · **QUIZ** (link → `/quiz`, `nav_quiz`) · **EXPLORE** (mega,
  `nav_explore`). FEATURED is removed.
- **Mega panels** (v5 §6.0.3 frame and motion):

  | Panel | Columns | Cards |
  |---|---|---|
  | SHOP | **CORE COLORS** (Tour White, Clubhouse Navy, Pine, Fescue → `/products/rope-cap?color=`); **LIMITED** (each live or upcoming edition with its date → its PDP); **BUNDLES** (The Pair $88, The Foursome $152) | `rope-cap-tour-white-1`, the Pair thumbnail, `rope-lifestyle-hero` |
  | THE CARD | **NOW** (live holes), **NEXT** (the next hole + date), **THE CARD** (→ `/card`) | up to 3 hole images |
  | EXPLORE | **EXPLORE** (The Crown Test, Fit Guide, Why The Rope Cap, Custom Orders, Shipping & Returns) | `rope-brim.jpg` |

- **Search:** v5 behaviour over the published catalog (colourways are search terms: the index holds
  one entry per colourway of The Rope Cap plus each edition and both bundles). Placeholders rotate:
  `Search`, `Search "navy"`, `Search "pine"`, `Search "pair"`, `Search "azalea"`.
- **Mobile menu rows:** SHOP ›, THE CARD ›, CUSTOM, QUIZ, EXPLORE ›. Footer card: Recently Viewed (N),
  Fit Guide, Custom Orders, Shipping & Returns.
- **Footer columns** (v5 §6.0.8 box): **Help** (Shipping & Returns, Fit Guide, Custom Orders
  `footer_custom`, Your Bag) · **Shop** (The Rope Cap, The Pair, The Foursome, Limited Editions →
  `/shop?group=limited`) · **The Card** (Now, Next, All Holes) · **Shelby** (The Crown Test, Why The
  Rope Cap, Quiz). The drop-alerts form becomes the **tee sheet** (G.5.7).
- **Value tiles** (v5 §6.0.9 box), true facts:
  1. **ONE SIZE, ADJUSTABLE**: "The strap fits 21.5–23.75 in (55–60 cm). The crown sits mid, about
     11–11.5 cm." + `link` "Fit guide".
  2. **ALWAYS IN STOCK**: "Four core colors that never run out. We show the live count for each."
  3. **FREE SHIPPING ON $85+**: "Any two caps ship free. Under $85, standard shipping is $6. 30-day
     returns."
- **Wordmark and favicon:** unchanged (v5 §7.4).

### G.6.2 Home `/` (replaces v5 §6.1's section list; boxes and motion are v5's)

| # | Section | v5 pattern reused | Golf-green band? |
|---|---|---|---|
| 1 | Hero | §6.1.1 hero | no |
| 2 | Pick a color | §6.1.2 category row (pill morph M5) | no |
| 3 | The next hole | §6.1.3 brand pill | **yes (the home band)** |
| 4 | The build | §6.1.4 material ring | no |
| 5 | One, two or four | §6.1.5 promo tiles (3-up) | no |
| 6 | In stock today | §6.1.6 | no |
| 7 | From The Crown Test | §6.1.7 stories carousel | no |
| 8 | About Shelby | §6.1.8 expanding pill | no |
| 9 | Credibility strip | G.5.8 (hidden while empty) | no |
| 10 | Stories | §6.1.9 | no |
| — | Value tiles, footer | G.6.1 | |

1. **Hero** (v5 §6.1.1 box, M3):
   - images `/hats/rope-lifestyle-hero.jpg` (desktop) / `/hats/rope-lifestyle-hero-mobile.jpg`
     (mobile, `object-position: 50% 35%`);
   - eyebrow mono "THE ROPE CAP · HOLE 1 · OUT NOW" (+ " · HOLE [n] [DD MON]" when a hole is upcoming
     within 60 days);
   - `<h1>` display 24/32 tracking .025em: "One rope cap. Made properly.";
   - kicker (G.2.3) under the H1, white: *Mid crown. Washed cotton. A rope worth looking at.*;
   - product line Inter 14/20: "The Rope Cap · $48 · 4 colors" (live price, live colour count);
   - buttons (`grid gap-2 grid-cols-2`): `btn-primary` "SHOP THE ROPE CAP" (`hero_shop_core`) and
     `btn-primary` "THE PAIR · $88" (`hero_shop_pair`). Product and price are in the first screen.
2. **Pick a color** (`#colors`; v5 category row, reveal M2, titles M4, morph M5):
   - section header `flex justify-between px-5`: `.tab-title` "PICK A COLOR" (selected) and `link`
     12/16 "Not sure? Take the 30-second quiz" (`home_quiz`);
   - one tile per **core** colourway (4), `aspect-[0.77] rounded-[20px]`, backgrounds alternate
     **sage `#B9B78D`** (Tour White, Pine) and **golf tint `#EEF5E8`** (Clubhouse Navy, Fescue);
   - **photo:** inside a white disc (`absolute left-[14%] top-[10%] w-[72%] aspect-square
     rounded-full bg-white shadow-[0_.85rem_1rem_rgba(0,0,0,0.25)] overflow-hidden`) with the
     colourway's `-1` `object-contain` at 86%; the hover image is the `-3` side view (M5a). **Never
     `cutout`/multiply a Rope Cap photo**: light crowns would take the tile colour;
   - centre stack (M5c/M5d): title `h2.btn.btn-outline-black` (Tour White, Fescue tiles use
     `btn-outline-black`; all tiles use dark text because both backdrops are light); CTA
     `btn btn-outline-black w-full` "SHOP [COLOR]" → `/products/rope-cap?color=` (`shop_by_color`);
   - mobile: v5 centred-slide carousel.
3. **The next hole** (`#hole`; v5 §6.1.3 brand pill geometry and M27; **golf-green band**):
   - container background `bg-golf-green` (no photo); the pill SVG strokes stay white;
   - centre: a 200px (md 240px) white disc with the next edition's `-1` photo `object-contain`, the
     floating-image shadow, above the text;
   - eyebrow mono 12/20 tracking .1em `#EEF5E8`: "HOLE 2 · 05 APR 2027 · 10:00 AM PT" (real
     `release_at`) or "HOLE [n] · LIVE NOW";
   - title: **Hole number** role "02" (white) + `.kicker` *Azalea* (white);
   - body Inter 14/20 white: the edition promise (`metadata.promise`), e.g. "White crown, azalea
     rope, tan leather strap. An edition of 200.";
   - v5 countdown digits (white) when upcoming; `btn btn-primary` "JOIN THE TEE SHEET" (opens G.5.7
     inline) or "SHOP AZALEA" when live (`hero_shop_drop`);
   - marquee strings (true facts): "HOLE 2", "AZALEA", "EDITION OF 200", "05 APR 2027", "$52",
     "LEATHER STRAP";
   - hidden when no hole is live or upcoming.
4. **The build** (`#build`; v5 material ring M26, background `/hats/rope-clubhouse.jpg` +
   `bg-black/30`):
   - centre: the Tour White `-5` rope macro in the white circle (M26d); under the ring (mobile) or
     beside it: display 24/32 white "What it's made of", `btn btn-primary` "SEE THE SCORECARD" →
     `/products/rope-cap#scorecard` (`home_scorecard`);
   - callouts (titles = scorecard labels, bodies = `details`): **CROWN** (Crown), **ROPE** (Rope),
     **BRIM** (Brim), **CLOSURE** (Closure).
5. **One, two or four** (`#bundles`; v5 promo tiles, `md:grid-cols-3`, M6/M7):
   - tile backgrounds: single = sage, pair = golf tint, foursome = sage;
   - images in white discs (as item 2): single = Tour White `-1`; pair = Clubhouse Navy and Pine `-1`
     side by side in a white pill (`rounded-full`, aspect 2:1); foursome = the four core `-1` photos
     in a 2×2 grid inside a white rounded square;
   - titles serif italic (G.2.3): *The Rope Cap*, *The Pair*, *The Foursome*; under each, mono 12/20
     `#212121`: "$48", "$88 · $44 A CAP", "$152 · $38 A CAP" (live);
   - buttons `btn-outline-black`: "SHOP ONE" (`core_product`), "SHOP THE PAIR" (`home_pair`),
     "SHOP THE FOURSOME" (`home_foursome` → `/offer/the-pair#foursome`).
6. **In stock today** (v5 §6.1.6): the four core colourways with G.5.6 swatches and live counts.
7. **From The Crown Test** (v5 §6.1.7): the new series (G.8); card images: episodes 1 and 3
   `rope-brim.jpg`, 2 and 4 `rope-cap-tour-white-3.jpg` / `rope-cap-pine-3.jpg` contain on white.
8. **About Shelby** (v5 §6.1.8 pill window, image `/hats/rope-brim.jpg`): quote (serif italic,
   G.2.3) "We make one rope cap. We kept the crown lower than most, washed the cotton until it felt
   broken in, and put a rope on it worth looking at. Each season gets a new numbered color."; button
   `btn-secondary` "WHY THE ROPE CAP" → `/reasons/rope-cap` (`home_reasons`).
9. **Credibility strip** (G.5.8), hidden while empty.
10. **Stories** (v5 §6.1.9): "The Crown Test" (`/stories/crown-test`, `rope-brim.jpg`) and "Fit
    Guide" (`/fit-guide`, `rope-cap-tour-white-3.jpg` contain on white).

### G.6.3 Product page `/products/[handle]` (v5 §6.4 with these changes)
1. **Gallery** (v5 §6.4.2): selected colourway's photos. Tour White has 6 angles (`-1` ¾ front, `-2`
   back, `-3` side, `-4` top, `-5` rope macro, `-6` underside); every other core colour and Azalea
   have 3; Cypress and Haar have 1. Badge: `CORE`, or the edition badge (G.5.5 `.badge-edition`)
   "HOLE 2 · EDITION OF 200".
2. **Title:** serif **italic** 30/36 / 24/32 (G.2.3): "The Rope Cap" (editions: "The Rope Cap,
   Azalea").
3. **Sub-line** (mono): "ONE SIZE · CORE COLOR" or "HOLE 2 · LIMITED EDITION · RELEASES 05 APR 2027"
   (or "· RELEASED 05 APR 2027" once live).
4. **Price row:** price Inter 18/28 500; the v5 price pill now reads "+ ANY TWO SHIP FREE" (true at
   the $85 threshold; editions too).
5. **Rope rule** (G.5.4), the selected colourway.
6. **Color** (v5 item 5 with **Core / Limited groups**, Appendix A §6.4.7 rule now applies):
   - segmented control (G.2.2 colours) "ALL · CORE · LIMITED" filters the swatch groups
     (`color_pill`);
   - group **CORE**: the four colourways of The Rope Cap (in-page variants, write `?color=`);
   - group **LIMITED**: each live or upcoming edition as a linked swatch (G.5.6) to its own PDP
     (`pdp_edition_link`), upcoming ones captioned with the mono date "05 APR";
   - on an edition PDP the groups are the same, with the edition selected and the core swatches
     linking back to `/products/rope-cap?color=`;
   - label row: mono "COLOR:" + name + `#575757` "(Core)" / "(Hole 2, edition of 200)", and the rope
     line Inter 12/16 `#575757` "Navy rope".
7. **Size:** the one-size line (v5) "One size · fits 21.5–23.75 in (55–60 cm)" + `link` "Fit guide".
8. **Crown-height scale:** v5's fit-scale component (golf-green active segment), label "CROWN
   HEIGHT", steps LOW · **MID** · TALL, value "Mid · about 11–11.5 cm" (`metadata.crown_cm`). The
   structure scale stays (Semi-structured).
9. **Add to bag** (v5 item 8): "ADD TO BAG – $48" (editions "ADD TO BAG – $52"); upcoming editions
   show `btn-outline-black` "JOIN THE TEE SHEET" instead (no add-to-bag before `release_at`).
10. Under the CTA: `POLICY.shipping`, the live stock line; editions add the edition line
    (`.edition`) "EDITION OF 200 · 143 LEFT" and `POLICY.limitedRun` (G.7.3).
11. **Bundle rows** (G.5.9): core colourways only.
12. Quiz link: `link` "Not sure which color? Take the 30-second quiz" (`pdp_quiz`).
13. **Scorecard band** (`#scorecard`; **the PDP golf-green band**): `band-golf m-2.5 my-10
    rounded-xl md:rounded-3xl p-5 md:p-10`, `grid gap-8 md:grid-cols-[1fr_1.2fr]`:
    - left: eyebrow mono `#EEF5E8` "THE SCORECARD", display 30/36 white "Every spec, on one card.",
      kicker *Ruled like the card in your back pocket.*, and the `-3` side photo in a white rounded
      square (`rounded-2xl`, contain);
    - right: the scorecard (G.5.2) for the selected colourway.
    - This replaces v5's details band "SPECS" block; the details band keeps THE DETAILS and CARE &
      RETURNS.
14. **Material ring** (v5 §6.4.7): background `rope-clubhouse.jpg`, centre the colourway's `-1`.
15. **You may also like** (v5 §6.4.8): the other core colourways (as colourway cards, G.6.4) and the
    live editions; never other products (there are none).
16. Brand pill (v5 §6.4.10) with the Crown Test series; sticky buy bar (v5 §6.4.4).

### G.6.4 Collection `/shop` (v5 §6.3 with these changes)
1. **Banner:** image `rope-lifestyle-hero.jpg`; breadcrumb "Home / The Rope Cap"; H1 display "The
   Rope Cap"; description Inter 14/20 "One cap, four core colors, a numbered edition each season.";
   count "4 core colors · [n] limited".
2. **Filter bar:** the shape control becomes the **group control** "ALL · CORE · LIMITED · BUNDLES"
   (`?group=`, `color_pill`). The Filter button and panel are removed (one size; colours are the
   cards). Sort keeps Featured · Newest.
3. **Grid** (`grid-cols-2 md:grid-cols-4`), one **colourway card** per core colour of The Rope Cap
   (v5 product card with the colour fixed: title "The Rope Cap", colour line "Tour White · Navy
   rope", the G.5.6 swatch row showing all four core colours with this one selected, live price,
   v5 quick add "ADD TO BAG · $48"), then each live or upcoming edition (badge "HOLE 2"; upcoming
   cards show "JOIN THE TEE SHEET" in the quick-add row), then sold-out editions with their badge.
4. **Bundles band** (**the collection's golf-green band**): `band-golf mx-2.5 my-10 rounded-3xl p-5
   md:p-10`, heading display 24/32 white "Two or four", then two white cards side by side: The Pair
   and The Foursome (image, serif italic title, live price and per-cap price, `btn-secondary` "SHOP
   THE PAIR" / "SHOP THE FOURSOME", `home_pair` / `home_foursome` with `page_type: collection`).
5. Value tiles, footer.

### G.6.5 Offer `/offer/the-pair` (v5 §6.10 and Appendix A §12.1, re-pointed)
- **Data:** `the-pair` (16 inventory-kit variants: First cap × Second cap over the four core
  colours) at $88; `the-foursome` (5 kit variants: "4 × Tour White", "4 × Clubhouse Navy", "4 ×
  Pine", "4 × Fescue" (`required_quantity` 4) and "One of each" (1 of each colour)) at $152. Both
  `metadata.offer: true`, `single_handle: "rope-cap"`, `offer_path`. Anchors are live: Pair $96
  struck (2 × single), Foursome $192 struck (4 × single); each hidden if the saving is not positive.
- **Above the fold** (v5 §6.10): gallery of the two chosen colourways; buy card title from the
  **`offer-headline` experiment** (control "Two rope caps. $88." / variant `saving` "Save $8 on two
  rope caps."), sub-line "THE PAIR · CORE COLORS", price row "$88" + struck "$96" + pill "SAVE $8",
  rope rules under each picker, "FIRST CAP:" / "SECOND CAP:" pickers (G.5.6), live kit stock, CTA
  "ADD THE PAIR – $88" (`offer_add`), policy lines (both caps ship free: "$88 qualifies for free
  shipping").
- **Step-up: The Foursome** (`#foursome`; **the offer page's golf-green band**): `band-golf`
  rounded-3xl, kicker *For the group trip, the outing or Father's Day.*, display "Four caps, $38
  each.", a v5 segmented control "FOUR OF ONE COLOR · ONE OF EACH" (G.2.2), a single picker for the
  first mode, price "$152" + struck "$192" + "SAVE $40", CTA `btn-primary` "ADD THE FOURSOME –
  $152" (`offer_foursome_add`). `/offer/the-foursome` renders the same page scrolled to this band.
- **Then** (v5): what's included (Two caps · One size each · the scorecard summary · Free shipping),
  why two (A light one and a dark one · One for the bag, one for the car · You already know the
  fit), proof (in stock today rows; the Crown Test stance linked, `offer_story`), FAQ (Will it fit?
  · Can I pick the same color twice? · Returns · Shipping · "Is this a sale?" → "No. Singles stay
  $48; two are $88 and four are $152, every day."), closing brand pill (`offer_close_cta`), sticky
  bar "ADD THE PAIR – $88" (`offer_sticky_add`).

### G.6.6 Listicle `/reasons/rope-cap` (v5 §6.11, Appendix A §12.2, re-pointed)
- Hero image `rope-cap-tour-white-1.jpg` on white; eyebrow "6 REASONS · THE ROPE CAP"; H1 "Six
  things that make this rope cap different"; dek "Every reason comes with the fact behind it, so you
  can check it on this page."
- Reasons, each with its fact (dropped if the fact's source is empty):
  1. **A crown that sits mid, not tall.** Fact: the crown-height scale + `crown_cm`. Image
     `rope-cap-pine-3.jpg`.
  2. **Washed cotton, broken in on day one.** Fact: `details.Fabric`. Image
     `rope-cap-tour-white-1.jpg`.
  3. **A rope worth looking at.** Fact: `details.Rope`. Image `rope-cap-tour-white-5.jpg`.
  4. **A strap that adjusts without a plastic snap.** Fact: `details.Closure` + the one-size range.
     Image `rope-cap-tour-white-2.jpg`.
  5. **Four colors that never run out.** Fact: live stock per core colour. Image four `-1` photos.
  6. **Two ship free, and you get 30 days.** Fact: `POLICY` (threshold and returns). Image
     `rope-clubhouse.jpg`.
- CTAs after reasons 3 and 6 "SHOP THE ROPE CAP" (`listicle_mid_cta`, `listicle_end_cta`); buy
  block with the BuyBox + `link` "Or two for $88" (`listicle_offer`); sticky "SHOP THE ROPE CAP –
  $48" (`listicle_sticky`). **Golf-green band:** the buy block.

### G.6.7 The Card `/card` and `/card/[handle]` (replaces v5 §6.6 visuals and Appendix A §6.6 copy)
- **`/card`:**
  - Banner (v5 §6.3 banner) image `rope-clubhouse.jpg`; H1 (Card heading role, white on the photo)
    "The Card"; description "Six numbered holes in 2027. Hole 1 is the core cap. Each hole after it
    is one numbered color, released on its date and not remade." (G.7.3 commitment, G.11).
  - **Next-hole band** (**the Card's golf-green band**): `band-golf mx-2.5 my-10 rounded-3xl p-5
    md:p-10 grid md:grid-cols-2 gap-8`: left the edition `-1` in a white disc; right eyebrow mono
    "NEXT · HOLE [n]", the Hole-number role "0[n]" + kicker name, the date mono, the v5 countdown
    (white digits), the edition line ("EDITION OF 200"), the tee-sheet form (G.5.7).
  - **The card grid:** a scorecard-styled header row (`.label-score`) "HOLE · NAME · DATE · EDITION
    · STATUS" above `grid gap-2.5 md:grid-cols-3 px-2.5` of hole cards (G.5.5) for Holes 1–6, in
    hole order. Sold-out and ended holes stay in place with their badge (the archive is the card).
  - Tabs (v5) are removed: one card, all holes.
- **Holes 1–6 (data):** Holes 1–4 come from releases (G.8); Holes 5–6 from `src/lib/holes.ts`
  (announced, no product, no countdown):

  | Hole | Name | Date (Pacific) | Moment (neutral wording) | Edition, price |
  |---|---|---|---|---|
  | 1 | The Rope Cap (core) | Live now | Season opener | Core, open run, $48 |
  | 2 | Azalea | Mon 5 Apr 2027, 10:00 AM PT (`2027-04-05T17:00:00Z`) | First major week | 200, $52 |
  | 3 | Cypress | Tue 1 Jun 2027, 10:00 AM PT (`2027-06-01T17:00:00Z`) | Father's Day / national championship weekend | 200, $52 |
  | 4 | Haar | Mon 12 Jul 2027, 10:00 AM PT (`2027-07-12T17:00:00Z`) | The links major | 200, $52 |
  | 5 | Away Match (a pair of colours) | Mon 13 Sep 2027, 10:00 AM PT (`2027-09-13T17:00:00Z`) | The team match in September | Announced |
  | 6 | Winter Rules (corduroy) | Mon 8 Nov 2027, 10:00 AM PT (`2027-11-08T18:00:00Z`, PST) | The holidays | Announced |

- **`/card/[handle]`** (v5 drop page): hero with the edition image, eyebrow "HOLE [n] · [phase]",
  H1 in the Card heading role (Midnight `#03143b` when on the white article sheet), the story
  article, "What to look for" (proof), then by phase: upcoming → countdown + tee sheet; live → the
  edition PDP buy card centred; ended → "This hole has been played." + the core cap. `drop_viewed`,
  `drop_hero`.

### G.6.8 Cart drawer, `/cart`, checkout (v5 §6.7–§6.8 with these changes)
- **Free-shipping progress** (now true; replaces v5's "No progress bar"): under the drawer header, a
  `px-5 py-3` block: Inter 12/16 "Add $[85 − subtotal] for free shipping." or "Free shipping
  unlocked." (with `CheckCircle` 16px golf green); a track `h-[7px] rounded-[4px] bg-natural-white`
  with a golf-green fill `origin-left`, `scaleX = min(subtotal / 85, 1)`, animated with M21. Same
  block on `/cart`. The threshold is read from `POLICY.freeShippingThreshold` (85) and must match the
  Medusa shipping-price rule (G.9).
- **Header policy line:** `POLICY.announcement` "Free shipping on $85+ · 30-day returns".
- **Bundle row** in the drawer when a single core Rope Cap is in the bag (G.5.9, `cart_offer`);
  complete-the-look suggestions become other core colourways ("ADD · $48", `cart_complete_look`).
- **Lines:** variant meta "Pine / One Size"; Pair lines "Navy + Pine"; Foursome lines "4 × Pine" or
  "One of each"; editions add the edition badge "HOLE 2".
- **Checkout:** shipping options show the live Medusa price ($0 for Standard at $85+). No other
  change.

### G.6.9 Order `/order/[id]`
v5 §6.8. For edition lines with `metadata.edition.numbered_inside`, add Inter 12/16 `#575757`:
"Your edition number is printed inside the cap." Never a specific number.

### G.6.10 Custom orders `/custom` (new; `page_type: "custom"`)
- **Hero** (v5 §6.1.1 box, image `rope-clubhouse.jpg`): eyebrow "CUSTOM", H1 "Rope caps for your club
  or outing", kicker *Your logo above the rope. Twenty-four caps or more.*, button `btn-primary` "GET
  A QUOTE" → `#quote`.
- **Facts band** (**the custom page's golf-green band**): `band-golf mx-2.5 my-10 rounded-3xl p-5
  md:p-10`, a scorecard (G.5.2, white table on green) titled *Custom orders* with rows: 01 MINIMUM
  "24 caps" · 02 PER COLOR "In twelves" · 03 PRICE "$40 a cap" · 04 SET-UP "Quoted with your
  artwork" · 05 TIMING "2–4 weeks after artwork approval" · 06 COLORS "Tour White, Clubhouse Navy,
  Pine, Fescue" · 07 MARK "Your logo, embroidered above the rope".
- **How it works:** v5 value tiles ×3: "01 SEND YOUR LOGO", "02 APPROVE A PROOF", "03 WE MAKE AND
  SHIP" with one sentence each.
- **Quote form** (`#quote`, white `rounded-3xl mx-2.5 p-6 md:p-10`, max-width 720px centred; v5 input
  and label styles from §6.8):
  - fields: name*, email*, club or organisation*, quantity* (number ≥ 24), colours (four rows, each a
    quantity in steps of 12, total must equal quantity), needed by (date, optional), artwork link
    (URL, optional), notes (textarea, optional), and a hidden honeypot `company_website`;
  - submit `btn btn-secondary btn-atc` "REQUEST A QUOTE" (`custom_submit`); success replaces the form
    with display 24/32 "Thanks, [first name]. We'll reply within two business days." (no promise
    beyond that line; G.11);
  - client and server validation (zod): 24 minimum, multiples of 12 per colour, valid email, URL.
- **FAQ** (v5 accordion): Can I use my club's logo? (only with permission, the requester confirms a
  checkbox "I have the right to use this artwork" — required) · Is there a set-up fee? (quoted) · Can
  I mix colors? (yes, in twelves) · How long does it take? (2–4 weeks after approval).
- **Backend** (spec for the builder):
  - module `custom-quote` (DML model `custom_quote`: id, name, email, organisation, quantity, colors
    json, needed_by date nullable, artwork_url nullable, notes text nullable, status enum `new ·
    quoted · won · lost` default `new`, source json nullable for attribution, timestamps);
  - `POST /store/custom-quotes` (publishable key, zod-validated, honeypot rejects silently, rate
    limited per IP to 5 per hour with the existing Redis);
  - admin: a route `/app/custom-quotes` (Medusa admin extension, list with status select and detail
    drawer) and an `admin` API `GET/POST /admin/custom-quotes[/:id]`;
  - on create, emit `custom_quote.created`; a subscriber sends an email through the existing
    notification module (`local-email` or SendGrid) to `CUSTOM_QUOTES_EMAIL` (env, optional; logs
    when unset) and records the analytics event `custom_quote_submitted`.

### G.6.11 Fit guide `/fit-guide` (v5 §6.5, reduced to one cap)
1. Banner H1 "How it fits"; description "One size. The strap fits 21.5–23.75 in (55–60 cm). The
   crown sits mid, about 11–11.5 cm."
2. **Crown band** (**the fit guide's golf-green band**): the crown-height scale large (track 12px,
   three steps LOW · MID · TALL, MID active in white on green), the `-3` side photo of Tour White in
   a white disc, and one sentence: "Most rope caps sit tall. Ours sits mid."
3. How to measure + the one-row size table (One size · 21.5–23.75 in · 55–60 cm · 6⅞–7½).
4. The scorecard (G.5.2).
5. Quiz band (v5 §6.1.4 ring) with "Find your color" (`fit_guide_quiz`). Value tiles, footer.

### G.6.12 Advertorial `/read/the-rope-cap` (v5 §6.12, Appendix A §12.3, re-pointed)
- AdLabel "ADVERTISEMENT · FROM SHELBY"; kicker "FIELD NOTES"; H1 (serif, G.2.3) "Most rope caps sit
  too tall. We made one that doesn't."; dek "What changed, how we check it, and what it costs.";
  byline mono "BY SHELBY · 4 MIN READ · [date]".
- Five beats (second person, brand voice): the cap you bought last summer and why it sits like a
  stack (problem) · why rope caps run tall (the template; no brand named) · what we changed (crown,
  cotton, rope, strap) · how we check it (the Crown Test, linked) · the offer (single, pair).
- Inline CTA `btn-primary` "SEE THE ROPE CAP" (`advertorial_inline`); offer card (v5) with
  `advertorial_offer_pdp` and `link` "Or two for $88" (`advertorial_offer_pack`); disclosure "This
  is an advertisement from Shelby, the company that makes The Rope Cap."; sticky
  (`advertorial_sticky`). **Golf-green band:** the offer card.

### G.6.13 Quiz `/quiz` and `/quiz/result` (v5 §6.13, re-pointed: a color and bundle finder)
- Header "FIND YOUR COLOR · 30 SECONDS"; 4 steps; option buttons v5 with G.2.2 selected colours.
- **Questions** (`src/lib/quiz.ts`, keys change):
  1. `wear` — "Where will it get the most wear?" On the course · Range and simulator · Everyday ·
     It's a gift.
  2. `palette` — "Which do you reach for?" Light · Dark · Earthy · Something limited.
  3. `count` — "How many are you buying?" Just one · Two · Four (a group or a gift set).
  4. `crown` — "How do you like a crown?" Low · Mid · Tall · No idea.
- **Scoring (deterministic):** colour by `palette` (Light → Tour White, Dark → Clubhouse Navy,
  Earthy → Fescue, otherwise Pine; "Something limited" → the live edition if one is on sale, else the
  next upcoming edition with the tee sheet, else Pine); in-stock check falls back to the next colour
  in the order Tour White, Clubhouse Navy, Pine, Fescue. Product by `count`: one → The Rope Cap;
  two → The Pair with the match and a contrasting second colour (Light ↔ Dark, Earthy ↔ Pine); four →
  The Foursome "One of each" (or "4 × [match]" when `wear` is "It's a gift"). `crown` adds a "why"
  line only: Low → "Ours sits mid, a touch higher than a low dad cap."; Mid → "Mid is exactly where
  ours sits."; Tall → "Ours is lower than most rope caps; if you like tall, try it on and use the
  30-day returns."; No idea → "Mid suits most heads; the fit guide shows why."
- **Result** (v5 result layout): eyebrow "YOUR MATCH", H1 "The Rope Cap in Pine" / "The Pair: Navy
  + Pine" / "The Foursome, one of each"; "Why it fits you" lines pair each answer with a fact; the
  buy card preselected (`add_to_cart` `source: "quiz"`); for count = one, a bundle nudge row
  (`quiz_bundle`). **Golf-green band:** the "Why it fits you" card. Events unchanged
  (`quiz_started`, `quiz_answered` {step, answer}, `quiz_completed` {match}).

### G.6.14 Story `/stories/crown-test` (v5 §6.9, re-pointed)
- Hero image `rope-brim.jpg`; eyebrow "THE CROWN TEST"; H1 from the `story-headline` experiment
  (control: the audience question "Why does every rope cap sit so tall?"; variant `stance`).
- Modules as v5: problem (image `rope-lifestyle-hero.jpg`), stance in the pill window (serif italic),
  proof (episodes), offer (Rope Cap buy card), **Your turn** (now the **golf-green band**: v5 value
  tile with `band-golf`), close (brand pill "GET THE ROPE CAP", `story_close_cta`).

### G.6.15 Help pages
`/help/shipping-returns`: v5 sheet. Copy updated: free standard shipping on orders of $85 or more,
otherwise $6; express $15; 30-day returns; numbered editions follow the same 30-day returns.

---

## G.7 Assets

### G.7.1 Rope Cap product photos (`public/hats/`, square 1:1 on pure white, JPEG)
| File | Angles |
|---|---|
| `rope-cap-tour-white-1…6.jpg` | ¾ front, back, side, top, rope macro, underside |
| `rope-cap-clubhouse-navy-1…3.jpg`, `rope-cap-pine-1…3.jpg`, `rope-cap-fescue-1…3.jpg`, `rope-cap-azalea-1…3.jpg` | ¾ front, back, side |
| `rope-cap-cypress-1.jpg`, `rope-cap-haar-1.jpg` | ¾ front only |

Render `object-contain` on white (cards, gallery) or inside white discs on coloured tiles (G.6.2).
**Never** `cutout` (multiply) a Rope Cap photo.

### G.7.2 Lifestyle (`public/hats/`)
`rope-lifestyle-hero.jpg` (16:9), `rope-lifestyle-hero-mobile.jpg` (4:5), `rope-clubhouse.jpg`
(4:5), `rope-brim.jpg` (4:5). All are AI-generated stand-ins without logos (G.11). The v4/v5 hat
photos stay in the folder for old orders but are not used by any v6 page.

### G.7.3 Policy lines (`src/lib/policy.ts`)
```ts
announcement: "Free shipping on $85+ · 30-day returns",
shipping: "Free shipping on $85+ · Standard $6 · Express $15",
returns: "30-day returns",
dispatch: "Ships in 1–2 business days",
limitedRun: "Numbered edition. We don't remake numbered colors.",
oneSize: "fits 21.5–23.75 in (55–60 cm)",
freeShippingThreshold: 85,
```
(`sized` is removed: nothing is sized.)

### G.7.4 Icons
v5 §7.3 plus Phosphor `Users` (custom page "how it works") and `Ruler` (fit guide, already in v5).
No golf clip-art icons (no flags, clubs, balls or tees).

## G.8 Data (Medusa seed; the builder implements it in `backend/src/scripts/seed.ts`, idempotent)

1. **Retire** (unpublish, keep records): `everyday-cap`, `trucker`, `ribbed-beanie`,
   `performance-cap`, `corduroy-cap`, `bucket-hat`, `waxed-field-cap`, `everyday-two-pack`.
   Soft-delete their releases (`everyday-cap-bone`, `corduroy-cap`, `bucket-hat`, `waxed-field-cap`).
   Deactivate the Caps, Truckers, Beanies and Bucket Hats categories. Pause the `crush-test` series.
2. **Category** "Rope Caps" (`rope-caps`). Collection `core` holds The Rope Cap.
3. **`rope-cap`** "The Rope Cap", published, $48, options Color (Tour White, Clubhouse Navy, Pine,
   Fescue) × Size (One Size), SKU `ROPE-<COLOR>-OS`, `unit_cost` 10.5 (the midpoint of the report's
   $7–14 landed estimate; demo), stock **300 per colour** (1,200, the report's launch run), images
   per G.7.1 linked per colour. Metadata:
   - `promise`: "One rope cap, properly: a mid crown that sits right.";
   - `fit_notes`: "One size. The strap adjusts from 21.5 to 23.75 inches. The crown sits mid, about
     11–11.5 cm.";
   - `crown_cm`: "11–11.5";
   - `fit_profile`: `{ crown: "Mid", structure: "Semi-structured" }`;
   - `details`: Crown "Mid profile, about 11–11.5 cm, lightly structured front" · Panels "Five, with a
     seamless front" · Rope "Braided cotton cord, about 3–5 mm, in a contrast color" · Brim
     "Pre-curved with a slight retro flat, 7 cm (2.75 in)" · Closure "Self-fabric strap with an
     antique-brass slide" · Fabric "100% cotton twill, garment-washed" · Sweatband
     "Moisture-wicking" · Care "Spot clean. Reshape and air dry.";
   - `rope`: `{ "Tour White": "Navy", "Clubhouse Navy": "White", "Pine": "Cream", "Fescue": "Navy" }`;
   - `edition`: `{ hole: 1 }`.
4. **Editions** (each its own product, $52, one colour, One Size, leather strap; `unit_cost` 12):
   - `rope-cap-azalea` "The Rope Cap, Azalea": stock 200; metadata `edition: { hole: 2, size: 200,
     numbered_inside: true }`, `rope: { Azalea: "Azalea pink" }`, `promise` "White crown, azalea
     rope, tan leather strap. An edition of 200.", `details` as the core with Closure "Tan leather
     strap with a brass buckle";
   - `rope-cap-cypress` (Hole 3, 200, "Coastal green crown, sand rope, tan leather strap.");
   - `rope-cap-haar` (Hole 4, 200, "Fog grey crown, cream rope, tonal brim, tan leather strap.");
   - status draft until their release goes live.
5. **Bundles** `the-pair` ($88, 16 kit variants) and `the-foursome` ($152, 5 kit variants), as in
   G.6.5, `unit_cost` = sum of the singles' unit costs.
6. **Releases** (playbook walkthrough, all through the existing workflows):
   - `hole-1-rope-cap` "Hole 1: The Rope Cap" (major, linked to `rope-cap`): goes live now through
     `goLiveReleaseWorkflow`;
   - `rope-cap-azalea` "Hole 2: Azalea" (light) scheduled `2027-04-05T17:00:00Z`, all checks ready;
   - `rope-cap-cypress` "Hole 3: Cypress" (major) scheduled `2027-06-01T17:00:00Z`, editorial asset
     not yet approved (would be held if due today);
   - `rope-cap-haar` "Hole 4: Haar" (light) scheduled `2027-07-12T17:00:00Z`, stock 0 to show the
     "held for stock" path (its 200 arrive later; the Card shows "Upcoming").
   - Holes 5–6 are not releases (G.6.7 `holes.ts`).
7. **Shipping:** add to the existing Standard option a conditional price `{ currency_code: "usd",
   amount: 0, rules: [{ attribute: "item_total", operator: "gte", value: 85 }] }` while keeping $6;
   Express stays $15. The builder confirms Medusa 2.22's `item_total` shipping-price rule and
   verifies $0 at $88 and $6 at $48 at checkout.
8. **Content series** `crown-test` "The Crown Test" (demo data, flagged as before): goal "Orders of
   The Rope Cap from people who found us on TikTok"; audience "People whose rope caps sit like a
   stack on their head"; stance "We measure the crown of every rope cap we sign off. Ours sits at
   11–11.5 cm."; audience question "Why does every rope cap sit so tall?"; proof "A ruler on the
   crown of a typical tall rope cap and on ours, side by side, then both worn."; format "Before /
   after reveal"; beats; participation prompt "Show us the tallest cap you own, ruler optional.";
   four episodes with sample metrics and one unpublished next batch ("The sweat-line wash test").
   Landing path `/stories/crown-test`. Competitor brands are never named.
9. **Experiments:** `offer-headline` copy updated (G.6.5), same split and minimum. `story-headline`
   unchanged.

## G.9 Third-party integrations
Unchanged from v5 §8. The custom-quote email uses the existing notification module. No reviews,
BNPL, SMS or popups (G.1.4).

## G.10 Build instructions
1. Append G.3 to `globals.css`; add the Caslon font (G.4); update `policy.ts` (G.7.3).
2. New components: `scorecard.tsx`, `rope-rule.tsx`, `hole-card.tsx`, `credibility-strip.tsx`,
   `bundle-rows.tsx`, ticker in `announcement-bar.tsx`, swatch rope band in the shared swatch;
   `src/lib/holes.ts`, `src/lib/credibility.ts`, `src/lib/swatches.ts` (colourways).
3. Routes: `/card`, `/card/[handle]`, `/custom`, `/offer/[handle]` handles `the-pair` /
   `the-foursome`, `/reasons/rope-cap`, `/read/the-rope-cap`, `/stories/crown-test` (data-driven);
   redirects (G.6.0).
4. Backend: the seed (G.8), the custom-quote module, routes, admin page and subscriber (G.6.10).
5. Verify: backend typecheck; seed twice (idempotent); `next build` + eslint; Playwright at
   390×664 and 1440×900 on every v6 route; computed styles for G.2 tokens (golf green, Caslon italic
   on the PDP title, the scorecard borders, the ticker height 32px); the ticker crawl speed (40px/s)
   and pause on hover; reduced-motion run; add to bag from PDP, edition (live), pair, foursome, quiz
   result; a Stripe test-card checkout at $88 showing $0 standard shipping; a custom-quote submission
   landing in the admin list; every redirect in G.6.0 returns 308.

## G.11 Open questions (v6; supersede v5 §11 items 9–10)
1. **Prices** ($48 core, $52 editions, $88 Pair, $152 Foursome, $40 custom, $24 pro-shop wholesale)
   are research-recommended demo values (report, "Price ladder"); confirm against real landed cost.
2. **Free shipping at $85** is research-recommended; confirm the margin.
3. **"We don't remake numbered colors"** is a commitment the site states for every edition; confirm
   before launch.
4. **Edition numbers printed inside** require the factory to number labels; until confirmed, set
   `numbered_inside: false` and the order page line disappears.
5. **Trademark:** "Shelby" overlaps Carroll Shelby Licensing's apparel and headwear marks; run a
   search before embroidery. No tournament or club marks anywhere (G.1.3).
6. **Demand is unmeasured** (no Google Trends or TikTok Shop data, report "Demand looks real"). Treat
   launch quantities as a test.
7. **Tariffs and landed cost** are unverified (report); confirm with a customs broker. The scorecard's
   ORIGIN row stays hidden until the factory is chosen.
8. **Custom set-up fee** amount and reply time; the page says "quoted" and "within two business
   days".
9. **Early access** for the tee sheet or the app (the report suggests a short window) is not built;
   no drop is app-only.
10. **Pro-shop wholesale** ($24 keystone) is not built into the store; it runs through a B2B channel.
11. **Photography** is AI-generated stand-ins; replace with real packshots and on-course photos.

---

# Part V5: the Allbirds base (binding except where Part G overrides)

## 1. Project overview

| | |
|---|---|
| Brand | **shelby**, a small DTC hat brand. Name pending a trademark check (§11). |
| Tagline | "The core, always. Drops, often." |
| What the site does | Sells one always-in-stock core cap (**The Everyday Cap**, 4 colors), a few more shapes and scheduled drops, and hosts the landing pages for social traffic (story, offer, listicle, advertorial, quiz). |
| Stack | Next.js 16 App Router (Cache Components, Partial Prefetching), React 19, Tailwind CSS 4, `@phosphor-icons/react`, `next/font/google`, Medusa v2 Store API (server-only via `src/lib/medusa.ts`), first-party analytics + Umami, Stripe Payment Element. **No new dependencies** (all motion is CSS plus small client hooks; see §2.4). |
| Language | US English ("Color", "Bag"). |
| Mobile app | `mobile/APP_SPEC.md` v5 reskins the Expo app in the same theme and maps every animation below to Reanimated. |

### 1.1 Which source governs what

| Concern | Source |
|---|---|
| Page inventory, IA, section order, routes | **v4** (Appendix A, verbatim) |
| Data sources, server/client split, caching, every `data-track` name, every `page_type`, both experiments, event names, evidence rules, hat behaviours (colour → gallery, one-size vs sized, fit profile scales, Make It Two, sticky bar, quick add, recently viewed, search, notify) | **v4** (Appendix A, verbatim) |
| Copy rules and Shelby copy | **v4**, with the casing changes in §1.3 |
| Visual language: colour, type, radii, shadows, spacing, grids, image treatment, component styling, section styling | **Allbirds** (§2–§6 of this file) |
| Motion: every transition, transform, keyframe, reveal, hover timeline, drawer/menu choreography | **Allbirds** (§2.4 and per-section notes in §6) |

**Precedence:** where Appendix A gives a visual value (a Melin colour, font, px size, radius,
height, motion), the matching v5 value in §2–§6 replaces it. Where §6 is silent about a function,
Appendix A's function stands unchanged. Nothing in Appendix A is deleted; v5 only restyles it.

**Allbirds patterns applied as part of the theme** (each named again in §6):
- the **floating white header pill** over a page-coloured canvas;
- the **rounded full-bleed hero** with a GSAP-style fade reveal;
- **category tiles** that morph from a 20px radius into a 250px pill on hover;
- **white rounded product cards** with a hover image swap and the 3D "flip" quick-add row;
- **3-up promo tiles** with a slow 1.08 image zoom;
- **value-prop tiles** (mono eyebrow + body) above the footer;
- the **material ring** (concentric circles, dots travelling a circular path, staggered callouts);
- the **brand pill** (pill outline, orbiting dots, marquee strip);
- the **expanding pill window** for editorial quotes;
- the **mono section tabs** with a 2px underline;
- the **natural-white filter pill bar** and segmented control on the collection;
- the **white PDP buy card** beside a rounded image gallery;
- the **right cart drawer** with a 0.8s ease-out slide.

### 1.2 What stays Shelby (rules)

1. **Name and mark:** the text wordmark **`shelby`** (§6.0.2) sits where Allbirds' logo sits. Never
   Allbirds' logo, script mark, bird icon or any of its artwork.
2. **Copy:** Shelby's own words (Appendix A), set in Allbirds' casing patterns (§1.3). Allbirds'
   sentences, product names (Tree Runner, Runner NZ, Dasher, Cruiser…), material names (TENCEL™,
   SweetFoam®, Featherbed™…), slogans ("Better Things in a Better Way", "Follow the Flock") and
   section titles are never reused.
3. **Products, prices, policies:** from Medusa and `src/lib/policy.ts` only.
4. **Photos:** Shelby's demo photos in `public/hats/` (§7). No Allbirds imagery.
5. **Icons:** Phosphor (§7.3) in place of Allbirds' icon artwork.
6. **No claims Shelby can't back.** Where Allbirds shows these, Shelby uses the equivalent or omits:

| Allbirds element | Shelby |
|---|---|
| Sustainability claims, carbon footprint labels, "Materials from the earth", B Corp, natural-material stories | **Omitted.** Value tiles use true Shelby facts (§6.0.9). |
| Yotpo stars, review counts, reviews widget, "Is this true to size?" AI widget, "Explore this product" assistant | **Omitted** (no reviews; no assistant). |
| "Free ground shipping on orders over $100", "Spend $X more to earn free shipping!" + progress bar, "+ Free shipping" price pill | **Omitted** (flat $6). The drawer header shows the policy line (§6.7); the PDP price pill shows a true line (§6.4). The progress-bar *component* is reused only as the quiz progress bar (§6.12). |
| "Final Sale", sale prices in red with struck originals | **Omitted** (no discounts). The red token is used only for low stock (§2.1). Struck price appears only on the two-pack offer, where the $76 anchor is computed live (Appendix A §12.1). |
| Returns insurance, Shop Pay/accelerated checkout, Afterpay | **Omitted** (§11). |
| Email signup "Subscribe to our emails", SMS (Attentive) popups | Footer form becomes **"Get drop alerts"** (next release only; §6.0.8). No popups. |
| Social icons row "Follow the Flock" | Kept only for channels Shelby actually has (TikTok), with the URL from `NEXT_PUBLIC_TIKTOK_URL`; hidden when unset. |
| Country selector, cookie preferences, "Do Not Sell", "California Transparency Act" | **Omitted** (US-only demo; no cookie banner in v4). |
| "Men / Women" segmented control, men's/women's sizes | Becomes the **shape** control (All · Caps · Truckers · Beanies · Bucket Hats). |
| Wishlist, account, chat (Gladly) | **Omitted.** |

### 1.3 Casing and voice in the Allbirds theme

- **UPPERCASE** (with tracking) for: buttons, nav, badges, card titles, mono eyebrows, column
  headings, drawer and section tab titles.
- **Sentence case** for: hero H1s, section headings, PDP titles, body copy. E.g. the hero H1 is
  "One cap. Every color. Always in stock." (v4 had it in uppercase heavy; v5 sets it in sentence case
  like Allbirds' hero lines).
- **Title Case** for product names (from Medusa) and the shape names.

### 1.4 Evidence rules (unchanged, all still apply)

No generated testimonials, reviews, ratings or customer counts. No fake timers, deadlines or
discounts. Price anchors are computed from live prices. Proof comes only from live data (stock,
price), product facts (`metadata.details`, `fit_profile`), `policy.ts` or the content-series record.
An empty proof source removes its block (Appendix A §12.0).

---

## 2. Design tokens

### 2.1 Color palette

Allbirds' `@layer theme` block (verbatim names) plus the Tailwind defaults it uses. Shelby uses the
same values.

**Brand and neutrals**

| Token | CSS variable | Value | Use |
|---|---|---|---|
| Black | `--color-black` | `#212121` | Text, primary buttons, footer, badges' text, selected sizes, drawer overlay base |
| White | `--color-white` | `#ffffff` | Cards, header pill, buy card, drawer, inputs |
| Natural white | `--color-natural-white` | `#e0dacf` | Badges, pills, filter bar, segmented active text, progress track, mega-menu secondary bar |
| Natural white 60 | `--color-natural-white-60` | `#ece9e2` | **Page background** (`body`), mega menu, mobile menu |
| Natural white 25 | `--color-natural-white-25` | `#f5f4f1` | Quiet panels (offer rows, search results hover) |
| Natural white 60 @ 0.5 | `--color-natural-white-60-0.5` | `#ece9e250` | Translucent scrims over the page colour |
| Midnight | `--color-midnight` | `#03143b` | Not used by Shelby (kept for completeness) |
| Charcoal | `--color-charcoal` | `#52525b` | Long-form body copy (PDP details, articles) |
| Light charcoal | `--color-light-charcoal` | `#575757` | Muted text (breadcrumbs, colour lines, meta, fit notes), secondary-button hover |
| Light charcoal 0.3 | `--color-light-charcoal-0.3` | `#57575730` | Size-button hover fill |
| Light charcoal 0.7 | `--color-light-charcoal-0.7` | `#575757b3` | Swatch inset ring |
| Red | `--color-red` | `#9c0f0f` | **Shelby: low-stock text and dot only** (Allbirds: sale price) |
| Stroke | `--color-stroke` | `#cdcdcd` | Size-button border, option-row border |
| Khaki | `--color-khaki` | `#443828` | Not used |
| Green | `--color-green` | `#10714e` | **Shelby: in-stock dot and text** |

**Tailwind defaults Allbirds uses** (Tailwind 4 oklch, verbatim)

| Token | Value | Use |
|---|---|---|
| `--color-gray-200` | `oklch(92.8% .006 264.531)` | Disabled button fill |
| `--color-gray-300` | `oklch(87.2% .01 258.338)` | Disabled button border |
| `--color-gray-400` | `oklch(70.7% .022 261.325)` | Disabled button text, sold-out size text |
| `--color-gray-500` | `oklch(55.1% .027 264.364)` | Input placeholder |
| `--color-gray-600` | `oklch(44.6% .03 256.802)` | Filter label and product count |
| `--color-gray-700` | `oklch(37.3% .034 259.733)` | Pull-quote body |
| `--color-neutral-800` | `oklch(26.9% 0 0)` | Carousel captions |
| `--color-blue-600` | `oklch(54.6% .245 262.881)` | Focus outline on `.btn` |

**Overlays, veils and gradients (verbatim)**

| Name | Value | Where |
|---|---|---|
| Drawer overlay | `bg-black/50` → `color-mix(in oklab, #212121 50%, transparent)` | Cart and recently-viewed drawers, modals |
| Menu overlay | `bg-black/30` → `color-mix(in oklab, #212121 30%, transparent)` | Desktop mega menu |
| Tile veil | `rgba(0, 0, 0, 0.15)` | Category tiles |
| Radial veil (`.bg-radial-blur`) | `radial-gradient(circle, #00000040, #0000 30%)` | Promo tiles (behind the centred title) |
| Banner veil | `linear-gradient(0deg, rgba(0,0,0,.2), rgba(0,0,0,0))` | Collection banner, hero (§6.1.1) |
| Ring fill | `#212121` at `fill-opacity: .1` | Material ring inner circle |
| Ring strokes | `#fff` 0.6px at `stroke-opacity: .7` (middle) and `.4` (outer) | Material ring |
| Pill borders | `1.4px solid #21212180` | Expanding pill (editorial) |
| Crossed size | `linear-gradient(to top right, #0000 0% calc(50% - .8px), #00000080 50%, #0000 calc(50% + .8px) 100%)` | Sold-out size buttons (`.crossed-bg`) |

**Shelby tile tones** (pixel-sampled from Allbirds' four home category tiles at 1920px; used as the
tile backgrounds that Shelby's white-backdrop photos multiply onto)

| Token | Value | Shape tile |
|---|---|---|
| `--color-tile-slate` | `#5d7283` | Caps |
| `--color-tile-umber` | `#554b4a` | Truckers |
| `--color-tile-rose` | `#8d6b67` | Beanies |
| `--color-tile-sage` | `#80887e` | Bucket Hats |

**Colour swatches** (Shelby's names, kept from `src/lib/swatches.ts`): Black `#1e1f21`,
Washed Black `#2c2c2e`, Navy `#26314a`, Bone `#e4ddcc`, Cream `#ede6d6`, Olive `#5e6440`,
Charcoal `#4a4a4c`, Rust `#a9441f`, Stone `#c9c1ae`, Tobacco `#8a5a2e`, Forest `#24462f`,
Sand `#cdbb98`, Brown `#5a3a26`, White `#f4f2ee`, fallback `#8c867c`. Two-tone names ("Bone /
Brown") render Allbirds' split swatch: `linear-gradient(135deg, A 50%, B 50%)`.

### 2.2 Typography

Allbirds loads three proprietary self-hosted families: **Geograph** (Klim Type Foundry; 300/400/500/
700, normal + oblique) as `--font-sans`, **Self Modern** (400) as `--font-serif`, and **Akkurat
Mono** (400) as `--font-mono`. None can be downloaded. Per the site-clone skill's substitution rule:

| Allbirds family and role | Shelby font | Load | CSS variable | Tailwind class |
|---|---|---|---|---|
| Geograph in **heading roles** (hero H1, section headings, collection H1, article headlines, countdown digits) | **Plus Jakarta Sans** 400, 500, 600 | `next/font/google` `Plus_Jakarta_Sans` | `--font-display` | `font-display` |
| Self Modern (**serif display** role: PDP title, promo tile titles, pill quotes, story quotes) | **Plus Jakarta Sans** 400 (skill rule: display → Plus Jakarta Sans). See §11 item 9. | same | `--font-serif: var(--font-display)` | `font-serif` |
| Geograph in **body/UI roles** (body, buttons, nav, labels, prices, inputs, cards, badges) | **Inter** 400, 500, 700 | `next/font/google` `Inter` | `--font-sans` | `font-sans` (default) |
| Akkurat Mono (eyebrows, section tabs, column headings, option labels) | **IBM Plex Mono** 400, 500 (the closest free grotesque mono; the skill names no mono substitute) | `next/font/google` `IBM_Plex_Mono` | `--font-mono` | `font-mono` |

Fallbacks: `system-ui, sans-serif` (sans and display), `ui-serif, serif` is **not** used (the serif
role maps to display), `ui-monospace, monospace` (mono). `font-display: swap` for all.

**Type scale** (computed values; `letter-spacing` given in px at that size and as the Tailwind token)

| Role | Font | Size / line-height | Weight | Tracking | Case | Colour |
|---|---|---|---|---|---|---|
| Announcement | sans | 12/16 / **10/15** | 400 | .05em (0.6 / 0.5px) | as written | white |
| Nav link | sans | 12/16 | 500 | .05em (0.6px) | UPPER | `#212121` |
| Mobile menu item | sans | 14/21 | 500 | .05em (0.7px) | UPPER | `#212121` |
| Mobile menu sub-link | sans | 14/21 | 400 | normal | Capitalize | `#212121` |
| Mega column heading | sans | 12/16 | 500 | .05em | UPPER | `#212121` |
| Mega link | sans | 14/20 | 400 | normal | as written | `#575757` |
| Hero eyebrow | mono | 12/20 | 500 | .1em (1.2px) | UPPER | white |
| Hero H1 | display | 24/32 | 400 | .025em (0.6px) | Sentence | white |
| Section tab title | mono | 16/24 | 500 | .05em (0.8px) | UPPER | `#212121` |
| Section heading (centred) | display | 30/36 / 24/32 | 400 | normal | Sentence | `#212121` |
| Serif-role tile title | serif→display | 40/60 / 30/45 | 400 | normal | Title | white |
| Card title | sans | 14/20 / 12/16 | 500 | .05em (0.7 / 0.6px) | UPPER | `#000` |
| Card colour line | sans | 14/20 / 12/16 | 400 | .05em | as written | `#000` |
| Card price | sans | 14/20 (carousel) · 12/16 (grid) | 500 | .05em | UPPER | `#000` |
| Badge | sans | 12/12 / 10/10 | 500 | .05em | UPPER | `#212121` |
| Value-tile eyebrow | mono | 12/16 | 400 | .1em (1.2px) | UPPER | `#000` |
| Value-tile body | sans | 14/21 | 400 | normal | Sentence | `#000` |
| PDP title | serif→display | 30/36 / 24/32 | 400 | normal | Title | `#000` |
| PDP sub-line (mono) | mono | 14/20 / 12/16 | 400 | .05em | UPPER | `#575757` |
| PDP price | sans | 18/28 | 500 | .05em (0.9px) | UPPER | `#212121` |
| PDP price pill | sans | 12/16 italic | 500 | .05em | UPPER | `#000` on `#e0dacf` |
| PDP option label | mono 12/16 500 UPPER + sans 12/16 500 value | | | .05em | | `#212121` |
| Size button | sans | 12/16 | 500 | normal | as written | `#000` |
| Fit note | sans | 12/16 | 400 | normal | Sentence | `#575757` |
| Detail heading | sans | 14/16 | 500 | normal | UPPER (copy) | `#000` |
| Detail body | sans | 14/22 | 400 | .025em (0.35px) | Sentence | `#52525b` |
| Callout title | mono | 12/20 | 400 | .1em | UPPER | white |
| Callout body | sans | 14/20 | 400 | normal | Sentence | white |
| Pill quote | serif→display | 24/40 (lg) · 18/32 (md) · 14/20 | 400 | normal | Sentence | white |
| Breadcrumb | sans | 12/16 | 400 | .025em (0.3px) | as written | `#575757` (white on banners) |
| Collection H1 | display | 24/32 / 20/24 | 400 | normal | Title | white |
| Collection description | sans | 14/20 | 400 | normal | Sentence | `#e0dacf` |
| Filter label | sans | 14/20 | 500 | .025em (0.35px) | UPPER | gray-600 |
| Button | sans | 12/15 | 500 | .025em (0.3px) | UPPER | per variant |
| Button small / large | sans | 11/15 · 14/20 | 500 | .025em | UPPER | |
| Footer column heading | mono | 12/16 | 400 | .05em (0.6px) | UPPER | white |
| Footer link | sans | 12/16 | 400 | normal | as written | white |
| Drawer title | sans | 12/16 | 500 | normal | UPPER | `#000` |
| Drawer line title | sans | 12/16 | 500 | .05em | UPPER | `#000` |
| Drawer line meta | sans | 12/16 | 400 | normal | as written | `#575757` |
| Empty-state line | sans | 20/28 | 400 | normal | Sentence | `#000` |
| Article body | sans | 16/26 | 400 | normal | Sentence | `#52525b` |
| Carousel caption | sans | 12/16 | 400 | normal | Sentence | neutral-800 |
| Pull-quote name | mono | 14/20 | 500 | .1em (1.4px) | UPPER | `#000` |
| Pull-quote body | sans | 14/22.75 (leading 1.625) | 400 | normal | Sentence | gray-700 |
| Count badge | sans | 9/13.5 | 500 | normal | | white on `#212121` |

Fluid display sizes (Allbirds `--text-fluid-*`, used at 3xl/4xl only, i.e. ≥1920px): `xs`
`clamp(.7rem,.6627rem + .312vw,.884rem)`, `sm` `clamp(.875rem,.7991rem + .5443vw,1.25rem)`, `md`
`clamp(1.0938rem,.9573rem + .8988vw,1.7675rem)`, `lg` `clamp(1.3672rem,1.1379rem + 1.4323vw,
2.4992rem)`, `xl` `clamp(1.709rem,1.3394rem + 2.2266vw,3.5339rem)`. Shelby defines the custom
breakpoints `3xl: 120rem` and `4xl: 160rem` and applies them only where §6 says.

### 2.3 Spacing, radius, shadows, layout

- **Spacing unit** `--spacing: .25rem` (Tailwind default).
- **Gutters:** full-bleed rounded blocks sit **10px** from the viewport edge (`m-2.5`) and **10px**
  apart. Text sections use 20px (`px-5`) / 40px (`md:px-10`) padding.
- **Containers:** `--container-7xl: 80rem` (1280px) for collection grids and the filter bar;
  `--container-2xl: 42rem` for quiz cards; `65ch` (`.prose`) for article columns; header pill
  `max-w-[2560px]`.
- **Section rhythm (home at 1440):** hero 784px tall, then 10px, then category row (471px), 40px,
  carousel section (565px), 40px, promo tiles (667px), 40px, value tiles (240px), footer. PDP lower
  bands use `my-10` (40px).
- **Z-index scale (verbatim):** background −10, base 0, content 10, swiper button 10, background
  overlay 30, floating card 40, filter dropdown 50, floating widget 60, navigation content 70,
  header 80, global banner 85, takeover 90.
- **Chrome offsets:** `--hero-header-offset-desktop: 4rem`, `--hero-header-offset-mobile: 6.25rem`,
  `--hero-header-offset-desktop-lg: 5.25rem`, `--hero-header-offset-mobile-lg: 8.25rem`.
  `--global-banner-height` is set at runtime to the announcement bar's height (32 / 46).

**Radius tokens**

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 2px | Size buttons |
| `--radius-sm` | 4px | Progress track, small selects |
| `--radius-md` | 6px | Sticky buy bar top corners, hamburger button |
| `--radius-lg` | 8px | PDP gallery images |
| `--radius-xl` | 12px | Header pill, PDP buy card, mobile bands, option rows, split-block images |
| `--radius-2xl` | 16px | Product cards (`rounded-t-2xl` image), value tiles, collection banner, carousel images |
| `--radius-3xl` | 24px | Promo tiles, PDP lower bands (md+), brand pill container (md+) |
| `--radius` | 20px | Hero, category tiles (default), drawer thumbnails |
| `--radius-pill` | 250px | Category tile hover state |
| full | `9999px` (Allbirds writes `3.40282e38px`) | Buttons, badges, swatches, inputs, segmented control, filter bar, social icons |

**Shadows (verbatim Tailwind 4 values)**

| Token | Value | Use |
|---|---|---|
| `shadow` / `shadow-sm` | `0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a` | Header pill, PDP buy card (md+) |
| `shadow-md` | `0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a` | Search results panel |
| `shadow-lg` | `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` | Mega menu panel |
| `shadow-xl` | `0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a` | Cart / recently-viewed drawer |
| `shadow-[0_.85rem_1rem_rgba(0,0,0,0.25)]` | `0 .85rem 1rem #00000040` | Floating image in the material ring |
| Selected swatch ring | `0 0 0 1px #212121` | Selected colour swatch |

**Blur:** `--blur-xs 4px`, `--blur-sm 8px`, `--blur-md 12px` (backdrop on the search panel only).

**Aspect ratios used:** hero = viewport-derived height; category tile `0.77`; promo tile `7/10`;
product image `1/1`; PDP gallery `7/4`; details image `3/2`; split-block image `10/7`; stories
card image `5/4`; collection banner `1/1` (mobile) / `3/1` (md) / `4/1` (lg); brand pill
container `0.63` (mobile) / `2.56` (md); pull-quote portrait `5/7`.

### 2.4 Animations

Allbirds animates with **GSAP 3 + ScrollTrigger** (bundled as `ScrollTrigger.js`), driven by the
constants in `animations.js`. It has **no `prefers-reduced-motion` handling** (0 rules in its CSS,
no checks in the modules read). Shelby reproduces every effect with CSS transitions/keyframes and
three small client hooks (no GSAP, no new dependency) and **adds** reduced-motion handling.

#### 2.4.1 Timing constants (verbatim from `animations.js`)

| Constant | Seconds |
|---|---|
| `SECTION.FADE_IN` | 0.8 |
| `ELEMENT.HOVER.DEFAULT` / `.DELAY` / `.TITLE` | 0.6 / 0.1 / 0.05 |
| `ELEMENT.NAVIGATION.DROPDOWN` / `.SLIDE` | 0.3 / 0.6 |
| `ELEMENT.ACCORDION.DEFAULT` / `.STAGGER` / `.TECH_DETAILS` | 0.3 / 0.08 / 0.2 |
| `ELEMENT.CAROUSEL.SLIDE_CHANGE` | 0.2 |
| `ELEMENT.QUICK_VIEW.FADE_IN_MOVE_UP` / `.FADE_OUT_MOVE_DOWN` | 0.4 / 0.2 |
| `ELEMENT.SCROLL_BAR` | 0.8 |
| `ELEMENT.MARQUEE` | 10 |
| `ELEMENT.CIRCLE_ANIMATION.DESKTOP` / `.MOBILE` | 4 / 15 |
| Border radius `DEFAULT` / `PILL` | 20px / 250px |

#### 2.4.2 Easing tokens

GSAP eases map to CSS `cubic-bezier`. The three sine curves are Allbirds' own CSS tokens (exact).
The power3 (quartic) curves use the standard Penner quartic beziers.

| Token | GSAP name | CSS value |
|---|---|---|
| `--ease-sine-out` | `sine.out` | `cubic-bezier(.61, 1, .88, 1)` |
| `--ease-sine-in` | `sine.in` | `cubic-bezier(.12, 0, .39, 0)` |
| `--ease-sine-in-out` | `sine.inOut` | `cubic-bezier(.37, 0, .63, 1)` |
| `--ease-power3-out` | `power3.out` | `cubic-bezier(.25, 1, .5, 1)` |
| `--ease-power3-in` | `power3.in` | `cubic-bezier(.5, 0, .75, 0)` |
| `--ease-power3-in-out` | `power3.inOut` | `cubic-bezier(.76, 0, .24, 1)` |
| `--ease-snappy` | (CSS token) | `cubic-bezier(.2, 0, 0, 1)` |
| `--ease-out` | Tailwind | `cubic-bezier(0, 0, .2, 1)` |
| `--ease-in-out` | Tailwind | `cubic-bezier(.4, 0, .2, 1)` |
| default transition | Tailwind | `.15s cubic-bezier(.4, 0, .2, 1)` |

**Reversal rule:** GSAP plays a timeline backwards on close/leave, so a close mirrors the open
curve: an open on `power3.out` closes on `power3.in` with the same duration, `sine.out` closes on
`sine.in`, and `*.inOut` curves stay the same.

#### 2.4.3 Motion catalogue

Every animation Shelby ships. Durations and delays in seconds. "Trigger" names the Shelby element.

| # | Effect | Element (Shelby) | Trigger | Property: from → to | Duration · ease · delay |
|---|---|---|---|---|---|
| M1 | Section reveal | Every top-level section marked `data-reveal` | Section top crosses 85% of the viewport, once (`start: "top 85%"`, `once: true`) | opacity 0 → 1 | 0.8 · sine.out |
| M2 | Category row reveal | Home §6.1.2 | Section top crosses 100% of the viewport, once | opacity 0 → 1 | 0.8 · sine.out · 0.8 (home only) |
| M3 | Hero reveal | Home hero container, then its content | On mount | container opacity 0 → 1; content opacity 0 → 1 | 0.8 · sine.out · 0; content 0.8 · sine.out · 0.3 |
| M4 | Staggered title fade | Category tile title pills | Section top at 75% of viewport, once | opacity 0 → 1 | 0.8 · sine.out · stagger 0.15 |
| M5 | Tile hover morph | Category tile | `mouseenter` after a 0.1 delay (desktop, hover-capable); on mobile the centred slide | border-radius 20px → 250px | 0.6 · power3.inOut |
| M5a | | Tile hover image | same | opacity 0 → 1 | 0.6 · sine.out |
| M5b | | Tile title pill border | same | border-color white → transparent | 0.3 · sine.in |
| M5c | | Tile text block | same | translateY(30%) → 0 | 0.6 · power3.inOut |
| M5d | | Tile CTA buttons | same (pointer-events on at the end, off after the reverse) | opacity 0 → 1 | 0.6 · sine.out |
| M6 | Promo image zoom | Promo tile image | `:hover` on the tile | scale 1 → 1.08 | 0.9 · ease-in-out (`cubic-bezier(.4,0,.2,1)`) |
| M7 | Promo content stagger | Promo tiles' veil + content | After M1 of the section | opacity 0 → 1 | 0.8 · sine.out · 0.8 · stagger 0.05 |
| M8 | Card image swap | Product card second image | Card `:hover` (desktop) | opacity 0 → 1 | 0.15 · ease-in-out |
| M9 | Card box | Product card | any state change | `transition: all` | 0.3 · ease-in-out |
| M10 | Quick-add flip out | Card meta rows (colour + price) | Card `:hover` / `:focus-within` (md+) | `perspective(600px) translateY(0) rotateX(0)` → `translateY(-50%) rotateX(90deg)`, opacity 1 → 0 | 0.35 · ease-out · 0.25 (enter) / 0.15 (leave) |
| M10a | Quick-add flip in | Card quick-add row | same | `perspective(600px) translateY(50%) rotateX(-90deg)`, opacity 0 → `translateY(0) rotateX(0)`, 1; pointer-events on after 0.6 | 0.35 · ease-out · 0.25 / 0.15 |
| M11 | Button colours | `.btn` (all variants) | hover / focus | background-color, color, border-color; opacity | 0.2 · sine.inOut (colours), 0.2 · sine.out (opacity) |
| M12 | Size button | `.btn-size` | hover / select | colours | 0.2 · sine.inOut |
| M13 | Swatch | Card swatch labels | checked / hover | `transition: all` | 0.2 · ease-in-out |
| M14 | Checkbox tick | `.checkbox:before` | checked | scale 0 → 1 | 0.05 · ease-in-out |
| M15 | Section tab underline | Mono tab titles | active / hover | border-bottom-color transparent → `#212121` (2px) | 0.3 · ease |
| M16 | Nav link dim | Header nav links | a mega menu is open | non-active links opacity 1 → 0.5 (hover back to 1) | 0.2 · sine.inOut |
| M17 | Mega menu open | Overlay (`bg-black/30`) | nav item hover (desktop), focus or click | opacity 0 → 1 | 0.24 · sine.out · 0 |
| M17a | | Panel background (`origin-top`) | same | scaleY 0 → 1 | 0.3 · power3.inOut · 0 |
| M17b | | Panel content wrapper | same | opacity 0 → 1 | 0.15 · sine.out · 0.15 |
| M17c | | Secondary bar + column contents | same | opacity 0 → 1, stagger 0.05 | 0.255 · sine.out · 0.255 |
| M17d | | Switching between two open menus | hover another item | old content opacity → 0, then new content opacity 0 → 1 stagger 0.05 | 0.15 · sine.in, then 0.15 · sine.out |
| M18 | Mobile menu open | Menu sheet (`bg-natural-white-60`, `origin-top`) | hamburger | scaleY 0 → 1; container opacity 0 → 1 | 0.3 · power3.inOut; 0.24 · sine.out |
| M18a | | Menu items and footer card | same | opacity 0 → 1, stagger 0.05 | 0.3 · sine.out · 0.4 |
| M18b | | Sub-panel (Shop, Drops…) | tap a row with a chevron | translateX(100%) → 0 (old panel opacity → 0) | 0.48 · power3.inOut |
| M19 | Accordion | Footer menus (mobile), FAQ, menu accordions | toggle | max-height 0 → content height (then `auto`) | 0.3 · power3.inOut (menu accordions 0.15) |
| M20 | Drawer open | Drawer overlay (`bg-black/50`) | bag icon, add to bag, eye icon | opacity 0 → 1 | 0.4 · sine.out |
| M20a | | Drawer panel | same | translateX(100%) → 0 | 0.8 · power3.out |
| M20b | Drawer close | both | ×, overlay click, Escape | reverse: panel 0.8 · power3.in; overlay 0.4 · sine.in | |
| M21 | Progress bar | Quiz progress fill (`origin-left`) | step change | scaleX → step / total | 0.6 · power3.inOut |
| M22 | Modal open | Size chart, quick-add size sheet (desktop) | open | overlay opacity 0 → 1; dialog opacity 0, scale .95 → 1, 1 | 0.3 · sine.out; 0.4 · power3.out · 0.1 |
| M23 | Quick view in / out | Search panel, quiz step change, quick-add sheet (mobile) | open / next | opacity 0 → 1 and translateY(10%) → 0; out: opacity → 0, translateY → 10% | in 0.4 · sine.out; out 0.2 · sine.in |
| M24 | Carousel fade | Announcement messages | every 5s (hero: every 4s when it has 2+ slides) | crossfade opacity | 0.3 (Swiper default speed) · ease |
| M25 | Carousel slide | Product / story carousels | arrow click, swipe | `scroll-behavior: smooth` to the next card | browser smooth scroll |
| M26 | Material ring | PDP ring band (§6.4.10), Find Your Fit (§6.1.4) | Band reveal (M1 trigger) | band opacity 0 → 1 | 0.8 · sine.out · 0 |
| M26a | | 3 circles | same | scale 0 → 1 (`transform-box: fill-box`), opacity 0 → 1 | 1.5 · sine.out · 0 |
| M26b | | 4 dots, each on the r=90 circle path | same | travel from path progress `s + .15` to `s`, with `s` = .681, .825, .175, .3243; radius 0 → 1.5 | 1.5 · sine.out · 0.8 + i × 0.4 |
| M26c | | 4 callouts, in the order 4, 3, 1, 2 | same | opacity 0 → 1, stagger 0.4 | 0.5 · sine.out · 1.6 |
| M26d | | Centre floating image | same | opacity 0 → 1 | 0.6 · sine.out · 1.4 |
| M27 | Brand pill | Pill content | Section reveal | opacity 0 → 1, translateY(16px) → 0 | 0.8 · sine.out; 0.8 · power3.out |
| M27a | | 3 orbiting dots on the pill path | same | desktop: travel to their resting points (power3.out, 4s, once); mobile: loop the path (linear, 15s, infinite) | see §6.1.3 |
| M27b | | Marquee strip | same | translateX(0) → translateX(−50%) | 10 · linear · infinite |
| M28 | Pill window | Editorial pill (§6.1.8, §6.9) | Section reveal | container opacity 0 → 1 | 0.3 · sine.out · 0 |
| M28a | | Pill image window | same | `clip-path: inset(49% round 9999px)` → `inset(0 round 9999px)` (the CSS equivalent of GSAP's scale .01 → 1 with the image counter-scaled) | 2.2 · power3.out · 0.8 |
| M28b | | 2 pill borders | same | scale 0 → 1 | 2.2 · power3.out · 0.8 |
| M28c | | Quote text | same | opacity 0 → 1 | 1.5 · sine.out · 1.7 |
| M28d | | Floating image / UI | same | opacity 0 → 1, translateY(10%) → 0 | 1.2 · sine.out / power3.out · 2.5 |
| M29 | Card caption rise | Story-card text (UGC rows) | Section reveal | translateY(100%) → 0, opacity 0 → 1 | 0.8 · power3.out / sine.out · 0.4 |
| M30 | Skeleton | Loading placeholders | while loading | `pulse`: 50% opacity .5 | 2 · `cubic-bezier(.4,0,.6,1)` · infinite |
| M31 | Spinner | Button loading state | while pending | `spin`: rotate 360deg | 1 · linear · infinite |
| M32 | Count badge | Header bag/eye badge | 0 ↔ ≥1 | opacity | 0.05 · sine.in |
| M33 | Sticky buy bar | PDP sticky bar | main add-to-cart button leaves the viewport | opacity 0 → 1, pointer-events none → auto | 0.15 · ease-in-out (`transition: all`) |

**Header behaviour:** Allbirds ships a hide-on-scroll helper (hide after a 60px downward delta past
the header height, show on scroll up or when the cursor is within 60px of the top; `y` 0.3s
power3.out/in). In the captured state the header **stayed pinned** while scrolling 1,400px down and
back. Shelby keeps it **pinned** (no hide).

#### 2.4.4 Implementation (no new dependency)

- **`useInView(ref, { rootMargin, once })`** (`src/lib/motion.ts`, client): IntersectionObserver
  with `rootMargin: "0px 0px -15% 0px"` for M1 (`"0px 0px 0px 0px"` for M2, `"0px 0px -25% 0px"`
  for M4). Sets `data-in="true"` on the element. `<Reveal as="section" delay={…}>` wraps server
  content.
  - CSS: `[data-reveal]{opacity:0;transition:opacity .8s var(--ease-sine-out)}
    [data-reveal][data-in="true"]{opacity:1}`. Children with `data-reveal-child` use
    `transition-delay: calc(var(--i) * var(--stagger))`.
  - `<noscript><style>[data-reveal]{opacity:1!important}</style></noscript>` in the layout, so
    no-JS and crawlers see content.
- **`usePathMotion(pathRef, dots, { from, to, duration, ease, delay, repeat })`** (client):
  `requestAnimationFrame` + `SVGPathElement.getPointAtLength()` to place each dot's `cx/cy`, with
  the easing functions below implemented as JS:
  - sine.out `t => Math.sin(t*Math.PI/2)`;
  - power3.out `t => 1 - (1-t)**4`;
  - linear.
  Used by M26b and M27a. Stops when the element leaves the viewport.
- **`useHoverIntent(ref, delay = 100)`** (client): `mouseenter` sets `data-hover="true"` after
  100ms; `mouseleave` clears it at once. Used by M5 (CSS transitions key off `[data-hover]`).
- Everything else is pure CSS (`transition`, `@keyframes`, `:hover`, `[data-open]`).
- **Reduced motion** (`@media (prefers-reduced-motion: reduce)` and the same check in the hooks):
  - `[data-reveal]` starts at opacity 1;
  - every transition and animation duration becomes `0.01ms` (state changes stay, motion goes);
  - M26b and M27a dots render at their resting points;
  - the M27b marquee stops (static, first copy only);
  - announcement and hero carousels do not autoplay (manual arrows only);
  - the M10 flip becomes an instant swap;
  - M20 drawers appear without the slide.

---

## 3. Global styles (`src/app/globals.css`, replace the file)

```css
@import "tailwindcss";

@custom-variant 3xl (@media (min-width: 120rem));
@custom-variant 4xl (@media (min-width: 160rem));

@theme inline {
  /* fonts (next/font variables set on <html> in layout.tsx) */
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-jakarta), system-ui, sans-serif;
  --font-serif: var(--font-jakarta), system-ui, sans-serif; /* Self Modern role, §2.2 */
  --font-mono: var(--font-plex-mono), ui-monospace, monospace;

  /* colours (§2.1) */
  --color-black: #212121;
  --color-white: #ffffff;
  --color-natural-white: #e0dacf;
  --color-natural-white-60: #ece9e2;
  --color-natural-white-25: #f5f4f1;
  --color-natural-white-60-0\.5: #ece9e250;
  --color-charcoal: #52525b;
  --color-light-charcoal: #575757;
  --color-light-charcoal-0\.3: #57575730;
  --color-light-charcoal-0\.7: #575757b3;
  --color-red: #9c0f0f;
  --color-stroke: #cdcdcd;
  --color-green: #10714e;
  --color-tile-slate: #5d7283;
  --color-tile-umber: #554b4a;
  --color-tile-rose: #8d6b67;
  --color-tile-sage: #80887e;

  /* radius (§2.3) */
  --radius-xs: .125rem;
  --radius-sm: .25rem;
  --radius-md: .375rem;
  --radius-lg: .5rem;
  --radius-xl: .75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-tile: 20px;
  --radius-pill: 250px;

  /* easing (§2.4.2) */
  --ease-sine-out: cubic-bezier(.61, 1, .88, 1);
  --ease-sine-in: cubic-bezier(.12, 0, .39, 0);
  --ease-sine-in-out: cubic-bezier(.37, 0, .63, 1);
  --ease-power3-out: cubic-bezier(.25, 1, .5, 1);
  --ease-power3-in: cubic-bezier(.5, 0, .75, 0);
  --ease-power3-in-out: cubic-bezier(.76, 0, .24, 1);
  --ease-snappy: cubic-bezier(.2, 0, 0, 1);

  /* fluid display (§2.2) */
  --text-fluid-sm: clamp(.875rem, .7991rem + .5443vw, 1.25rem);
  --text-fluid-md: clamp(1.0938rem, .9573rem + .8988vw, 1.7675rem);
  --text-fluid-lg: clamp(1.3672rem, 1.1379rem + 1.4323vw, 2.4992rem);
  --text-fluid-xl: clamp(1.709rem, 1.3394rem + 2.2266vw, 3.5339rem);

  /* z-index (§2.3) */
  --z-index-content: 10;
  --z-index-overlay: 30;
  --z-index-floating: 40;
  --z-index-dropdown: 50;
  --z-index-widget: 60;
  --z-index-nav-content: 70;
  --z-index-header: 80;
  --z-index-banner: 85;
  --z-index-takeover: 90;

  --animate-marquee: marquee 10s linear infinite;
}

:root {
  --hero-header-offset-desktop: 4rem;
  --hero-header-offset-mobile: 6.25rem;
  --hero-header-offset-desktop-lg: 5.25rem;
  --hero-header-offset-mobile-lg: 8.25rem;
  --global-banner-height: 46px;
}
@media (min-width: 48rem) { :root { --global-banner-height: 32px; } }

@layer base {
  html { -webkit-text-size-adjust: 100%; -webkit-tap-highlight-color: transparent; }
  body {
    background: var(--color-natural-white-60);
    color: var(--color-black);
    font-family: var(--font-sans);
    font-size: 1rem;
    line-height: 1.5;
    min-height: 100%;
  }
  ::selection { background: var(--color-black); color: var(--color-natural-white-60); }
  :focus-visible { outline: 2px solid oklch(54.6% .245 262.881); outline-offset: 2px; }
  input::placeholder { color: oklch(55.1% .027 264.364); }
}

@layer components {
  /* Allbirds' .btn, verbatim values (§5) */
  .btn {
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    padding: .5rem 1rem; text-align: center; white-space: nowrap;
    font-family: var(--font-sans); font-size: .75rem; line-height: 1.25; font-weight: 500;
    letter-spacing: .025em; text-transform: uppercase; color: var(--color-black);
    border-radius: 9999px;
    transition: background-color .2s var(--ease-sine-in-out), color .2s var(--ease-sine-in-out),
      border-color .2s var(--ease-sine-in-out), opacity .2s var(--ease-sine-out);
  }
  .btn:focus { outline-color: oklch(54.6% .245 262.881); }
  .btn-primary { border: 1px solid var(--color-white); background: var(--color-white); }
  .btn-secondary { border: 1px solid var(--color-black); background: var(--color-black); color: var(--color-white); }
  .btn-outline-black { border: 1px solid var(--color-black); color: var(--color-black); background: transparent; }
  .btn-outline-white { border: 1px solid var(--color-white); color: var(--color-white); background: transparent; }
  .btn-icon-black { border: 1px solid var(--color-black); padding: 0; color: var(--color-black); background: transparent; }
  .btn-icon-white { border: 1px solid var(--color-white); padding: 0; color: var(--color-white); background: transparent; }
  @media (hover: hover) {
    .btn-primary:hover { border-color: var(--color-black); background: var(--color-black); color: var(--color-white); }
    .btn-secondary:hover { border-color: var(--color-light-charcoal); background: var(--color-light-charcoal); color: var(--color-white); }
    .btn-outline-black:hover, .btn-icon-black:hover { border-color: var(--color-black); background: var(--color-black); color: var(--color-white); }
    .btn-outline-white:hover, .btn-icon-white:hover { border-color: var(--color-white); background: var(--color-white); color: var(--color-black); }
  }
  .btn-small { padding: .5rem .75rem; font-size: 11px; }
  .btn-large { padding: .625rem .875rem; font-size: .875rem; line-height: 1.25rem; }
  .btn-atc { padding-block: 1rem; width: 100%; }
  .btn:disabled, .btn[aria-disabled="true"] {
    cursor: not-allowed; border-color: oklch(87.2% .01 258.338);
    background: oklch(92.8% .006 264.531); color: oklch(70.7% .022 261.325);
  }

  .btn-size {
    position: relative; overflow: hidden; display: flex; flex-direction: column;
    align-items: center; justify-content: center; width: 100%; cursor: pointer;
    padding-block: .75rem; border: 1px solid var(--color-stroke); border-radius: var(--radius-xs);
    font-size: .75rem; line-height: 1rem; font-weight: 500; color: currentColor;
    transition: color .2s var(--ease-sine-in-out), background-color .2s var(--ease-sine-in-out),
      border-color .2s var(--ease-sine-in-out);
  }
  @media (hover: hover) { .btn-size:hover:not(:disabled) { background: var(--color-light-charcoal-0\.3); } }
  .btn-size[aria-pressed="true"] { border-color: var(--color-black); background: var(--color-black); color: var(--color-white); }
  .btn-size:disabled { cursor: not-allowed; color: oklch(70.7% .022 261.325); opacity: .7; }

  .checkbox {
    appearance: none; display: grid; place-content: center; padding: .125rem;
    border: 1px solid var(--color-black);
  }
  .checkbox::before {
    content: ""; width: 10px; height: 10px; box-shadow: inset 1em 1em var(--color-black);
    transform: scale(0); transition: transform 50ms ease-in-out;
  }
  .checkbox:checked::before { transform: scale(1); }

  .badge {
    display: inline-flex; align-items: center; padding: .5rem; border-radius: 9999px;
    background: var(--color-natural-white); color: var(--color-black);
    font-size: 10px; line-height: 1; font-weight: 500; letter-spacing: .05em; text-transform: uppercase;
  }
  @media (min-width: 48rem) { .badge { font-size: .75rem; } }

  .eyebrow { font-family: var(--font-mono); font-size: .75rem; line-height: 1rem; letter-spacing: .1em; text-transform: uppercase; }
  .tab-title {
    font-family: var(--font-mono); font-size: 1rem; line-height: 1.5rem; font-weight: 500;
    letter-spacing: .05em; text-transform: uppercase; white-space: nowrap;
    border-bottom: 2px solid transparent; transition: all .3s ease;
  }
  .tab-title[aria-selected="true"], .tab-title:hover { border-bottom-color: var(--color-black); }
}

@utility cutout { mix-blend-mode: multiply; }
@utility bg-radial-blur { background: radial-gradient(circle, #00000040, #0000 30%); }
@utility crossed-bg {
  background: linear-gradient(to top right, #0000 0% calc(50% - .8px), #00000080 50%, #0000 calc(50% + .8px) 100%);
}
@utility scrollbar-hidden { scrollbar-width: none; &::-webkit-scrollbar { display: none; } }

/* Motion (§2.4) */
[data-reveal] { opacity: 0; transition: opacity .8s var(--ease-sine-out); }
[data-reveal][data-in="true"] { opacity: 1; }
[data-reveal-child] { opacity: 0; transition: opacity .8s var(--ease-sine-out) calc(var(--d, 0s) + var(--i, 0) * var(--stagger, 0s)); }
[data-in="true"] [data-reveal-child] { opacity: 1; }

@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 50% { opacity: .5; } }

@media (prefers-reduced-motion: reduce) {
  [data-reveal], [data-reveal-child] { opacity: 1 !important; }
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; transition-delay: 0s !important; scroll-behavior: auto !important;
  }
  .animate-marquee { animation: none !important; }
}
```

**Body class string:** `bg-natural-white-60 min-h-full font-sans text-black antialiased`.
**Selection:** `#212121` on `#ece9e2`.

---

## 4. Tailwind config

Tailwind 4 is CSS-first. Everything lives in `globals.css` (§3). Keep `postcss.config.mjs` with
`@tailwindcss/postcss`. There is no `tailwind.config.ts`; for tools that require one, export an
empty `{ content: ["./src/**/*.{ts,tsx}"] }`. Fonts are wired in `src/app/layout.tsx`:

```tsx
import { IBM_Plex_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google"
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-inter", display: "swap" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jakarta", display: "swap" })
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" })
// <html lang="en" className={`${inter.variable} ${jakarta.variable} ${plexMono.variable}`}>
```

---

## 5. Button component (`src/components/ui/button.tsx`)

`Button` / `ButtonLink` keep their props (`variant`, `size`, `block`, `loading`, `track`) and
render the §3 classes.

| Variant | Class | Default | Hover (hover-capable devices) | Disabled |
|---|---|---|---|---|
| `primary` (light) | `btn btn-primary` | white fill, white 1px border, `#212121` text | `#212121` fill and border, white text | gray-200 fill, gray-300 border, gray-400 text |
| `secondary` (dark, main CTA) | `btn btn-secondary` | `#212121` fill and border, white text | `#575757` fill and border | same |
| `outline-black` | `btn btn-outline-black` | transparent, `#212121` border and text | `#212121` fill, white text | same |
| `outline-white` | `btn btn-outline-white` | transparent, white border and text | white fill, `#212121` text | — |
| `icon-black` | `btn btn-icon-black size-10` (40px) / `size-8` (32px) | circle, 1px `#212121` border | `#212121` fill, white icon | 50% opacity, no pointer (`.swiper-nav-disabled-state`) |
| `icon-white` | `btn btn-icon-white` | circle, white border | white fill, `#212121` icon | — |
| `link` | `text-sm underline` (14/20) or `text-xs underline` (12/16) | as text | `text-decoration-thickness: 2px` | — |

**Sizes (exact boxes):**

| Size | Padding | Font | Height |
|---|---|---|---|
| default | 8px 16px | 12/15 | **33px** (incl. 1px borders) |
| `small` | 8px 12px | 11/15 | 33px |
| `large` | 10px 14px | 14/20 | **42px** |
| `atc` | 16px 16px, full width | 12/15 | **49px** |
| icon | 0 | — | 40px or 32px square |

- **Base:** pill (`9999px`), Inter 500 UPPERCASE, tracking .025em, `white-space: nowrap`, flex
  centred.
- **Motion:** M11.
- **Loading:** label replaced by a 16px `CircleNotch` with `animate-[spin_1s_linear_infinite]`
  (M31); width locked.
- **Focus:** 2px blue-600 outline (§3).
- **Active:** `active:opacity-[.85]` (Allbirds' footer Sign Up).

---

## 6. Section-by-section spec

Each section names the Allbirds pattern it takes, then the exact values. Function, data and
tracking for every section are Appendix A's (same section numbers).

### 6.0 Global chrome

#### 6.0.1 Announcement bar (`announcement-bar.tsx`, Allbirds global banner)
- `sticky top-0 z-[85]`, `bg-black text-white`. The slide is `flex items-center justify-center
  px-8 py-2`, so the bar is **32px** tall (one line) / **46px** (two lines at 10/15). Text 12/16 /
  10/15, tracking .05em, centred. Links inside are plain white with an underline on hover.
- Prev/next chevron buttons (`CaretLeft` / `CaretRight` 24px, `size-6`) sit absolute at the left and
  right edges, vertically centred.
- **Messages:** Appendix A §6.0.1 (policy lines; "[Drop] Is Live Now" when a drop is live). Crossfade
  every **5s** (M24). Allbirds loops with `crossFade` and keyboard arrows; pause on hover and
  focus. With one message: static, arrows hidden.
- Sets `--global-banner-height` on `<html>` from its measured height (ResizeObserver).

#### 6.0.2 Header pill (`site-header.tsx`, Allbirds header)
- **Structure:** a `sticky z-[80]` wrapper at `top: var(--global-banner-height)` with **0px**
  height. The pill hangs from it, `absolute top-5 left-5 right-5 mx-auto max-w-[2560px]`.
  - Pill: `bg-white rounded-xl shadow overflow-hidden`, height **48px / 40px**, padding `0 20px /
    0 10px`.
  - The pill floats over the hero image (the hero starts 10px under the banner). On pages without
    a hero, `main` gets `padding-top: 76px / 108px` (pill top 20 + height 48/40 + 8; mobile adds
    Allbirds' 40px breadcrumb margin).
  - The header stays pinned while scrolling (§2.4.3).
- **Desktop row:** three blocks, `flex items-center justify-between`.
  - **Left:** the wordmark link, 74×24 box (Allbirds' logo box).
    - **Shelby wordmark:** the text `shelby`, display font 600, 22px/24px, letter-spacing −.02em,
      lowercase, `#212121`, `aria-label="Shelby home"`.
  - **Centre:** nav, `flex gap-8` (32px). Each item: Inter 12/16 500 UPPERCASE tracking .05em
    `#212121`.
    - Direct links are `<a>`; mega items are `<button aria-expanded>`.
    - Transition: opacity .2s sine-in-out (M16).
    - Items (functions from Appendix A §6.0.2): **SHOP** (mega), **FEATURED** (mega), **DROPS**
      (mega, with a 6px `#212121` dot after the label when a drop is live), **FIT QUIZ** (link),
      **EXPLORE** (mega). Order: SHOP · FEATURED · DROPS · FIT QUIZ · EXPLORE.
  - **Right:** `ul flex items-center gap-2` of 24px icon buttons (`size-6`):
    - search (`MagnifyingGlass`), opens §6.0.5;
    - recently viewed (`Eye`, hidden when empty);
    - bag (`Handbag`).
    - Count badges (bag, eye): `absolute top-2.5 -right-0.5 size-3.5 rounded-full bg-black
      text-white text-[9px] font-medium`, centred, opacity transition 50ms sine-in (M32); hidden at 0.
- **Mobile row:**
  - hamburger (`List` 24px, in a `rounded-md` button) at left;
  - wordmark absolutely centred (`inset-0 mx-auto max-w-[75px]`), 20px/24px;
  - search and bag icons at right (`gap-2`). The eye moves into the mobile menu footer card.

#### 6.0.3 Mega menus (desktop, Allbirds dropdown)
- **Frame:** `fixed inset-x-0 top-0 left-5 right-5 mx-auto max-w-[2560px]
  pt-[calc(5rem+var(--global-banner-height))] z-30`.
  - Inside, the **panel background** is `absolute top-0 -left-[50%] -right-[50%] m-auto h-full
    w-screen bg-natural-white-60 rounded-b-xl shadow-lg origin-top`, with scaleY 0 → 1 (M17a).
  - Content wrapper: `relative z-30 pb-10`.
- **Overlay:** `fixed inset-0 bg-black/30 z-[10]` (M17).
- **Secondary bar** at the top of the content: `rounded-xl bg-natural-white` full width, 40px tall,
  centred label Inter 12/16 500 (e.g. "Shop", "Drops").
- **Columns:** `flex gap-12` starting at the pill's left padding. Each column is a heading (Inter
  12/16 500 UPPERCASE tracking .05em, `mb-4`), then links (Inter 14/20 400 `#575757`,
  `hover:underline`, `gap-2`). Top-level single links (no children) use the heading style.
- **Image cards** (right side, v4's tiles): up to 3 cards, each 220px wide.
  - Image: `aspect-square rounded-2xl bg-white overflow-hidden`, the photo `object-contain`.
  - Caption: Inter 12/16 500 UPPERCASE tracking .05em, `mt-2`.
- **Panel contents** (from Appendix A §6.0.3):

  | Panel | Columns | Cards |
  |---|---|---|
  | SHOP | **SHAPES** (Caps, Truckers, Beanies, Bucket Hats, Shop All); **THE CORE** (one link per Everyday Cap colour → PDP `?color=`) | the 3 shape lead photos |
  | FEATURED | **FEATURED** (The Everyday Cap, live drop product, The Two-Pack, Fit Quiz) | Everyday Cap, Two-Pack |
  | DROPS | **LIVE NOW**, **COMING UP** (titles + dates), **ALL DROPS** | up to 3 release `hero_image`s |
  | EXPLORE | **EXPLORE** (The Crush Test, Fit Guide, Why The Everyday Cap, Shipping & Returns) | `story-crush.jpg` |

- Opens on hover (100ms intent), focus or click. Closes on Escape, an outside click, or leaving the
  panel and header. Motion M17–M17d. Tracking from Appendix A.

#### 6.0.4 Recently viewed drawer
- Function: Appendix A §6.0.4.
- Frame: the cart drawer (§6.7), header "PREVIOUSLY VIEWED (N)".
- Body: a 2-column grid of product cards (§6.2, gap 10px, padding 20px), with no quick-add row.

#### 6.0.5 Search (Allbirds icon + dropdown)
- The search icon opens a **dropdown panel** in the mega-menu frame (§6.0.3): same background,
  scaleY M17a, overlay M17.
- **Input:** full width (max 640px, centred), `rounded-full border border-black bg-white px-3 py-2.5
  pr-20 text-base` (16/24), with a `MagnifyingGlass` 20px inside the left padding (`pl-10`).
  - Placeholder rotates every 2s (Appendix A list).
  - A `btn btn-outline-black btn-small` "SEARCH" sits absolutely inside the input at `right-1`,
    vertically centred.
- **Results** (in the panel, max 6): rows `flex gap-4 p-2 rounded-xl hover:bg-natural-white-25`:
  - a 56px `rounded-lg bg-white` thumbnail (`object-contain`);
  - title Inter 12/16 500 UPPERCASE tracking .05em;
  - meta 12/16 `#575757`.
  - Then `link` "View all results". Empty: 14/20 "No hats match "term"".
- Mobile: the same panel under the pill, full width (left/right 10px), M23 in.

#### 6.0.6 Continuity banner (Appendix A §10)
- A `rounded-xl bg-white` strip, `mx-2.5 mb-2.5`, padding 12px 16px:
  - Phosphor `PlayCircle` 20px;
  - Inter 14/20 "You just watched: [episode]";
  - a `link` to the story, right-aligned.
- Sits directly under the header offset.

#### 6.0.7 Mobile menu (Allbirds dropdown sheet)
- Hamburger → `X`. A `fixed inset-0 top-[var(--global-banner-height)] z-40 bg-natural-white-60
  origin-top` sheet (M18) under the pill. Scroll locked.
- **Top-level rows** (padding-top 74px to clear the pill; `px-5`; rows 45px apart): SHOP ›, FEATURED
  ›, DROPS ›, FIT QUIZ, EXPLORE ›.
  - Each row: Inter 14/21 500 UPPERCASE tracking .05em `#212121`.
  - Rows with children end in a 20px `CaretCircleRight` (Allbirds' circled chevron).
  - Tapping slides in the sub-panel (M18b), which repeats the mega-menu columns as a list (Inter
    14/21 400 Capitalize, 35px rows) with a "‹ Back" row at the top.
- **Footer card:** `absolute bottom-5 left-5 right-5 rounded-sm bg-white p-5`, links Inter 14/21 400
  Capitalize, 35px rows:
  - Recently Viewed (N);
  - Fit Guide;
  - Shipping & Returns.
- Items fade with stagger (M18a).

#### 6.0.8 Footer (Allbirds footer)
- `footer` `bg-black text-white px-5 py-[3.125rem] md:px-10 md:pt-20 md:pb-5`.
- **Top grid:** `mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2`.
  - **Left column:**
    - **Drop alerts** (replaces "Subscribe to our emails"):
      - label mono 12/16 tracking .1em UPPERCASE `mb-8` "GET DROP ALERTS";
      - form `relative max-w-[384px]` with a pill input `h-[42px] w-full rounded-full border
        border-black bg-white px-3 py-2.5 pr-20 text-base text-black` (placeholder "Email for
        [drop title]");
      - inside it, a `btn btn-primary font-bold text-black absolute top-1/2 right-1 -translate-y-1/2
        active:opacity-[.85]` "SIGN UP".
      - Function: Appendix A §6.0.6 (next upcoming release; hidden when none).
      - Success: Inter 12/16 "You're on the list for [drop]."
    - Under it, the **social row** (only when `NEXT_PUBLIC_TIKTOK_URL` is set):
      - heading mono 12/16 tracking .05em UPPERCASE "FOLLOW SHELBY" `mb-6`;
      - one 42px circle icon (`TiktokLogo` 24px): `rounded-full border border-white p-2`,
        `hover:bg-white hover:text-black` (M11).
  - **Right column:** `md:grid md:grid-cols-4`. Columns, each a mono 12/16 tracking .05em heading
    (`mb-8`, desktop only) over `ul grid gap-3` of links (Inter 12/16, `hover:underline`):

    | Column | Links |
    |---|---|
    | Help | Shipping & Returns, Fit Guide, Your Bag |
    | Shop | each shape, All Hats, The Two-Pack |
    | Drops | Live Now (when live), All Drops |
    | Shelby (spans 1, links in 1 column) | The Crush Test, Why The Everyday Cap, Fit Quiz |

  - **Mobile:** each column is an accordion: a full-width row with the mono heading and a `Plus`
    16px that rotates 45° when open (M19, rotation 0.3 power3.inOut). Panels animate max-height.
- **Bottom row:** `grid gap-2 text-xs max-md:grid-cols-2 md:flex md:justify-between md:gap-4`:
  - "© Shelby" (left);
  - Shipping & Returns, Fit Guide (`hover:underline`).

#### 6.0.9 Value tiles (Allbirds "SEO tiles", before every footer)
- `grid grid-cols-1 gap-2.5 p-2.5 md:min-h-60 md:grid-cols-3`.
- Each tile: `flex flex-col justify-center gap-5 rounded-2xl bg-white px-5 pt-10 pb-8
  md:justify-start md:p-8`, with a mono eyebrow (12/16 tracking .1em UPPERCASE) over Inter 14/21.
- Shelby tiles (true facts only):
  1. **ONE SIZE, ADJUSTABLE**: "The strap fits 21.5–23.75 in (55–60 cm). Sized styles come in S/M
     and L/XL." (+ `link` "Fit guide").
  2. **ALWAYS IN STOCK**: "The Everyday Cap never runs out. We show the live count for every
     color." (count from stock; the tile hides the count while loading).
  3. **30-DAY RETURNS**: from `POLICY.returns` + `POLICY.dispatch`.
- Reveal M1, children stagger 0.05 (M7 timing).

### 6.1 Home `/` (Appendix A §6.1 order, Allbirds patterns)

| # | Shelby section | Allbirds pattern |
|---|---|---|
| 1 | Hero | Full-bleed rounded hero, bottom-right copy |
| 2 | Browse By Style | Category row with the pill morph |
| 3 | Drop banner | Brand pill (orbiting dots, marquee) |
| 4 | Find Your Fit | Material ring |
| 5 | Shop By Color | 3x promo tiles (4-up here) |
| 6 | In Stock Today | Standard carousel header (mono tab + arrows) over value tiles |
| 7 | From The Crush Test | Stories carousel |
| 8 | About Shelby | Expanding pill window |
| 9 | Stories | "From the newsroom" grid |
| — | Value tiles, footer | §6.0.9, §6.0.8 |

**6.1.1 Hero** (`#hero`)
- **Box:** `relative m-2.5 overflow-hidden rounded-[20px] text-white`, height
  `calc(100vh - var(--hero-header-offset-desktop-lg) - var(--global-banner-height))` (784 at 900 tall)
  / `calc(100vh - var(--hero-header-offset-mobile-lg) - var(--global-banner-height))` (486 at
  664). Use `svh` units on mobile.
- **Image:** `/hats/lifestyle-hero.jpg` (desktop, `object-cover object-center`, `preload`) /
  `/hats/lifestyle-hero-mobile.jpg` (mobile, `object-cover`, `object-position: 50% 30%`).
- **Veil:** the banner veil (§2.1) at the bottom 60%. If WCAG contrast of the white text over Shelby's
  photo at the copy's position is below 4.5:1, raise its first stop to `rgba(0,0,0,.35)`.
- **Copy block:** `pointer-events-none absolute inset-0 flex flex-col p-8 pt-20 md:p-16 justify-end
  items-start text-left md:items-end md:text-right`.
  1. Eyebrow: mono 12/20 500 tracking .1em UPPERCASE `mb-4` "THE CORE · ALWAYS IN STOCK" (plus " ·
     [Drop] IS LIVE" when live).
  2. `<h1>` display 24/32 400 tracking .025em `mb-2` "One cap. Every color. Always in stock."
  3. Product line (Shelby rule: product and price in the first screen): Inter 14/20 `mb-6` "The
     Everyday Cap · $38 · 4 colors" (live price).
  4. Buttons `pointer-events-auto grid gap-2 grid-cols-2` (one column when there is no live drop):
     `btn btn-primary` "SHOP NOW" (`hero_shop_core`) and `btn btn-primary` "SHOP THE DROP"
     (`hero_shop_drop`).
- **Motion:** M3 (container and copy block start at `opacity-0`).

**6.1.2 Browse By Style** (`#shapes`, Allbirds category row)
- **Wrapper:** `relative overflow-hidden p-2.5`, reveal M2.
- **Desktop:** `flex gap-2.5`, one `li` per shape (up to 4; 348×451 at 1440):
  - `relative aspect-[0.77] overflow-hidden rounded-[20px]`, background = the shape's tile tone
    (§2.1: Caps slate, Truckers umber, Beanies rose, Bucket Hats sage).
  - **Base image:** the shape's lead photo (`-1`), `absolute inset-x-[10%] top-[18%] w-[80%]
    aspect-square object-contain cutout`.
  - **Hover image** (`.tile-hover-image`): the same product's `-3` angle, same box, opacity 0 (M5a).
  - **Veil** `absolute inset-0 z-10 bg-[rgba(0,0,0,.15)]`.
  - **Centre stack** `absolute inset-0 z-20 m-auto h-fit w-fit flex flex-col items-center gap-2`,
    translateY(30%) at rest (M5c):
    - the title as `h2.btn.btn-outline-white pointer-events-none` (shape name);
    - then the CTA group (opacity 0, M5d): `btn btn-outline-white w-full` "SHOP [SHAPE]" →
      `/shop?shape=` (`shape_tile`), and for Caps a second "SHOP THE EVERYDAY CAP"
      (`core_product`).
  - Hover morph M5–M5d via `useHoverIntent` (`data-hover`).
  - Initial title stagger M4.
- **Mobile:** a horizontal scroll-snap carousel, `slidesPerView 1.4`, centred, gap 10px. The centred
  slide plays the hover state (M5–M5d); others reverse. Same tiles.

**6.1.3 Drop banner** (`#drop`, Allbirds brand pill)
- **Container:** `relative mx-2.5 my-10 overflow-hidden rounded-xl md:rounded-3xl text-white
  text-center aspect-[0.63] md:aspect-[2.56]`.
  - Background: the release's lifestyle image (`/hats/lifestyle-corduroy.jpg` for the corduroy drop,
    else `hero_image`), `object-cover`, plus `bg-black/25`.
- **Pill SVG:** `absolute top-6 inset-x-0 m-auto h-fit w-full px-8 md:inset-0 md:m-auto
  md:w-[calc(25%+5.3rem)]`, `md:rotate-90`, `viewBox="-5 -5 255 382"`.
  - Outer motion path: `M 122.5 0.669 L 122.5 0.669 C 190.747 0.669 244.331 54.253 244.331 122.5 L
    244.331 249.331 C 244.331 317.578 190.747 371.162 122.5 371.162 C 54.253 371.162 0.669 317.578
    0.669 249.331 L 0.669 122.5 C 0.669 54.253 54.253 0.669 122.5 0.669`, stroke white 0.662.
  - Two rounded rects:
    - 219.663×346.663 rx 109.831, white stroke 0.662;
    - 195.663×322.663 rx 97.831, fill `#212121` at .1 opacity plus white stroke 0.662.
    - Both use `transform="rotate(-180 …)"` exactly as Allbirds draws them.
  - Three dots `r=2.5` white at (1,198), (1,186), (1,174) that travel the outer path (M27a):
    - desktop: from their start to evenly spaced resting points over **4s power3.out**, once;
    - mobile: loop the full path, **15s linear**, infinite.
- **Content:** `relative z-10 m-auto flex flex-col gap-3 max-md:px-20 max-md:pt-[25%] md:absolute
  md:inset-0 md:h-fit`, starts opacity 0 / translateY 16px (M27):
  - eyebrow mono 12/20 tracking .1em: "LIMITED RELEASE · LIVE NOW", or "NEXT DROP · [date]";
  - display 20/28 (lg 24/32, 2xl 30/36) tracking .025em: the release title;
  - Inter 12/16 (lg 14/20, 2xl 16/24): the promise;
  - `btn btn-primary mx-auto my-2 w-fit` "SHOP THE DROP" (`hero_shop_drop`) / "GET NOTIFIED"
    (→ `#notify`).
- **Marquee strip:** `relative mt-auto mb-9 overflow-hidden`, a row of mono 12/20 tracking .1em
  callouts separated by 6px white dots, duplicated once, `animate-marquee` (M27b).
  - Strings, true facts: the release's tier ("LIGHT RELEASE"/"MAJOR RELEASE"), "LIMITED RUN",
    "RESTOCKED ONLY IF IT SELLS THROUGH", the release date, the price.
- Hidden when there are no live or upcoming releases.

**6.1.4 Find Your Fit** (`#fit`, Allbirds material ring)
- **Container:** `relative mx-2.5 my-10 h-[175vw] max-h-[98vh] overflow-hidden rounded-xl
  md:h-[56.25vw] md:max-h-[90vh] md:rounded-3xl`.
  - Image `/hats/lifestyle-hero.jpg` (`object-cover`), `bg-black/30` on top.
- **Ring:** `absolute m-auto h-fit w-full max-md:top-[10%] md:inset-0 md:w-[50%] md:max-w-[65vh]`,
  an SVG `viewBox="0 0 200 200"`:
  - circle-1 r 70 fill `#212121` fill-opacity .1;
  - circle-2 r 80 stroke white .6 stroke-opacity .7;
  - circle-3 r 90 stroke white .6 stroke-opacity .4;
  - the motion path `M 100,10 a 90,90 0 1,0 0.01,0` (desktop only, no stroke);
  - 4 dots `r` 0 → 1.5 white (desktop only).
- **Centre content** (replaces Allbirds' floating product image, M26d): display 24/32 white "Find
  your fit", Inter 14/20 white "Four questions. One hat, a color that's in stock and, for sized hats,
  a size.", then `btn btn-primary` "TAKE THE QUIZ" (`home_quiz`) → `/quiz`. Max-width 60% of the
  ring.
- **Callouts** (desktop; `w-55` = 220px, `absolute`):
  - positions: `top-[28.5%] -left-55 text-right`, `top-[68.5%] -left-55 text-right`,
    `top-[28.5%] -right-55 text-left`, `top-[68.5%] -right-55 text-left`;
  - each a mono 12/20 tracking .1em title over Inter 14/20 white;
  - they describe the 4 quiz questions, which is true: "WHAT IT'S FOR" / "Everyday, training, sun or
    cold."; "HOW CAPS FIT YOU" / "Tight, loose or just right."; "CROWN HEIGHT" / "Low and close, or
    some structure."; "YOUR COLORS" / "Dark, light or earthy.".
  - Mobile: the four callouts stack under the ring as 2×2 white text blocks (no dots).
- **Motion:** M26–M26d.

**6.1.5 Shop By Color** (`#colors`, Allbirds 3x promo tiles)
- `grid gap-8 px-2.5 md:grid-cols-4 md:gap-2.5`, reveal M1, then M7.
  - Mobile: a scroll-snap carousel, slides 80% wide, gap 10px.
- **Tile:** `group relative aspect-[7/10] w-full overflow-hidden rounded-3xl`, background = the
  colour's swatch hex (§2.1).
  - Image: the colour's `-1` photo `absolute inset-x-[8%] top-[20%] w-[84%] object-contain cutout`,
    `transition duration-900 ease-in-out group-hover:scale-[1.08]` (M6).
  - Veil `absolute inset-0 bg-radial-blur` (M7).
  - Centred title: serif-role display **40/60** (30/45 mobile) in white (`#212121` on Bone and
    Cream), `select-none`, e.g. "Washed Black".
  - Bottom buttons: `absolute inset-x-2.5 bottom-2.5 md:inset-x-5 md:bottom-5 flex gap-2.5`, one
    `btn btn-outline-white w-full` (`btn-outline-black` on light tiles) "SHOP [COLOR]" →
    `/products/everyday-cap?color=` (`shop_by_color`).

**6.1.6 In Stock Today** (`#stock`)
- Header row (Allbirds' carousel header): `flex items-center justify-between px-5`:
  - a `tab-title` "IN STOCK TODAY" (selected, 2px underline);
  - Inter 12/16 `#575757` "Live sellable stock. Updated every visit." on the right (`md:block
    hidden`).
- Then `grid grid-cols-2 gap-2.5 p-2.5 md:grid-cols-4`. Each cell is a value tile (§6.0.9 box):
  - a 36px swatch (§6.4.6);
  - the colour as mono eyebrow;
  - the count line Inter 14/21: `●` green `#10714e` "220 in stock"; red `#9c0f0f` "Only 3 left"
    when ≤5; `#575757` "Restocking".
  - Links to `?color=` (`core_product`).
- Skeleton: 14px `bg-natural-white` bars with `animate-pulse` (M30).

**6.1.7 From The Crush Test** (`#series`, Allbirds stories carousel)
- Header `flex items-center justify-between px-5 md:px-10 mb-5`:
  - mono 16/26 tracking .05em UPPERCASE "FROM THE CRUSH TEST";
  - two `btn btn-icon-black size-8` arrows (`ArrowLeft` / `ArrowRight` 16px, desktop only).
- Track: scroll-snap, padding-left 10px, gap 10px. Slide width: 1.3 / 2.6 / 3.6 per view at
  0 / 768 / 1024.
- **Card:** an `<a>`:
  - image `aspect-[4/5] w-full rounded-2xl bg-white object-cover overflow-hidden` (episodes 1 and 3:
    `story-crush.jpg`; 2 and 4: core photos `object-contain` on white);
  - `mt-3` mono 12/16 tracking .1em "EPISODE N · TIKTOK";
  - Inter 14/20 500 UPPERCASE tracking .05em: the title;
  - Inter 12/16 neutral-800: the subject (3 lines).
  - Captions rise in on reveal (M29).
- Under it, centred: `btn btn-outline-black` "SEE THE FULL TEST" (`series_story`).
- Shown only with an active series.

**6.1.8 About Shelby** (`#about`, Allbirds expanding pill)
- `relative mx-2.5 my-10 flex justify-center rounded-xl pt-20 pb-6 md:rounded-3xl md:pt-22`.
- **Pill borders** (centred, absolute): two `rounded-full border-[1.4px] border-[#21212180]`.
  - Outer: `h-[102vw] w-[67vw] md:h-[43vw] md:w-[68vw] 2xl:h-[40vw] 2xl:w-[65vw]`.
  - Inner: `h-[98vw] w-[63vw] md:h-[40vw] md:w-[65vw] 2xl:h-[37vw] 2xl:w-[62vw]`.
- **Pill:** `relative mx-auto flex h-[94vw] w-[59vw] md:h-[37vw] md:w-[62vw] 2xl:h-[34vw]
  2xl:w-[59vw] flex-col items-center justify-center gap-4 overflow-hidden rounded-full`.
  - Image `/hats/lifestyle-bucket.jpg` `absolute inset-0 -z-10 size-full object-cover rounded-full`
    plus `bg-black/30`.
  - Quote paragraph: serif-role display 14/20 · md 18/32 · lg 24/40, white, `max-w-[85%]
    md:max-w-[80%]`, centred. v4's About text: "We make one cap we never let run out, and a few small
    drops a year. We show you the stock count, and we fold every cap into a back pocket before we
    sign it off."
- Under the pill (`mt-10`, centred): `btn btn-secondary` "WHY THE EVERYDAY CAP" (`home_reasons`) →
  `/reasons/everyday-cap`.
- **Motion:** M28–M28d (the window opens from the centre, then the borders grow, then the quote
  fades in).

**6.1.9 Stories** (`#stories`, Allbirds "From the newsroom")
- `px-5 py-10`.
  - `h2` display 30/36 (24/32) centred "Stories", `mb-10`.
  - Grid `grid gap-8 md:grid-cols-4 md:gap-5 max-w-7xl mx-auto`. Shelby has 2 posts; they take
    columns 2–3 on desktop (`md:col-start-2`).
- **Post:** an `<a>`:
  - image `block aspect-[5/4] overflow-hidden` (Crush Test: `story-crush.jpg` cover; Fit Guide:
    `everyday-cap-black-3.jpg` contain on white);
  - `h3` Inter 20/28 (`lg:text-xl`, 18/28 mobile) `mt-6 mb-2`, padded `px-6`;
  - excerpt Inter 14/20 `#575757` `px-6`.
  - Tracking `home_story` / `fit_guide`.

### 6.2 Product card (`product-card.tsx`, Allbirds master product card)
- **Card:** `ab-qa-card group relative flex h-full flex-col rounded-2xl bg-white transition-all
  duration-300 ease-in-out max-sm:min-h-86` (M9).
- **Image box:** `relative z-10 aspect-square`, link `absolute inset-0 overflow-hidden
  rounded-t-2xl`.
  - First image: the selected colour's `-1` (`object-cover`; photos are square on white).
  - Second image: that colour's `-2`, `opacity-0`, shown on hover (M8). If the swatch row changes the
    colour, both images switch (Allbirds `setActiveColorway`).
- **Badge row:** `absolute top-2.5 inset-x-2.5 md:top-5 md:inset-x-5 z-20 flex justify-between`,
  `.badge`. Labels from Appendix A §6.2: CORE, LIMITED, NEW, LOW STOCK. Never "FINAL SALE".
- **Info:** `relative p-4` (16px), link `flex flex-col gap-1`:
  1. Title: Inter 12/16 / **md 14/20** 500 UPPERCASE tracking .05em, `md:truncate`.
  2. Colour: Inter 12/16 / md 14/20 tracking .05em, `min-h-[1.5em] truncate` (the selected colour).
  3. Price: Inter 12/16 500 tracking .05em (carousel cards: 14/20).
  4. Swatches `mt-2.5 flex items-center gap-1`:
     - 20px circles (`size-5 rounded-full`) with `inset-ring-1` `#575757b3`; selected adds
       `border-3 border-white` + the `0 0 0 1px #212121` ring (M13);
     - max 5, then "+N" Inter 14/14 500 underline.
     - Two-tone names render the split gradient.
- **Quick add (md+):** the Allbirds flip (M10, M10a), verbatim geometry.
  - The colour line and price `p` elements get `transform: perspective(600px) translateY(0)
    rotateX(0); transform-origin: 50% 0%`.
  - The quick-add row `.ab-qa-flip` is `absolute top-10 left-4 right-4 z-[2] h-[42px] flex
    items-center gap-1.5`, at rest `opacity:0; pointer-events:none; transform: perspective(600px)
    translateY(50%) rotateX(-90deg); transform-origin: 50% 100%`.
  - On `:hover` / `:focus-within`, they swap. Transitions `transform .35s ease-out, opacity .35s
    ease-out`, delay .25s on enter and .15s on leave. The row's pills enable pointer events after
    0.6s.
  - **One-size products:** a single `btn btn-secondary btn-small` "ADD TO BAG · $38" (`quick_add`).
  - **Sized products:** size pills `btn btn-outline-black btn-small` (S/M, L/XL; sold out: disabled
    + `.crossed-bg`), tap = add.
  - **Mobile:** the flip is replaced by Allbirds' mobile row `flex justify-between items-center
    mt-2`: Inter 12/16 `#575757` "One size" / "2 sizes", and a `Handbag` 16px + "ADD" Inter 12/16
    500 UPPERCASE button. It opens the quick-add sheet (M23) for sized hats and adds directly for
    one-size.
- Tracking and data: Appendix A §6.2.

### 6.3 Collection `/shop` (Allbirds collection)
1. **Banner:** `relative m-2.5 overflow-hidden rounded-2xl aspect-square md:aspect-[3/1]
   lg:aspect-[4/1]`, the image, then the banner veil (§2.1).
   - Images by shape: Caps / All → `lifestyle-hero.jpg`; Bucket Hats → `lifestyle-bucket.jpg`;
     Beanies and Truckers → `lifestyle-corduroy.jpg`.
   - Inside `flex flex-col absolute inset-0`:
     - breadcrumb `px-2.5 pt-15 lg:pt-16 text-xs/4 text-white` "Home / [Shape]";
     - copy `flex flex-1 flex-col justify-end items-start p-6 md:-mt-6`: `h1` display 20/24 / md
       24/32 white `mb-2` (shape name, or "All Hats"), then the description Inter 14/20
       `text-natural-white md:max-w-1/2` (Appendix A §6.3 shape sentence) and the product count.
2. **Filter bar** (desktop): `relative z-[60] mx-auto mb-4 hidden h-16 max-w-7xl items-center
   justify-between rounded-full bg-natural-white px-4 py-3 lg:flex`.
   - **Left:** the Filter button `flex items-center gap-2`:
     - a 34px circle `rounded-full border border-black p-1` with `SlidersHorizontal` 24px;
     - Inter 14/20 500 UPPERCASE tracking .025em gray-600 "Filter";
     - Inter 14/20 gray-600 "(N products)".
   - **Centre-right:** the **shape segmented control** `flex gap-1 rounded-full border border-black
     p-1`, one `btn` per shape link (All, Caps, Truckers, Beanies, Bucket Hats).
     - Active: `bg-black text-natural-white-60`.
     - Others: transparent `#212121`, hovering to `bg-black/10`.
     - `data-track="shape_pill"`.
   - **Right:** sort `select.btn.btn-outline-black h-[41px] min-w-fit appearance-none pr-10`, with a
     32px `CaretDown` at `absolute top-1 right-1`. Options: Featured, Price low–high, Price high–low,
     Newest.
   - **Mobile:** a row `flex gap-2.5 px-2.5 mb-2.5`:
     - "FILTER AND SORT" `btn btn-outline-black` with `SlidersHorizontal` 16px + a 20px circled
       `CaretDown` (left, flex-1);
     - the segmented control (right; scrolls horizontally when it doesn't fit).
3. **Filter panel:** desktop is a dropdown under the bar (`absolute top-[72px] left-0 w-[560px]
   rounded-2xl bg-white p-6 shadow-lg z-50`, M23 in); mobile is a bottom sheet (`rounded-t-2xl
   bg-white p-5`, M23).
   - **COLOR:** 24px swatch circles with labels, checkboxes (`.checkbox`, M14).
   - **SIZE:** in-stock sizes only (Appendix A §6.3), as `.btn-size` toggles.
   - Footer: `btn btn-outline-black` "CLEAR" + `btn btn-secondary` "SHOW N HATS".
4. **Grid:** `mx-auto max-w-7xl grid grid-flow-dense grid-cols-2 gap-2.5 px-2.5 md:grid-cols-4
   lg:px-0` of §6.2 cards (313px wide at 1440; 180px at 390).
   - Order: core first, then the live drop, then the rest.
   - Empty state: a value-tile box with Inter 20/28 "Nothing matches those filters right now." and
     `btn btn-secondary` "SHOP ALL HATS".
5. Value tiles, footer.

### 6.4 Product page `/products/[handle]` (Allbirds PDP)

**6.4.1 Layout:**
- Breadcrumb `nav.text-xs.text-light-charcoal mx-5 mb-2.5 max-lg:mt-10`: "Home / [Shape]" (links
  `hover:underline`).
- Then `relative md:mx-5 md:grid md:grid-cols-[1fr_45vw] md:items-start md:gap-5
  xl:grid-cols-[1fr_38vw] 2xl:grid-cols-[1fr_33vw]` (gallery 833px + buy card 547px at 1440).

**6.4.2 Gallery** (driven by the selected colour via `SelectionProvider`):
- **Desktop:** `grid grid-cols-1 gap-2 lg:grid-cols-2`. Each item is a `button.relative
  .overflow-hidden.rounded-lg.aspect-[7/4].w-full.bg-white` (opens the zoom dialog).
  - The image is `object-contain object-center rounded-lg cursor-zoom-in`.
  - The **first image spans both columns** (833×476).
- **Badge:** `absolute top-5 left-5 z-10 .badge bg-white` (CORE / LIMITED).
- **Mobile:** a full-bleed scroll-snap slider:
  - slides `rounded-2xl`, each a `bg-white aspect-square` button with `object-contain`;
  - under it, a 2px `bg-natural-white` track with a `#212121` thumb (width = 1/N) that follows the
    scroll position (Shelby-defined; Allbirds' mobile pagination was not captured).
- Changing colour fades the gallery (`opacity` 0 → 1, 0.2s sine.out, M24's CAROUSEL fade timing)
  and scrolls to the first image.

**6.4.3 Buy card** (`aside`):
- `grid grid-cols-1 gap-10 rounded-xl bg-white p-5 max-md:mx-2.5 md:sticky md:top-[120px]
  md:gap-6 md:p-5 lg:p-6 xl:p-8 md:self-start md:shadow-sm`, reveal M1.
- In order:
  1. `h1` serif-role display 24/32 / **md 30/36** 400 (product title).
  2. Sub-line in mono 12/16 / md 14/20 tracking .05em UPPERCASE `#575757`, e.g. "CAPS · ONE
     SIZE" or "CAPS · SIZED". For the Everyday Cap add "· ALSO IN A [link]TWO-PACK[/link]"
     (`pdp_offer`).
  3. **Price row** `flex items-center gap-2`:
     - price Inter 18/28 500 tracking .05em `#212121`;
     - the price pill (`rounded-full bg-natural-white px-2 py-1` Inter 12/16 500 italic UPPERCASE
       tracking .05em): "+ 30-DAY RETURNS" (true, from `POLICY.returns`). Drops show "LIMITED RUN"
       instead.
  4. **Make It Two** (Appendix A §6.4.9, Everyday Cap only): a `rounded-2xl
     bg-natural-white-25 p-3 flex items-center gap-3` row:
     - a 56px `rounded-lg bg-white` thumbnail;
     - Inter 12/16 500 UPPERCASE "THE TWO-PACK · $68" over 12/16 `#575757` "Any two colors. Save $8
       against two singles.";
     - `CaretRight` 16px. Links to the offer (`pdp_offer`).
  5. **Colour** `flex flex-col gap-3`:
     - label row `flex gap-2 text-xs/4 font-medium tracking-wider`: mono "COLOR:" + Inter colour
       name + Inter 400 Capitalize `#575757` "(Core)" / "(Limited edition)";
     - swatches `flex flex-wrap gap-1`:
       - each `button.relative.size-9.rounded-full` (36px) with a fill span `absolute inset-0
         rounded-full border-3 border-white inset-ring-1 inset-ring-light-charcoal-0.7`
         (background = swatch hex or the split gradient);
       - selected adds `shadow-[0_0_0_1px_#212121]`;
       - selecting writes `?color=` (Appendix A §6.4.7).
  6. **Size:**
     - **Sized:** header row `flex justify-between`: mono 12/16 500 UPPERCASE "SIZE" and `link`
       12/16 "Size chart" (opens the M22 dialog). Then `ul grid grid-cols-7 gap-2` of `.btn-size`
       (each ~62×42), S/M and L/XL in the first two cells.
       - Low stock shows a second line Inter 10/12 `#9c0f0f` "3 left".
       - Sold out: disabled + `.crossed-bg`.
     - **One-size:** no buttons. Inter 12/16 `#575757` "One size · fits 21.5–23.75 in (55–60 cm)."
       + `link` "Fit guide" (`fit_guide`).
  7. Fit note (Appendix A): Inter 12/16 `#575757` + `button.underline` "Fit guide".
  8. **Add to cart** `btn btn-secondary btn-atc` (49px):
     - "ADD TO BAG – $38" (the price is a separate span);
     - "SELECT A SIZE" disabled until a size is chosen (sized only);
     - "SOLD OUT" disabled when out.
     - Loading M31. `add_to_cart`. Every add opens the drawer (§6.7, M20).
  9. Under the CTA, centred Inter 12/16 `#212121`: `POLICY.shipping`. Then the stock line Inter
     12/16 with a 6px dot (green "In stock · ships in 1–2 business days" / red "Only 3 left in S/M"),
     then, for drops, `#575757` "Limited run. Restocked only if it sells through."
  10. Fit quiz link: `link` 12/16 "Not sure? Take the 30-second fit quiz" (`pdp_quiz`).
  11. **Fit profile** (with `metadata.fit_profile`): two rows, each a mono 12/16 UPPERCASE label +
      value. The scale is 3 segments `flex gap-1`: each `h-[7px] flex-1 rounded-[4px]
      bg-natural-white`, the active one `bg-black` (the Allbirds progress-bar look). Labels under it
      Inter 10/12 `#575757`.

**6.4.4 Sticky buy bar** (Allbirds):
- `fixed bottom-0 inset-x-0 z-[70] rounded-t-md bg-white px-7 py-5`.
  - Hidden (`opacity-0 pointer-events-none`) until the main CTA leaves the viewport (M33).
- Content:
  - centred `flex gap-2` Inter 14/20: title + price;
  - `mt-3` the same CTA as §6.4.3 item 8 (`sticky_add_to_cart`); for sized products with no size
    chosen, it scrolls to the size grid.
- Desktop and mobile both.

**6.4.5 Details band** (Allbirds "product details"):
- `m-2.5 my-10 min-h-[166px] rounded-xl bg-white p-5 md:rounded-3xl md:p-6`, reveal M1 (trigger
  `top bottom+=100px`).
- `grid gap-5 md:grid-cols-2`:
  - left: an image `aspect-[3/2] rounded-xl md:rounded-3xl object-cover` (the product's lifestyle
    photo per Appendix A §6.4.16's map, else the colour's `-3` `object-contain` on
    `bg-natural-white-25`);
  - right: three blocks, each an `h3` Inter 12/16 / md 14/16 500 UPPERCASE + `p` Inter 14/22
    tracking .025em `#52525b`, `gap-8`:
    - **THE DETAILS**: description;
    - **SPECS**: `metadata.details` as "Crown: …" lines;
    - **CARE & RETURNS**: the Care line + `POLICY.returns`.

**6.4.6 Swatch** (shared component; used in §6.1.6 and §6.4.3).

**6.4.7 Material ring** (Allbirds tech band; products with ≥4 `metadata.details` lines):
- §6.1.4's container and ring.
  - Background image map: everyday-cap → `story-crush.jpg`; corduroy-cap → `lifestyle-corduroy.jpg`;
    bucket-hat → `lifestyle-bucket.jpg`; others → `lifestyle-hero.jpg`.
  - Centre: the colour's `-1` photo inside a `rounded-full bg-white` circle (45% of the ring),
    `shadow-[0_.85rem_1rem_rgba(0,0,0,0.25)]`, M26d.
  - Callouts: the first four detail lines (title = key, e.g. "CROWN"; body = value).
- Motion M26–M26d.

**6.4.8 You May Also Like** (Allbirds recommendations carousel):
- Header `flex justify-between px-5`: `tab-title` "YOU MAY ALSO LIKE" + two `btn-icon-black size-10`
  arrows.
- Then the §6.1.7 track with §6.2 cards (`pdp_also_like`). Fades in (`opacity 0 → 1, .5s`).

**6.4.9 Previously Viewed:** the same carousel, `tab-title` "PREVIOUSLY VIEWED", hidden when empty.

**6.4.10 Brand pill** (Allbirds brand message; shown with an active content series):
- §6.1.3's pill with the series stance as the heading and `btn btn-primary` "SEE THE FULL TEST"
  (`series_story`).
- Marquee strings: the episode titles.

**6.4.11 Size chart dialog** (M22):
- `fixed inset-0 z-[90]` overlay `bg-black/50`.
- Dialog `rounded-2xl bg-white p-6 max-w-[560px] w-[calc(100%-20px)]`.
- Table: Inter 14/20; head mono 12/16 UPPERCASE; rows `border-t border-natural-white` 44px.
- Close `btn-icon-black size-8`.

Then value tiles, footer.

### 6.5 Fit guide `/fit-guide`
1. Banner (§6.3 banner): H1 "How it fits", description = Appendix A §6.5 statement.
2. **How to measure + size table:** a white `rounded-3xl p-6 md:p-10 mx-2.5`, `grid md:grid-cols-2
   gap-10`.
   - Left: mono "HOW TO MEASURE" + 3 numbered steps. The number is mono 12/16 in a 28px
     `rounded-full bg-natural-white` circle; the text is Inter 14/22 `#52525b`.
   - Right: mono "SIZES" + the table (§6.4.11 style).
3. **By style:** for each product with `fit_profile`, a §6.4.5 details-band layout:
   - image (the `-3` side photo on `bg-natural-white-25`, `object-contain`);
   - name (display 24/32), shape (mono sub-line), fit note, the two scales (§6.4.3 item 11), the
     size line;
   - `btn btn-secondary` "SHOP THE [NAME]" (`fit_guide_shop`).
   - Anchor `#<handle>`.
4. **Quiz band:** §6.1.4 material ring (`fit_guide_quiz`).
5. Value tiles, footer.

### 6.6 Drops `/drops` and `/drops/[handle]`
- **`/drops`:**
  - banner (§6.3 style) "Drops" / "Small releases, on a calendar. The core never leaves.";
  - then `tab-title` tabs `role=tablist`: "LIVE & UPCOMING" / "PAST" (M15).
  - **Live & upcoming:** §6.1.5 promo tiles (`grid md:grid-cols-3 gap-2.5 px-2.5`), one per
    release, with the release `hero_image` (cover).
    - Title: serif-role display 40/60.
    - Under it, mono 12/20 tracking .1em white: "LIVE NOW" or the date.
    - For upcoming releases, the **countdown** (Appendix A §6.6.1) centred under the date: digits
      display 40/48 `tabular-nums` white separated by " : ", unit labels mono 10/12 tracking .1em
      UPPERCASE white/80 ("DAYS HRS MIN SEC").
    - Bottom buttons: `btn-outline-white` "SHOP THE DROP" (live) / "GET NOTIFIED" (upcoming, opens
      the notify form inline in the tile: the §6.0.8 pill input).
    - Image zoom M6.
  - **Past:** a §6.3 grid of white `rounded-2xl` cards, each a release image `aspect-square
    object-cover rounded-t-2xl` + `p-4` title (card title style) + mono date + "ENDED" `.badge`.
- **`/drops/[handle]`:**
  - hero (§6.1.1 box) with the release image: eyebrow = phase, H1 = title, product line = promise,
    buttons = SHOP / GET NOTIFIED (`drop_hero`);
  - then a white `rounded-3xl mx-2.5 my-10 p-6 md:p-10` article (`max-w-[65ch]` centred): story
    (Inter 16/26 `#52525b`), "What to look for" (mono heading + proof);
  - then by phase:
    - upcoming → the countdown in a value tile + the notify pill form;
    - live → the §6.4.8 carousel of its products;
    - past → "This drop has ended." + products still on sale.
  - `drop_viewed`.

### 6.7 Cart drawer and `/cart` (Allbirds cart drawer)
- **Overlay:** `fixed inset-0 z-[90] bg-black/50` (M20).
- **Panel:** `fixed top-0 right-0 z-[90] flex h-full w-full max-w-[531px] flex-col overflow-y-auto
  bg-white shadow-xl`, translateX(100%) at rest (M20a/b).
- **Header row** `relative flex h-11 items-center px-5`:
  - `h2` Inter 12/16 500 UPPERCASE "BAG (N)" (left);
  - centred `p.m-auto` Inter 12/16 `#575757` `POLICY.announcement` ("Standard shipping $6 · 30-day
    returns");
  - close `button` 32px `X` (right).
  - No progress bar.
- **Lines:** `px-5 py-4 flex gap-3 border-b border-natural-white-60`:
  - image `size-[85px] aspect-square rounded-[20px] object-contain bg-natural-white-25` (the
    line's colour photo);
  - text column: title (Inter 12/16 500 UPPERCASE tracking .05em, link), variant ("Navy / One Size",
    Inter 12/16 `#575757` truncate), then a row with the quantity stepper (`rounded-full border
    border-stroke h-8`, `−`/`+` 32px, Inter 12/16 500 count) and the price (Inter 12/16 500, right);
  - remove = `link` 12/16 "Remove".
- **Make It Two** (Appendix A §6.7): the §6.4.3 item 4 row, `mx-5 mt-4` (`cart_offer`).
- **Complete the look** (Appendix A §6.7): mono 12/16 tracking .1em "COMPLETE THE LOOK" `px-5 mt-6
  mb-3`, then a horizontal scroll-snap row (2.4 per view, gap 10, offset 20):
  - mini cards `rounded-2xl bg-natural-white-25 p-3`: 1:1 image, title 12/16 500 UPPERCASE, price
    12/16;
  - `btn btn-secondary btn-small w-full` "ADD · $34" for one-size, or `btn-outline-black btn-small`
    "CHOOSE SIZE" (`cart_complete_look`).
- **Footer** (sticky at the bottom of the panel, `border-t border-natural-white-60 p-5 bg-white`):
  - subtotal row Inter 14/20 500 ("Subtotal" / amount);
  - Inter 12/16 `#575757` "Shipping is chosen at checkout.";
  - `btn btn-secondary btn-atc` "CHECKOUT" (`cart_checkout`);
  - Inter 12/16 centred "Guest checkout. No account needed."
- **Empty:** `p.mb-10.px-5.text-center.text-xl` (20/28) "Your bag is empty.", then `ul flex flex-col
  items-center gap-y-5 px-10` of `btn btn-secondary w-full`: "SHOP THE EVERYDAY CAP", "SHOP CAPS",
  "SHOP TRUCKERS", "SHOP BEANIES".
- **`/cart` page:** the same pieces in a `max-w-[960px] mx-auto px-2.5` page, the lines in a white
  `rounded-2xl` card and the summary in a second card (`md:grid md:grid-cols-[1fr_360px] gap-2.5`).

### 6.8 Checkout `/checkout` and order `/order/[id]`
- Page `bg-natural-white-60`, `max-w-[1100px] mx-auto px-2.5 pt-[76px] md:pt-[108px]`, `md:grid
  md:grid-cols-[1fr_400px] gap-2.5`.
- **Left:** three numbered sections (Appendix A §6.8 logic), each a white `rounded-2xl p-6`:
  - heading mono 12/16 tracking .1em "1 · CONTACT", "2 · DELIVERY", "3 · PAYMENT";
  - a locked section shows a one-line summary + `link` "Edit".
  - **Inputs:** Allbirds' pill input (`h-[42px] rounded-full border border-black bg-white px-4
    text-base`).
  - Labels Inter 12/16 500 UPPERCASE tracking .05em `mb-1.5`.
  - Errors Inter 12/16 `#9c0f0f`.
  - **Shipping options:** radio rows `rounded-xl border border-stroke p-4`; selected `border-black`;
    with `.checkbox`-style radios.
  - **Stripe Payment Element** appearance:
    - `theme: "stripe"`;
    - variables `colorPrimary #212121`, `colorBackground #ffffff`, `colorText #212121`, `colorDanger
      #9c0f0f`, `fontFamily` Inter, `borderRadius "12px"`, `spacingUnit "4px"`.
  - "PLACE ORDER" `btn btn-secondary btn-atc` (`place_order`).
- **Right:** a white `rounded-2xl p-6 md:sticky md:top-[120px]` summary (drawer line style, totals
  Inter 14/20).
- **Order page:** white `rounded-3xl p-6 md:p-10`:
  - mono "ORDER CONFIRMED", display 30/36 "Thanks, [first name]." (`checkout_complete`);
  - the lines;
  - `btn btn-secondary` "KEEP SHOPPING".

### 6.9 Story pages `/stories/[handle]` (Allbirds "Our story")
Modules in Appendix A §6.9 / §12.5 order, each in an Allbirds pattern:
1. **Hero** (§6.1.1 box, `story-crush.jpg`): mono eyebrow "THE CRUSH TEST", H1 = the headline (the
   `story-headline` experiment chooses the question or the stance; keep `Exposure`), product line
   "You just watched: [episode]" when continuity applies.
2. **Problem:** a split block `flex flex-col md:flex-row gap-0 mx-2.5 my-10`:
   - image `aspect-[10/7] rounded-xl object-cover md:min-w-[55vw]` (`lifestyle-hero.jpg`);
   - text block `flex flex-col items-center justify-center gap-6 rounded-xl px-5 py-6 md:px-10
     text-center`: `h2` display 24/32 Capitalize, `p` Inter 14/20, `link`.
3. **Stance:** the §6.1.8 expanding pill with the stance as the quote (M28).
4. **Proof:** the §6.1.7 stories carousel of episodes (`story_see_proof`, `story_episode`).
5. **Offer:** the §6.4.3 buy card centred (`max-w-[547px] mx-auto`), with its own colour state and
   live stock (`story_shop`).
6. **Your turn:** a value tile, `bg-black text-white`: mono "YOUR TURN" + the participation prompt
   (Inter 16/24).
7. **Close:** the §6.1.3 brand pill with `btn btn-primary` "GET THE EVERYDAY CAP"
   (`story_close_cta`).

### 6.10 Offer `/offer/everyday-two-pack` (Appendix A §12.1)
- The PDP layout (§6.4.1–6.4.4):
  - **Gallery:** the two chosen colours' `-1` photos side by side in the first spanning `aspect-[7/4]`
    tile (each half `object-contain`), then each colour's `-2`/`-3`.
  - **Buy card:**
    - title "The Everyday Cap Two-Pack";
    - mono sub-line "THE TWO-PACK · CORE";
    - price row: "$68" + `line-through opacity-65` "$76" (live anchor) + pill "SAVE $8";
    - **two colour pickers** ("FIRST CAP:", "SECOND CAP:", §6.4.3 item 5 style);
    - a live kit stock line, the CTA "ADD THE PAIR – $68" (`offer_add`), the policy lines.
  - The `offer-headline` experiment swaps the H1 (control "Two Everyday Caps. $68." / variant "Save $8
    on two Everyday Caps."); keep `Exposure`.
- **Then:**
  - §6.0.9-style tiles "WHAT'S INCLUDED" / "WHY TWO" / "THE FIT";
  - proof tiles (live core stock, the crush-test stance → link);
  - **FAQ:** a white `rounded-3xl p-6` list of rows `border-b border-natural-white-60 py-5`,
    question Inter 14/20 500 UPPERCASE + `Plus` 16px rotating 45° (M19), answer Inter 14/22
    `#52525b`;
  - the closing brand pill (`offer_close`);
  - sticky bar (§6.4.4).

### 6.11 Listicle `/reasons/everyday-cap` (Appendix A §12.2)
- **Hero:** §6.1.1 box. Eyebrow "6 REASONS · THE EVERYDAY CAP", H1 = headline, product line =
  subhead.
- **Jump list:** `flex flex-wrap gap-2 px-2.5 my-10 justify-center`, `btn btn-outline-black
  btn-small` pills "01 BROKEN IN", … (anchors).
- **Reasons:** each a §6.9 item 2 split block, alternating image left/right (`md:flex-row-reverse` on
  even).
  - The number is mono 12/16 tracking .1em in a `.badge` above the heading.
  - The fact line is Inter 12/16 `#575757`. Live data (stock counts, scales) renders inside the text
    block.
- **CTAs** after reasons 3 and 6: a centred `btn btn-secondary` (`listicle_cta_3` / `_6`).
- **Buy block:** the §6.4.3 buy card centred + a `link` to the two-pack.
- **Sticky bar:** §6.4.4.

### 6.12 Advertorial `/read/one-cap` (Appendix A §12.3)
- `pt-[76px] md:pt-[108px]`.
- **Label pill** at the top, centred: `.badge` "ADVERTISEMENT · FROM SHELBY" (mono, `bg-natural-white`).
- **Article** in a white `rounded-3xl mx-2.5 px-5 py-10 md:px-10` sheet, column `max-w-[65ch]
  mx-auto`:
  - kicker mono 12/16 tracking .1em "FIELD NOTES";
  - `h1` serif-role display 30/36 (md 40/48);
  - dek Inter 18/28 `#52525b`;
  - byline mono 12/16 `#575757` "BY SHELBY · 3 MIN READ · [date]";
  - body Inter 16/26 `#52525b` with `.prose` spacing (p margin 1.25em); H2s display 24/32;
  - images `rounded-xl` with captions Inter 12/16 neutral-800 `mt-2`;
  - inline CTAs `link` Inter 16/26 500 (`advertorial_*`).
- **Offer card** at the end: §6.4.3 buy card + two-pack `link`. Then the disclosure line Inter 12/16
  `#575757` (Appendix A).
- No nav changes.

### 6.13 Quiz `/quiz` and result `/quiz/result` (Appendix A §12.4)
- **Quiz:**
  - page `pt-[76px] md:pt-[108px] px-2.5`;
  - a white `rounded-3xl mx-auto max-w-2xl p-6 md:p-10` card containing:
    - mono "FIT QUIZ · 30 SECONDS" and "1 OF 4" (right);
    - the **progress bar**: track `h-[7px] w-full rounded-[4px] bg-natural-white`, fill `bg-black`
      `origin-left`, scaleX = step/4 (M21);
    - `h1` display 24/32 / md 30/36 (the question);
    - option rows `flex flex-col gap-2.5`: each `button` 56px `rounded-xl border border-stroke
      bg-white px-5 text-left` Inter 14/20 500 UPPERCASE tracking .05em with `ArrowRight` 16px at
      right. Hover `bg-light-charcoal-0.3`; selected `bg-black text-white border-black` (M12
      timing).
    - "‹ Back" `link` 12/16.
  - Steps change with M23 (out 0.2 sine.in, in 0.4 sine.out).
  - Entry hero (before Q1): the §6.1.4 ring band with "Find your fit" and "START" (`quiz_start`).
- **Result:**
  - the §6.4 PDP layout for the match (gallery + buy card preselected with colour and size), with
    eyebrow mono "YOUR MATCH";
  - a "WHY IT FITS YOU" white `rounded-2xl p-6` card above the buy card's CTA (Phosphor
    `CheckCircle` 16px + Inter 14/22 lines);
  - the runner-up as a §6.2 card;
  - the two-pack row for the Everyday Cap;
  - `link` "Retake the quiz". Events per Appendix A.

### 6.14 Help pages
`/help/shipping-returns`: §6.12 article sheet (no ad label), heading "Shipping & returns", policy
copy.

---

## 7. Assets

### 7.1 Product photos (`public/hats/`, unchanged)
- Square 1:1 on pure white:
  - `<slug>-1` (¾ front), `-2` (back; beanies/buckets: side), `-3` (side; beanies/buckets: top-down);
  - the black Everyday Cap adds `-4` top, `-5` underside, `-6` buckle.
- They render `object-contain` on white cards, or `object-contain cutout` on coloured tiles (multiply
  turns the white backdrop into the tile colour).

### 7.2 Lifestyle photos (unchanged)
`lifestyle-hero.jpg` (16:9), `lifestyle-hero-mobile.jpg` (4:5), `lifestyle-corduroy.jpg`,
`lifestyle-bucket.jpg`, `story-crush.jpg`.

### 7.3 Icons (Phosphor, `regular`)
`MagnifyingGlass`, `Handbag`, `Eye`, `List`, `X`, `CaretLeft`, `CaretRight`, `CaretDown`,
`CaretCircleRight`, `ArrowLeft`, `ArrowRight`, `Plus`, `Minus`, `SlidersHorizontal`, `Ruler`,
`PlayCircle`, `CheckCircle`, `CircleNotch`, `TiktokLogo`, `EnvelopeSimple`. Server Components import
from `@phosphor-icons/react/dist/ssr`.

### 7.4 Wordmark and favicon
Text wordmark §6.0.2. Favicon: a 32px `#212121` rounded square with a white lowercase "s" (display
600). Never Allbirds' artwork.

### 7.5 Missing image
`bg-natural-white-25 rounded-2xl` box, with the title in mono 12/16 `#575757`, centred.

## 8. Third-party integrations
Unchanged from v4: first-party analytics, Umami, Stripe, Medusa. **Not adopted from Allbirds:**
Yotpo, Attentive, Wunderkind, Gladly, OneTrust, Amplitude Experiment, Loop Returns, Shop Pay,
geofencing, the AI shopping assistant. Allbirds runs GSAP; Shelby does not (§2.4.4).

## 9. Build instructions
1. Replace `src/app/globals.css` with §3 and the fonts in `layout.tsx` with §4.
2. Add `src/lib/motion.ts` (`useInView`, `<Reveal>`, `usePathMotion`, `useHoverIntent`,
   `prefersReducedMotion()`).
3. Restyle components in place (keep file names and props):
   - `site-header` / `header` (§6.0.2–6.0.3), `announcement-bar` (§6.0.1);
   - `footer` (§6.0.8), new `value-tiles.tsx` (§6.0.9);
   - `product-card` + `quick-add` (§6.2), `pdp/*` (§6.4), `cart/*` (§6.7);
   - `home/*` (§6.1), `lp/*` (§6.9–6.13), `quiz/*` (§6.13), `offer/*` (§6.10).
   - New shared visual components: `ring-band.tsx` (M26), `brand-pill.tsx` (M27), `pill-window.tsx`
     (M28), `category-row.tsx` (M5), `promo-tiles.tsx` (M6/M7), `tab-title.tsx`.
4. Keep every `data-track`, `page_type`, `Track`, `Exposure`, experiment key and evidence rule
   (Appendix A §10, §12).
5. Verify:
   - `next build` + eslint;
   - Playwright at 390×664 and 1440×900 on every route;
   - sample computed styles against §2;
   - record each motion with `page.waitForTimeout` samples (hero at 0/300/900ms, drawer at
     150/500/1000ms, tile hover at 300/800ms) and confirm the curves;
   - run once with `reducedMotion: "reduce"` and confirm content is visible and static.
- **Known compatibility:** `clip-path: inset(... round 9999px)` transitions are supported in all
  current engines. `transform-box: fill-box` is required for SVG circle scaling. `svh` is needed on
  iOS for the hero height.

## 10. Landing pages, continuity and testing
Unchanged (Appendix A §10, §12): every page keeps `<ContinuityBanner />` (restyled §6.0.6). Every
tracked CTA label, both experiments (`story-headline`, `offer-headline`) and their 100-exposure
minimum stay.

## 11. Open questions (business decisions, not built)
Items 1–8 from v4 stand (Appendix A §11). Plus:

9. **Serif display role.** Allbirds' signature contrast comes from Self Modern (a serif) for
   product titles, tile titles and quotes. The skill's rule maps every paid display face to Plus
   Jakarta Sans, which v5 follows. If the serif look is wanted, swap `--font-serif` to a free serif
   (e.g. Instrument Serif or Fraunces via `next/font/google`); it is one variable.
10. **Free-shipping progress bar.** Allbirds' drawer bar ($100 threshold) is omitted because Shelby
    has flat $6 shipping; the component exists (quiz progress) if a threshold is adopted.

---

# Appendix A: v4 structure and functions (verbatim, binding for function; visuals superseded)

The text below is web/SITE_SPEC.md v4 §6–§12 exactly as committed in `02852f5`. Use it for page
inventory, section order, data, behaviour, copy, tracking, `page_type`, experiments and evidence
rules. Every visual value inside it (colours, fonts, px sizes, radii, heights, motion) is replaced by
v5 §2–§6.

Numbering: headings are prefixed `A.` (v4's §6.4.7 is A.6.4.7). References in the main body to
"Appendix A §6.4.7" and cross-references inside the appendix ("§6.4.7") both mean A.6.4.7. Where the
appendix mentions "Melin", read it as "the v4 reference"; it carries no visual authority in v5.

## A.6. Section-by-section spec

### A.6.0 Global chrome

#### A.6.0.1 Announcement bar (`announcement-bar.tsx`)

- `bg-primary text-white`, height **36px** (padding 8px 0, line 20px), full width. **Scrolls away**:
  it is not part of the sticky header.
- Text system 14.08px/21.12px, centred.
- **Messages (Shelby, true):** `POLICY.announcement` split into "Standard Shipping $6" and
  "30-Day Returns". When a drop is live, add "[Drop title] Is Live Now", linking to the drop
  (`announcement_drop`).
- They crossfade every 5s (§2.4), like Melin's rotating bar. With one message the bar is static.
  Pause on hover/focus. `aria-live="off"`.

#### A.6.0.2 Desktop header (`header.tsx`, lg+)

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

#### A.6.0.3 Mega menus (desktop)

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

#### A.6.0.4 Recently viewed (eye icon)

- `localStorage` key `shelby.viewed`: the last 12 product handles. Written on PDP view (try/catch;
  storage can be missing). The count badge shows how many entries there are.
- Click opens a **right drawer** with the same frame as the cart drawer (§6.7: 500px / full screen,
  `bg-white`).
  - Header row is 75px: "Previously Viewed" (heading 16px), "N Products" (body 13px `#736b67`),
    close ×.
  - Body is a 2-column grid of product cards (§6.2), with no quick add.
- Hidden when empty. `data-track="recently_viewed"`.

#### A.6.0.5 Search

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

#### A.6.0.6 Newsletter block ("Join The List"), before every footer

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

#### A.6.0.7 Mobile header (< lg)

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

#### A.6.0.8 Footer (`footer.tsx`)

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

### A.6.1 Home `/`

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

### A.6.2 Product card (`src/components/product-card.tsx`)

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

### A.6.3 Collection `/shop`

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

### A.6.4 Product page `/products/[handle]`

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

### A.6.5 Fit guide `/fit-guide`

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

### A.6.6 Drops `/drops` and `/drops/[handle]`

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

### A.6.7 Cart drawer and `/cart`

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

### A.6.8 Checkout `/checkout` and confirmation `/order/[id]`

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

### A.6.9 Story pages `/stories/[handle]`

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

## A.7. Assets

### A.7.1 Product photos (`public/hats/`)

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

### A.7.2 Lifestyle photos (unchanged)

`lifestyle-hero.jpg` (1376×768), `lifestyle-hero-mobile.jpg`, `lifestyle-corduroy.jpg`,
`lifestyle-bucket.jpg`, `story-crush.jpg` (928×1152). All `object-cover`.

### A.7.3 Icons (Phosphor, `regular` weight unless stated)

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

### A.7.4 Wordmark and favicon

The wordmark is text (§6.0.2), with no image. The favicon stays as is.

### A.7.5 Missing image

A `bg-tile` square with the product title in body 12px `#736b67`, centred.

## A.8. Third-party integrations

- **First-party analytics** (`src/lib/analytics.ts`, `/api/e`): events, funnels, experiments,
  `page_type` on every event.
- **Umami** when `NEXT_PUBLIC_UMAMI_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` are set.
- **Stripe** Payment Element (appearance in §6.8).
- Melin's ~40 script hosts are **not** adopted: reviews.io, Rebuy, Klaviyo, Postscript, Rivo,
  Intelligems, Global-e, Redo, Corso, AfterShip, Shop Pay / Afterpay, Forter, NoFraud, Sierra chat,
  GTM, Clarity, mParticle, Noibu, ad pixels, ShopMy, Fondue, EqualWeb, GovX. Their UI slots are
  handled in §1.2.

## A.9. Build instructions

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

## A.10. Landing pages, continuity and testing

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

## A.11. Open questions (business decisions, not built)

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

## A.12. Landing page types

Source: the user's essay outline ("From Customer Insight to Conversion") [ES]. The functions, data,
events and evidence rules below are unchanged from v3. Only the visual layer moves to Melin's
system. The traffic map, brief and compliance check live in `docs/landing-pages/`.

### A.12.0 Rules every landing page follows

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

### A.12.1 Offer landing page `/offer/[handle]` (first: `/offer/everyday-two-pack`)

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

### A.12.2 Listicle `/reasons/[handle]` (first: `/reasons/everyday-cap`)

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

### A.12.3 Advertorial / presell `/read/[slug]` (first: `/read/one-cap`)

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

### A.12.4 Quiz `/quiz` and result `/quiz/result`

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

### A.12.5 Story page `/stories/[handle]`

§6.9.

### A.12.6 Homepage and PDP entry points

- **Home:** quiz (§6.1.4), reasons (§6.1.8), story (§6.1.7, §6.1.9).
- **PDP:** quiz link (§6.4.12), Make It Two (§6.4.9).
- **Drawer:** the two-pack row (§6.7).

### A.12.7 Experiment

`offer-headline`:
- Seeded and running, 50/50 split, minimum sample 100 per variant.
- Primary metric `add_to_cart` with `page_type = offer`, then `order_completed`.
- Judge only after the minimum sample.
