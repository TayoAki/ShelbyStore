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
