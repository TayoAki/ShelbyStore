# Shelby backend

Medusa v2 (2.22) with a custom **release** module for product drops. See the
[root README](../README.md) for how the playbook maps to the code.

## Layout

| Path | What it does |
|---|---|
| `src/modules/release` | `Release` and `ReleaseReminder` data models. |
| `src/links/release-product.ts` | Many-to-many link between releases and products. |
| `src/lib/playbook` | Framework-free playbook logic: go/no-go checks, scorecard, decision rule, status transitions. Unit tested. |
| `src/lib/release-data.ts` | Loads stock, core availability and order lines through Medusa's Query. |
| `src/workflows/release` | Create, update (including product links), delete and go-live workflows. Go-live publishes the products and emits `release.live`, or holds the release. |
| `src/jobs/release-go-live.ts` | Every minute: runs go-live for scheduled releases whose date has arrived. |
| `src/subscribers/release-live.ts` | On `release.live`: sends Expo push and email reminders to "notify me" signups. |
| `src/api/admin/releases` | Admin API: CRUD, `go-live`, `scorecard`, `decision`. |
| `src/api/store/releases` | Store API: `GET /store/releases[?phase=]`, `GET /store/releases/:handle`, `POST /store/releases/:handle/reminders`. Returns customer-facing fields only. |
| `src/api/media/[key]` | Serves uploaded images from a private bucket by redirecting to presigned URLs. |
| `src/admin` | **Releases** pages in the Medusa admin: calendar, brief, products and stock, assets, go/no-go, economics, scorecard and decision. |
| `src/scripts/seed.ts` | US region, a core tee, and four releases covering each playbook state. |

## Release lifecycle

```
draft ──schedule──▶ scheduled ──date arrives / "Go live now"──▶ live ──record decision──▶ reviewed
                        ▲                     │
                        └──move date─── held ◀┘ (any go/no-go check fails)
```

Products attached to a release stay unpublished until it goes live.

## Scripts

```bash
npm run dev          # API + admin with hot reload
npm run seed         # demo data (skips if already seeded)
npm run test:unit    # playbook logic tests
npm run build        # production build into .medusa/server
```

Environment variables are documented in `.env.template`.
