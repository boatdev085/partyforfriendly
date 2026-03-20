import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

/**
 * Extend next-auth Session type to include Discord-specific fields
 * that are added in the jwt/session callbacks.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      discordId?: string
      discordUsername?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string
    discordUsername?: string
  }
}
