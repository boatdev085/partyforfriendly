import type { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { upsertUser } from "@/lib/users"

/**
 * Shared NextAuth configuration.
 * Defined outside the route file so it can be imported by
 * server helpers (getServerSession) without violating Next.js
 * route file export restrictions.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId:     process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    /**
     * Runs on sign-in (and on subsequent requests when the token is refreshed).
     * On first sign-in `profile` is populated – we upsert into Supabase and
     * store the internal UUID so it's available in session.
     */
    async jwt({ token, profile }) {
      if (profile) {
        // Map Discord profile fields
        token.discordId       = (profile as any).id
        token.discordUsername = (profile as any).username

        // Upsert into Supabase users table and attach internal UUID to token
        const row = await upsertUser({
          id:           (profile as any).id,
          username:     (profile as any).username,
          global_name:  (profile as any).global_name ?? undefined,
          discriminator:(profile as any).discriminator ?? undefined,
          avatar:       (profile as any).avatar ?? null,
          email:        (profile as any).email ?? null,
        })

        if (row) {
          token.supabaseUserId = row.id
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id             = token.supabaseUserId ?? token.sub
        ;(session.user as any).discordId     = token.discordId
        ;(session.user as any).discordUsername = token.discordUsername
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
