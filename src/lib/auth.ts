import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import type { Session } from "next-auth"

/**
 * Get the current session in Server Components or API Route Handlers.
 *
 * @example
 * // In a Server Component:
 * const session = await getSession()
 * if (!session) redirect("/login")
 */
export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

/**
 * Get the current authenticated user from the session.
 * Returns null if the user is not authenticated.
 *
 * @example
 * const user = await getCurrentUser()
 * if (!user) return <Unauthorized />
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Assert that the current request is authenticated.
 * Throws if no session is found — use in API routes where you want a hard failure.
 *
 * @throws {Error} When no valid session exists
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session.user
}
