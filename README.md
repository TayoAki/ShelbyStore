# Shelby

A DTC apparel store built around two playbooks:

- **Product drops** ([`docs/playbook.md`](docs/playbook.md)): keep a signature basic
  always in stock, and use small releases to give customers a reason to come back.
- **Social content** (Tuan Le): pick a stance you can prove, film the proof in a
  repeatable format, and measure each episode through tracked links (`?asset=`).
  It runs in Admin → Content; see [`docs/analytics.md`](docs/analytics.md).

## How the UI was designed

[`docs/research/successful-stores.md`](docs/research/successful-stores.md) ranks 15
demonstrably successful DTC apparel brands, with sourced revenue and growth evidence.
[`docs/research/teardowns/`](docs/research/teardowns) holds live browser teardowns of 11
of them: tokens, layouts and pattern counts. [`docs/research/ux-evidence.md`](docs/research/ux-evidence.md)
grades the published UX research (Baymard, NN/g, field experiments). The storefront spec
[`web/SITE_SPEC.md`](web/SITE_SPEC.md) cites that evidence for each decision. Shelby has its
own design; it isn't a copy of any brand.

| Folder | What it is |
|---|---|
| [`backend/`](backend) | [Medusa v2](https://github.com/medusajs/medusa) commerce backend with a **release** module that runs the playbook's SOPs, plus a Releases section in the Medusa admin |
| [`web/`](web) | Next.js web storefront, built from the research-driven spec in [`web/SITE_SPEC.md`](web/SITE_SPEC.md) |
| [`mobile/`](mobile) | Expo (React Native) app for iOS and Android |
| [`.railway/`](.railway) | Railway infrastructure: Postgres, Redis, a bucket for product images, the Medusa server and worker, the storefront, and self-hosted Umami |
| [`docs/`](docs) | The two playbooks, the [analytics spec](docs/analytics.md), and the [research](docs/research) behind the UI |

## How the playbook maps to the software

| Playbook | Where it lives |
|---|---|
| Core product that is always available | Products in the `core` collection. The app's home and shop lead with them and show stock per size. The scorecard flags any core size that goes out of stock. |
| SOP 2: scope the release (tier, date, owner, backup approver) | `Release` record. Tiers are **major** (new silhouette or story) and **light** (approved variation). Edited under **Admin → Releases**. |
| SOP 3: one product promise, the proof, approved assets | `product_promise`, `proof` and `assets` on the release. Each tier requires certain asset kinds; optional assets can be skipped if production overruns. |
| SOP 4: go/no-go, then hold or publish | A job runs every minute and puts each scheduled release through the checks: brief, products, **stock by size**, creative, mobile PDP, fulfillment, links and tracking. If everything passes, the products are published and "notify me" reminders go out. Otherwise the release is **held** with reasons and needs a new date. |
| Pilot scorecard (contribution, sell-through, core availability, workload, channel response) | `GET /admin/releases/:id/scorecard`, shown on the release page. Channel response comes from the `?asset=` deep-link tag. The app copies it into cart metadata, and Medusa copies cart metadata onto the order. |
| Repeat / simplify / pause | The scorecard recommends a decision using the playbook's rule, and holds it back until day 7. The team records the actual decision, which moves the release to **reviewed**. |
| Skill test (washed tee, delayed size run) | The seed's "Lounge Sweatpants in Heather" release has no XL stock, so it is held when its date arrives. |

## Run it locally

You need Node 20+, Postgres and Redis.

```bash
cd backend
cp .env.template .env            # set DATABASE_URL / REDIS_URL if yours differ
npm install
npx medusa db:migrate
npm run seed                     # prints the publishable key for the app
npx medusa user -e admin@example.com -p <password>
npm run dev                      # API on :9000, admin at http://localhost:9000/app
```

```bash
cd web
cp .env.example .env.local       # paste the publishable key
npm install
npm run dev -- --port 3001       # http://localhost:3001
```

```bash
cd mobile
cp .env.example .env             # paste the publishable key
npm install
npx expo start                   # i = iOS simulator, a = Android
```

Checks: `npm run test:unit` and `npx tsc --noEmit` in `backend/`; `npx tsc --noEmit`, `npx eslint src` and `npm run build` in `web/`; `npm run typecheck` in `mobile/`; `npm run railway:check` at the root. CI runs all of them.

## Deploy

Everything except the app runs on Railway, defined in [`.railway/railway.ts`](.railway/railway.ts):
the Medusa server and worker, Postgres, Redis, the image bucket, the web storefront, and
Umami. See [`.railway/README.md`](.railway/README.md) for the first-deploy checklist and the
PostHog hosting choice. The app ships through the app stores (EAS Build) and points at the
Railway URL.

## Not done yet

- **Card payments.** Checkout uses Medusa's test provider (`pp_system_default`), which records orders without charging anyone. The backend enables Stripe when `STRIPE_API_KEY` is set, but the app still needs Stripe's PaymentSheet.
- **Push reminders** need an EAS project ID and a real device. Email reminders are logged until `SENDGRID_API_KEY` is set.
- **Store policy copy** (`web/src/lib/policy.ts`): shipping prices, the 30-day returns line and dispatch time must match the real policy before launch.
- **Content-series stance:** the seeded "30-Wash Test" is a hypothetical example. Per the playbook, only publish a stance the business can actually prove on camera.
- **Unit costs** come from variant metadata (`unit_cost`). The scorecard lists any variant that's missing one.
