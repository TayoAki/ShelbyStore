# Railway infrastructure

`railway.ts` describes the Shelby project on Railway with
[Infrastructure as Code](https://docs.railway.com/infrastructure-as-code).
(Railway deprecated `railway.json` / `railway.toml`, and new services can't use them.)

```bash
npm install                 # installs the `railway` SDK at the repo root
npm run railway:check       # typecheck this file
railway login && railway link
railway config plan         # preview
railway config apply        # apply
```

## Live deployment

The Railway project **shelby-store** runs from branch `claude/compassionate-johnson-q9ktyq`. It
was created with the Railway MCP tools, with the same settings as `railway.ts`.

| Service | URL |
|---|---|
| storefront | https://storefront-production-af7bf49b.up.railway.app |
| medusa (API + admin at `/app`) | https://medusa-production-77bb307e.up.railway.app |
| umami | https://umami-production-76da48be.up.railway.app |
| worker, Postgres, Postgres-nPRT (Umami's), Redis, `media` bucket | private |

Secrets (JWT/cookie, admin password, Stripe keys, Umami app secret) live only in Railway
variables, never in git. `SEED_DEMO_DATA=true` seeds the demo catalog. Set it to `false` before
loading real products.

Known gaps:
- **No Stripe webhook yet.** The Stripe test account has hit its limit of 16 webhook endpoints.
  Card checkout doesn't need one, because payment is confirmed in the browser and captured
  when the order is placed. Free a slot, add
  `https://<medusa domain>/hooks/payment/stripe_stripe` (events `payment_intent.*`), and set
  `STRIPE_WEBHOOK_SECRET` on medusa and worker.
- **The worker can boot before migrations.** The server runs migrations in its pre-deploy step.
  On a deploy that adds tables, the worker can start first and run with failed modules. Restart
  the worker after such a deploy until it waits for migrations itself.

First deploy checklist:

1. Set `JWT_SECRET` and `COOKIE_SECRET` on **medusa** and **worker** (the same value on both).
2. Generate a public domain for **medusa**; `MEDUSA_BACKEND_URL` and the CORS
   variables resolve from it.
3. Create the first admin user: `railway ssh -s medusa` then
   `cd .medusa/server && npx medusa user -e you@example.com -p <password>`.
4. Optional: seed demo data with `npx medusa exec ./src/scripts/seed.js`, or create
   the region, stock location, publishable key and products in the admin.
5. Storefront: set `MEDUSA_PUBLISHABLE_KEY` on **storefront** (Admin → Settings →
   Publishable API Keys) and generate a public domain for it. `MEDUSA_BACKEND_URL`,
   `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_UMAMI_URL` resolve automatically, and the
   backend's `STOREFRONT_URL` (used for tracked links in the admin) points at it.
   Redeploy the storefront after changing any `NEXT_PUBLIC_*` value, because they're
   inlined at build time.
6. Point the app at it: `EXPO_PUBLIC_MEDUSA_BACKEND_URL=https://<medusa domain>` and
   the same publishable key.

## Analytics

Analytics are **first-party**: the Medusa `analytics` module stores every event in the main
Postgres database. It covers funnels, trends, experiments, and the scorecards' sessions per
`?asset=` link. Nothing extra needs deploying or configuring. Open **Admin → Analytics**.
Event names and properties are defined in [`docs/analytics.md`](../docs/analytics.md).

- The storefront sends events to its own `/api/e` route, which forwards them to Medusa.
- The app posts straight to `/store/analytics/events`.
- `STORE_TIMEZONE` (set in `railway.ts`) controls the day buckets in reports.

### Umami (optional dashboard, in `railway.ts`)

Umami is a separate cookieless traffic dashboard. Nothing in the backend reads from it. The
`umami` service runs the official image `ghcr.io/umami-software/umami:3.5.0` with its own
`umami-db` Postgres.

1. Set `APP_SECRET` on **umami** (`openssl rand -hex 32`), apply, and generate a public domain for it.
2. Sign in as `admin` / `umami` and **change the password right away**.
3. Add a website for the storefront and copy its id into `NEXT_PUBLIC_UMAMI_WEBSITE_ID` on
   **storefront**. Redeploy it, because the value is inlined at build time.
4. Optional, for the app: `EXPO_PUBLIC_UMAMI_URL` and `EXPO_PUBLIC_UMAMI_WEBSITE_ID`.
