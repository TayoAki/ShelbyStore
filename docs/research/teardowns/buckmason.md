# Buck Mason — teardown

Captured 2026-11-15 with Playwright (Chromium; iPhone 13 profile at 390×844, desktop at 1440×900). Pages: `/`, `/collections/mens-tees-and-long-sleeves` (filtered to one fabric), `/products/…-slingshot-rib-ls-tee`. Values are `getComputedStyle` readings of the rendered page. "—" means not measured.

**Positioning:** premium American basics. The home leads with the season's campaign, and a "best sellers" grid carries the basics.

## Tokens

| Token | Value |
|---|---|
| Display / UI font | Acumin Pro Condensed 600–700, **uppercase** (titles, nav, CTA). Adobe Fonts (Typekit) |
| Body font | Acumin Pro 400, 12–15px; desktop body line-height 28.6px on long copy |
| Mono accent | Overpass Mono (Google Fonts), loaded but used sparingly |
| Text | `#333333` (all copy); muted `#5f5d5d` |
| Page bg / surface | `#ffffff` / `#f3f1ef` (warm off-white announcement bar) |
| Border | `#dddad0` (warm grey) |
| Primary CTA | `#333333` bg, `#ffffff` text, 51px tall on mobile and 47px on desktop, radius 1px, 14.3px/700 uppercase, letter-spacing 0.29px. Desktop shows it `#aaaaaa` while no size is picked. |
| PDP title | 20px/20px 600 uppercase, letter-spacing 0.4px; price 14px 400 on the same line, right-aligned |
| Size buttons | 58×41px, white, radius 1px, no border, 11.7px |
| Swatch | 30×30 square (0 radius) |
| Container | max-width 1728px (desktop) |
| Grid gap | 30px column / 30–40px row |

## Header & nav
- Announcement bar (30px, `#f3f1ef`) states the free-shipping threshold and a 365-day returns promise. It's static, not rotating.
- Sticky header (114–118px including the bar). On mobile it hides when you scroll down and comes back when you scroll up. The logo is centered on mobile.
- Mobile: hamburger, search, bag, with a Men/Women tab row under the logo. Desktop: Men / Women / Made in USA / Journal on the left, Stores / account / bag on the right.

## Homepage (in order)
1. Full-bleed campaign image with a script wordmark and one bracketed CTA ("[Shop new arrivals]" style)
2. 4-up product feature row (image + name)
3. Editorial lookbook block with a CTA
4. Category editorial (denim) with a CTA
5. "Shop best sellers" grid of 16 products

No reviews, UGC, video or promo modules. The page is quiet and image-led.

## Collection
- 1 column on mobile with full-width 3:4 images; 3 columns on desktop (433px images).
- Card: up to 6 images per card (hover and swipe), uppercase name (14.3px/600), price, colorway name and a "New arrival" tag. Desktop hover shows a quick size row.
- Pill filter chips by fabric across the top, plus a "Filters" and "Sort" bar that sticks when you scroll. A product count is shown.

## Product page
- **Mobile:** swipe gallery (dots); title + price; color swatches with the color name; size buttons XS–XXL; "Size/fit guide" link right-aligned on the size row. The CTA label is **"Select size to add to cart"** until you choose a size. A pinned CTA bar sits at the bottom of the screen after you scroll.
- **Desktop:** stacked full-height 3:4 images on the left; the info column has the description first, then color, size, CTA, Afterpay line and store-availability check.
- Accordions: Description · Fit · Fabric · Returns (365 days).
- "Pair it with" cross-sell (2 products) and a "Best sellers" rail.
- No ratings or reviews. Afterpay installment text shows under the CTA on desktop.

## Drop mechanics
- "New arrival" eyebrow on the PDP and on cards. No countdowns, waitlists or launch calendar seen.

## Performance (directional, one sample)
Mobile home LCP 3.6s (big campaign image); mobile PDP LCP 0.8s.

## Notes for Shelby
- The closest tone match for a premium-basics brand: one condensed uppercase face, a warm off-white surface, and almost square 1px corners.
- "Select size to add to cart" puts the blocking step in the button label itself.
- The 365-day returns promise sits in the announcement bar and again as a PDP accordion.
