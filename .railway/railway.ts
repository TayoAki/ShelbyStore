import {
  bucket,
  defineRailway,
  github,
  group,
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

  const shared = {
    NODE_ENV: "production",
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
    // Migrations run once per deploy, before the new server takes traffic.
    preDeploy: "cd .medusa/server && npm run predeploy",
    start: "cd .medusa/server && npm run start",
    healthcheck: "/health",
    healthcheckTimeout: 120,
    env: {
      ...shared,
      MEDUSA_WORKER_MODE: "server",
      MEDUSA_BACKEND_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
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

  return project("shelby", {
    resources: [...group("Backend", [db, cache, media, medusa, worker])],
  })
})
