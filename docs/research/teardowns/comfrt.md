# Comfrt — teardown

Captured 2026-11-15 (Black Friday early access). Pages: `/`, `/collections/hoodies-sweatshirts`, `/products/basic-mock-neck-sweatshirt`. Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`.

**Positioning:** a fast-growing DTC comfort-wear brand with a hero hoodie, "core" and "limited edition" colors, and a paid VIP club.

## Tokens

| Token | Value |
|---|---|
| Font | **System fonts only** (`-apple-system`, Arial): 28px/700 hero and PDP title, 14–16px body |
| Text | `#1a1a1a` / `#000000`; muted `#555555`; sale red |
| Surfaces | `#ffffff`, `#f5f4f1`, `#f8f6f1` (warm off-whites); `#222222` announcement bar |
| Primary CTA | **Brand pink `#f9d2ee`** with black text, 47px, radius 4.42px, uppercase 700. **The label includes the price and stock** ("Add to cart – $55" / "In-stock: ready to ship") |
| Size buttons | 36×36px; the selected size is filled black |
| Swatches | 28px, radius 8px, 1px border at 10% black |
| Product image ratio | 3:4 |
| Grid | 2 columns mobile, 4 columns desktop with a sidebar filter |

## Header & nav
- Dark marquee announcement bar (sale and a free-shipping threshold).
- Fixed translucent header (white at 65% opacity); logo centered on mobile.
- The desktop nav includes category, home, pets and a sale entry.

## Homepage (in order)
1. Promo hero carousel with "Shop now"
2. Category chips/tiles (Hoodies, Blankets, Loungewear …)
3. "Shop new arrivals" carousel with **"New color" and "Just dropped" tags**
4. **Membership band**: paid VIP club with credit back, "first dibs on every drop", and members-only items
5. Hoodies carousel
6. Clinician-endorsement block (expert proof)
7. Athleisure / pajamas split
8. Press carousel
9. Loungewear carousel
10. Promo band

## Collection
- "Filters" and "Sort", product count (52).
- Card: wishlist heart, "New color" badge, name, sale price with a "comp. value" strike, **swatch rows ("+21")**.

## Product page
- Rating and review count above the title; sale price with "comp. value"; promo code line.
- Swatches grouped **"Core"** and **"Limited Edition: [color]"**; size row; **"Find my size | Size guide"**; model captions on images (height + size worn).
- A VIP opt-in checkbox at the CTA ("earn credit back"); quantity stepper; pink price-bearing CTA.
- Accordions: Description · Size & Fit · Fabric & Care · Shipping & Return Policy; "Featured fabric" icons.
- **Bundle add** (matching set at a bundle price) and "Complete the look".
- **Pinned mobile panel** (164px) with name, price, swatches, size and "Add to cart".

## Drop mechanics
- "Just dropped" and "New color" tags; limited-edition color group; paid membership with first access to drops; a pre-order policy in the footer. No countdowns.

## Performance (directional)
Mobile home LCP 4.7s; mobile PDP LCP 0.6s. It has the heaviest transfer of the set (~770KB home document plus assets).

## Notes for Shelby
- "Core" vs "Limited Edition" swatch groups appear here too (5 of 11 sites).
- Putting price and stock status in the CTA answers "how much?" and "will it ship?" at the moment of decision.
- Membership-gated early access to drops is a retention mechanic that fits the playbook's "reason to return".
