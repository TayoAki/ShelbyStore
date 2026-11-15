import { NextResponse, type NextRequest } from "next/server"
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE,
  attributionFromParams,
  DISTINCT_ID_COOKIE,
  DISTINCT_ID_MAX_AGE,
  isDistinctId,
} from "./lib/attribution"

/**
 * 1. Ensures every visitor has a first-party analytics id (`_shelby_id`). On a
 *    first visit the new id is added to the forwarded request too, so server
 *    components (experiment assignment) see it on the very first render.
 * 2. Captures `?asset=<key>` (release assets, content-series episodes) and UTM
 *    params into a 7-day cookie. Latest touch wins. Cart creation copies it into
 *    cart metadata, and Medusa copies cart metadata onto the order, which feeds
 *    the release and content-series scorecards.
 */
export function proxy(request: NextRequest) {
  const existing = request.cookies.get(DISTINCT_ID_COOKIE)?.value
  const distinctId = isDistinctId(existing) ? existing : crypto.randomUUID()
  const isNew = distinctId !== existing

  let response: NextResponse
  if (isNew) {
    request.cookies.set(DISTINCT_ID_COOKIE, distinctId)
    response = NextResponse.next({ request: { headers: request.headers } })
    response.cookies.set(DISTINCT_ID_COOKIE, distinctId, {
      maxAge: DISTINCT_ID_MAX_AGE,
      path: "/",
      sameSite: "lax",
    })
  } else {
    response = NextResponse.next()
  }

  const touch = attributionFromParams(request.nextUrl.searchParams)
  if (touch) {
    response.cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(touch), {
      maxAge: ATTRIBUTION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    })
  }
  return response
}

export const config = {
  // Pages only: skip static assets, images, API routes and Next internals.
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
}
