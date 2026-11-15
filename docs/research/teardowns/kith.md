# Kith — teardown

Captured 2026-11-15. Pages: `/`, `/collections/kith-tees`, `/collections/kith-tees/products/khma030419-613` (LAX tee). Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`.

**Positioning:** a drop-driven streetwear and lifestyle brand. The homepage works as a calendar of campaigns and collaborations.

## Tokens

| Token | Value |
|---|---|
| Title font | **Georgia** (serif) for campaign and product titles: 22px mobile, 28px desktop, letter-spacing 1.1px; PDP title 16–18px |
| UI / body font | Proxima Nova (Adobe Fonts) 300–700, 12px/15px; nav and buttons 12px/500 uppercase, letter-spacing 1.2px |
| Text | `#333333`; muted `#757575` |
| Surfaces | `#ffffff`; product images on `#f2f2f2` |
| Primary CTA | Before a size is picked: `#828282` (grey) / white, 41px, radius 0, 12px/500 uppercase, letter-spacing 1.2px ("Select a size") |
| Hero buttons | transparent with a 1px white border, 41px, uppercase |
| Product image ratio | **1:1** (square, product on a hanger against grey) |
| Grid | 2 columns mobile, 4 columns desktop |

## Header & nav
- No announcement bar. A fixed header, transparent over the hero, with the logo centered; hamburger on mobile.
- Desktop nav: New · Mens · Womens · Kids · Gifting | logo | Hospitality, search, account, bag.

## Homepage (in order)
The page is a stack of **campaign/collaboration blocks**. Each is a full-bleed image or video (650px on mobile) with a title, "Shop now" and **"A closer look"** (lookbook), followed by a product rail for that release. This repeats for about 7 campaigns, then a gift guide.

## Collection
- The collection opens with **product-family cards** (a named tee line + one-line description), then the grid.
- Card: square image (2 per card), title, price, color dots.

## Product page
- Thumbnail rail plus main image on desktop; swipe carousel with dots on mobile.
- Eyebrow (product family), serif title, price, "Color: [name]" swatches, **"Fit: Standard"**, size grid XS–XXL with "View size guide".
- Holiday shipping-deadline notice; **"Limited to 2 units per customer"** (purchase limit).
- Tabs: Description · Size & Fit · Shipping & Returns. "Complete the look" and "Related products". No reviews.

## Drop mechanics
- The whole homepage is release-led (collaborations, seasonal capsules, lookbooks). Per-customer purchase limits on the PDP. No countdowns on the pages captured.

## Performance (directional)
Mobile home LCP 3.6s; mobile PDP LCP 1.3s.

## Notes for Shelby
- Each release gets a "Shop now" / "A closer look" block with a product rail. That's a template for a drop page.
- Explicit purchase limits protect the stock of a limited release.
