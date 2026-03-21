import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Build query with filters
    let query = (supabase
      .from('parties')
      .select('*, games(name, cover_url), memberships(count)')) as any;

    // Filter by game_id if provided
    const gameId = searchParams.get('game');
    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    // Filter by join_mode if provided
    const joinMode = searchParams.get('join_mode');
    if (joinMode) {
      query = query.eq('join_mode', joinMode);
    }

    // Filter by status if provided
    const status = searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = 20;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data: parties, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Parties fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch parties' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: parties || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (err) {
    console.error('Parties API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin client bypasses RLS — required because app uses NextAuth (not
    // Supabase Auth), so auth.uid() is always null with the anon key.
    const admin = createAdminClient();

    // Resolve host_id from NextAuth session
    const sessionUser = await getCurrentUser();
    let hostId: string | null = (sessionUser as any)?.id ?? null;

    // ─── Dev fallback ────────────────────────────────────────────────────────
    // When running locally without a real Discord session, find-or-create a
    // persistent dev user so the FK constraint on parties.host_id is satisfied.
    if (!hostId && process.env.NODE_ENV === 'development') {
      const { data: devUser, error: devErr } = await (admin
        .from('users')
        .upsert(
          {
            discord_id: 'dev-local-000',
            username: 'devuser',
            display_name: 'Dev User (local)',
          } as never,
          { onConflict: 'discord_id' }
        )
        .select()
        .single() as any);

      if (devErr) {
        console.error('Dev user upsert error:', devErr);
      } else {
        hostId = (devUser as any)?.id ?? null;
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      game_id,
      description,
      join_mode,
      max_members,
      tags,
      discord_voice_link,
      scheduled_at,
    } = body;

    // Validation
    if (!title || !game_id || !join_mode || !max_members) {
      return NextResponse.json(
        { error: 'Missing required fields: title, game_id, join_mode, max_members' },
        { status: 400 }
      );
    }

    // Validate join_mode enum
    const validJoinModes = ['open', 'request', 'invite_only'] as const;
    type JoinMode = typeof validJoinModes[number];
    if (!validJoinModes.includes(join_mode as JoinMode)) {
      return NextResponse.json(
        { error: `Invalid join_mode. Must be one of: ${validJoinModes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create party — only columns that exist in the DB schema
    const { data: party, error: partyError } = await (admin
      .from('parties')
      .insert({
        title,
        game_id,
        description: description || '',
        join_mode: join_mode as JoinMode,
        max_members: Number(max_members),
        status: 'open',
        host_id: hostId,
        tags: tags ?? [],
        discord_voice_link: discord_voice_link ?? null,
        scheduled_at: scheduled_at ?? null,
      } as never)
      .select()
      .single() as any);

    if (partyError || !party) {
      console.error('Party creation error:', partyError);
      return NextResponse.json(
        { error: 'Failed to create party' },
        { status: 500 }
      );
    }

    // Add creator as host member in memberships table
    const { error: memberError } = await (admin
      .from('memberships')
      .insert({
        party_id: party.id,
        user_id: hostId,
        role: 'host',
        status: 'approved',
      } as never) as any);

    if (memberError) {
      console.error('Membership creation error:', memberError);
      // Non-fatal — party was created, membership can be repaired
    }

    return NextResponse.json(party, { status: 201 });
  } catch (err) {
    console.error('Create party error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
