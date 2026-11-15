# Represent — teardown

Captured 2026-11-15 (a collaboration capsule was on pre-order). Pages: `/`, `/collections/t-shirts`, `/products/represent-x-…-t-shirt-vintage-black`. Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`. The page uses Tailwind utility classes and a headless layout, so body-text sampling came back empty. Typography below comes from headings, cards and the PDP.

**Positioning:** a British luxury streetwear brand built on capsules, collaborations and pre-orders.

## Tokens

| Token | Value |
|---|---|
| Font | **STK Bureau** (self-hosted woff2; 300–700) for everything; Inter also loaded. Small UI type: PDP title 12px/500, card title 10px, letter-spacing 0.13px |
| Text | `#000000` on `#ffffff`; promo red `#ae0200` |
| Primary CTA | black full-width button ("Pre-order" / "Add to cart"), radius 0, uppercase |
| Size buttons | row of bordered boxes XS–XL, with a "Find your perfect size" helper |
| Swatches | **product-image thumbnails** (not color chips) |
| Product image ratio | 3:4 (cards); full-height gallery on mobile |
| Grid | 2 columns mobile, 4 columns desktop, with **1–3px column gaps** (images almost touch) and 35px row gap |

## Header & nav
- Fixed header, transparent over the full-bleed campaign hero; sub-brand switcher (main line / activewear / outlet / retail / archive) and a US/USD selector.

## Homepage
1. Split full-bleed hero: two campaigns side by side (main line + activewear), each with "Shop" and a collaboration CTA.

The remaining sections weren't captured because the page is client-rendered (marked "—" in the README).

## Collection
- SEO intro copy with links; sub-collection image tiles; **Model on/off toggle** and a grid-density toggle; "Filter & sort"; product count; "Load more".
- Card: **"Pre-order" label**, wishlist bookmark, name, "N colors", price.

## Product page
- Gallery counter ("1 / 8") and a **model caption** (height, weight, size worn).
- **Pre-order notice with the ship-from date**; color as image thumbnails; size boxes; "Size chart"; "Find your perfect size".
- Full-width black "Pre-order" CTA, which is also **pinned at the bottom on mobile**.
- Loyalty points earned for the purchase; free shipping threshold; "Ships from the USA"; Afterpay installments.
- "Style with" (outfit add-ons with prices, including sold-out ones) and "You may also like".

## Drop mechanics
- **Pre-order with an explicit ship date**, "Pre-order" card labels, early-access promo chips, and sub-brand drops. No countdown.

## Performance (directional)
Mobile home LCP 1.4s; mobile PDP LCP 1.6s.

## Notes for Shelby
- Pre-order with a ship date lets a drop sell before stock lands, which pairs with the playbook's held/rescheduled release.
- A near-zero-gap grid makes the catalog read as a lookbook.
