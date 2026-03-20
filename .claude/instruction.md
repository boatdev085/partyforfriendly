# PartyForFriendly — Project Instructions

## Project Overview
PartyForFriendly is a gaming party-finder platform (Thai-focused) where players can create/join parties for games. Built with Next.js 15 + TypeScript + styled-components + Supabase + Discord OAuth2.

## Tech Stack
- **Framework:** Next.js 15 (App Router), TypeScript
- **Styling:** styled-components — NO Tailwind. All styles use `src/styles/theme.ts` for colors/radii
- **Auth:** NextAuth.js v4 with Discord OAuth2 provider
- **Database:** Supabase (Postgres) — local dev on http://127.0.0.1:54321
- **Realtime:** Supabase Realtime (planned)
- **i18n:** Custom TH/EN context (`src/lib/locale-context.tsx` + `src/lib/i18n.ts`)
- **Notifications:** react-hot-toast

## Repository
- GitHub: https://github.com/boatdev085/partyforfriendly
- Local path: `/Users/boatkung/project/partyforfriendly`
- Default branch: `main`
- GitHub token: **ขอจากผู้ใช้ทุกครั้ง — ห้าม hardcode ใน code หรือ commit**

## GitHub Project Board
- Project: "PartyForFriendly Dev Board"
- Columns: 📋 Todo → 🔨 In Dev → ✅ Done
- Use GraphQL API to move cards: https://api.github.com/graphql

## Key File Structure
```
src/
  app/
    layout.tsx              — Root layout with SessionProviderWrapper + LayoutShell
    page.tsx                — Home/landing page (public)
    login/page.tsx          — Discord login page (public)
    parties/
      page.tsx              — Party list
      create/page.tsx       — Create party form
      [id]/page.tsx         — Party room (chat, voice, members)
      [id]/manage/page.tsx  — Leader panel
    search/page.tsx         — Search with filters
    profile/[id]/page.tsx   — User profile
    notifications/page.tsx  — Notifications
    reviews/page.tsx        — Give/receive ratings
    api/auth/[...nextauth]/route.ts — NextAuth handler
  components/
    layout/
      Sidebar.tsx           — 220px fixed sidebar, uses useSession()
      LayoutShell.tsx       — Client wrapper, sidebar state, LocaleProvider
      LangSwitcher.tsx      — TH/EN pill toggle
      HamburgerBtn.tsx      — Mobile hamburger
    auth/
      AuthGuard.tsx         — Redirects unauthenticated users to /login
      SessionProviderWrapper.tsx — next-auth SessionProvider wrapper
    home/Hero.tsx           — Landing page hero
    notifications/NotifItem.tsx
    leader/                 — PartySettings, RealtimeStats, MemberManager, PendingList
    profile/                — ProfileHeader, StatsRow, GamesList, RatingOverview, PartyHistory
    reviews/                — GiveRatingForm, ReceivedReviews
    room/                   — ChatArea, VoiceWidget, MembersList, PartyInfoCard
  lib/
    supabase/
      client.ts             — createBrowserClient<Database>
      server.ts             — createServerClient<Database>
    auth-options.ts         — NextAuth authOptions (upserts user to Supabase on login)
    auth.ts                 — Server-side helpers: getSession, getCurrentUser, requireAuth
    users.ts                — User repository: getUserById, getUserByDiscordId, upsertUser, updateUser
    i18n.ts                 — TH/EN dictionary
    locale-context.tsx      — LocaleProvider + useLocale() hook
    mock-data.ts            — MOCK_PARTIES array (temporary, will be replaced by Supabase)
  styles/theme.ts           — Color palette: bg, bgCard, bgHover, border, primary (#7c6aff), accent (#00d4aa), text, textMuted
  types/
    index.ts                — Party, User, etc. types
    database.ts             — Supabase Database interface (Row/Insert/Update for all tables)
    next-auth.d.ts          — NextAuth session type augmentation
middleware.ts               — Edge middleware: protects /parties, /profile, /search, /notifications, /reviews
supabase/
  migrations/               — SQL migration files
  seed.sql                  — Initial games data (8 games)
  config.toml               — Supabase local config
```

## Environment Variables
`.env.local` contains:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
DISCORD_CLIENT_ID=<id>
DISCORD_CLIENT_SECRET=<secret>
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
```

## Supabase Local Dev
- Start: `cd /Users/boatkung/project/partyforfriendly && supabase start` (requires Docker Desktop running)
- Studio UI: http://127.0.0.1:54323
- API: http://127.0.0.1:54321
- Reset/migrate: `supabase db reset`

## Database Schema (Supabase)
Tables: `users`, `games`, `parties`, `party_members`, `join_requests`, `messages`, `reviews`, `notifications`
All tables have RLS enabled. See `supabase/migrations/` for full DDL.

## Dev Server
```
cd /Users/boatkung/project/partyforfriendly && npm run dev
```
Runs on http://localhost:3000

## Coding Rules
1. **styled-components only** — no Tailwind, no inline styles
2. **Always use `theme.ts`** for colors
3. **"use client"** directive required for any component using hooks/state
4. **Write files directly to host** using Desktop Commander `write_file` or `edit_block` — do NOT use git worktrees
5. **TypeScript strict** — run `npx tsc --noEmit` and fix all errors before reporting done
6. **Never push without user review** — always report "ready for review at http://localhost:3000" and wait for explicit approval

## Workflow for Each Issue
1. Read the GitHub issue to understand what to build
2. Read relevant existing files first
3. Implement using Desktop Commander write_file/edit_block directly to `/Users/boatkung/project/partyforfriendly/src/`
4. Run `npx tsc --noEmit` — fix all errors
5. Report "Issue #N ready for review at http://localhost:3000"
6. **Wait for user to say "push + ย้ายการ์ด + เริ่ม #N+1"**
7. Then: `git add -A && git commit -m "feat: ... (Issue #N)" && git push origin main`
8. Move card to ✅ Done via GitHub GraphQL API
9. Start next issue

## Issues Status (as of writing)
| # | Title | Status |
|---|---|---|
| 1 | Homepage / Landing page | ✅ Done |
| 2 | Party List page | ✅ Done |
| 3 | Search page | ✅ Done |
| 4 | Create Party page | ✅ Done |
| 5 | Party Room page | ✅ Done |
| 6 | Leader Panel (manage party) | ✅ Done |
| 7 | Profile page | ✅ Done |
| 8 | Reviews / Ratings page | ✅ Done |
| 9 | Notifications page | ✅ Done |
| 10 | Sidebar navigation | ✅ Done |
| 11 | i18n TH/EN support | ✅ Done |
| 12 | Responsive design (mobile) | ✅ Done |
| 13 | Discord OAuth2 auth + AuthGuard | ✅ Done |
| 14 | Supabase DB schema + migrations | ✅ Done |
| 15 | Protected routes middleware | ✅ Done |
| 16 | Users table + user repository | ✅ Done (not yet pushed) |
| 17+ | Remaining backend/API issues | 📋 Todo |

> ดู issues และ status ล่าสุดทั้งหมดได้ที่ GitHub Project Board:
> https://github.com/users/boatdev085/projects/ (หรือ https://github.com/boatdev085/partyforfriendly/issues)
> **อย่า assume status จาก instruction.md นี้ — ให้ดูจาก board จริงเสมอ**

## Important Notes
- User is a senior software engineer — keep responses technical and concise
- User reviews at localhost:3000 before every push — never skip this step
- Always move GitHub card to ✅ Done after pushing
- If Desktop Commander write_file fails, try edit_block or break file into smaller writes
- Supabase local needs Docker Desktop running
