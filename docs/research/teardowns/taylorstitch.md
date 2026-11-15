# Taylor Stitch — teardown

Captured 2026-11-15. Pages: `/`, `/collections/mens-tees-sweaters`, `/products/organic-cotton-tee-in-vintage-white-2304`. Playwright at 390×844 (iPhone 13) and 1440×900; values from `getComputedStyle`. On the mobile PDP an email-capture modal covered the page during the sticky-CTA probe, so "pinned CTA" is "not detected" rather than confirmed absent.

**Positioning:** durable menswear staples with limited-edition runs ("Last Call", "Limited Edition" labels).

## Tokens

| Token | Value |
|---|---|
| Display font | **Orbikular** (variable serif), **light 300**, tight tracking (−1.26 to −1.89px): 41–42px hero and PDP title; price 22px. Self-hosted |
| Body / UI font | **National 2** 400/500, 14px/22px |
| Mono accent | **IBM Plex Mono** for small labels, eyebrows and meta |
| Text | `#0f2130` (navy ink) for titles; `#5f6062` / `#363636` for body |
| Surfaces | `#ffffff`, `#f2f2f2`; announcement bar `#171717`; accent khaki `#a09473` |
| Primary CTA | **Brand blue `#4573a7`** / white, 54px mobile and 66px desktop, radius 0, 16px/500 **uppercase, letter-spacing 1.6px** ("Add to cart") |
| Size buttons | 3-column grid of 111–125×48px labels showing **letter + numeric size** ("M / 40"); selected = filled navy; sold out = greyed with a strike ("Out of stock" text on the label) |
| Swatches | 40px circles; the selected one has a 2px navy ring |
| Product image ratio | 4:5 |
| Grid | **1 column on mobile**, 3 on desktop |

## Header & nav
- Rotating dark announcement bar with arrows (email discount, free shipping and returns on every domestic order, a featured product).
- Sticky white header (62px) with the logo centered on mobile.
- Desktop nav: New & featured · Shirts & sweaters · Bottoms · Outerwear · Accessories · Last call, then About and Help.
- A first-visit email modal ("join the club" for a first-order discount).

## Homepage (in order)
1. Video hero carousel (seasonal story)
2. "Shop by category" image carousel on a grey band
3. Brand-values block (durability, responsibility)
4. "Newest arrivals" carousel with a "Limited edition" tag on items
5. Editorial pair (staples / last call)
6. Fabric-story editorial with "Shop shirting" and "See the lookbook"
7. Journal ("Dispatch") carousel
8. Customer-quote carousel ("Words from the wild") linking to products

## Collection
- Category tabs (All / Tees / Polos / Sweaters / Sweatshirts), "Filter by" and "Sort by", product count.
- **Card includes a one-line product description** under the name and price (18px serif title).

## Product page
- Breadcrumb; star rating and review count (Stamped) above the title; serif title with the color name on a second line; price right-aligned.
- Description paragraph above the selectors; circle swatches; 3-column size grid with both size systems; "Size & fit guide".
- Blue full-width CTA, then a **perks list**: free shipping & returns, a durability guarantee, responsible-build note.
- Sections: Fit · Material · Specifications · Essential; customer quotes.

## Drop mechanics
- "Limited edition" labels on new arrivals; a "Last call" nav for end-of-run stock. No countdowns.

## Performance (directional)
Mobile home LCP 2.7s (video); mobile PDP LCP 2.3s.

## Notes for Shelby
- Serif display, grotesk UI and mono labels together read as "considered, durable". The mono eyebrows suit spec-style proof ("230 GSM").
- The perks list under the CTA (shipping, returns, guarantee) answers risk questions at the decision point.
- Showing two size systems ("M / 40") helps fit confidence.
