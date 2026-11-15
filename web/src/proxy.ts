import { NextResponse, type NextRequest } from "next/server"
import { ATTRIBUTION_COOKIE, ATTRIBUTION_MAX_AGE, attributionFromParams } from "./lib/attribution"

/**
 * Captures `?asset=<key>` (from release assets and content-series episodes) and
 * UTM params into a 7-day cookie. Latest touch wins. Cart creation copies it into
 * cart metadata, and Medusa copies cart metadata onto the order, which feeds the
 * release scorecard's channel response and the content-series business response.
 */
export function proxy(request: NextRequest) {
  const touch = attributionFromParams(request.nextUrl.searchParams)
  const response = NextResponse.next()
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
  // Pages only: skip static assets, images and Next internals.
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
}
