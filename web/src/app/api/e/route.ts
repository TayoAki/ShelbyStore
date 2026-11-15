import { MEDUSA_BACKEND_URL } from "@/lib/medusa"

/**
 * First-party analytics proxy: the browser posts event batches here (same
 * origin, so ad blockers and CORS don't get in the way) and the server forwards
 * them to Medusa with the publishable key and the visitor's user agent.
 * The visitor's IP is not forwarded or stored.
 */
const MAX_BODY_BYTES = 64 * 1024

export async function POST(request: Request) {
  const body = await request.text()
  if (!body || body.length > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 })
  }
  try {
    JSON.parse(body)
  } catch {
    return new Response(null, { status: 400 })
  }
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/analytics/events`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-publishable-api-key": process.env.MEDUSA_PUBLISHABLE_KEY ?? "",
        "user-agent": request.headers.get("user-agent") ?? "",
      },
      body,
      cache: "no-store",
    })
    return new Response(null, { status: res.ok ? 202 : res.status })
  } catch {
    return new Response(null, { status: 502 })
  }
}
