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

First deploy checklist:

1. Set `JWT_SECRET` and `COOKIE_SECRET` on **medusa** and **worker** (the same value on both).
2. Generate a public domain for **medusa**; `MEDUSA_BACKEND_URL` and the CORS
   variables resolve from it.
3. Create the first admin user: `railway ssh -s medusa` then
   `cd .medusa/server && npx medusa user -e you@example.com -p <password>`.
4. Optional: seed demo data with `npx medusa exec ./src/scripts/seed.js`, or create
   the region, stock location, publishable key and products in the admin.
5. Point the app at it: `EXPO_PUBLIC_MEDUSA_BACKEND_URL=https://<medusa domain>` and
   the publishable key from Admin → Settings → Publishable API Keys.

## Analytics

Event names and properties are defined in [`docs/analytics.md`](../docs/analytics.md).
Every integration is a no-op until its variables are set.

### Umami (self-hosted, in `railway.ts`)

The `umami` service runs the official image `ghcr.io/umami-software/umami:3.5.0`
with its own `umami-db` Postgres.

1. Set `APP_SECRET` on **umami** (`openssl rand -hex 32`), apply, and generate a public domain for it.
2. Sign in as `admin` / `umami` and **change the password right away**.
3. Add a website for the storefront. Copy its id.
4. Create a dedicated non-admin user that can view the website (the backend uses it to read stats).
5. On **medusa** and **worker**, set `UMAMI_WEBSITE_ID`, `UMAMI_USERNAME` and `UMAMI_PASSWORD`.
   `UMAMI_URL` is already wired to the umami service's domain.
6. Give the storefront and app the tracker settings (see `docs/analytics.md`).

The release scorecard and the content-series scorecard then show tagged sessions
per `?asset=` link next to the orders.

### PostHog: choose before launch

The backend sends `order_completed` and `release_live` server-side. The web store and app send
the client events. All of them read `POSTHOG_API_KEY` + `POSTHOG_HOST`, so they work the same
against either option. PostHog isn't in `railway.ts` yet.

| | PostHog Cloud | Self-hosted on Railway |
|---|---|---|
| Setup | Create a project and set 2 variables | ~19 services (ClickHouse, Kafka, ZooKeeper, Postgres, Redis, object storage, Temporal, capture, plugins…). The only Railway templates are community-made, and they ship hardcoded default secrets you would have to rotate. |
| Size | Managed | PostHog's own minimum for the hobby deploy is **4 vCPU, 16 GB RAM, 30 GB+ disk** |
| Cost | Free tier: 1M events, 5k recordings and 1,500 survey responses per month ([pricing](https://posthog.com/pricing)) | Railway usage for the whole stack, running 24/7. ClickHouse and Kafka alone need several GB of RAM. |
| Support | Supported | PostHog calls self-hosting "officially unsupported", with no support and no guarantees ([docs](https://posthog.com/docs/self-host)) |
| Data location | PostHog's US or EU region | Your Railway project |

To add self-hosting later, deploy a PostHog template into this project. Rotate every default
secret (`SECRET_KEY`, `ENCRYPTION_SALT_KEYS`, database and MinIO passwords) first. Then point
`POSTHOG_HOST` at its web service. PostHog's verified **reverse-proxy** template
(`posthog-proxy`) is a cheap middle ground: it serves Cloud ingestion from your own domain,
so ad blockers drop fewer events.
