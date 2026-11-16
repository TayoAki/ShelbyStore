import type { NextConfig } from "next"

const backend = new URL(process.env.MEDUSA_BACKEND_URL || "http://localhost:9000")
const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")

const nextConfig: NextConfig = {
  cacheComponents: true,
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
