---
version: 1
slug: "web-src-app-page-tsx"
primary_target: "web/src/app/page.tsx"
related_targets: ["web/src/app/products/[handle]/page.tsx","web/src/app/shop/page.tsx"]
---

# Storefront: The Ball Box

## Scope and mode

The Shelby storefront in `web/`: home, shop, product page and the landing pages (offer, listicle, advertorial, story, quiz and result, The Card and hole pages, fit guide, custom) are **Persuade**; cart drawer, bag, checkout and order confirmation are **Operate** inside the same world.

## Audience, job, action

Everyday golfers aged 25–45 on a phone, usually arriving from a golf video. Job: decide whether this rope cap fits and looks right. Action: Add to bag (one $48 cap; The Pair and The Foursome as step-ups). Success: a first cap bought on a phone without fit doubt (user-confirmed).

## Proof and content

Real product facts only: mid crown about 11.5 cm against the tall crowns buyers complain about, one size 21.5–23.75 in, garment-washed cotton, four core colours, live stock counts, real release dates for numbered holes, 30-day returns, free standard shipping from $85. No reviews, ratings, customer counts or invented urgency (PRODUCT.md commitment).

## Constraints

Facts, prices, page set, URLs, checkout and tracking stay exactly as they are (user-confirmed): every `data-track` name, `page_type`, the `story-headline` and `offer-headline` experiments, attribution and continuity behaviour. The user found the previous restyle cluttered, weak in type and hierarchy, and the product did not shine; those are the failures this build must not repeat. Photos are the existing AI stand-ins in `web/public/hats/`.

## Direction contract

THESIS: The site is a golf-ball box. The cap is the model printed on the front panel, its measured spec runs down the side panel, numbered holes and the Pair and Foursome sleeves sit on the back. It refuses the category default: a lifestyle hero over a grid of product cards.

OWN-WORLD: Coated white paperboard ground, flat two-ink flexo print: navy ink as the base, each colourway's own ink (pine, fescue stone, clubhouse navy) carrying whole panels, one sleeve-red stripe reserved for numbered editions. Compressed bold caps for model names and every numeral; panels edged with heavy printed keylines and folds, photos seen only through die-cut windows. No cards, pills, tickers or marquees.

STORY: A golfer from a video sees the cap through the window, reads "Mid crown · 11.5 cm" as the model's spec, picks a colour that re-inks the panel, and adds it to the bag. Scrolling turns the box to its side panel (the crown drawn to true scale beside a 12 cm tall crown, the spec table) and back panel (holes, the Pair and Foursome as two- and four-cap sleeves).

FIRST VIEWPORT: Phone: the front panel fills the screen. The die-cut window holds the selected colour's photo at about half the height; the model name in compressed caps; the spec line; four ink stripes are the colour control; $48 and Add to bag printed at the panel's foot, visible without scrolling. Desktop: front and side panels open side by side as one flattened box, Add to bag on the front panel.

FORM: Golf-ball sleeve and dozen-box packaging, number 3 of 7 on the ordered list. seed:276be53ebed84d06. Signature interaction: choosing a colour re-inks the panel and swaps the window photo on one shared beat; scrolling turns the box from front to side panel. Raised from the declined challengers: real numbers in fixed digit slots; measurements at true scale; one rope line through the reading order; one motion beat; colours and holes as numbered units on one keylined plate.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

The colour stripe re-inks the whole front panel and the window shows that cap: the box changes colour in your hand.

## Unresolved

Direction chosen by the roll after the user declined the decision question; the Yardage Book and the category standard remain available on request. Prices and the free-shipping threshold are demo values pending confirmation; the brand name is pending a trademark search.
