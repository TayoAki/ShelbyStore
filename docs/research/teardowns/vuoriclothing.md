# Vuori — teardown

Captured 2026-11-15. Pages: `/`, `/collections/mens`, `/products/kore-short-unlined-7-raindrop` (their signature short). Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`. The collection grid loads client-side and wasn't captured (skeletons only), so collection metrics are marked "—".

**Positioning:** performance lifestyle with signature "core" styles (the Kore short) in core and limited colors.

## Tokens

| Token | Value |
|---|---|
| Font | **Aktiv Grotesk** (Adobe Fonts) for everything: 300/400/500; headings use negative tracking (−0.6 to −0.72px) |
| Type sizes | PDP title 20–21px/400; price 15px/300; body 15px/26px; desktop home display 50px |
| Text | `#333333`; muted `#727272`; light `#c6c6c6` (sold-out sizes) |
| Surfaces | `#ffffff`, `#f8f8f8`, `#ededed` |
| Primary CTA | `#333333` / `#ffffff`, 44px, radius 2px, 15px/400, **sentence case** ("Select Size" → "Add to Bag") |
| Secondary buttons | transparent with a 1px `#c6c6c6` border, 60px |
| Size buttons | 44×44px, radius 2px; sold-out sizes greyed out (`#c6c6c6`) |
| Swatches | 36×36 squares |
| Product image ratio | 4:5 (1.25) |

## Header & nav
- A rotating one-line announcement (a product-led message, not a discount) above a sticky white header. The header hid on scroll-down during the test.
- Desktop: a search pill **plus an "Ask AI" shopping-assistant button**; nav New · Women · Men · Accessories · Gifting · Explore.
- A first-visit modal offers a first-purchase discount for email signup.

## Homepage (in order)
1. Video hero carousel (with pause/prev/next) for the seasonal collection, with Shop Men's / Shop Women's
2. A long merchandising run: new arrivals carousel with a men/women toggle, gift guide, collection features

## Product page
- **Mobile:** swipe gallery; title, price, star rating (MUI) under the title; Afterpay/Klarna line; color swatches split into **"Limited Edition Colors"** and **"Core Colors"**; sizes; "Size guide"; a **fit summary from reviews ("Customers say this runs true to size")**; model caption (height + size worn).
- Feature icon list (4-way stretch, quick drying, recycled content).
- Accordions: Product details · Fit (fit name, inseam, model size) · Fabric & care · Product features.
- Satisfaction guarantee + free returns line ("love it or send it back").
- Reviews: **AI-generated "Review highlights"** summary; 4.8★ from ~26.7k reviews; a fit scale; filters for rating, body type, height, size and inseam; each review shows the reviewer's height and body type.
- "Shop the look", "More from the [collection]", "You may also like".
- **Pinned mobile CTA bar** ("Select Size"), plus a **desktop pinned top bar** with thumbnail, name, price and a "Select Size" button.

## Drop mechanics
- "Limited Edition Colors" group on the PDP; "New arrival" tags. No countdown on the PDP.

## Performance (directional)
Mobile home LCP 4.4s (video hero); mobile PDP LCP 0.6s.

## Notes for Shelby
- Review data drives fit confidence: a fit scale, body-type filters and an AI summary.
- A pinned buy bar on both mobile and desktop.
- "Core Colors" naming matches the playbook's core concept exactly.
