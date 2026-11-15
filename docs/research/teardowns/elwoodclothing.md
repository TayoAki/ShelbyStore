# Elwood — teardown

Captured 2026-11-15. Pages: `/`, `/collections/tees`, `/collections/tees/products/trademark-crop-hill-tee-black`. Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`. Elwood is the brand behind the playbook in `docs/playbook.md`.

**Positioning:** a vintage-inspired core tee and core fleece, with collection drops alongside ("Lost Coast" collection; "Seasonal Core").

## Tokens

| Token | Value |
|---|---|
| Font | **System Helvetica** everywhere: uppercase 700 section titles (14px, letter-spacing 0.7px); product titles 16px/400; body 12px. Source Sans Pro is linked from Google Fonts, but Helvetica renders. |
| Text | `#000000`, `#232323`; muted `#808080` |
| Product-image bg | `#dcdedf` (cool light grey behind flat-lay product shots) |
| Primary CTA | `#000000` / `#ffffff`, 38px tall, radius 0, 12px/700 uppercase, letter-spacing 0.6px |
| Secondary buttons | black, 30px tall, 2px black border, 13px uppercase |
| Size buttons | 37×37px squares, 1px black border, 9px type; the selected size is filled black |
| Swatches | 22px circles |
| Container | 1200px (desktop content) |
| Product image ratio | **2:3** (1.5), taller than most |

## Header & nav
- No announcement bar. The header is transparent over the hero on home (absolute positioning) and sticky white elsewhere. The logo is centered on mobile, which shows only search and cart icons.
- Desktop nav: Shop · Best sellers · Kids · Vintage · Rewards · Wholesale · Behind the scenes.
- A persistent "10% off" side tab for email capture.

## Homepage (in order)
1. Full-bleed hero carousel with a centered CTA ("Shop [collection]") and a second slide pointing to "Seasonal Core"
2. 12-product grid (hover shows a size grid and add to cart)
3. Kids banner
4. **Core** product carousel (core tee, core sweatpant, core hoodie)
5. Sweatshirts banner
6. A second core carousel

## Collection
- 2 columns on mobile, 4 on desktop; 2:3 flat-lay images on grey; 61 products shown.
- Card: name, color, price. Desktop hover shows **an inline size grid and "Add to cart"** (quick add), plus a "What's my size?" fit-predictor link (a third-party fit widget).
- "Filter" and "Sort" dropdown bar.

## Product page
- **Mobile:** swipe gallery (dots, zoom); title, price; swatches labelled **"Core colors: Black"** and **"Seasonal colors"**; size grid XS–XXL; CTA reads "Select size" until one is picked.
- **Desktop:** two images side by side; the info column has title, price, color groups, size row, "What's my size?", black "Add to cart", then the Afterpay line.
- Accordions: Product details · Size & fit · Free delivery & easy returns.
- "You may also like" carousel with **quick-add size grids on each item**.
- Brand reviews carousel (verified-customer testimonials) rather than product-level star ratings.

## Drop mechanics
- Core vs Seasonal color labels on the PDP, a "Seasonal Core" hero and named collection drops. No countdowns or waitlists.
- Rewards program in the nav.

## Performance (directional)
Mobile home LCP 2.0s; mobile PDP LCP 2.5s.

## Notes for Shelby
- The site makes the core visible: core products are labelled "Core" in names, carousels and swatch groups.
- Quick add with a size grid on cards and on recommendations keeps people adding to the cart without leaving the page.
- A plain system-Helvetica look still reads as premium because of photography consistency: flat lays on one grey.
