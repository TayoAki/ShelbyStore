# Ecommerce UX evidence for Shelby's storefront

Researched 2026-11-15. Each row runs finding → statistic → source → what Shelby should do. **Grade** is how much weight the evidence can bear:

- **A**: independent, large-sample research or a randomized field experiment
- **B**: a research firm's benchmark or survey (Baymard, NN/g, Contentsquare)
- **C**: vendor or commissioned data, a single A/B test, or a self-reported figure. Directional only.

## 1. Context: who arrives, and on what device

| Finding | Statistic | Grade | Source | Shelby implication |
|---|---|---|---|---|
| Mobile carries most traffic | Mobile is **69.9%** of traffic | B | [Contentsquare 2026 benchmark](https://contentsquare.com/en/guides/digital-experience-benchmark/conversions/) | Design for a 390px screen first. Social-video traffic is almost entirely mobile. |
| Mobile converts worse | Desktop conversion is **74% higher** than mobile. Retail desktop CR is 3.7% | B | [Contentsquare](https://contentsquare.com/en/guides/digital-experience-benchmark/conversions/), [retail](https://contentsquare.com/guides/retail-digital-experience/conversions/) | The mobile gap is the opportunity. Every friction fix below is a mobile fix. |
| Preventable mobile issues cause abandonment | **63%** of mobile users abandoned a product or site at least once purely because of preventable usability issues | B | [Baymard mobile](https://baymard.com/research-articles/mobile-commerce-design) | Run a phone check before each release (playbook SOP 4, "mobile product page"). |

## 2. Speed

| Finding | Statistic | Grade | Source | Shelby implication |
|---|---|---|---|---|
| Small speed gains convert | A **0.1s** faster mobile site gave **+8.4%** retail conversion and **+9.2%** AOV (37 brands, Google-commissioned) | A/B | [Deloitte "Milliseconds Make Millions"](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html) | Set a performance budget: server-rendered pages, optimized images, minimal client JS. |
| Slow pages lose visits | **53%** of mobile visits are abandoned if load takes more than 3s. Going from 1s to 7s load raises bounce probability by **113%** | B | [Think with Google](https://thinkwithgoogle.com/consumer-insights/consumer-trends/mobile-site-load-time-statistics/) | Drop and episode landing pages need to be fast at peak traffic: static or ISR, with a CDN. |

## 3. Navigation and homepage (mobile)

| Finding | Statistic | Grade | Source | Shelby implication |
|---|---|---|---|---|
| Hidden navigation is used less | Hidden nav cuts discoverability by **more than 20%**. On mobile, navigation was used in **57%** of cases when hidden versus **86%** with combo (partly visible) nav. Tasks were 15% slower with hidden nav on mobile. n=179 | B | [NN/g, Hamburger Menus](https://www.nngroup.com/articles/hamburger-menus/) | With 4 or fewer top-level destinations, show them as visible links rather than only in a hamburger. Shelby has about 3–4 (Core, Drops, Shop, Bag), so they fit. |
| Mobile homepages run long | Mobile homepages stretch to **5–10+ viewports**, against 2–3 on desktop | B | [Baymard mobile](https://baymard.com/research-articles/mobile-commerce-design) | Keep the homepage to a few strong blocks (live drop, core, upcoming) with in-page links. |

## 4. Product page

| Finding | Statistic | Grade | Source | Shelby implication |
|---|---|---|---|---|
| Images come first | **56%** of users' first action on a PDP is exploring images | B | [Baymard](https://baymard.com/research-articles/product-images-descriptive-text) | Put a full-width, swipeable gallery first. Lead with on-body shots. |
| Users judge size from images | **42%** try to judge size from images. **37%** of sites lack "in scale" images and **23%** lack human-model images | B | [Baymard PDP benchmark](https://baymard.com/research-articles/current-state-ecommerce-product-page-ux) | Include on-model shots and state the model's height and size ("Model is 6'1", wearing M"). |
| Size buttons beat dropdowns | **57%** of sites don't use buttons for size selection | B | [Baymard PDP benchmark](https://baymard.com/research-articles/current-state-ecommerce-product-page-ux), [size buttons](https://baymard.com/research-articles/use-buttons-for-size-selection) | Show every size as a button, with availability visible at a glance. |
| Most apparel sites lack sizing info | **83%** of desktop and **87%** of mobile apparel sites don't provide enough sizing info (2022 benchmark) | B | [Baymard apparel sizing](https://baymard.com/research-articles/apparel-size-information) | Put a size guide link next to the size buttons, with measurements and the core tee's fit notes. |
| Fit is what review readers want | **48%** of apparel shoppers look for size and fit details in reviews, ahead of quality (43%). n=1,922, 2026 | B | [Baymard apparel 2026](https://baymard.com/research-articles/apparel-and-accessories-quantitative-ux-insights-2026) | When reviews arrive, add an aggregate "fit" subscore (runs small / true / large). |
| Reviews lift purchase | Five reviews make purchase **270%** more likely than none. Purchase likelihood peaks at a **4.2–4.5** rating | A/B | [Spiegel Research Center](https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales) | Ask core-tee buyers for reviews. Don't hide or curate negative ones. |
| UGC engagement correlates with conversion | Shoppers who engage with UGC on best-in-class sites showed a **137%** conversion lift. This is correlational | C | [Bazaarvoice SEI 2019](https://www.bazaarvoice.com/press/bazaarvoice-report-shoppers-crave-connection-and-conversation-with-brands-and-retailers) | Feature customer photos and series submissions (the Tuan Le "participation" loop). |
| Returns info is expected on the PDP | **60%** look for the return policy on the PDP, **44%** of sites don't link it, and **15%** abandoned an order over the return policy | B | [Baymard PDP benchmark](https://baymard.com/research-articles/current-state-ecommerce-product-page-ux) | Put one line under the CTA: "Free returns within 30 days · Ships in 1–2 days". |
| Total cost is often missing | **67%** of sites don't estimate total cost near the buy section | B | [Baymard PDP benchmark](https://baymard.com/research-articles/current-state-ecommerce-product-page-ux) | Show shipping cost or the free-shipping threshold next to the price or CTA. |
| Product video lifts apparel sales | A randomized field experiment at a US apparel retailer found video gave **+14.5%** apparel sales and **+28.3%** accessory sales | A | [Kumar & Tan, Management Science 2015](https://pubsonline.informs.org/doi/fpi/10.1287/mnsc.2014.2086) | Make the gallery slot 1 or 2 a short try-on or "proof" clip, the same footage as the social episode. |
| Vendor video claims run higher | Shoppable video gave a **+21%** median lift, **+24%** in apparel (n=148 PDPs) | C | [idukki](https://idukki.io/blog/shoppable-video-vs-photography.md) | Treat as an upper bound and verify in Shelby's own analytics. |
| Sticky add-to-cart is unproven | No Baymard study found. Vendor A/B tests conflict: one mobile bottom bar gave −7.7% CR but +6.8% ATC, another +6.5% CR | C | [Cleancommit tests](https://cleancommit.io/ab-tests/mobile-bottom-sticky-add-to-cart-button/) | Use a sticky CTA only after a size is chosen, or test it. Don't assume it wins. |

## 5. Stock, sold-out sizes and scarcity

| Finding | Statistic | Grade | Source | Shelby implication |
|---|---|---|---|---|
| Users learn too late that their size is gone | **39%** found their size unavailable only on the PDP, after browsing the list | B | [Baymard out-of-stock](https://baymard.com/research-articles/handling-out-of-stock-products) | Show size availability on product cards (a size strip) and add a size filter. |
| Sites block orders for out-of-stock items | **68%** of sites don't allow orders for temporarily out-of-stock items. "Email me when in stock" shouldn't be the main strategy | B | [Baymard out-of-stock](https://baymard.com/research-articles/handling-out-of-stock-products) | For the core, show a restock date or allow backorder, since "always in stock" is the brand promise. For drops, sold-out is real and should say so plainly. |
| Honest low-stock disclosure helps | A field experiment with **840k+** customers found low-availability warnings raised revenue per customer by **+5.3%** and order frequency by **+4.9%**. Shoppers were 25% *less* likely to buy the low item and read it as a reliability signal | A | [Mitrofanov & Knight (BC/Instacart), Management Science](https://phys.org/news/2022-12-stock-consumers.html) | Show accurate stock per size ("Only 3 left in L"). Never fake it. Trust is the mechanism. |
| Single-store test of stock counts | Showing stock counts at 5 or fewer units gave **+11.61%** CR (21 days, 15,956 sessions) | C | [OuterBox / Paul Evans](https://outerboxdesign.com/frontend/pe-inventoryurgencytest-casestudy.pdf) | Consistent with the row above. Use a low-stock threshold of about 5. |
| Scarcity suits limited items | Scarcity messages work best for unique or limited-edition items | B | [ASU W. P. Carey (Park, Rabinovich, Yin)](https://news.wpcarey.asu.edu/20200327-%E2%80%98only-2-left-stock-order-now%E2%80%99-does-it-work) | Use scarcity copy on drops, not on the core. |

## 6. Drops and launches

The evidence here is weak, so treat these as principles rather than proven lifts.

| Finding | Statistic | Grade | Source | Shelby implication |
|---|---|---|---|---|
| Countdown timers aren't reliably persuasive | A US sample (n=3,777) found a 60-second timer not effective. Vendor tests are mixed, and fake or resetting timers erode trust | B/C | [CBS on Luguri & Strahilevitz](https://www.cbsnews.com/news/manipulative-advertising-technology-dark-patterns/), [Cleancommit review](https://cleancommit.io/blog/do-countdown-timers-work/) | Use a countdown only as real release-time information ("Drops Thu 10am PT"), never as pressure. |
| A predictable cadence builds habit | Kith releases every Monday at 11am ET | Precedent | [kith.com](https://kith.com/collections/kith-monday-program/sneakers) | Pick a fixed drop day and time so the calendar becomes a reason to return (Elwood playbook). |
| Pre-orders can carry real revenue | Taylor Stitch Workshop is about **11%** of revenue, with more than 95% of styles produced | C | [MakerSights](https://makersights.com/case-study/taylor-stitch-case-study) | "Notify me" also measures demand. Show the signup count to the team, not to shoppers. |

## 7. Product list (collection)

| Finding | Statistic | Grade | Source | Shelby implication |
|---|---|---|---|---|
| Quick views help apparel | Quick views help for visual products such as apparel. Baymard cautions against add-to-cart buttons directly on list items | B | [Baymard quick views](https://baymard.com/research-articles/ecommerce-quick-views) | With a small catalog, link cards straight to the PDP. Add a size-aware quick add only if tested. |
| Multi-select filters | **14%** of sites don't allow multiple filter values | B | [Baymard filters](https://baymard.com/research-articles/allow-applying-of-multiple-filter-values) | Filters stay minimal (size, color) and multi-select. |

## 8. Cart and checkout

| Finding | Statistic | Grade | Source | Shelby implication |
|---|---|---|---|---|
| Most carts are abandoned | Average documented cart abandonment is **70.22%** (50 studies) | B | [Baymard](https://baymard.com/lists/cart-abandonment-rate) | Instrument every step in PostHog. Recover with email. |
| Why shoppers abandon | Extra costs **40%**, slow delivery **20%**, didn't trust site with card **19%**, forced account **18%**, long checkout **17%**, errors **17%**, returns **13%**, couldn't see total **12%**, not enough payment methods **9%** | B | [Baymard](https://baymard.com/lists/cart-abandonment-rate) | Show shipping early, guest checkout by default, delivery estimate, trust and returns line, express pay. |
| Checkouts have too many fields | The average checkout has **23.48** form elements against an ideal of **12–14**. Better checkout design could lift conversion by **35.26%** | B | [Baymard](https://baymard.com/lists/cart-abandonment-rate) | Use one page, address autocomplete, and skip optional fields such as company and phone. |
| Guest checkout is often buried | About **62%** of sites don't make guest checkout the most prominent option (editions range 47–65%) | B | [Baymard guest checkout](https://baymard.com/research-articles/make-guest-checkout-prominent) | Default to guest. Offer an account after purchase. |
| Apple Pay lifts conversion | A holdback test found Apple Pay gave **+22.3%** conversion and +22.5% revenue on average. Placing it early in an express checkout gave about **2x** | B/C | [Stripe, Apr 2025](https://stripe.com/blog/testing-the-conversion-impact-of-50-plus-global-payment-methods) | Put express wallets at the top of checkout and on the PDP when Stripe is wired up. |
| Shop Pay claims a lift | Up to **+50%** vs guest checkout (a ceiling, not an average) | C | [Shopify](https://www.shopify.com/enterprise/blog/shopify-checkout) | Not applicable to Medusa. Use it only as context for express-pay value. |

## 9. Social-commerce landing (short-form video traffic)

| Finding | Statistic | Grade | Source | Shelby implication |
|---|---|---|---|---|
| Discovery turns into purchase | **58%** of people who discovered a small business on TikTok Shop later bought from it (GlobalData survey of 6,000, commissioned by TikTok) | C | [Modern Retail, May 2026](https://www.modernretail.co/operations/tiktok-shop-says-sales-from-u-s-small-businesses-climbed-66-in-2025/) | Social discovery converts when the landing page continues the video. |
| Creator links drive buying | **46%** buy via TikTok Shop when a creator links the product (survey) | C | [PartnerCentric](https://partnercentric.com/tiktok-shop-trends-statistics/) | Give each content episode its own tracked link (`?asset=`) to a landing page that opens on the same proof. |
| Video lifts apparel sales | See §4 | A | Kumar & Tan 2015 | Lead episode and drop pages with the clip, then the product and sizes above the fold. |

## Design rules this implies (strongest evidence first)

1. Mobile-first, fast pages (Deloitte, Google, Contentsquare).
2. A gallery-first PDP with on-model images, model size stated, and a try-on clip (Baymard 56% and 42%, Kumar & Tan).
3. Size buttons showing availability, plus a size guide link beside them (Baymard 57% and 83–87%).
4. Accurate per-size stock: "Only N left" at 5 or fewer, never faked (Instacart field experiment).
5. Shipping cost or threshold, delivery estimate and returns line next to the CTA (Baymard 40%, 60% and 67%).
6. Size availability on product cards and a size filter (Baymard 39%).
7. Visible top-level navigation, as there are 4 or fewer destinations (NN/g).
8. Guest checkout by default, a short one-page form and express wallets (Baymard 18%, 23.48 vs 12–14, 62%; Stripe +22.3%).
9. Reviews with a fit subscore once volume exists (Spiegel 270%, Baymard 48%).
10. Drops use a fixed calendar and an honest countdown. No fake timers (Kith precedent, Luguri & Strahilevitz).
11. Every social episode gets a tracked landing page that opens on the same proof (TikTok surveys; the Tuan Le playbook).
12. Sticky add-to-cart and quick add are unproven. A/B test them rather than assume.

## Sources

- Baymard: [cart abandonment](https://baymard.com/lists/cart-abandonment-rate) · [PDP benchmark](https://baymard.com/research-articles/current-state-ecommerce-product-page-ux) · [mobile](https://baymard.com/research-articles/mobile-commerce-design) · [product images](https://baymard.com/research-articles/product-images-descriptive-text) · [size buttons](https://baymard.com/research-articles/use-buttons-for-size-selection) · [apparel sizing](https://baymard.com/research-articles/apparel-size-information) · [apparel 2026](https://baymard.com/research-articles/apparel-and-accessories-quantitative-ux-insights-2026) · [out-of-stock](https://baymard.com/research-articles/handling-out-of-stock-products) · [quick views](https://baymard.com/research-articles/ecommerce-quick-views) · [filters](https://baymard.com/research-articles/allow-applying-of-multiple-filter-values) · [guest checkout](https://baymard.com/research-articles/make-guest-checkout-prominent)
- [NN/g: hamburger menus](https://www.nngroup.com/articles/hamburger-menus/)
- [Contentsquare 2026 benchmark](https://contentsquare.com/en/guides/digital-experience-benchmark/conversions/) · [retail conversions](https://contentsquare.com/guides/retail-digital-experience/conversions/)
- [Deloitte: Milliseconds Make Millions](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html) · [Think with Google: mobile load time](https://thinkwithgoogle.com/consumer-insights/consumer-trends/mobile-site-load-time-statistics/)
- [Spiegel Research Center: online reviews](https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales) · [Bazaarvoice SEI](https://www.bazaarvoice.com/press/bazaarvoice-report-shoppers-crave-connection-and-conversation-with-brands-and-retailers)
- [Kumar & Tan 2015, Management Science](https://pubsonline.informs.org/doi/fpi/10.1287/mnsc.2014.2086) · [idukki shoppable video](https://idukki.io/blog/shoppable-video-vs-photography.md)
- [Phys.org: Mitrofanov & Knight low-stock experiment](https://phys.org/news/2022-12-stock-consumers.html) · [OuterBox inventory urgency test](https://outerboxdesign.com/frontend/pe-inventoryurgencytest-casestudy.pdf) · [ASU W. P. Carey: scarcity](https://news.wpcarey.asu.edu/20200327-%E2%80%98only-2-left-stock-order-now%E2%80%99-does-it-work)
- [CBS: dark patterns study](https://www.cbsnews.com/news/manipulative-advertising-technology-dark-patterns/) · [Cleancommit: countdown timers](https://cleancommit.io/blog/do-countdown-timers-work/) · [Cleancommit: sticky ATC](https://cleancommit.io/ab-tests/mobile-bottom-sticky-add-to-cart-button/)
- [Stripe: 50+ payment methods test](https://stripe.com/blog/testing-the-conversion-impact-of-50-plus-global-payment-methods) · [Shopify checkout](https://www.shopify.com/enterprise/blog/shopify-checkout)
- [Modern Retail: TikTok Shop small business](https://www.modernretail.co/operations/tiktok-shop-says-sales-from-u-s-small-businesses-climbed-66-in-2025/) · [PartnerCentric: TikTok Shop stats](https://partnercentric.com/tiktok-shop-trends-statistics/)
- [Kith Monday Program](https://kith.com/collections/kith-monday-program/sneakers) · [MakerSights: Taylor Stitch](https://makersights.com/case-study/taylor-stitch-case-study)
