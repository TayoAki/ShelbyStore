# How Shelby meets the landing-page essay

Source: the user's essay outline, *From Customer Insight to Conversion* (Shopify DTC landing pages
with AI and Replo; reviewed 2026-11-13). Each row below is a requirement from the essay, where Shelby
implements it, and a status:

- **Exceeds**: does what the essay asks, plus something it doesn't ask for that removes a failure mode.
- **Meets**: does what the essay asks.
- **Partial**: some of it is built; the rest is missing or waits on real data.
- **Gap**: not built. A reason is given.

Statuses are strict: a row is Meets only when the thing exists and was checked on 2026-11-16 (local
build, browser tests at 390×844 and 1440×900, a Stripe test-card order). Shelby runs on Medusa and
Next.js, not Shopify and Replo. Where the essay names a tool, the row maps the tool's *function*.

## Summary

| Area | Exceeds | Meets | Partial | Gap |
|---|---|---|---|---|
| Page types (6) | 2 | 4 | 0 | 0 |
| Body 1–10 and limits (51 rows; 1 N/A) | 6 | 31 | 11 | 2 |

Most partial rows wait on real customers: there are no reviews, real comments or channel results yet, and the photos are AI-generated stand-ins. The rest are business decisions (the two-pack price, a guarantee) or the next tests to run (beyond headlines, with a proper sample-size calculation). The two gaps are deliberate: no bonuses or free gifts, and no segment-specific page versions until there are real segments.

## The six page types (essay Body 2 table)

| Page type | Essay's job | Shelby | Status | Why |
|---|---|---|---|---|
| Homepage | Introduce the brand, support browsing | `/`: core cap and price above the fold, shape tiles, quiz band, live stock, drops, story, fit strip | **Exceeds** | Both hat competitors fail to show a product or price on the first screen; Shelby shows both, with live stock as proof |
| Product page | Explain a product, enable purchase | `/products/[handle]`: colour-driven gallery, fit range or sizes, crown/structure scales, live stock, terms under the CTA, quiz and offer links | **Exceeds** | Adds fit tooling (scales, quiz link) and per-colour URLs on top of the essay's buy box, variants and pricing |
| Offer landing page | Present one focused deal | `/offer/everyday-two-pack`: one bundle, true anchor, pair picker, terms at the button, included, why two, proof, FAQ, close | **Meets** | Everything the essay lists for an offer, with the bundle built as inventory kits so it can't oversell |
| Listicle | Educate through a sequence of reasons | `/reasons/everyday-cap`: six numbered reasons, an image per reason, a fact per reason, jump list, mid and end CTAs, buy block | **Meets** | |
| Advertorial / presell | Develop a story and build belief | `/read/one-cap`: "Advertisement · From Shelby" label, editorial layout, problem → why → what changed → how we check → offer | **Meets** | Includes the sponsored labelling the essay's page-type guide asks for |
| Quiz result | Connect needs to a recommendation | `/quiz` → `/quiz/result`: four questions, deterministic match, "why it fits you", preselected buy box, runner-up, bundle | **Meets** | |

## Body 1: Begin with the customer and the offer

| Requirement | Where | Status | Note |
|---|---|---|---|
| Work backward from what is sold and to whom; match messaging, layout and CTAs to purchase difficulty | `docs/landing-pages/brief.md`, `page-map.md` | **Meets** | One-size $38 cap = low difficulty → short paths; fit is the hard part → quiz and fit guide |
| Onboarding-form inputs (differentiation, frustrations, outcomes, channels, offer, AOV, CR, results, goals, competitors, reviews, screenshots) | `brief.md` sections 1–7 | **Partial** | Every field is present; customer, AOV, CR and results are marked Unknown (pre-launch) |
| Review mining: comments, competitor products, forums | Teardowns of 13 stores, research report; series `audience_language` | **Partial** | Competitors are mined; real customer comments don't exist yet, and the seeded comments are demo |
| Keep observed language, inferred motivations and unanswered questions separate | `brief.md` (Observed / Inferred / Unknown on every row) | **Meets** | |

## Body 2: Match the page to awareness and intent

| Requirement | Where | Status | Note |
|---|---|---|---|
| Map cold / warm / hot traffic to page types | `page-map.md` | **Meets** | |
| Sponsored labelling for advertorials | `AdLabel` above the kicker + closing disclosure line | **Meets** | |
| Tailored recommendations after quizzes | `src/lib/quiz.ts`, result page | **Meets** | Every "why" line pairs an answer with a product fact, and says so when the match misses an answer |
| Sources disagree on offer pages for cold traffic | `page-map.md` routing rules | **Meets** | Cold offer traffic is treated as a test, not a default |
| Mappings are hypotheses, not rules | `page_type` on every event; experiments | **Exceeds** | Funnels split by page type out of the box, so the mapping can be checked, not assumed |

## Body 3: Angle from real concerns; ad-to-page continuity

| Requirement | Where | Status | Note |
|---|---|---|---|
| Pain → agitation → solution → outcome, with proof and a mechanism | Advertorial beats; story page modules | **Meets** | |
| The mechanism must be something the product actually does | Advertorial "What we changed" uses product details only | **Meets** | Claims about caps in general are hedged ("many", "can") |
| Ad-to-page continuity | `ContinuityBanner` on every page; `?asset=` → episode; story hero names the episode | **Exceeds** | Any landing page recognises the exact episode a visitor watched, automatically |
| AI drafts are a foundation that needs editing | All landing copy hand-edited against the evidence rules (SITE_SPEC §12.0) | **Meets** | |
| An angle should answer a specific hesitation | Fit (quiz, range on every page), shape loss (crush test), returns | **Partial** | The hesitations are inferred, not yet heard from real buyers |

## Body 4: An offer that clarifies value and reduces risk

| Requirement | Where | Status | Note |
|---|---|---|---|
| Bundles | Two-pack, 16 inventory-kit variants | **Exceeds** | Kit stock follows the core caps, so the bundle can never sell a cap that isn't there |
| Price anchoring | `$76` struck, computed live from the single's price | **Exceeds** | The anchor is recomputed at render, so it can't go stale or be false; hidden if the saving isn't positive |
| Guarantees | 30-day returns under every CTA and "on the pair" for the bundle | **Partial** | Shelby claims only its real policy; a stronger guarantee is a business decision (SITE_SPEC §11) |
| Scarcity | Live stock lines; "Only N left" from real counts | **Meets** | |
| Urgency | Countdown only to a release's real `release_at` | **Meets** | No fake timers; the offer page says "There's no deadline" |
| Bonuses / free gifts | — | **Gap** | Not offered; nothing to give that isn't invented |
| Distinguish single / subscription / launch / bundle / promotion pages | PDP, offer, drop pages | **Partial** | Subscriptions and promotions are deliberately not offered (hats aren't replenished; no discounts) |
| Offers accurate and consistent; watch affordability and margin | Live prices; demo price flagged; unit costs on variants | **Partial** | $68 is a demo price: confirm margin before launch |

## Body 5: Structured argument, then edit

| Requirement | Where | Status | Note |
|---|---|---|---|
| Seven modules: hook, problem, solution, social proof, explanation, offer, close | Story page, advertorial, listicle, offer page | **Partial** | Every module except social proof, which is omitted on purpose until real reviews exist |
| Page length follows the reader's needs | Advertorial long (story), offer short (decision) | **Meets** | |
| Alternate headlines | `offer-headline` and `story-headline` experiments | **Meets** | |
| Versions for different customer segments | — | **Gap** | No segment-specific variants yet; needs real segments first |
| No generated endorsements; real material or explicit placeholders | `ProofList` drops empty proof; no reviews, ratings or customer counts anywhere | **Exceeds** | Enforced in code, not just policy: a missing source removes its block |

## Body 6: Every visual has a job

| Requirement | Where | Status | Note |
|---|---|---|---|
| Product-use and lifestyle scenes | Lifestyle and crush photos | **Meets** | |
| Benefit icons | Fit strip and reassurance icons | **Meets** | |
| Three-step diagrams | Fit guide "How to measure" (3 numbered steps) | **Partial** | Numbered text steps, not an illustrated diagram |
| Customer-video prompts | "Your turn" participation prompt on the story page | **Meets** | |
| Listicle: reason headings, matching images, scanability, onward action | Listicle | **Meets** | |
| Images showing results are claims | Photos are AI-generated stand-ins, labelled in `web/public/hats/README.md` | **Partial** | Must be replaced with real photography before launch |

## Body 7: Responsive layouts from reusable structure

| Requirement | Where | Status | Note |
|---|---|---|---|
| Containers, spacing, backgrounds, mobile stacking | `Container`, shared tokens, `src/components/lp/*` | **Meets** | Checked at 390 and 1440 wide: no horizontal overflow on any new page |
| Semantic headings, image loading, titles, descriptions, URLs | One H1 per page (checked), `generateMetadata`, next/image preload/lazy, readable URLs | **Meets** | |
| Reuse adjusted sections | `ProductOffer`, `StockList`, `ProofList`, `Faq`, `ClosingCta`, `StickyCta`, `OfferCard`, `ReasonBlock`, `AdLabel` shared across pages | **Meets** | The story page now reuses `ProductOffer` too |

## Body 8: Working purchase actions

| Requirement | Where | Status | Note |
|---|---|---|---|
| Buttons, variants, pricing and purchase path work | Browser tests: add from the offer, listicle, quiz result, PDP and bag | **Exceeds** | A Stripe test-card order of a Navy + Olive two-pack reduced Navy and Olive by exactly one each |
| The button adds the exact product, plan and price shown | Kit variant per pair; live Medusa prices; `source` on every add | **Meets** | |
| Selling plans (subscription vs one-time) | — | **N/A** | No subscriptions (Body 4 row) |

## Body 9: Measure and test a clear hypothesis

| Requirement | Where | Status | Note |
|---|---|---|---|
| Track conversion, bounce, scroll, CTA clicks, time on page | Funnels, bounce rate KPI, `$pageleave` (time and max scroll), `cta_click` labels | **Meets** | |
| Test headlines, offers, CTAs, hero visuals, proof | Headline tests on the story and offer pages | **Partial** | Only headlines are under test so far |
| State the change and expected effect before testing | Experiment record: hypothesis, audience, change, primary funnel | **Meets** | |
| Presell clicks vs purchases answer different questions | `page_type` + `advertorial_*` labels vs `order_completed` | **Meets** | |
| Sample size depends on baseline and effect, not a fixed threshold | Minimum 100 exposures per variant + two-proportion z-test | **Partial** | The fixed minimum is the kind of heuristic the essay warns about; no power calculation yet |

## Body 10: Reuse learning with evidence discipline

| Requirement | Where | Status | Note |
|---|---|---|---|
| Record audience, claim, offer, structure, conditions, result | Experiment records; `page-map.md`; SITE_SPEC §12 | **Meets** | |
| Keep a control | The first variant of every experiment is the control | **Meets** | |
| A swipe file isn't proof | Teardowns state "patterns, not proof"; evidence counts cited, not conversion claims | **Meets** | |

## The essay's corrections and limits

| Limit | How Shelby respects it | Status |
|---|---|---|
| Practitioner guidance; performance claims unverified | Docs cite it as guidance; no conversion lift is claimed anywhere | **Meets** |
| Materials come from one creator; don't count links as independent confirmation | Our teardowns and report are separate sources; the essay is cited once | **Meets** |
| Page categories overlap: describe the function | `page-map.md` gives each page one job and one metric | **Meets** |
| Tool specifics (Replo plans, publishing routes) change | Not applicable: Medusa + Next.js; functions mapped instead | **Meets** |

## What it takes to move the Partial rows to Meets

1. Real photography (Body 6).
2. The first real comments, reviews and return reasons, captured as observed language (Body 1, 3, 5).
3. Confirming the two-pack price against margin (Body 4).
4. Testing beyond headlines: offer structure, hero image, proof placement (Body 9).
5. A sample-size calculator from baseline and minimum detectable effect, replacing the fixed 100 (Body 9).
6. An illustrated measuring diagram on the fit guide (Body 6).
