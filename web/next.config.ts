import type { NextConfig } from "next"

const backend = new URL(process.env.MEDUSA_BACKEND_URL || "http://localhost:9000")
const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")

/** Retired v4/v5 URLs (SITE_SPEC G.6.0): permanent (308) redirects to the v6 pages. */
const RETIRED_PRODUCTS = ["everyday-cap", "trucker", "ribbed-beanie", "performance-cap", "corduroy-cap", "bucket-hat", "waxed-field-cap", "everyday-two-pack"]

const nextConfig: NextConfig = {
  cacheComponents: true,
  async redirects() {
    return [
      { source: "/drops", destination: "/card", permanent: true },
      { source: "/drops/:handle", destination: "/card/:handle", permanent: true },
      ...RETIRED_PRODUCTS.map((h) => ({ source: `/products/${h}`, destination: "/products/rope-cap", permanent: true })),
      { source: "/offer/everyday-two-pack", destination: "/offer/the-pair", permanent: true },
      { source: "/reasons/everyday-cap", destination: "/reasons/rope-cap", permanent: true },
      { source: "/read/one-cap", destination: "/read/the-rope-cap", permanent: true },
      { source: "/stories/crush-test", destination: "/stories/crown-test", permanent: true },
    ]
  },
  partialPrefetching: true,
  images: {
    remotePatterns: [
      // Uploaded product images served by the backend (/media → bucket).
      {
        protocol: backend.protocol.replace(":", "") as "http" | "https",
        hostname: backend.hostname,
        port: backend.port,
        pathname: "/media/**",
      },
      // Demo hat photos: the seed stores absolute URLs to this site's /hats folder.
      {
        protocol: site.protocol.replace(":", "") as "http" | "https",
        hostname: site.hostname,
        port: site.port,
        pathname: "/hats/**",
      },
      { protocol: "https", hostname: "images-api.printify.com", pathname: "/mockup/6afbd089a57e3213600a8e97/**" },
      // Medusa's demo images, still referenced by orders from the apparel demo.
      { protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" },
    ],
  },
  turbopack: {
    // web/ has its own lockfile; the repo root has another (Railway SDK).
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
