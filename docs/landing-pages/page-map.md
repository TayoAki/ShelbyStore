# Page map: traffic → page → job → metric

The essay maps each page type to one job and one kind of visitor (Body 2), and treats the mapping
as a starting hypothesis, not a rule (Body 2 D). This is Shelby's map. Every event carries
`page_type`, so each row's metric can be read in Admin → Analytics by splitting funnels on
`page_type` (or on the first page of the session).

| Visitor | Awareness | Page type | Shelby URL | The page's one job | Success metric (primary → secondary) |
|---|---|---|---|---|---|
| Organic, branded, returning | Knows Shelby | Homepage | `/` | Introduce the brand, show the core cap and price, route by shape | Click into a PDP / shape → purchase |
| Evaluating or ready to buy one hat | Product-aware | Product page | `/products/[handle]` | Explain the hat, answer fit, enable the exact purchase | `add_to_cart` (page_type pdp) → `order_completed` |
| Warm: retargeting, email, PDP and bag links | Most-aware | Offer page | `/offer/everyday-two-pack` | Present one focused deal: two caps for $68 | `add_to_cart` (page_type offer) → `order_completed`; AOV |
| Cold, curious, less informed | Problem- or unaware | Listicle | `/reasons/everyday-cap` | Educate through six checkable reasons | Onward `#buy` clicks and adds (source listicle) → purchase |
| Cold paid traffic that needs belief | Problem-aware | Advertorial (labelled) | `/read/one-cap` | Tell the story: why caps fail, what we changed, how we check | Onward clicks (`advertorial_*` labels) → purchase by first-touch advertorial visitors |
| Content-series viewers (TikTok) | Problem-aware, knows the episode | Story page | `/stories/crush-test` | Continue the episode's promise with the test and an offer | `story_shop` clicks → purchase |
| Undecided about shape, colour or size | Solution-aware | Quiz → result | `/quiz` → `/quiz/result` | Turn four answers into one match | `quiz_completed` / `quiz_started`; adds with source quiz → purchase |
| Launch traffic | Varies | Drop page | `/drops/[handle]` | Announce a release with a real date | `notify_me_submitted`; launch-day purchases |

## Routing rules

- **Content episodes** set `landing_path` to any of these pages (Admin → Content). The episode's
  tracked link carries `?asset=`, and the continuity banner on every page names the episode.
- **Cold offer traffic is a test, not the default.** The essay's sources disagree on sending cold
  traffic to offer pages (Body 2 B). Shelby sends cold traffic to the listicle, advertorial or story
  page first, and tests the offer page against them before using it cold.
- **One change at a time.** New pages launch against a control: the offer page runs
  `offer-headline`; the story page runs `story-headline`. Compare like-for-like audiences and devices
  (Body 9 D).

## Entry points on the site

| Page | Linked from |
|---|---|
| Offer | Everyday Cap PDP ("Get two for $68"), the bag when a single is in it, listicle, advertorial, quiz result |
| Listicle | Footer ("Why the Everyday Cap"), episode links, paid traffic |
| Advertorial | Paid traffic only (not in the nav: it's an ad) |
| Quiz | Home band, nav ("Fit quiz"), PDP fit row, fit guide, footer, offer FAQ |
