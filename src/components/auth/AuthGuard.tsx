"use client"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Client-side auth guard for pages that need authentication.
 * Works alongside the server-side middleware for defense-in-depth.
 * The middleware handles the first redirect; this handles client-side
 * navigation that may bypass the middleware.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(pathname)
      router.push(`/login?callbackUrl=${callbackUrl}`)
    }
  }, [status, router, pathname])

  if (status === "loading") {
    return null
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
