import type { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

/**
 * Shared NextAuth configuration.
 * Defined outside the route file so it can be imported by
 * server helpers (getServerSession) without violating Next.js
 * route file export restrictions.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub
        ;(session.user as any).discordId = token.discordId
        ;(session.user as any).discordUsername = token.discordUsername
      }
      return session
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.discordId = (profile as any).id
        token.discordUsername = (profile as any).username
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
