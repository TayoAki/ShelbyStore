# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(A separate Expo app in `mobile/` shares the catalog and brand; it is built from its own spec, `mobile/APP_SPEC.md`.)

## Users

**Primary (confirmed): everyday golfers aged roughly 25–45.** They play a few times a month, are often range or simulator regulars, and buy a cap for themselves. They arrive mostly from short-form golf content on phones, already know what a rope cap is, and are deciding between Shelby and the rope caps they see from golf brands and creators at $35–60.

Other audiences the store already serves (not the design's lead): gift buyers around Father's Day and the holidays, and clubs or outing organisers ordering custom caps (`/custom`).

## Product Purpose

Shelby sells one product: **The Rope Cap**, a five-panel, garment-washed cotton golf cap with a braided rope above the brim, one size (21.5–23.75 in, 55–60 cm). Four core colours are always in stock (Tour White, Clubhouse Navy, Pine, Fescue); numbered editions of 200 ("holes") release on dated golf-calendar moments and are not remade. Bundles: The Pair (any two) and The Foursome (four). Success is a first cap bought on a phone without fit doubt, then a reorder or a numbered edition.

## Positioning

**The fit: a mid crown.** The rope caps that sell best have tall crowns, and buyers say the height "takes getting used to". Shelby's crown sits lower (target ~11–11.5 cm) so the cap sits right the first time. This is the claim to lead with; numbered holes and one-cap focus support it.

## Operating Context

- Most visits are mobile, from creator videos and social links (with `?asset=` attribution); the continuity banner names the video a visitor came from.
- The golf calendar drives demand: the season opens in spring, numbered holes release on announced dates (Hole 2 Azalea 5 Apr 2027, Hole 3 Cypress 1 Jun 2027, Hole 4 Haar 12 Jul 2027; Holes 5–6 announced).
- Fit is judged from photos and the fit guide (crown height scale, head circumference in inches and cm).

## Capabilities and Constraints

- Stack: Next.js 16 storefront (`web/`) on a Medusa 2 backend (`backend/`), deployed on Railway; Stripe Payment Element checkout (test mode); first-party analytics with funnels and experiments; release module for numbered holes with go/no-go checks.
- Pages that must keep working: home, shop, product page, cart drawer and bag, checkout and order confirmation, fit guide, The Card (holes) and hole pages, custom quote, story, offer (Pair/Foursome), listicle, advertorial, quiz and result. Every `data-track` name, `page_type`, experiment (`story-headline`, `offer-headline`) and attribution behaviour stays.
- Prices are research-recommended demo values pending confirmation: $48 core, $52 editions, $88 Pair, $152 Foursome, free standard shipping from $85 (otherwise $6; express $15), custom $40 each at 24+.
- Photos are AI-generated stand-ins (square on white, plus golf lifestyle images in `web/public/hats/`) until real photography exists.
- Undecided: the brand name ("Shelby" overlaps Carroll Shelby's apparel and headwear marks; a trademark search is pending); measured demand data.

## Brand Commitments

- **No fake proof or urgency (confirmed).** No invented reviews, ratings, customer counts, testimonials or "people are switching" claims; no evergreen or resetting timers. Scarcity comes only from real stock and real release dates; a proof block with no real data behind it is not shown.
- Voice used so far: plain and warm with dry wit; no puns, no invented heritage ("since 19xx"), no "members only", no tournament or club trademarks in names or copy.

## Evidence on Hand

- `reports/Golf brand rope cap positioning.md`: golf landscape, golf visual identity (measured palettes and type), rope cap market and specs, merchandising calendar, channels.
- `reports/Most successful ecommerce brands.md`; `docs/research/teardowns/` (11 apparel stores, Melin, Goorin); `docs/landing-pages/` (brief, page map, essay compliance).
- Live stock counts, product facts and policies are the only proof the site may show today. There are no real reviews yet.
