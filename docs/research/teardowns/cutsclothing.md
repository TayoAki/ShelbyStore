# Cuts — teardown

Captured 2026-11-15 (Black Friday early access was running). Pages: `/`, `/collections/all-shirts`, `/products/black-crew-curve-hem` (their signature tee). Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`.

**Positioning:** a signature tee ("AO Curve-Hem") as the core, with seasonal and limited colorways plus bundles.

## Tokens

| Token | Value |
|---|---|
| Display font | Tiempos Headline (serif), **light 300**, letter-spacing −0.48px (24px mobile h2, 44–56px desktop). Self-hosted |
| UI / body font | Untitled Sans 400/500, 14px/20px |
| Text | `#222222` / `#0c0c0c` |
| Surfaces | `#ffffff`, `#fafaf9`, `#f5f5f4` (stone neutrals) |
| Primary CTA | `#0c0a09` bg / white text, **pill radius 999px**, 44px tall, 12px/500, sentence case. Before a size is picked it's `#f5f5f4` with `#939393` text and a `#e7e5e4` border. |
| Secondary button | white pill with a 1px border, 36–44px |
| PDP title | Tiempos 18px/300 on mobile, 24px on desktop; price 15px with the compare-at price struck through |
| Size buttons | 40×40px outlined boxes |
| Swatches | 16px circles, with the selected one ringed |
| Container | 1096px max for text blocks; product grid is fluid |
| Grid gap | 16–20px column / 32px row |

## Header & nav
- A red promotional marquee bar during the sale.
- The header is fixed and transparent over the hero, with the logo centered. Mobile has hamburger, search and bag (count); desktop has Men / Women / Bundles on the left and Search / Account / Cart on the right.

## Homepage (in order)
1. Sale hero (image carousel) with "Shop now"
2. Quick-link chips: Men's new / Men's best sellers / Women's
3. "Shop best sellers" product carousel, with a Men/Women toggle and star ratings on cards
4. "Shop by category" image tiles
5. "Shop bundles & fits" carousel (outfit bundles priced together)
6. "Shop by activity" tiles (Elevated / Everyday / Lounge)
7. "New releases" carousel
8. "Trending collections" carousel
9. Video product feature
10. Logos and press, then a video band
11. About us
12. Shop Men / Shop Women split
13. UGC strip with the brand hashtag and handles
14. App-download prompt: early access to new products and offers

## Collection
- 2 columns on mobile, 3 on desktop, 3:4 images.
- **Flat / Model image toggle** and a grid-density toggle.
- Card: discount badge, **"+ Quick add"** that opens a size row, star rating and review count, name, color, sale and compare-at price, swatch dots ("+9 more").
- "Filters" drawer, and "Load more" with pagination.

## Product page
- **Mobile:** star rating and review count (Okendo) above the title, then title and price. Swipe gallery with video, and a model caption giving height, weight and the size worn.
- Swatches are grouped as **"Staple colors"** and **"Seasonal colors"**: core and limited are separated on purpose.
- Sizes S–XXL with a "Size guide" link. A fit line ("Signature – fitted through chest and shoulders").
- **Quantity price tiers:** buy 1 / buy 4 / buy 6, with per-unit prices and a "Best value" tag on the largest tier.
- The CTA reads "Select size" until a size is picked. Afterpay "4 interest-free payments" text sits under it.
- Accordions: Description · Size & Fit · Materials & Care.
- "Complete the look" and "Recommended for you". The pinned mobile CTA bar has a size dropdown and a "Select size" button.

## Drop mechanics
- Seasonal vs staple swatch groups; a "New releases" rail; app early access. No countdowns.

## Performance (directional)
Mobile home LCP 1.0s; mobile PDP LCP 1.9s.

## Notes for Shelby
- The **Staple vs Seasonal swatch split** is the clearest example of the playbook's core-plus-drops model on a single PDP.
- Serif display paired with neutral sans UI reads as premium for basics.
- Multi-buy tiers suit a replenishable core tee.
