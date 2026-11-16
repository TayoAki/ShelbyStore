# Analytics

Shelby runs its **own product analytics**, a small PostHog-style system built into the
Medusa backend. Every event lives in our Postgres database (`analytics_event`). Funnels,
trends, experiments and the playbook scorecards all read from it. No third party receives
event data.

| Tool | Role | Where |
|---|---|---|
| **First-party analytics** | Source of truth for events, funnels, experiments, and sessions per tracked link | `backend/src/modules/analytics`, Admin → Analytics |
| **Medusa orders** | Authoritative revenue. Order metadata carries the attribution. | `backend/` |
| **Umami** (optional) | A separate cookieless traffic dashboard. Nothing depends on it. | `umami` service on Railway |

## Events

| Event | Properties | Sent by |
|---|---|---|
| `$pageview` | `title`. Columns: `path`, `url` (with the query string), `referrer` | web (automatic: load + client navigation) |
| `$pageleave` | `time_on_page_ms`, `max_scroll_pct` | web (automatic: navigation, tab hidden, page hide) |
| `$screen` | `screen` | app (automatic) |
| `cta_click` | `label`, `text`, `href` | web: any element with `data-track="<label>"` |
| `$experiment_exposure` | `experiment`, `variant` | web: `<Exposure />` |
| `product_viewed` | `product_id`, `handle`, `release_id`? | web, app |
| `drop_viewed` | `release_id`, `handle`, `phase` | web, app |
| `add_to_cart` | `product_id`, `variant_id`, `quantity`, `price`, `currency`, `release_id`? | web, app |
| `checkout_started` | `cart_id`, `value`, `currency` | web, app |
| `notify_me_submitted` | `release_id` | web, app |
| `order_completed` | `order_id`, `value`, `currency`, `asset`, `release_id`, `utm_*`, `items[]` | **backend only** (`order.placed` subscriber), deduped by `$insert_id` |
| `release_live` | `release_id`, `handle`, `tier`, `title` | backend only |
| `offer_viewed` | `offer` | web: offer landing page |
| `listicle_viewed` | `listicle` | web: listicle |
| `advertorial_viewed` | `slug` | web: advertorial |
| `quiz_started` / `quiz_answered` | `step`, `question`, `answer` (answered) | web: `/quiz` |
| `quiz_completed` | `match`, `color`, `size`, `runner_up`, `use`, `fit`, `crown`, `colors` | web: quiz result |

Every web event also carries **`page_type`** (home, collection, pdp, offer, listicle, advertorial,
quiz, quiz_result, story, drops, fit_guide, cart, checkout, order, other), derived from the path,
so any funnel step can be filtered or broken down by the kind of page it happened on. `add_to_cart`
carries **`source`** when it happens outside the PDP (offer, listicle, story, quiz,
complete_the_look). See `docs/landing-pages/page-map.md` for each page type's success metric.

Every event row also has `distinct_id` (person), `session_id`, `occurred_at`, `asset`,
`utm_source/medium/campaign`, `device_type` (mobile/tablet/desktop/app/server) and
`platform` (web/app/server). Registered **super-properties** are merged into every later
event, for example `$exp_<experiment>: <variant>`.

Names must match `^[$a-z0-9_]{1,64}$`. `$`-prefixed names are automatic or system events.

## Identity and sessions

- **Web:** the person is the first-party cookie `_shelby_id` (1 year). `src/proxy.ts` sets it on
  the first request, so server-rendered experiments see it immediately. A session lives in
  `sessionStorage` and starts afresh after 30 minutes idle.
- **App:** the person is a device id in AsyncStorage. The session is held in memory with the
  same 30-minute rule.
- **Server:** `order_completed` uses the cart's `analytics_id` metadata, so a purchase joins the
  journey of the visitor who made it. Without one it falls back to `customer:<id>`, then
  `order:<id>`.

## Attribution

1. Each creative asset and content episode has an **asset key**, such as `tiktok-tryon`. Links
   use `?asset=<key>`.
2. The web store (proxy cookie `_shelby_attr`) and the app (AsyncStorage) keep
   `{ asset, release_id, utm_* }` for 7 days. The latest touch wins. Events carry it in the
   `asset`/`utm_*` columns.
3. The cart's `metadata` gets the same keys plus `analytics_id`. Medusa copies cart metadata
   onto the order. Attribution is cleared after an order.

## Ingestion

| Endpoint | Who |
|---|---|
| `POST /api/e` (storefront, same origin) | Browser. It batches up to 10 events, or every 2 seconds. The Next.js route forwards to Medusa with the publishable key and the visitor's user agent. |
| `POST /store/analytics/events` (Medusa) | The app directly, and the storefront proxy. Takes up to 50 events per batch, validated with zod. |
| `GET /store/analytics/experiments` | Running experiments (key, variants, weights) for assignment |

**Delivery is at-least-once, deduplicated:**
- Every client event carries a unique `$insert_id`.
- The web queue is mirrored to `sessionStorage`. Events leave it only after a 2xx response.
- When the page is hidden or left, the queue is also sent with `sendBeacon`. Anything unconfirmed is resent from the next page.
- A unique index on `$insert_id` (`INSERT … ON CONFLICT DO NOTHING`) drops the repeats.
- Verified locally: navigating away right after "add to bag" and closing the tab both keep every event, exactly once.

On the server:
- Events with bad names are dropped. Strings are length-limited, and properties are capped at 8 KB.
- Known bot and crawler user agents are dropped.
- Client clocks are corrected with the batch's `sent_at`, then clamped to the window from 7 days ago to 5 minutes ahead.
- **IP addresses are not stored.**

## Reading the data (Admin → Analytics)

- **Overview:**
  - Totals: visitors, sessions, pageviews, bounce rate (one view and no interaction), orders, revenue, orders per session.
  - A daily chart.
  - Top pages, with average time on page and scroll depth.
  - Tracked links (`?asset=`), with sessions, orders and revenue.
  - Devices and referrers.
- **Funnels.** Ordered steps, each an event plus optional property filters. The date range applies to the first step. The conversion window is counted from the first step. Results show per-step counts, step and overall conversion, and median time to convert, with an optional **breakdown** by `asset`, `utm_*`, `device_type`, `path`, `release_id` or `$exp_<key>`.
  - **Presets:**
    - Purchase: `product_viewed → add_to_cart → checkout_started → order_completed`
    - Social to purchase: tagged visit → `product_viewed → add_to_cart → order_completed`
    - Drop: `drop_viewed → product_viewed → add_to_cart → order_completed`
  - **How it's computed:** SQL CTEs `s1…sN`:
    - `s1` is each person's first matching event in range (`DISTINCT ON`), carrying the breakdown value.
    - `sK` is the first matching event at or after step K−1 and within `t1 + window`.
    - Counts are per person, in strict order. Medians use `percentile_cont`.
    - Every value is a bound parameter. Columns come from a whitelist, and property keys are bound through `properties ->> ?`.
- **Experiments:** see below.
- **Live events:** the latest 100 events, refreshed every 5 seconds.

Admin endpoints: `GET /admin/analytics/overview`, `POST /admin/analytics/funnel`,
`POST /admin/analytics/trends`, `GET /admin/analytics/events`, `GET /admin/analytics/schema`,
and `/admin/analytics/experiments[/:id[/status|/decision|/results]]`.

## Experiments (A/B tests and the experiment log)

The landing-page process the team follows is to test one hypothesis against a control and
keep a record. An experiment stores:
- the **hypothesis**, **audience** and **what changes**;
- the **variants**: the first is the control, each with a weight;
- the **primary metric**: funnel steps after exposure;
- a **minimum sample** per variant;
- the **decision** (ship / keep control / iterate) and **learnings**.

In the storefront:

```tsx
// Server component, inside <Suspense> (it reads the visitor cookie)
const variant = (await getVariant("hero-headline")) ?? "control"
return (
  <>
    <Exposure experiment="hero-headline" variant={variant} />
    {variant === "b" ? <HeadlineB /> : <HeadlineControl />}
  </>
)
```

- **Assignment** is deterministic per visitor: FNV-1a of `<key>:<_shelby_id>` mapped onto the
  weights. It's the same function in `web/src/lib/experiments.ts` and `backend/src/lib/analytics/assign.ts`.
- **`<Exposure />`** registers `$exp_<key>` and sends `$experiment_exposure` once per page.
- **Results** come from a funnel starting at exposure, broken down by variant: conversion, uplift
  versus control, and a two-proportion z-test p-value.
- **Verdict:** results stay **inconclusive** until every variant reaches the minimum sample, so
  there's no early winner. Treat significance as a signal, then check the result holds across
  devices and traffic sources.

## How the scorecards count

| Number | How |
|---|---|
| Orders and net sales per asset | Medusa orders whose `metadata.asset` equals the key, net of discounts, tax and received returns |
| **Landing sessions** per asset | Distinct sessions with a `$pageview`/`$screen` whose URL contains `asset=<key>` as a whole parameter |
| **Product-page sessions** per asset | Distinct sessions with `product_viewed` attributed to `<key>` |

Content-series episodes count sessions from each episode's publish date. Releases count from
their go-live time.

## Environment variables

| App | Variable | Purpose |
|---|---|---|
| backend | `STORE_TIMEZONE` (default `America/Los_Angeles`) | Day buckets in reports |
| backend | `STOREFRONT_URL` | Base URL for tracked links shown in the admin |
| web | `NEXT_PUBLIC_ANALYTICS_DISABLED=true` | Turn the tracker off |
| web | `NEXT_PUBLIC_UMAMI_URL`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Optional Umami dashboard |
| app | `EXPO_PUBLIC_ANALYTICS_DISABLED=true` | Turn the tracker off |
| app | `EXPO_PUBLIC_UMAMI_URL`, `EXPO_PUBLIC_UMAMI_WEBSITE_ID` | Optional Umami dashboard |

First-party analytics need no keys. Events reach the backend through the publishable key the
store already uses.

## The social-content playbook in the admin

**Admin → Content** runs the playbook's two-week pilot. The logic is in
`backend/src/lib/content-playbook`.

| Signal | Source |
|---|---|
| Attention (average % viewed) | Manual, from platform analytics. Read every post at the same age. |
| Participation (relevant comments + submissions, per 1,000 views once volume allows) | Manual |
| Business response | Automatic: tracked-link sessions from first-party analytics, plus orders and net sales from Medusa |
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

- `_shelby_id` is a first-party analytics cookie. It isn't shared with anyone, and no IP is stored.
- If you sell into regions that require consent for analytics cookies, set
  `NEXT_PUBLIC_ANALYTICS_DISABLED=true` until consent is given, or add a consent gate before
  `startAnalytics()`.
- Umami is cookieless and can keep running without consent.
