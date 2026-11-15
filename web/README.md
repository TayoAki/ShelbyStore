# Shelby web storefront

Next.js 16 (App Router, Cache Components) storefront for Shelby, built from
[`SITE_SPEC.md`](SITE_SPEC.md). Every design decision in the spec cites the research
in [`../docs/research`](../docs/research).

```bash
cp .env.example .env.local
npm install
npm run dev -- --port 3001
```

- All Medusa calls are server-side: `src/lib/medusa.ts`, `src/lib/data/*`, and the server actions in `src/lib/actions/*`.
- Catalog reads are cached (`"use cache"`, 1-minute revalidate). Live stock and the bag are read per request and streamed in.
- `src/proxy.ts` stores `?asset=` and UTM params in a 7-day cookie. They're copied into cart metadata, and Medusa copies them onto the order.
- Analytics (Umami + PostHog) follow [`../docs/analytics.md`](../docs/analytics.md). Both are off until their `NEXT_PUBLIC_*` vars are set.
- Policy copy (shipping, returns) lives in `src/lib/policy.ts`. Confirm it before launch.
