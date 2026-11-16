import {
  bucket,
  defineRailway,
  github,
  group,
  image,
  postgres,
  preserve,
  project,
  redis,
  ref,
  service,
} from "railway/iac"

/**
 * Shelby on Railway.
 *
 *   postgres  Medusa's database
 *   redis     events, workflows, locks and cache shared by server and worker
 *   media     private bucket for product images (served via /media redirects)
 *   medusa    HTTP API + admin dashboard (MEDUSA_WORKER_MODE=server)
 *   worker    scheduled jobs + subscribers: release go-live checks, reminders
 *   umami       self-hosted web analytics (own Postgres): tagged sessions per asset
 *   storefront  Next.js web store (web/), built from web/SITE_SPEC.md
 *
 * Product analytics (events, funnels, experiments) are first-party: they live in
 * Medusa's own `analytics` module and Postgres, so there is no extra service.
 *
 * Plan and apply with the Railway CLI (5.42.1+) from the repo root:
 *   railway config plan
 *   railway config apply
 *
 * Before the first apply, set JWT_SECRET and COOKIE_SECRET on both services
 * (long random strings, the same value on both). They are preserved, not
 * stored in this file. Then generate a public domain for `medusa`.
 */

const REPO = "TayoAki/ShelbyStore"

export default defineRailway((ctx) => {
  const db = postgres("postgres")
  const cache = redis("redis")
  const media = bucket("media", { region: "iad" })

  const source = github(REPO, {
    branch: ctx.isEnvironment("production") ? "main" : undefined,
    rootDirectory: "backend",
  })

  // `medusa build` compiles the server and admin into .medusa/server, which
  // then gets its own production install (Medusa's documented layout).
  const build = {
    builder: "RAILPACK" as const,
    buildCommand: "npm run build && cd .medusa/server && npm install --omit=dev",
    watchPatterns: ["/backend/**"],
  }

  // Self-hosted Umami (https://github.com/umami-software/umami), pinned.
  // First login is admin / umami: change it, create the website, then set
  // UMAMI_WEBSITE_ID (and the API user) on medusa + worker.
  const umamiDb = postgres("umami-db")
  const umami = service("umami", {
    source: image("ghcr.io/umami-software/umami:3.5.0"),
    healthcheck: "/api/heartbeat",
    env: {
      DATABASE_URL: umamiDb.env.DATABASE_URL,
      APP_SECRET: preserve(),
      // Umami listens on $PORT; pin it so the domain's target port matches.
      PORT: "3000",
    },
  })

  // Analytics are first-party (events live in the Medusa database), so the
  // backend needs no analytics keys. Umami is only the separate cookieless
  // dashboard; the storefront loads its tracker.
  const analytics = {
    STORE_TIMEZONE: "America/Los_Angeles",
    // Tracked links in the admin (content episodes, release assets) point here.
    STOREFRONT_URL: "https://${{storefront.RAILWAY_PUBLIC_DOMAIN}}",
  }

  const shared = {
    ...analytics,
    // No NODE_ENV here: with NODE_ENV=production at build time, `npm ci` skips
    // devDependencies that `medusa build` needs (TypeScript, Vite).
    // `medusa start` defaults NODE_ENV to production at runtime by itself.
    NPM_CONFIG_PRODUCTION: "false",
    STRIPE_API_KEY: preserve(),
    STRIPE_WEBHOOK_SECRET: preserve(),
    DATABASE_URL: db.env.DATABASE_URL,
    REDIS_URL: cache.env.REDIS_URL,
    JWT_SECRET: preserve(),
    COOKIE_SECRET: preserve(),
    S3_BUCKET: ref(media, "BUCKET"),
    S3_ENDPOINT: ref(media, "ENDPOINT"),
    S3_REGION: ref(media, "REGION"),
    S3_ACCESS_KEY_ID: ref(media, "ACCESS_KEY_ID"),
    S3_SECRET_ACCESS_KEY: ref(media, "SECRET_ACCESS_KEY"),
  }

  const medusa = service("medusa", {
    source,
    build,
    // Migrations run once per deploy, before the new server takes traffic, then
    // the idempotent bootstrap (demo seed, Stripe on regions, first admin user).
    preDeploy: "cd .medusa/server && npm run predeploy && npx medusa exec ./src/scripts/bootstrap.js",
    start: "cd .medusa/server && npm run start",
    healthcheck: "/health",
    healthcheckTimeout: 120,
    env: {
      ...shared,
      MEDUSA_WORKER_MODE: "server",
      MEDUSA_BACKEND_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
      SEED_DEMO_DATA: preserve(),
      ADMIN_EMAIL: preserve(),
      ADMIN_PASSWORD: preserve(),
      // The admin is served from this same origin. Native apps send no Origin
      // header, so STORE_CORS only matters for a web build of the app.
      ADMIN_CORS: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
      AUTH_CORS: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
      STORE_CORS: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
      S3_FILE_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}/media",
    },
  })

  const worker = service("worker", {
    source,
    build,
    start: "cd .medusa/server && npm run start",
    env: {
      ...shared,
      MEDUSA_WORKER_MODE: "worker",
      DISABLE_MEDUSA_ADMIN: "true",
      // The worker serves no HTTP traffic, but links in reminder emails and
      // uploaded file URLs should still point at the public API.
      MEDUSA_BACKEND_URL: "https://${{medusa.RAILWAY_PUBLIC_DOMAIN}}",
      S3_FILE_URL: "https://${{medusa.RAILWAY_PUBLIC_DOMAIN}}/media",
    },
  })

  // Next.js storefront. All Medusa calls happen server-side, so it only needs
  // the API URL and the publishable key. NEXT_PUBLIC_* values are inlined at
  // build time, which Railway supports because service variables are build vars.
  const storefront = service("storefront", {
    source: github(REPO, {
      branch: ctx.isEnvironment("production") ? "main" : undefined,
      rootDirectory: "web",
    }),
    build: {
      builder: "RAILPACK" as const,
      buildCommand: "npm run build",
      watchPatterns: ["/web/**"],
    },
    start: "npm run start",
    healthcheck: "/",
    env: {
      // devDependencies (Tailwind, TypeScript) are needed by `next build`.
      NPM_CONFIG_PRODUCTION: "false",
      MEDUSA_BACKEND_URL: "https://${{medusa.RAILWAY_PUBLIC_DOMAIN}}",
      MEDUSA_PUBLISHABLE_KEY: preserve(),
      NEXT_PUBLIC_SITE_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
      NEXT_PUBLIC_UMAMI_URL: "https://${{umami.RAILWAY_PUBLIC_DOMAIN}}",
      NEXT_PUBLIC_UMAMI_WEBSITE_ID: preserve(),
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: preserve(),
    },
  })

  return project("shelby", {
    resources: [
      ...group("Backend", [db, cache, media, medusa, worker]),
      ...group("Analytics", [umamiDb, umami]),
      ...group("Storefront", [storefront]),
    ],
  })
})
