import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

/**
 * Shelby backend config.
 *
 * Locally everything runs in one process ("shared"). On Railway we run two
 * services from this same codebase:
 *   - server: MEDUSA_WORKER_MODE=server  (HTTP API + admin dashboard)
 *   - worker: MEDUSA_WORKER_MODE=worker  (scheduled jobs, subscribers, workflows)
 * Both need REDIS_URL so events, workflows and locks are shared between them.
 */

const REDIS_URL = process.env.REDIS_URL
const WORKER_MODE = (process.env.MEDUSA_WORKER_MODE || "shared") as
  | "shared"
  | "worker"
  | "server"

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.JWT_SECRET || !process.env.COOKIE_SECRET)
) {
  throw new Error("JWT_SECRET and COOKIE_SECRET must be set in production")
}

const modules: Record<string, any>[] = [
  { resolve: "./src/modules/release" },
  { resolve: "./src/modules/content" },
  { resolve: "./src/modules/analytics" },
  { resolve: "./src/modules/custom-quote" },
]

if (REDIS_URL) {
  modules.push(
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { redis: { redisUrl: REDIS_URL } },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: { redisUrl: REDIS_URL },
          },
        ],
      },
    }
  )
}

// Product images. Without S3 settings, uploads go to local disk, which Railway
// wipes on every deploy, so set these in production. With a (private) Railway
// bucket, set S3_FILE_URL to `${MEDUSA_BACKEND_URL}/media`: src/api/media serves
// those URLs by redirecting to presigned bucket URLs. With a public bucket
// (S3, R2), point S3_FILE_URL at the bucket's public URL instead.
if (process.env.S3_BUCKET) {
  modules.push({
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/file-s3",
          id: "s3",
          options: {
            file_url: process.env.S3_FILE_URL,
            access_key_id: process.env.S3_ACCESS_KEY_ID,
            secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION || "auto",
            bucket: process.env.S3_BUCKET,
            endpoint: process.env.S3_ENDPOINT,
            // New Railway buckets use virtual-hosted URLs; older ones and MinIO need path style.
            additional_client_config: {
              forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
            },
          },
        },
      ],
    },
  })
}

// Notifications: the admin feed stays local. "Notify me" emails go through
// SendGrid when configured, otherwise they're logged by the local provider.
modules.push({
  resolve: "@medusajs/medusa/notification",
  options: {
    providers: [
      {
        resolve: "@medusajs/medusa/notification-local",
        id: "local",
        options: { name: "Local Notification Provider", channels: ["feed"] },
      },
      process.env.SENDGRID_API_KEY
        ? {
            resolve: "@medusajs/medusa/notification-sendgrid",
            id: "sendgrid",
            options: {
              channels: ["email"],
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM,
            },
          }
        : {
            resolve: "@medusajs/medusa/notification-local",
            id: "local-email",
            options: { name: "Local Email (logs only)", channels: ["email"] },
          },
    ],
  },
})

// Card payments. The system provider (pp_system_default) stays available for testing.
if (process.env.STRIPE_API_KEY) {
  modules.push({
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/payment-stripe",
          id: "stripe",
          options: {
            apiKey: process.env.STRIPE_API_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            // Capture at checkout so payments never sit as expiring
            // authorizations. STRIPE_CAPTURE=manual keeps authorize-then-capture.
            capture: process.env.STRIPE_CAPTURE !== "manual",
          },
        },
      ],
    },
  })
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    // The worker service doesn't serve the dashboard.
    disable:
      process.env.DISABLE_MEDUSA_ADMIN === "true" || WORKER_MODE === "worker",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules,
})
