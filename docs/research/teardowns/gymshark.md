# Gymshark — teardown

Captured 2026-11-15 during Black Friday ("up to 50% off" hero). Pages: `/`, `/collections/t-shirts-tops/mens`, `/products/…element-baselayer-long-sleeve-t-shirt…`. Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`.

**Positioning:** a high-volume performance apparel brand, with heavy merchandising and promotions.

## Tokens

| Token | Value |
|---|---|
| Display font | **Plaak Gymshark** (custom, 800, condensed): 32px mobile and 48px desktop campaign titles; PDP title 24/32px uppercase. Self-hosted |
| Body / UI font | SN Skandia 400/500/700, 14px/19.6px; 12px for small text |
| Text | `#0d1012`; muted `#767a7f`; sale red `#dc0428` |
| Surfaces | `#ffffff`, `#f4f5f6`, `#dee0e3` (image background); brand blue `#004aa2` in promo bands |
| Primary CTA | `#0d1012` / white, 54px, radius 0, 14px/400, sentence case ("Add to bag"), with a wishlist heart button beside it |
| Size buttons | 86×52px labels on mobile (4-column grid), white with a 1px `#dee0e3` border, radius 0 |
| Product image ratio | 4:5 (1.25) |
| Grid | 2 columns mobile, 4 columns desktop (with a sidebar filter on desktop) |

## Header & nav
- Rotating announcement bar (free-shipping threshold, email discount, student discount, sale) with a pause control.
- Sticky header, transparent over the gradient hero. Logo centered on mobile; search, account and bag icons.

## Homepage (in order)
1. Sale hero with a split Women's / Men's image CTA
2. Product carousels by category, with ratings in the card titles
3. Women's sale and men's sale category tiles ("[category] from $X")
4. "How do you train?" activity tiles
5. "Explore" guides
6. SEO copy block

## Collection
- Intro copy with sub-category links, then 2 columns on mobile and 4 on desktop, 4:5 images, a second image on hover, a discount badge on cards, a product count (457), and "Load more" plus pagination.

## Product page
- **Social-proof chip on the gallery** ("[N] people viewed this in the last 24 hours").
- Discount label, then title (uppercase display), fit subtitle ("Compression fit"), sale and compare-at price, rating and count next to the price.
- Color thumbnails (product images); a 4-column size grid; "Size guide"; **"Customers say it fits true to size"**.
- "Add to bag" plus wishlist; Klarna, Afterpay and Sezzle; loyalty points earned ("XP"); free standard delivery threshold; express delivery note.
- "Get the look" (outfit cross-sell); tabs: Designed for · Description; Delivery & returns row.
- Reviews with filters by activity, age, workout frequency and height; a "% would recommend" figure.
- No bottom pinned CTA. The info column sticks within the layout instead.

## Drop mechanics
- None seen beyond sale and new-season tags.

## Performance (directional)
Mobile home LCP 0.9s; mobile PDP LCP 0.3s (fastest of the set).

## Notes for Shelby
- A fit consensus line and fit-segmented review filters build size confidence.
- Recently-viewed counts and loyalty XP add urgency and a reason to return, but the promotional density doesn't fit a premium-basics tone.
