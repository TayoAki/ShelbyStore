import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Public URLs for uploaded product images.
 *
 * Railway buckets are private, so Medusa stores image URLs as
 * `${MEDUSA_BACKEND_URL}/media/<key>` (S3_FILE_URL) and this route redirects to
 * a short-lived presigned URL. The bytes come straight from the bucket, whose
 * egress is free, instead of streaming through this service.
 */
const SIGNED_URL_TTL_SECONDS = 6 * 60 * 60
const KEY_PATTERN = /^[A-Za-z0-9._-]{1,512}$/

let client: S3Client | null = null
const s3 = () =>
  (client ??= new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  }))

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const key = req.params.key
  if (!process.env.S3_BUCKET || !KEY_PATTERN.test(key)) {
    res.status(404).json({ type: "not_found", message: "File not found" })
    return
  }
  const url = await getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
    { expiresIn: SIGNED_URL_TTL_SECONDS }
  )
  // Let clients and the edge cache the redirect for less time than the signature lasts.
  res.setHeader("Cache-Control", "public, max-age=3600")
  res.redirect(302, url)
}
