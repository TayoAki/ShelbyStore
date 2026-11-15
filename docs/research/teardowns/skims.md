# SKIMS — teardown

Captured 2026-11-15 (the holiday shop was the home campaign). Pages: `/`, `/collections/tees-tanks`, `/products/cotton-jersey-long-sleeve-t-shirt-merlot`. Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`.

**Positioning:** core "classic shades" plus limited-edition colorways and drops.

## Tokens

| Token | Value |
|---|---|
| Display font | **T-Star 900, uppercase**, letter-spacing 0.75px (30px mobile and 48px desktop campaign titles; PDP title 16px/900). Self-hosted |
| Body / UI font | Inter (Google Fonts, variable), 12–16px |
| Text | `#2d2a26` (warm near-black); accent `#986b58` (clay) |
| Surfaces | `#ffffff`, `#faf8f5` (warm off-white), translucent warm overlays (oklab) |
| Primary CTA | Before a size is picked: **outlined** white with a `#787572` 1px border and grey text; 52px tall, radius 2px, T-Star 16px/900 uppercase |
| Size buttons | 56×32px text boxes |
| Swatches | 32×32, radius 2px |
| Product image ratio | ~1.44 (tall, close to 2:3) on collection; 1:1 on the mobile PDP gallery |
| Grid | 2 columns mobile, 4 columns desktop |

## Header & nav
- A rotating announcement bar (free-shipping threshold, with a pause button).
- Sticky header; on mobile a **full-width search field** sits under the logo row, with wishlist, bag and menu icons.
- Desktop nav: New · Holiday shop · Best sellers · Clothing · Bras · Underwear · Shapewear · Mens · Accessories · Kids · Sale.

## Homepage (in order)
1. Campaign hero (image carousel) with "Shop now"
2. Category tiles: gift themes
3. Best-selling gifts banner
4. Matching sets tiles
5. Markdowns banner

A **"Never miss a drop" modal** asks for email and a Women/Men/Both preference, offers no discount, and frames the signup around drops. A "Be the first to know" chip floats on the PDP.

## Collection
- Sub-category tiles at the top (All clothing / Tanks / Shorts …), then "Filter" and "Sort".
- Card: image, wishlist heart, quick "+" add, title, price. "View more products" pagination.

## Product page
- **Mobile:** swipe gallery with progress bar; model caption (body size, height, size worn); "New color" eyebrow; fabric line; title; price.
- Swatch groups: **"Limited Edition: [color]"** first, then **"Classic shades"**.
- Size row XXS–4X; "Size guide"; outlined "Select a size" CTA; Klarna + Afterpay lines; free returns for rewards members.
- Tabs: Details · Fit & Fabric · Shipping.
- **"Complete the look"**: each item has its own size dropdown and "Add to cart" (inline add); "Similar styles".
- **Pinned mobile bar:** thumbnail, name, price and a "Select a size" button.

## Drop mechanics
- "Never miss a drop" email capture with a gender preference; limited-edition swatch label; "New color" eyebrow. No countdown visible.

## Performance (directional)
Mobile home LCP 1.2s; mobile PDP LCP 1.6s.

## Notes for Shelby
- Drop-framed email capture ("never miss a drop") instead of a discount pop-up fits a drop calendar.
- "Limited Edition" vs "Classic shades" is the same core-vs-drop split as Cuts, Elwood, Vuori and Comfrt.
- Inline add-to-cart in "Complete the look" raises items per order without a page change.
