# Analytics

This page is the source of truth for event names, properties and attribution. The web
storefront (`web/`), the app (`mobile/`) and the backend (`backend/`) all follow it.

| Tool | Role | Where |
|---|---|---|
| **Medusa** | The authoritative record of orders and revenue. Order metadata carries the attribution. | `backend/` |
| **Umami** (self-hosted) | Cookieless web analytics. Answers "how many sessions came through this tagged link?" | `umami` service on Railway |
| **PostHog** (self-hosted or Cloud) | Product analytics: funnels, paths, retention, feature flags | `POSTHOG_*` / `*_POSTHOG_*` env |

Each integration is a no-op until its variables are set.

## Events

| Event | Properties | Sent by |
|---|---|---|
| page / screen view | `$current_url` / path. Keep the query string so `?asset=` landings are countable. | web, app (automatic) |
| `product_viewed` | `product_id`, `handle`, `release_id`?, `asset`? | web, app |
| `drop_viewed` | `release_id`, `handle`, `phase` (`live` / `upcoming` / `past`) | web, app |
| `add_to_cart` | `product_id`, `variant_id`, `quantity`, `price`, `currency`, `release_id`?, `asset`? | web, app |
| `checkout_started` | `cart_id`, `value`, `currency` | web, app |
| `notify_me_submitted` | `release_id` | web, app |
| `order_completed` | `order_id`, `value`, `currency`, `asset`, `release_id`, `utm_source/medium/campaign`, `items[]` (`product_id`, `variant_id`, `sku`, `title`, `quantity`, `price`) | **backend only** (`order.placed` subscriber); dedupe key `$insert_id = order_completed:<order_id>` |
| `release_live` | `release_id`, `handle`, `tier`, `title` | backend only |

Clients never send `order_completed`. The server event is the one revenue reports use.

**On every client event, when known:** `asset`, `release_id`, `utm_source`, `utm_medium`, `utm_campaign`.

## Attribution

1. Every creative asset and every content episode has an **asset key**, for example `tiktok-tryon`
   or `wash-test-2`. Links use `?asset=<key>`:
   - Web: `https://<store>/products/everyday-tee?asset=wash-test-2`
   - App: `shelby://drops/vintage-wash?asset=tiktok-tryon`
2. The client stores `{ asset, release_id, utm_* }` for **7 days**. The latest touch wins.
3. The client writes these keys into **cart metadata**. Medusa copies cart metadata onto the order.

| Cart / order metadata key | Value |
|---|---|
| `asset` | The asset key |
| `release_id` | The live release the product belongs to |
| `utm_source`, `utm_medium`, `utm_campaign` | From the landing URL |
| `analytics_id` | The client's PostHog distinct id, so the server's `order_completed` joins that visitor's journey |

4. After an order completes, the client clears the stored attribution so it isn't counted twice.

## How the scorecards count

| Number | Source | How |
|---|---|---|
| Orders and net sales per asset | Medusa | Orders whose `metadata.asset` equals the key, net of discounts, tax and received returns |
| **Landing sessions** per asset | Umami `GET /api/websites/:id/stats?query=c.asset=<key>` | Distinct sessions with a pageview whose URL query contains `asset=<key>` |
| **Product-page sessions** per asset (the playbook's "tagged product-page sessions") | Umami `GET /api/websites/:id/sessions?event=product_viewed&epf0=1.eq.asset.<key>` → `count` | Distinct sessions that fired `product_viewed` with `asset=<key>`. Attribution persists, so a shopper who lands on a drop page and then opens a product still counts. |

Umami's `stats` endpoint ignores custom events, so it can't answer the second question. The
`sessions` endpoint can. Both were verified against a local Umami 3.5.0 with synthetic traffic.

Content-series episodes count sessions from each episode's publish date. Releases count from
their go-live time.

## Client setup

### Web (`web/`)

```html
<script defer src="https://<umami>/script.js" data-website-id="<id>"></script>
```

- Don't set `data-exclude-search`. Landing counts need the query string.
- Custom events: `umami.track("product_viewed", { product_id, handle, asset, release_id })`.
- PostHog: `posthog.init(KEY, { api_host: HOST })`. Read `posthog.get_distinct_id()` into cart
  metadata as `analytics_id`.
- Env: `NEXT_PUBLIC_UMAMI_URL`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_POSTHOG_KEY`,
  `NEXT_PUBLIC_POSTHOG_HOST`.

### App (`mobile/src/lib/analytics.ts`)

- PostHog via `posthog-react-native`. Umami via `POST /api/send`.
- Env: `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`, `EXPO_PUBLIC_UMAMI_URL`,
  `EXPO_PUBLIC_UMAMI_WEBSITE_ID`.
- Umami rejects bot-like User-Agents, including React Native's default `okhttp/x` on Android.
  The app sends a browser-style UA ending in `ShelbyApp/<version>`.
- Each request carries a per-device `id` (the PostHog distinct id), so phones behind the same
  carrier IP count as separate sessions. Without it, Umami merges them.

### Backend

| Variable | Purpose |
|---|---|
| `POSTHOG_API_KEY`, `POSTHOG_HOST` | Server-side capture |
| `UMAMI_URL`, `UMAMI_WEBSITE_ID`, `UMAMI_USERNAME`, `UMAMI_PASSWORD` | Read access. Use a view-only user. For Umami Cloud, set `UMAMI_API_KEY` instead. |
| `STOREFRONT_URL` | Base URL for the tracked links shown in the admin |

## The social-content playbook in the admin

**Admin → Content** runs the playbook's two-week pilot. The full logic lives in
`backend/src/lib/content-playbook`.

| Signal | Source |
|---|---|
| Attention (average % viewed) | Manual, from platform analytics. Read every post at the same age. |
| Participation (relevant comments + submissions, per 1,000 views once volume allows) | Manual |
| Business response | Automatic: tracked-link sessions from Umami, plus orders and net sales from Medusa |
| Production effort | Manual: hours per episode against the series budget |

The recommendation follows the playbook's rule:

- **Pause** if the stance fails the competitor-swap test or has no proof, or if episodes run over the time budget.
- **Revise**, and say where the response drops off:
  - the **opening**, if attention falls
  - the **topic or prompt**, if few episodes draw participation
  - the **booking path**, if people engage but don't buy
- **Continue** otherwise.

Every review notes that four posts are too few to judge whether the series has built a community.

## Privacy

Umami is cookieless. PostHog stores an anonymous id in local storage or cookies by default.
If you sell into regions that require consent, gate `posthog.init` behind consent, or use
`persistence: "memory"` until consent is given. Umami can keep running without consent.
