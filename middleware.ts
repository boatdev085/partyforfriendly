import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Routes that require authentication.
 * Any path starting with these prefixes will be protected.
 */
const PROTECTED_PREFIXES = [
  "/parties",
  "/profile",
  "/search",
  "/notifications",
  "/reviews",
]

/**
 * Routes that are only accessible when NOT authenticated.
 * Authenticated users will be redirected to home.
 */
const AUTH_ONLY_ROUTES = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get next-auth JWT token (validates session without hitting DB)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users to /login, preserving the intended URL
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect already-authenticated users away from /login
  if (isAuthOnlyRoute && isAuthenticated) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl")
    const redirectTo = callbackUrl ?? "/"
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/ routes (NextAuth handles these)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - Files with an extension (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)",
  ],
}
