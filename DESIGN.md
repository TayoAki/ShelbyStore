---
name: Shelby
description: One rope cap, sold in a white golf-retail storefront with a single green for buying.
colors:
  text: "#212121"
  text-strong: "#000000"
  text-light: "#646464"
  bg: "#ffffff"
  tile: "#f6f6f6"
  sand: "#eee9e3"
  bg-brighter: "#f2f2f2"
  surface-sticky: "#fcfcfc"
  border: "#f0f0f0"
  track: "#eeeeee"
  field-border: "#8c8c8c"
  green: "#207212"
  green-hover: "#1a5c0f"
  green-deep: "#0b3305"
  green-fade: "rgb(32 114 18 / 0.05)"
  ink: "#000000"
  tab-active: "#141414"
  charcoal-hover: "#3b3b3b"
  black-hover: "#1a1a1a"
  on-ink: "#f7f7f7"
  on-ink-hover: "rgb(247 247 247 / 0.7)"
  link-hover: "rgb(33 33 33 / 0.7)"
  underlay: "rgb(0 0 0 / 0.4)"
  error: "#721c24"
  error-bg: "#f8d7da"
  error-border: "#f5c6cb"
typography:
  display:
    fontFamily: "Monomakh, Times New Roman, serif"
    fontSize: "69px"
    fontWeight: 400
    lineHeight: 1.05
  display-hero:
    fontFamily: "Monomakh, Times New Roman, serif"
    fontSize: "38.4px"
    fontWeight: 400
    lineHeight: 1.2
  display-section:
    fontFamily: "Monomakh, Times New Roman, serif"
    fontSize: "38px"
    fontWeight: 400
    lineHeight: 1.05
  wordmark:
    fontFamily: "Monomakh, Times New Roman, serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  headline:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontSize: "38.4px"
    fontWeight: 500
    lineHeight: 1.2
  title-page:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
  title-product:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
  title-card:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontSize: "19.2px"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.37
  body-long:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "14.4px"
    fontWeight: 500
    lineHeight: "25px"
  price:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "24.75px"
    fontFeature: "tnum"
  meta:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "12.6px"
    fontWeight: 400
    lineHeight: "17.64px"
  label-nav:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.025em"
  label-table:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.14em"
rounded:
  sm: "3px"
  tab: "4px"
  bar: "10px"
  pill: "20px"
  round: "50%"
spacing:
  grid-gap: "4px"
  gutter-page-mobile: "16px"
  gutter-page: "50px"
  gutter-rail-mobile: "12px"
  header-mobile: "72px"
  header: "70px"
  announce: "36px"
  measure: "680px"
  drawer: "380px"
  flyout: "650px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-secondary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.charcoal-hover}"
  button-outline:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "44px"
  button-outline-white:
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "44px"
  button-add-to-bag:
    backgroundColor: "{colors.green}"
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "16px 0"
    height: "52px"
    width: "100%"
  tab:
    textColor: "{colors.text}"
    rounded: "{rounded.tab}"
    padding: "4px 16px"
    height: "26px"
  tab-active:
    backgroundColor: "{colors.tab-active}"
    textColor: "{colors.bg}"
    rounded: "{rounded.tab}"
  badge:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    typography: "{typography.label-nav}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-dark:
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  field:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "44px"
  product-tile:
    backgroundColor: "{colors.tile}"
    rounded: "0"
  announcement-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    height: "{spacing.announce}"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
---

# Design System: Shelby

## Overview

**Creative North Star: "The Pro Shop Rack"**

The storefront is a bright, well-lit golf-retail floor: white walls, grey shelves, the caps on them, and one green tag that says "buy". It is a deliberate site-clone of Eastside Golf's live Shopify Broadcast style (SITE_SPEC v8 Part E), carried by Shelby's own name, copy, products and photos. Everything that is not merchandise stays quiet and small so the product photography and the single green accent do the selling. Density is retail-normal: tight 4px grid gaps, full-bleed photography, small uppercase navigation, and generous white between sections rather than decorative containers.

Black frames the page top and bottom (announcement bar, prefooter wordmark band, footer); white carries the middle. Three faces split the work cleanly: an old-style display serif for section titles and the wordmark, a bold geometric sans for product and page titles, and a plain grotesque for everything else. Motion is Eastside's: a skewed sweep across buttons on hover, a growing underline under nav links, a second product angle and a sliding quick-add bar on card hover, slide-in drawers. Nothing reveals on scroll.

The Expo app (`mobile/src/constants/theme.ts`, `mobile/APP_SPEC.md` v8) is a native translation of this system: same palette values, same three faces, same tile and green-for-buying rules, expressed with native navigation, tab bar, pressed states in place of hover, and safe areas.

**Key Characteristics:**
- White page, #F6F6F6 grey tiles behind every product shot, black bars at top and bottom.
- One accent: golf green, reserved for buying, prices and focus.
- Monomakh display serif for section titles and the SHELBY wordmark; Montserrat for product and page titles; Roboto for the rest.
- Small corners (3-4px) on controls; photographs and tiles are square-cornered.
- Hover motion lives on controls and cards; pages do not animate on scroll.

## Colors

A near-monochrome retail palette of white, light greys and black, with a single saturated golf green doing all the commercial work.

### Primary
- **Fairway Green** (green): add-to-bag and checkout buttons, the PDP price, selection and checkbox accents, the progress fill, text selection and the focus ring. It is the only chromatic color in the interface.
- **Rough Green** (green-hover): the hover sweep that fills a green button.
- **Deep Fairway** (green-deep): hover color for green text links.
- **Green Wash** (green-fade): the background of a selected radio card at checkout.

### Neutral
- **Scorecard Charcoal** (text): body text, outline button borders, secondary (charcoal) buttons, the dark badge.
- **Pure Black** (ink / text-strong): announcement bar, prefooter band, footer, card titles, the black button.
- **Pencil Grey** (text-light): metadata, card prices, breadcrumbs, helper copy.
- **White** (bg): the page and drawers.
- **Tile Grey** (tile): every product-photo tile and the grey section bands; product shots on white are multiplied onto it.
- **Clubhouse Sand** (sand): the mobile shop-by-color strip only.
- **Brighter Grey** (bg-brighter): mobile menu row hover and the white button's hover sweep.
- **Sticky White** (surface-sticky): the mobile sticky add-to-bag bar.
- **Hairline Grey** (border): accordion, table, menu and radio-card dividers.
- **Track Grey** (track): progress bar track.
- **Field Grey** (field-border): input borders and light swatch rims.
- **Tab Black** (tab-active): the selected tab fill and the carousel arrow glyph.
- **On-Ink** (on-ink, on-ink-hover): text on black bands and its hover.
- **Error Maroon** (error, error-bg, error-border): field errors and their message box.

### Named Rules
**The One Green Rule.** Green means buy. It appears on the purchase action, the price, selection and focus, never as a decorative fill, a section band or a headline color.

**The Grey Tile Rule.** Every product photograph sits on Tile Grey with `mix-blend-mode: multiply`, so white-background shots read as objects on a shelf rather than white boxes.

**The Black Frame Rule.** Black is for the page frame (announcement bar, prefooter, footer) and solid black buttons. Content sections in between stay white or Tile Grey.

## Typography

**Display Font:** Monomakh (with Times New Roman, serif)
**Heading Font:** Montserrat 500/600/700 (with Helvetica Neue, Arial)
**Body Font:** Roboto 400/500/700, italic for notes (with Helvetica Neue, Arial)

**Character:** An antique-feeling serif with a slightly hand-cut texture sits against clean commercial sans faces; the serif gives the store its clubhouse voice, the sans keeps buying plain.

The root size is 14px under 750px and 16px above, so body text is 0.9rem (12.6px mobile, 14.4px desktop). Frontmatter sizes are the desktop values; mobile steps are below.

### Hierarchy
- **Display** (Monomakh 400, 69px / 28px mobile, 1.05): the big section statements on home, The Card and story pages.
- **Display Hero** (Monomakh 400, 38.4px / 32.4px, 1.2): the hero title in its corner block.
- **Display Section** (Monomakh 400, 38px / 22px, 1.05, uppercase): rail and tabs headings such as the Rope Cap tabs rail.
- **Wordmark** (Monomakh 400, 30px / 26px, 0.04em, uppercase): the text SHELBY in the header and prefooter.
- **Headline** (Montserrat 500, 38.4px, 1.2): long-form section headings on the fit guide and story pages.
- **Title Page** (Montserrat 700, 26px, 1.2, uppercase): collection and utility page titles.
- **Title Product** (Montserrat 700, 24px / 18px, 1.2): the product name on the PDP.
- **Title Card** (Montserrat 500, 19.2px / 16.8px, 1.2): kit, hole and editorial card titles.
- **Body** (Roboto 400, 0.9rem, 1.37): default copy.
- **Body Long** (Roboto 500, 14.4px, 25px leading): descriptive paragraphs, held to the 680px measure.
- **Price** (Roboto 400, 18px, tabular, green): PDP price. Card prices use Meta size in Pencil Grey.
- **Meta** (Roboto 400, 12.6px, 17.64px): captions, card titles on mobile, breadcrumbs.
- **Label Nav** (Roboto 500, 11px, 0.025em, uppercase): header nav, badges, quick add.
- **Label Table** (Roboto 500, 11px, 0.14em, uppercase): table heads and small form labels.

### Named Rules
**The Three Faces Rule.** Monomakh speaks in section titles and the wordmark, Montserrat names products and pages, Roboto does everything else. No fourth face, and no face crosses into another's job.

**The 11px Floor Rule.** No interface text below 11px; Eastside's 9-10.8px labels were raised to 11px on purpose.

## Layout

Full-width pages with a page gutter of 16px on mobile and 50px from 750px up; rails use 12px then 50px. Breakpoints are the theme's own: 480px, 750px (the main mobile/desktop switch), 990px and 1400px. Product grids and rails use a tight 4px gap so tiles read as one shelf. Rails scroll horizontally with snap, hidden scrollbars and round white arrow buttons that appear on hover (always visible on touch); card columns are 164px on mobile and 349px on desktop.

The header is 72px on mobile, 70px on desktop, and sticks once the 36px announcement bar has scrolled away. The hero is full-bleed photography (650px tall on mobile, 75vh on desktop) with its copy, title and an outline-white button in a small bottom-right corner block over a soft radial darkening. The PDP is a single column on mobile (head, gallery, buy) and from 990px a media column beside a sticky buy column (670fr / 620fr, 50px gap). Long-form text holds a 680px measure. Drawers are 380px (menu, narrow) or 650px (cart flyout) wide.

## Elevation & Depth

The system is flat. Depth comes from the grey tile against white and the black frame, not from shadows. Three small shadows exist, each tied to a floating element.

### Shadow Vocabulary
- **Badge lift** (`box-shadow: 0 2px 2px rgb(0 0 0 / 0.02), 0 2px 6px rgb(0 0 0 / 0.04)`): white badges sitting on a tile.
- **Arrow float** (`box-shadow: 0 2px 8px rgb(0 0 0 / 0.18)`): round rail arrows over photography.
- **Drawer edge** (`box-shadow: 0 2px 8px rgb(0 0 0 / 0.06), 0 3px 12px rgb(0 0 0 / 0.02)`): cart and menu drawer panels, over a 40% black underlay.

### Named Rules
**The Floating-Only Shadow Rule.** Only things that float over other content (badges, arrows, drawers) cast a shadow. Cards, buttons, bands and inputs are flat.

## Shapes

Controls carry small, barely-there corners: 3px on buttons, fields and radio cards; 4px on tabs and the sticky add-to-bag button. Badges are 20px pills, progress bars 10px, swatches and carousel arrows full circles. Photographs, tiles, bands and drawers are square-cornered. Borders are 1px: charcoal on outline buttons and tabs, Field Grey on inputs, Hairline Grey as dividers. Selected swatches get a white gap ring then a 1px charcoal ring.

## Components

### Buttons
Quiet, rectangular, with one memorable hover.
- **Shape:** gently squared (3px), 1px border, min-height 44px, padding 8px 16px (10px 18px from 750px), Roboto 16px.
- **Primary (green):** Fairway Green fill and border, white text. Used for add to bag, checkout and the main buy actions.
- **Secondary / Black / White:** solid charcoal, black or white fills for non-buying actions and dark sections.
- **Outline (charcoal, black, white, green):** transparent fill, 1px border in the text color; outline-white is the hero button.
- **Hover:** a skewed (30deg) panel sweeps in from the left over 0.5s (`cubic-bezier(0.33, 0, 0, 1)`): at full opacity in the hover color on solid buttons, at 10% currentColor on outlines. A trailing arrow nudges 5px right. Under reduced motion the sweep is replaced by a plain background change.
- **Sizes:** small (33px, 12px text), add-to-bag (52px, full width, bold), sticky (47px, 4px corners, 18px text), checkout (50px, full width, 600).
- **Disabled:** 50% opacity, no sweep. Loading shows a 16px spinning notch, the only looping animation in the system.

### Tabs
- **Style:** 1px charcoal outline, 4px corners, 26px tall (44px on coarse pointers), 14px text, 0.06em tracking.
- **State:** selected tab fills Tab Black with white bold text. Used in the home tabs rail and filters.

### Badges and Swatches
- **Badge:** white pill, 11px uppercase, badge-lift shadow, top-left of a tile at 5px. Only real states: a numbered edition ("No. 02") or "Sold out" (dark pill).
- **Swatch:** 20px circle (32px large) filled with the cap color, 1px #E9E9E9 rim (Field Grey on light colors), double ring when selected.

### Cards / Containers
- **Product card:** a 5:6 Tile Grey tile with the product multiplied onto it; on hover the next angle fades in (0.5s) and a "+ Quick add" bar slides up from the tile bottom (0.25s), static below the tile on touch. Below: title (Meta size, black, greys on hover), price in Pencil Grey, a row of 20px swatches.
- **Bands:** full-width Tile Grey sections group related content; no bordered or shadowed boxes.
- **Accordion:** 1px Hairline Grey bottom rule, 48px summary at 18px 500, a plus icon that rotates 45deg when open.

### Inputs / Fields
- **Style:** white, 1px Field Grey border, 3px corners, 44px tall, 16px text.
- **Hover / Focus:** border darkens to charcoal; focus adds a 2px green outline.
- **Error:** border turns Error Maroon, with a message box in error-bg / error-border below.
- **Radio card:** 52px row, Hairline border, 3px corners; checked gets a charcoal border and the Green Wash.

### Navigation
- **Announcement bar:** 36px black strip, one real fact at a time cross-fading every 5s, with a pause control.
- **Header:** white, sticky; desktop is a three-column grid with the SHELBY wordmark left, uppercase 11px nav links whose underline grows from the center (0.25s, `cubic-bezier(0.215, 0.61, 0.355, 1)`), and icons right. A full-width mega menu fades in with links rising 6px and an image settling from 1.06 scale.
- **Mobile:** menu drawer slides in from the left (0.6s), 50px uppercase rows divided by hairlines; sub-menus slide in from the right.
- **Footer:** black prefooter band with the centered wordmark, then a black footer of four link columns (accordions on mobile) and the tee-sheet signup.

### Cart Drawer
A 650px flyout from the right over a 40% black underlay (fades in after 0.1s), with the drawer-edge shadow; lines fade up 15px as they appear and collapse when removed. The close icon rotates 90deg on hover.

## Do's and Don'ts

### Do:
- **Do** keep Fairway Green (#207212) for buying, price, selection and focus only.
- **Do** put every product photo on a Tile Grey (#F6F6F6) tile with multiply blending.
- **Do** use Monomakh for section titles and the wordmark, Montserrat for product and page titles, Roboto for everything else.
- **Do** keep control corners at 3-4px and photographs square.
- **Do** use the skewed hover sweep on every `.btn`, and provide the plain background-change fallback under reduced motion.
- **Do** keep text at 11px or larger and nav and labels uppercase.
- **Do** show badges only for real states: a numbered edition or live "Sold out".

### Don't:
- **Don't** use green as a background band, headline color or decorative accent.
- **Don't** add shadows to cards, buttons, bands or inputs; only badges, rail arrows and drawers float.
- **Don't** add scroll-triggered reveals; the live source runs with them off and so does Shelby.
- **Don't** introduce a fourth typeface or set body copy in Monomakh.
- **Don't** add review stars, "best seller", sale strikethroughs or discount popups; the slots they occupy on the source stay empty or carry real Shelby content.
- **Don't** round photographs or tiles, or raise control corners beyond 4px (pills are reserved for badges).
