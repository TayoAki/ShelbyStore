# Aimé Leon Dore — teardown

Captured 2026-11-15. Pages: `/`, `/collections/tees`, `/products/ald-new-balance-sonny-ny-long-sleeve-practice-tee-1`. Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`. A region-selector modal appeared on mobile.

**Positioning:** a luxury lifestyle brand with collaborations and seasonal drops, and a strong film/editorial identity.

## Tokens

| Token | Value |
|---|---|
| Fonts | **Söhne** (served via Bunny Fonts) for UI and titles; **DIN** for buttons and the location stamp. Very small type: PDP title 10–12px, body 10px |
| Text | `#181818`; muted `#c4c4c4` / `#454545` |
| Surfaces | `#ffffff`, `#f7f7f7`; video overlay `#181818` at 70% |
| Primary CTA | `#181818` / white, 40px mobile and 60px desktop, radius 0, DIN 10px uppercase, letter-spacing 1px ("Add to bag") |
| Selectors | **Native dropdowns** for color and size (the only site of the 11 without size buttons) |
| Product image ratio | 4:5 |
| Grid | 2 columns mobile, 4 columns desktop |

## Header & nav
- A **place/date/time stamp** above the header (brand home city plus the current date and time) instead of a promo bar.
- Fixed header, transparent over the full-screen video. The desktop nav is a long category list (All products, New arrivals, Tees & polos …).

## Homepage
- A single **full-screen film** (video with burned-in subtitles). No merchandising modules above the fold.

## Collection
- "Sort: Recommended" and "Refine"; **"Hide sold out products"** and **"Add your sizes"** (a saved-size filter); "New" badges.

## Product page
- Centered single image (desktop); minimal info: title, price, color and size dropdowns, "Add to bag".
- Accordions: Product details · Sizing · Delivery and returns.
- **Pinned mobile panel** (150px) with name, price, color dropdown, size dropdown and "Add to bag".
- No reviews, BNPL messaging or cross-sell visible.

## Drop mechanics
- Collaboration-led catalog; "New" badges; sold-out items stay visible behind a "hide sold out" filter. No countdowns.

## Performance (directional)
Mobile home LCP 4.5s (film); mobile PDP LCP 0.8s.

## Notes for Shelby
- Restraint signals luxury: tiny type, no promo bar, film-first home. It's the opposite end from Gymshark.
- A saved-size filter and "hide sold out" are useful once a drop starts selling through.
