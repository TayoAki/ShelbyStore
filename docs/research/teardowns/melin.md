# Melin — teardown

**Captured:** 2026-11-16, as a logged-out US visitor, at mobile 390×844 (iPhone 13 profile) and desktop 1440×900. Values are `getComputedStyle` readings unless marked otherwise.

**Pages captured:**
- `/`
- `/collections/most-popular`
- `/products/a-game-icon-hydro-black-forest`, the signature A-Game Icon Hydro cap
- the cart drawer, after adding that cap in "Classic"
- `/pages/fit-guide`
- the desktop mega menus and the mobile menu

**Other sources:**
- Raw HTML, `main.css` and the Adobe Typekit CSS, fetched with curl using a desktop UA.
- One `/products.json?limit=250` read, used for the catalog and price sample.

**How it was captured:**
- Platform: Shopify, on a custom "Archipelago Brands Theme" (Alpine.js + Tailwind build).
- About 15 page loads. The first pass's scripted clicks (cart, menus) failed, so they were re-run with DOM clicks. There were no bot challenges.
- Screenshots and JSON stay in the session scratchpad and are not committed.

**Positioning:** "premium headwear", meaning performance caps.
- **Shapes:** about 10 silhouettes (A-Game, Odysea, Trenches, Coronado, Eagle, Compass, Legend, Pace, Caddy, Coast).
- **Fabrics:** each shape comes in technical fabric families (Hydro waterproof, Hydrolite, Thermal, Wax'd, VO2).
- **Colorways:** a long tail of colors, split into **Core / Seasonal / Limited**.
- **Collabs:** athletes, USC, Realtree.

**Caveats:**
- Holiday season: the announcement bar rotates a gift-guide message and a free cinch-sack offer, and the homepage carries a gift-guide banner.
- Each page was sampled once. LCP was measured unthrottled from a datacenter, so treat it as directional.

## Catalog sample (`products.json`, 250 products)

**Prices:**
- Adult caps are **$79 / $89 / $99**: the mode is $89 (110 products), then $79 (75) and $99 (50).
- Kids caps are $69.
- Accessories run $10–$49; a few cases go up to $200.
- Overall range $20–$200, median **$89**.

**Sizing:**
- **91% of products (228/250) sell in three sizes: Small / Classic / XL.**
- One-size codes: `OSM`, `O/S`, `OSK` (kids).

**Product types are fit families**, not garment types:
- Split Fit 73, Split Crushed Fit 66, Vintage Fit 41, Horizon Fit 33
- Performance Dad Hat 11, Beanie 9, Bucket Hat 4, Camper Fit 4

**Colorways:**
- **Every colorway is its own product and URL**: all 250 products carry the `split_color` tag, so the handle reads `a-game-icon-hydro-black-forest`.
- A median of **6 images per product** (range 2–7).

**Facet data lives in tags:**
- Activity: Water / Train / Everyday / Run / Golf
- Style: Classic / Modern
- Depth: shallow / mid
- Bill: Curved / Flat
- Structured / Unstructured, Snapback / Strapback
- Collection, shape, and gender

**Drop signals:**
- `limited-edition` on 120 of 250 products, `Seasonal` on 72, `best-seller` on 48.
- Season codes such as `HO26` and `FA26`.

## Design tokens

### Fonts

**Avenir LT Pro** comes from Adobe Typekit (kit `lsv5hvm`). The theme re-declares each weight as its own family name, always used at `font-weight: 400`:

| Family alias | Typekit file |
|---|---|
| `Avenir Book` | n3 |
| `Avenir Medium` | n5 |
| `Avenir Heavy` | n7 |
| `Avenir Black` | n8 |
| `Avenir Light` | n2 |

**Root variables (inline `:root`):**
- `--font-body-family: 'Avenir Book'`
- `--font-heading-family: 'Avenir Black'`
- `--font-subheading-family: 'Avenir Medium'`
- `--font-heading-georgia: 'Georgia-Pro'`, a self-hosted `GeorgiaPro-Regular.woff`. It is declared, but never seen rendering.

**System-font fallback:** some blocks fall back to Tailwind's `ui-sans-serif` system stack, including the PDP description, the size-button labels and the cart drawer body. That gives a mixed look.

### Colors

**Root variables:**
- Merchant override: `--color-primary:#000; --color-secondary:#fff; --color-tertiary:#e4e4e4; --color-light:#fff; --color-dark:#000; --color-body:#000`.
- An earlier base-theme block, overridden: `#e36662`, `#f8f1e3`, `#fcf9f3`, `#b0dfe1`, `#f1a407`.

| Role | Value |
|---|---|
| Text | `#000000` |
| Muted text (fit name, color name, subtitles) | `#726b67` / `#736b67` / `#77706c` (warm greys) |
| Segmented-control text | `#0e1311` |
| Page background | `#ffffff` |
| Tiles, cart drawer background, search pill | `#f5f5f5` |
| Lower PDP band (tech, recs) | `#f8f8f9` |
| Badges | `#ededed` |
| Add-on card | `#ececec` with a 1px `#dddddd` border |
| Toggle track, sort border, inactive carousel dashes | `#e4e4e4` |
| Style-pill border | `#eeeeee` |
| Announcement bar, footer, primary CTA | `#000000` |
| Review stars | `--reviews-star-color: #f1a307` |
| Shopify "Buy it now" | `#1990c6` |

### Type scale

| Use | Desktop | Mobile |
|---|---|---|
| Section H2 ("Browse By Style", "Shop By Color", "Gallery") | Avenir Black 22px/28.6px | same |
| Promo heading ("Find your Fit") | Avenir Black 26px/33.8px | 18px/23.4px |
| Collection title | Avenir Black 26px/39px, UPPERCASE, centered | — |
| Collection subtitle | Avenir Book 13px/15px `#77706c`, capitalize, ls −0.1px | — |
| Nav links | Avenir Black 12px, UPPERCASE, ls 0.25em (from the CSS rule) | — |
| Card title | Avenir Black 16px/24px (two lines allowed) | PDP recs 14.08px |
| Card price | Avenir Book 14px/21px, ls 0.4px, right-aligned beside the title | same |
| Card meta (color, collab or fit type) | Avenir Book 12px/18px `#726b67`, capitalize, ls 0.4px | same |
| Review count `(3306)` | Avenir Book 10px | same |
| Badge | Avenir Book 15px/22.5px | same |
| PDP title | UPPERCASE, about 18–20px, Avenir Book (sticky-bar copy: 18px/25px, ls −0.38px) | same |
| PDP subtitle (product type) | Avenir Book 13px/15px `#736b67` | same |
| PDP description | `ui-sans-serif` 16px/24px | same |
| PDP labels ("Color:", "Choose your Size") | Avenir Book 13px/19.5px | same |
| Perk title / body | Avenir Medium 14.08px / Avenir Book 12px | same |
| Fit-guide scale labels | Avenir Book 13px, UPPERCASE, ls 0.65px | same |
| Body (reviews, blog) | Avenir Book 16px/19.2px, ls −0.12px | same |
| Footer column headings | Avenir Medium 22px/24px, white | accordion |

### Shape and spacing

- **Containers:** 1220px on the PDP and collection (x=110, inner padding 21.328px), and 1280px elsewhere on the home page.
- **Fluid section padding:** 28.432 / 37.904 / 50.512px. These look like clamp/vw-based values.
- **Radii:**
  - buttons 3px
  - style tiles and pills 4px
  - add-on card 8px
  - sort dropdown 22px
  - segmented control and toggles 9999px
  - swatches 50%
  - badges and product images 0
- **Shadows:** essentially none. Separation comes from fills and 1px lines.

## Components

**Primary button:**
- `#000` fill, white text, 1px `#000` border, radius 3px.
- Avenir Black 14px, UPPERCASE, ls 1.3px, padding `0 18px`.
- Height: **39px** by default, **52px** for the PDP add to cart, **56px** for checkout (radius 0).

**Outline and "light" buttons:**
- Transparent with a black border (1px, or 2px on the hero and quiz CTA).
- Hover runs an ink-fill animation: a `:before` scales up from the center (`transform .4s ease-out`) and the text turns white.

**Text CTA:** "SHOP NOW" or "READ MORE" in Avenir Black 13px, UPPERCASE, ls 0.4px, underlined.

**Style pills:** 35px tall, 1px `#eeeeee` border, radius 4px, Avenir Book 13px, ls 1.3px, `min-width:85px`, gap 9px.

**Sort control:** a pill dropdown, 189×34, 1px `#e4e4e4` border, radius 22px, reading "Sort By | Please Select ▾".

**Badges:** `#ededed` fill, 15px Avenir Book, padding `4px 8px`, radius 0, top-left on the image. Values seen: **Limited, Popular, Seasonal**.

**Segmented control (PDP colors: All / Core / Seasonal / Limited):**
- 4 items, each 92×41, Avenir Book 13px, capitalize.
- The active item is a black pill (radius 9999px) with white text; inactive items are white with `#0e1311` text.

**Swatches:**
- 42px circles (1px transparent border, 1px padding) in a 7-column grid with a 9px gap.
- The selected swatch gets a black ring. Half-and-half circles show two-tone caps.

**Size buttons (Small / Classic / XL):**
- Three across, each 117×48 on desktop and 110×48 on mobile, radius 3px.
- Labels are UPPERCASE `ui-sans-serif` 16px.
- The selected size is filled black. The default selection on load is **Small**.

**Add-on card:**
- `#ececec` fill, 1px `#dddddd` border, radius 8px, padding 16px.
- A checkbox, a 72px image, the title and the price. Example: a 3-hat travel case at $49.

**Sticky buy bar (PDP):**
- Fixed **at the top, under the header** (`top:61px`) on both desktop and mobile, 97px tall, white.
- Contents: title, subtitle and rating on the left; thumbnail, price, color and a 39px "ADD TO CART" on the right.

**Cart drawer:**
- A right slide-in `<dialog>`, 500px wide on desktop and full screen on mobile, `#f5f5f5` background.
- Header: a bag icon with "Your Bag".
- **Free-shipping progress bar:** "You're $41 Away From FREE Shipping!", with a milestone track running from "Free Exchanges" to "Free Shipping".
- **Line item:** a white panel with a 128px image, stars and count, "Color / Size", a pill qty stepper and a remove ×.
- **"Complete Your Kit":** a carousel (Rebuy) of $10–$49 accessories with 30px black "ADD" buttons.
- **Summary:** a "Free Exchanges FREE" line, the summary total and a full-width **CHECKOUT** (black, 56px, radius 0).
- Below checkout: a BNPL line (Shop Pay / Afterpay) and the trust strip "FREE SHIPPING ON ORDERS $120+ – FREE EXCHANGES – PERFECT FIT PROMISE".

## Header and navigation

**Announcement bar:**
- Black, 36px, white 14.08px text.
- It **rotates 4 messages:** free shipping on $120+, free and easy returns and exchanges, the holiday cinch-sack offer, and the gift guide.

**Desktop header (61px, white, sticky):**
- Logo on the left; nav centered.
- **Nav items:** FEATURED · SHOP · COLLECTIONS · FIT QUIZ · EXPLORE · MELIN RE:CAP.
- A search pill whose **placeholder rotates suggestions** ("hydro", "golf", "coronado", "XL").
- Icons: **Previously Viewed** (an eye with a count badge, which opens a recently-viewed drawer), account, and bag.

**Mega menus** are image tiles, one per entry:

| Menu | Tiles |
|---|---|
| FEATURED | Gifts · New Arrivals · Most Popular · Signature Collabs · Accessories · Gift Cards · Shop Featured |
| SHOP | **10 shapes** (A-Game … Beanies) with cut-out hat photos, plus Shop All |
| COLLECTIONS | **10 fabric or capsule lines** (Hydro, Thermal, Mill, VO2, Adventure Club, Hydrolite, Links, MPH, Gum, Neon) |
| EXPLORE | Company and story links plus 3 images |

**Mobile header:**
- 121px: a logo row (hamburger · logo · eye · account · bag) plus a full-width search row.
- **It condenses to 61px on scroll down and expands again on scroll up.**
- The menu is a full-width drawer of the same image-tile groups.

**Other:** no transparent-over-hero header, and no email popup within the first ~13s on either viewport.

## Homepage (desktop order; mobile follows the same order)

1. **Hero.** Full bleed, 1440×810 (mobile has its own 390×521 image).
   - A grey studio shot of a white cap, with a manifesto headline and an outlined "SHOP NOW".
   - **The headline and button are part of the image.** No DOM text was found, and the page has **no H1**.
2. **Browse By Style.**
   - A 22px H2, then a horizontal row of **10 shape tiles**: 133×153, `#f5f5f5`, radius 4px.
   - Each tile has a 91px cut-out cap and an UPPERCASE 13px Avenir Black label.
   - On mobile the tiles become a 2-column grid of 187×207.
3. **Seasonal campaign banner.** Full-bleed lifestyle image, 1440×720, with its text in the image.
4. **Find your Fit.** A 50/50 split.
   - Left: a looping video of a cap.
   - Right: a seal graphic, a 26px heading, short copy, and an outlined **TAKE THE QUIZ** button (228×56, 2px border).
5. **Shop By Color.**
   - 4 tiles at 335×447 (3:4): Black, Blue, Green and Brown.
   - Each tile shows a cap on a tonal background of its own color, with a white letter-spaced label. It becomes a carousel on mobile.
6. **Featured In.** A press-logo strip (4 publications), rendered as one image on `#f5f5f5`.
7. **See What People Are Saying.** 4 review cards, each with:
   - product name (16px Avenir Medium), fit family (13px muted), stars and count;
   - a 292px square customer photo;
   - an excerpt, the reviewer's first name, and a "SHOP NOW" link.
8. **About Us.** A full-bleed split landscape image with its text in the image.
9. **Blog.** 2 posts, each with:
   - a 335×251 image;
   - "BLOG | date" meta and a 16px Avenir Black title;
   - an excerpt and an outlined READ MORE (136×39).
10. **Instagram (@melin).** A carousel of 355px square tiles.
11. **Join the family.** A 22px UPPERCASE heading over the 10%-off-first-order line, then two black buttons with icons: "SIGN UP FOR EMAILS" and "SIGN UP FOR TEXTS".
12. **Footer.** Black.
    - Three groups: Get melin, Customer Service, Our Company. Headings are 22px Avenir Medium, links 13px white.
    - Legal row on the right. The groups become accordions on mobile.

## Collection (`/collections/most-popular`)

**Top of page:**
- A centered UPPERCASE title, 26px, with a subtitle.
- A centered row of **style pills** (View All + 10 shapes), then a 1px divider.

**Desktop layout:**
- **Left sidebar, 263px:**
  - the Sort By pill
  - accordion facets with 14px UPPERCASE headings (ls 1.4px)
  - **Size:** Small / Classic / XL boxes
  - **Color:** 32px circle swatches with 12px labels, 4 per row
  - **Shape:** checkboxes
- **Above the grid, on the right:** a **"Product | View on Model" toggle**, a 181×28 pill on a `#e4e4e4` track.

**Grid:**
- **4 columns** on desktop: 197px cards with about 29px gaps.
- **2 columns** on mobile: 171px images.
- Numbered pagination.

**Card:**
- **Square 1:1** product-on-white image, with no tinted tile behind it.
- A **6-image swipe carousel** inside each card, with dash indicators (21×4px; active `#000`, inactive `#e4e4e4`).
- Badge top-left.
- **Desktop hover:** the second (on-model) image shows, and a white **"+ QUICK ADD"** bar appears over the bottom of the image.
- **Mobile:** a **bag-plus quick-add icon** sits top-right of every image.
- Text block: title (16px Black) with the price (14px) on the same row; then color name, collab or product type, and stars with count.

**Mobile filters:** a "Filter + Sort" pill (radius 9999px, 1px black border) opens a full-screen drawer. It has a grey title bar and holds Sort plus the Size, Color and Shape accordions.

## Product page (A-Game Icon Hydro, $79)

**Desktop layout:** a 1220px container.
- **Gallery** (740px wide): a **2-column grid of 362px squares** with a 16px gap.
  - 6 images: 3/4 front, **on-model** (grey studio, in slot 2), front, side, back, underside.
  - The badge sits on image 1.
  - A 16:9 founder video (740×417) follows below the grid.
- **Info column:** 370px wide.

**Info column, in order:**
1. UPPERCASE title, with the price on the right.
2. Product-type subtitle, with stars and count (1,214) on the right.
3. Breadcrumb (Shop All > Hats & Headwear > Curved Bill Hats), 12px.
4. A 4-line description, then a divider.
5. **Color group control: All / Core / Seasonal / Limited.**
6. "Color: Black Forest", then the swatch grid (18 colorways).
7. "Choose your Size", with an underlined **Size Guide** link on the right; then Small / Classic / XL.
8. **POPULAR ADD ONS** (18px bold UPPERCASE), with a checkbox add-on card.
9. **Add to cart row:**
   - "ADD TO CART – LOW INVENTORY" (322×52). **The low-stock warning is appended inside the CTA label.**
   - A heart (wishlist) icon beside it.
   - A full-width blue "Buy it now" (Shopify dynamic checkout, 44px).
10. SKU line (13px), then a **green dot with "In stock, ready to ship!"** (14px Avenir Black).
11. BNPL: "4 interest-free payments of $17.25 with Shop Pay or Afterpay".
12. A promo image banner (the free holiday gift).
13. **Perks list**: 5 rows, each with a 48px line icon, a title and one line of detail:
    - **Free Shipping** (over $120; most orders ship within 1 business day from Southern California)
    - **Free & Easy Exchanges** (30 days)
    - **Limited Lifetime Warranty** (guaranteed 2 years)
    - **Perfect Fit Promise** ("if it doesn't become your favorite hat, send it back, no questions asked")
    - **Product Care**
14. **Fit Guide** (18px): two horizontal scale bars.
    - **Depth:** Shallow · Mid · Deep. The fill shows where this shape sits.
    - **Breathability:** Low · Medium · High.

**Full-width bands below the gallery and info column** (`#f8f8f9` background):
- **Technology & Features:**
  - 3 image cards (378px wide) with overlaid white text: Materials, Details, Innovation.
  - **8 feature icons:** Breathable, Hidden Besom Pocket, Moisture-Wicking Lining, Antimicrobial, Durable, Lightweight, Floatable, Water Friendly.
- **Gallery:** lifestyle photos.
- **You May Also Like:** a carousel (Rebuy, lazy-loaded).
- **Previously Viewed.**
- **Reviews & Questions** (reviews.io):
  - Summary: a 4.86 score (26px) "Based on 1,214 reviews", plus **Overall Fit (Small–True–Large), Quality and Value sliders**.
  - A customer-photo strip and **AI "Review Highlights"** tabs: Fit / Quality / Design / Comfort / Customer Service.
  - Sort, search, and Product Reviews / Questions tabs.
  - Each review shows its own Quality, Value and Fit sliders, plus the variant bought (for example "Black Forest / Classic").
  - Numbered pagination (151 pages).
- Then the newsletter block and the footer.

**Sticky buy bar:** pinned under the header once the main CTA scrolls away, on both viewports.

**Mobile:**
- **Gallery:** a full-width swipe gallery of 347px squares with dash indicators, a heart icon on the image, and a **"PLAY ▶" pill** that opens the video.
- **Buy box:** the same order as desktop. Size buttons are 110×48 and the CTA is 347×52.
- **Description:** moves below the perks list.

## Fit system (the most hat-specific pattern)

**Three sizes everywhere: Small / Classic / XL.**
- For A-Game, circumference is **Small 56.5–58.5cm · Classic 59–61.5cm · XL 61–63cm**.
- Depth and visor width vary by shape.

**Fit guide page (`/pages/fit-guide`):**
1. A dark intro banner.
2. A row of **10 shape cards**, each with a line-drawing icon, the name, a one-line description and "LEARN MORE".
3. One module per shape, each with:
   - a description, a product photo and "SHOP [SHAPE]";
   - **three measurement cards with diagrams: Depth (or crown height), Circumference, Visor width**;
   - a table giving each card's value for Small, Classic and XL in cm.

**Shape vocabulary:** Melin describes each shape by:
- depth: shallow, mid or deep
- visor: curved or flat, and narrow, medium or wide
- structure: structured, mid-structured, unstructured or "crushable"
- a reference style: trucker, rope hat, dad hat, ball cap

**Other fit help:**
- **Fit quiz** at `/collections/fit-finder`, linked from the nav and the homepage. Not visited.
- **Perfect Fit Promise** plus free exchanges, stated on the PDP, in the cart and in the footer.
- **Review fit slider:** Small–True–Large.

## Drops, core and merchandising

**Core and drop split:**
- **Core / Seasonal / Limited** appears both as PDP color groups and as card badges ("Popular" marks best-sellers).
- Limited colors and collabs (athlete, university, Realtree) sit under the same shape PDP; each still has its own URL.
- Season-coded capsules (Mill, VO2, Neon, Gum) appear as tiles in the COLLECTIONS menu.
- No countdowns, waitlists or "drops on" dates were seen. Scarcity shows up as "Low inventory" in the CTA and as Limited badges.

**Order-value levers:**
- The **free-shipping threshold ($120) sits above any single hat ($79–$99)**.
- A cart progress bar shows how far you are from it.
- **$10–$49 accessory add-ons** (sticker pack, ball markers, travel cases) appear on the PDP and in the cart to bridge the gap.
- Gift cards and a gift guide.

**Other levers:**
- **Loyalty:** a "melin Family" rewards launcher (Rivo), a circular logo button fixed bottom-left.
- **Email and SMS:** 10% off the first order. Capture sits in the footer block and the side launchers, not in a timed popup.
- **Military / first-responder program:** GovX ID verification.

## Third-party integrations (script hosts seen)

| Area | Tools seen |
|---|---|
| Reviews | **reviews.io** (fit / quality / value sliders, photo reviews, AI highlights) |
| Recommendations and upsells | **Rebuy** (PDP add-ons, cart "Complete Your Kit", You May Also Like) |
| Email and SMS | **Klaviyo**, **Postscript**; Retention.com and LiveIntent for identity |
| Loyalty | **Rivo** ("melin Family") |
| Price and A/B tests | **Intelligems** |
| International | **Global-e** |
| Returns, shipping protection, tracking | Redo, Corso, AfterShip/Automizely |
| Payments | Shop Pay installments, **Afterpay** |
| Fraud | Forter, NoFraud |
| Support | Sierra (AI agent chat) |
| Analytics and session replay | GTM, Microsoft Clarity, first-party **Jitsu** and **mParticle** endpoints, Noibu (error monitoring) |
| Ad pixels | Meta, TikTok, Pinterest, Bing, AppLovin, Xandr |
| Affiliates and creators | ShopMy, Fondue |
| Accessibility | EqualWeb overlay |
| Verification | GovX ID |

## Performance (directional)

| Page | Desktop LCP | Mobile LCP |
|---|---|---|
| Home | 2.0s | 2.4s |
| Collection | 3.1s | 2.8s |
| PDP | 3.2s | 3.2s |

Pages make **365–441 resource requests** each, with over 40 third-party script hosts.

## Not measured / gaps

- The fit quiz (`/collections/fit-finder`) and "MELIN RE:CAP" were not visited.
- **Not computed:**
  - unselected size-button border color (drawn by a pseudo-element)
  - swatch selected-ring width
  - header bottom-border hex
- The footer was read from screenshots; its DOM measurement failed.
- Hover color states were taken from CSS rules, not measured, except for the outline button's ink fill.
- The mobile collection grid gap was not measured.
- Hero, campaign, press and "About Us" text is baked into images, so it has no typography values.

## What Shelby should take / avoid

**Take:**

1. **Organize by shape first.** Navigation tiles, the "Browse By Style" row and the collection pills all lead with the silhouette. Fabric or capsule comes second; color is a third way in ("Shop By Color" tiles). For Shelby: name the core cap shape, and give each drop its own capsule.
2. **Make fit explicit.**
   - Use a short size set (Melin uses Small / Classic / XL) with a cm table per shape: circumference, crown depth, visor width.
   - Add a depth bar on the PDP.
   - Back it with a fit promise and free exchanges.
   - Hats carry less fit risk than tees; this is how Melin removes the rest.
3. **Group colors as Core / Seasonal / Limited on the PDP**, with matching Limited / Seasonal badges on cards. This maps one-to-one onto Shelby's core-plus-drops model and its existing release module.
4. **Give each colorway its own URL,** so a drop color is a shareable, trackable page (which fits the `?asset=` attribution).
5. **Shoot every color the same way: square product-on-white images.** Use the same 6 angles (3/4, front, side, back, underside, on-model) and add a "Product | On model" toggle on the collection.
6. **Set the free-shipping threshold above one hat's price.** Pair it with a cart progress bar and low-ticket add-ons ($10–$49) on the PDP and in the cart to lift order value.
7. **Use structured review sliders** (Fit: Small–True–Large, Quality, Value) plus customer photos.
8. **Keep the buy box readable at a glance:**
   - a sticky buy bar;
   - low stock shown inside the CTA label;
   - a green-dot "In stock, ready to ship" line;
   - a 5-row icon perks list (shipping, exchanges, warranty, fit promise, care) at the decision point.

**Avoid:**

1. **Text baked into hero and banner images.** Melin's home has no H1 and its PDP title is not a heading, so copy can't be A/B-tested, read by screen readers or indexed. Shelby's story and experiment pages need live text.
2. **Third-party sprawl.** More than 40 script hosts and about 400 requests per page give a 3.2s PDP LCP. Shelby's first-party analytics and lean stack is an advantage to keep.
3. **Mixed font stacks** (Avenir plus a system `ui-sans-serif` fallback in the description and size labels). Also, Avenir LT Pro and Georgia Pro are licensed Adobe fonts, so pick an open or licensed family of our own.
4. **Too many colorways per shape.** 18+ colors on one PDP suits Melin's scale. Shelby should keep the core to about 4–6 colors plus one limited drop at a time.
5. **A competing second CTA color** (the blue "Buy it now" next to the black add to cart), and stacked promo banners in the buy box.
