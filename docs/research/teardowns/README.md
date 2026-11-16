# Store UI teardowns: what top DTC apparel stores agree on

**Purpose:** evidence for Shelby's own `SITE_SPEC.md`. We studied these stores to learn patterns, **not to copy them**. No brand's copy, imagery, logo or exact look should be reproduced.

**Method:** Phase 1 and 2 of the site-clone workflow (deep scrape, then an exhaustive spec), adapted for research. No Firecrawl key was available, so pages were rendered in real Chromium with Playwright, plus raw HTML/CSS via curl.

- Each site was captured as a logged-out US visitor on 2026-11-15, at **mobile 390×844** (iPhone 13 profile) and **desktop 1440×900**.
- Pages: homepage, one collection (tees or the brand's core category), and one product page (a tee or signature basic). That's about 7 page loads per site, with no retries against bot protection.
- Tokens are `getComputedStyle` readings of rendered elements: fonts, sizes, colors, button boxes, radii, grid columns and gaps, image ratios.
- Patterns come from DOM checks plus a visual review of every screenshot. The pinned buy bar was re-checked with a scroll probe.

**Caveats:**
- Capture fell in the **Black Friday / holiday season**, so promotional density is higher than usual on Gymshark, Cuts, Comfrt and SKIMS.
- Each page was sampled once. LCP is unthrottled from a datacenter, so treat it as directional only.

## Coverage

| Site | File | Status | Model |
|---|---|---|---|
| Gymshark | [gymshark.md](gymshark.md) | ✅ | performance, promo-heavy |
| Represent | [representclo.md](representclo.md) | ✅ (home below the hero, body text not measurable) | capsules, collabs, pre-order |
| Vuori | [vuoriclothing.md](vuoriclothing.md) | ✅ (collection grid client-rendered, not measured) | core styles + limited colors |
| Buck Mason | [buckmason.md](buckmason.md) | ✅ | premium American basics |
| Cuts | [cutsclothing.md](cutsclothing.md) | ✅ | signature tee + seasonal colors |
| Taylor Stitch | [taylorstitch.md](taylorstitch.md) | ✅ (email modal covered the mobile pinned-CTA probe) | durable staples + limited runs |
| SKIMS | [skims.md](skims.md) | ✅ | classic shades + limited drops |
| Kith | [kith.md](kith.md) | ✅ | drop/collab calendar |
| Elwood | [elwoodclothing.md](elwoodclothing.md) | ✅ | core tee + collection drops (the playbook's brand) |
| Aimé Leon Dore | [aimeleondore.md](aimeleondore.md) | ✅ | luxury, film-led, collabs |
| Comfrt | [comfrt.md](comfrt.md) | ✅ | hero hoodie, core + limited colors, VIP club |
| True Classic | [trueclassictees.md](trueclassictees.md) | ❌ blocked (Cloudflare 429 challenge) | — |
| Melin (hats, added 2026-11-16) | [melin.md](melin.md) | ✅ | performance caps; core / seasonal / limited colours |
| Goorin Bros (hats, added 2026-11-16) | [goorin.md](goorin.md) | ✅ | character truckers + heritage hats; weekly numbered drop |

**11 of 12 sites captured.** Counts below are out of 11 unless a cell could not be measured (then "n/10" etc.).

The two hat stores were added when Shelby moved to hats and are **not** in the 11-site matrix below; the hat spec cites them as **[MG]** (`web/SITE_SPEC.md`). Each file ends with its own "take / avoid" list.

## Pattern matrix

GS Gymshark · RP Represent · VU Vuori · BM Buck Mason · CU Cuts · TS Taylor Stitch · SK SKIMS · KI Kith · EL Elwood · AL Aimé Leon Dore · CO Comfrt.
✓ present · ✗ absent · ~ partial · — not measured.

| Pattern | GS | RP | VU | BM | CU | TS | SK | KI | EL | AL | CO | Count |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Header & nav** | | | | | | | | | | | | |
| Sticky / fixed header | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **11/11** |
| Logo centered on mobile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | **10/11** |
| Transparent header over home hero | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | 6/11 |
| Header hides on scroll down, returns on scroll up | ✗ | ✓ | ~ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | 3/11 (+1) |
| Promotional announcement bar | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ~ | ✓ | 7/11 |
| Free-shipping threshold / free-returns promise shown | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ~ | ✓ | **8/11** |
| **Homepage** | | | | | | | | | | | | |
| Hero = campaign or collection story (not a sale) | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | 7/11 |
| Video in hero | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | 3/11 |
| Product carousel / grid on home | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | 8/10 |
| Category tiles on home | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | 5/11 |
| Lookbook / journal / film link | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | 5/11 |
| Loyalty or membership surfaced | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | 6/11 |
| Email-capture modal or tab on first visit | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | 5/11 |
| **Collection** | | | | | | | | | | | | |
| 2 columns on mobile | ✓ | ✓ | — | ✗ (1) | ✓ | ✗ (1) | ✓ | ✓ | ✓ | ✓ | ✓ | **8/10** |
| 4 columns on desktop | ✓ | ✓ | — | ✗ (3) | ✗ (3) | ✗ (3) | ✓ | ✓ | ✓ | ✓ | ✓ | 7/10 |
| Portrait 3:4 or 4:5 product images | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✗ (1:1) | ✗ (2:3) | ✓ | ✓ | **8/11** |
| Second image on hover/swipe | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | — | ✗ | 6/9 |
| Status badge on cards (New / New color / Pre-order / Limited / % off) | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | **8/10** |
| Swatches or "N colors" on cards | ✗ | ✓ | — | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | 4/10 |
| Quick add on cards | ✗ | ✗ | — | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | 4/10 |
| Filter / sort behind a button or drawer on mobile | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **10/10** |
| Product count shown | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | 7/10 |
| Model / flat-lay image toggle | ✗ | ✓ | — | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | 2/10 |
| **Product page** | | | | | | | | | | | | |
| Full-width swipe gallery on mobile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **11/11** |
| Size buttons (not a dropdown) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | **10/11** |
| Size-guide link at the size row | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | **10/11** |
| Fit descriptor or a dedicated fit section | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **10/11** |
| Model caption (height / size worn) | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | 5/11 |
| Fit consensus from reviews ("true to size", fit scale) | ✓ | ✗ | ✓ | ✗ | ✓ | ~ | ✗ | ✗ | ✗ | ✗ | ✓ | 4/11 (+1) |
| Size-finder tool | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ✓ | ✗ | ✓ | 3/11 |
| CTA reads "Select size" until a size is chosen | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | 6/11 |
| Pinned buy bar on mobile after scrolling | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ ¹ | ✓ | ✗ | ✗ | ✓ | ✓ | **7/11** |
| Near-black primary CTA | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (blue) | ~ (outline) | ~ (grey) | ✓ | ✓ | ✗ (pink) | 7/11 (+2) |
| CTA corner radius ≤ 2px | ✓ | ✓ | ✓ | ✓ | ✗ (pill) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | **9/11** |
| Uppercase CTA label | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **8/11** |
| Shipping / returns / guarantee reassurance at the CTA or in a PDP section | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **10/11** |
| Buy-now-pay-later line near the price or CTA | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | 7/11 |
| Product reviews on the PDP | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ~ | ✗ | ✓ | 5/11 (+1) |
| Rating summary next to the title | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | 5/11 |
| Outfit cross-sell ("complete the look", "pair it with", "style with") | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | **8/11** |
| Add to cart inline from recommendations | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | 3/11 |
| Details in accordions or tabs | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **10/11** |
| Each colorway has its own URL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | 9/11 |
| Multi-buy or bundle pricing | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | 2/11 |
| Live social-proof counter ("N viewed today") | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | 1/11 |
| AI shopping assistant or AI review summary | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | 1/11 |
| **Core vs drops** | | | | | | | | | | | | |
| **Core / staple vs limited / seasonal color groups on the PDP** | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | **5/11** ² |
| "New / New color / Just dropped / Limited edition / Pre-order" labels | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ | ✓ | ✓ | **8/11** |
| Drop-framed signup ("never miss a drop", first dibs, app early access) | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | 3/11 |
| Release blocks with "Shop" + lookbook | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | 6/11 |
| Pre-order with a stated ship date | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | 1/11 |
| Per-customer purchase limit | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | 1/11 |
| **Countdown timer visible** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **0/11** |

¹ Not detected; an email modal covered the page during the probe.
² 5 of the 6 brands whose model is core-plus-limited colors (Cuts, Elwood, SKIMS, Vuori, Comfrt). Taylor Stitch labels limited items on cards instead.

## Token comparison

| Site | Display type | UI / body font | Body px (mobile) | Text | Surface | Primary CTA (bg / text) | CTA h (mobile) | CTA radius | CTA case | Grid m / d | Image ratio | Font source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Gymshark | custom heavy condensed | SN Skandia | 14 | `#0d1012` | `#f4f5f6` | `#0d1012` / `#fff` | 54 | 0 | Sentence | 2 / 4 | 4:5 | self-hosted |
| Represent | grotesk (single family) | STK Bureau | — | `#000000` | — | black / white | — | 0 | UPPER | 2 / 4 | 3:4 | self-hosted + Adobe |
| Vuori | grotesk (single family) | Aktiv Grotesk | 15 | `#333333` | `#f8f8f8` | `#333333` / `#fff` | 44 | 2px | Sentence | — | 4:5 | Adobe |
| Buck Mason | condensed sans, UPPER | Acumin Pro | 12–15 | `#333333` | `#f3f1ef` | `#333333` / `#fff` | 51 | 1px | UPPER | 1 / 3 | 3:4 | Adobe + Google (mono) |
| Cuts | **serif**, light | Untitled Sans | 14 | `#222222` | `#fafaf9` | `#0c0a09` / `#fff` | 44 | pill | Sentence | 2 / 3 | 3:4 | self-hosted |
| Taylor Stitch | **serif**, light + mono labels | National 2 | 14 | `#0f2130` | `#f2f2f2` | `#4573a7` / `#fff` | 54 | 0 | UPPER +1.6px | 1 / 3 | 4:5 | self-hosted + Adobe + Google |
| SKIMS | heavy display, UPPER | Inter | 12 | `#2d2a26` | `#faf8f5` | outline `#787572` | 52 | 2px | UPPER | 2 / 4 | ≈2:3 | self-hosted + Google |
| Kith | **serif** (Georgia) titles | Proxima Nova | 12 | `#333333` | `#f2f2f2` | `#828282` (pre-size) | 41 | 0 | UPPER +1.2px | 2 / 4 | 1:1 | Adobe |
| Elwood | system Helvetica, bold UPPER | Helvetica | 12 | `#000000` | `#dcdedf` (image bg) | `#000` / `#fff` | 38 | 0 | UPPER | 2 / 4 | 2:3 | system |
| Aimé Leon Dore | grotesk (single family) | Söhne + DIN | 10 | `#181818` | `#f7f7f7` | `#181818` / `#fff` | 40 | 0 | UPPER +1px | 2 / 4 | 4:5 | Bunny + self-hosted |
| Comfrt | system bold | system / Arial | 14–16 | `#1a1a1a` | `#f5f4f1` | `#f9d2ee` / `#000` | 47 | 4.4px | UPPER | 2 / 4 | 3:4 | system |

**Ranges:**
- **Body text:** 10–16px on mobile, with 8 of 10 measured sites at 12–15px. Line-height ≈1.4–1.6.
- **Product titles:** 10–42px. Luxury brands go tiny (Aimé Leon Dore 10–12px); editorial serif brands go big (Taylor Stitch 42px). The median is about 18–20px.
- **Primary CTA:** 38–54px tall on mobile (median ≈46px). Radius is 0 on 6 sites, 1–2px on 3, 4.4px on one, and a pill on one.
- **Text color:** near-black but softened. `#333333` appears 3×; others are `#0d1012`, `#181818`, `#222222`, warm `#2d2a26` and navy `#0f2130`. Pure `#000` appears only on Elwood, Represent and Comfrt.
- **Page background:** always white, plus **one light neutral surface**. It's either warm (`#f3f1ef`, `#fafaf9`, `#faf8f5`, `#f5f4f1`) or cool (`#f2f2f2`, `#f4f5f6`, `#f7f7f7`, `#f8f8f8`).
- **Fonts:** every site uses a sans for UI. Three add a **serif display** for an editorial or premium feel (Cuts, Taylor Stitch, Kith). Four use a **heavy or condensed display** (Gymshark, SKIMS, Buck Mason, Elwood). Two add **mono** accents (Taylor Stitch, Buck Mason). Two ship **system fonts only** (Elwood, Comfrt) and still read as premium because their photography is consistent.
- **Grid:** 2 columns on mobile (8 of 10) and 4 on desktop (7 of 10). Sites with fewer products and an editorial tone (Buck Mason, Taylor Stitch) use 1 / 3.
- **Image ratio:** portrait 4:5 or 3:4 on 8 of 11 sites. Grid gaps run 1–20px between columns and 30–40px between rows.

**Performance (directional):**
- Mobile PDP LCP was 0.3–2.5s (median ≈1.3s).
- Mobile home LCP was 0.9–4.7s. The slowest were homes with a video or film hero (Vuori 4.4s, Aimé Leon Dore 4.5s) or heavy merchandising (Comfrt 4.7s).

## Where the best ones agree

1. **Mobile product pages share one skeleton.** A full-width swipe gallery (11/11) sits over title and price, then color, then size buttons (10/11) with a size-guide link on the size row (10/11). The CTA follows, then reassurance (10/11), then details in accordions (10/11).
2. **Size confidence comes from several sources.** Every site has a fit descriptor or fit section (10/11). Model height and size worn (5/11) and review-based fit consensus or fit scales (4–5/11) back it up. Three sites add a size finder.
3. **The CTA reflects state.** It reads "Select size" until a size is chosen (6/11), and stays reachable through a pinned mobile buy bar (7/11). Comfrt even puts the price and "in stock, ready to ship" into the button label.
4. **Reassurance sits at the decision point.** That means a free-shipping threshold or free returns in the announcement bar (8/11), a shipping/returns/guarantee block at the CTA (10/11), and a BNPL line (7/11).
5. **Shapes and colors stay restrained.** CTAs have near-square corners (9/11) and are mostly near-black (7/11); labels are mostly uppercase (8/11). Pages use white plus one neutral surface (11/11) and a sans UI (11/11). Personality comes from photography and one display face, not from the components.
6. **Collection grids converge.** Two columns on mobile and four on desktop, portrait images, a status badge on cards ("New color", "Pre-order", "Limited") on 8/10, and filters behind a drawer button (10/10).
7. **Outfit cross-sell is standard on the PDP** (8/11). The strongest versions let you add an item without leaving the page (SKIMS, Elwood, Comfrt).
8. **Core-plus-drop brands label the split.** "Core / Staple / Classic" colors are grouped apart from "Limited / Seasonal" colors on the same PDP at Cuts, Elwood, SKIMS, Vuori and Comfrt. Each colorway usually has its own URL (9/11), so a drop color is a linkable page.
9. **Drops are announced with labels, signups and editorial, never timers.** No site shows a countdown (0/11). Instead they use "New color", "Just dropped" and "Limited edition" labels (8/11) and drop-framed signups (SKIMS' "never miss a drop", Comfrt's members-first access, Cuts' app early access). Six sites give a release a campaign block with "shop" plus a lookbook (Kith, Aimé Leon Dore, Buck Mason, Taylor Stitch, Elwood, Represent).
10. **The header is sticky on every site,** with the logo centered on mobile (10/11). Six sites float it transparently over a campaign hero on the homepage.

## Where they differ

- **Reviews.** Performance and high-volume brands put ratings next to the title and add fit-segmented review filters (Gymshark, Vuori, Cuts, Comfrt, Taylor Stitch). Luxury and drop brands show none (Kith, Aimé Leon Dore, Represent, Buck Mason).
- **Promotional density.** Gymshark, Comfrt and Cuts use promo marquees, discount badges and sale heroes. Aimé Leon Dore, Kith and Buck Mason use no promo bar, or only a single promise line.
- **Homepage model.** Some stack campaigns (Kith, Aimé Leon Dore, Buck Mason). Others are dense with merchandising (Gymshark, Cuts, Comfrt).
- **Typography strategy.**
  - Serif editorial: Cuts, Taylor Stitch, Kith.
  - Heavy display: Gymshark, SKIMS.
  - One neutral grotesk: Vuori, Aimé Leon Dore, Represent.
  - System fonts: Elwood, Comfrt.
- **CTA color.** Near-black is the norm. The exceptions use a brand color: Taylor Stitch blue `#4573a7` and Comfrt pink `#f9d2ee`.
- **Desktop gallery.**
  - Two-column image grid: Gymshark, Vuori, Cuts, Taylor Stitch, Comfrt, Elwood.
  - Single stacked column: Buck Mason.
  - Thumbnail rail beside a main image: Kith.
  - Main image with thumbnails: SKIMS.
  - Carousel with arrows: Represent.
  - Single centered image: Aimé Leon Dore.

## Not measured / known gaps

- True Classic: blocked.
- Vuori collection grid: client-rendered skeletons.
- Represent: homepage below the hero, and body-text sampling.
- Taylor Stitch: the pinned mobile CTA. The probe was covered by an email modal.
- SKIMS: whether PDP reviews exist further down the page.
- Hover and focus colors weren't systematically measured. Sold-out size styling was seen only where a size was actually out of stock (Taylor Stitch, Vuori).
- Every number reflects one logged-out US session in Black Friday season.

Raw data (screenshots, per-page JSON, scripts) stays in the session scratchpad and is not committed.
