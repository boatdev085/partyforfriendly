-- Migration: leave_party_safe RPC
-- Atomically marks a member as left, reopens party if it was full,
-- and auto-promotes the oldest pending waitlist entry (join request).

create or replace function leave_party_safe(p_party_id uuid, p_user_id uuid)
returns json language plpgsql security definer as $$
declare
  v_party        record;
  v_next_request record;
begin
  -- Lock the party row to prevent concurrent operations from racing.
  select * into v_party
  from public.parties
  where id = p_party_id
  for update;

  if not found then
    return json_build_object('error', 'party_not_found');
  end if;

  -- Mark the member as left (only if currently approved).
  update public.memberships
  set status = 'left'
  where party_id = p_party_id
    and user_id  = p_user_id
    and status   = 'approved';

  if not found then
    return json_build_object('error', 'not_a_member');
  end if;

  -- Keep the denormalised counter in sync.
  update public.parties
  set current_members = greatest(current_members - 1, 0),
      updated_at      = now()
  where id = p_party_id;

  -- Reopen the party if it was full.
  update public.parties
  set status = 'open'
  where id = p_party_id
    and status = 'full';

  -- Auto-promote the oldest pending join request (FIFO waitlist).
  select * into v_next_request
  from public.memberships
  where party_id = p_party_id
    and status   = 'pending'
  order by joined_at asc
  limit 1
  for update skip locked;

  if found then
    -- Approve the request.
    update public.memberships
    set status = 'approved'
    where id = v_next_request.id;

    -- Increment member count again for the promoted user.
    update public.parties
    set current_members = current_members + 1,
        updated_at      = now()
    where id = p_party_id;

    -- Notify the promoted user.
    insert into public.notifications (user_id, type, title, message, data)
    values (
      v_next_request.user_id,
      'approved',
      'Join request approved',
      'Your join request was approved — welcome to the party!',
      json_build_object('party_id', p_party_id)::jsonb
    );

    return json_build_object(
      'success',           true,
      'promoted_user_id',  v_next_request.user_id
    );
  end if;

  return json_build_object('success', true, 'promoted_user_id', null);
end;
$$;

-- Grant execute to the roles used by Supabase clients.
grant execute on function leave_party_safe(uuid, uuid) to anon, authenticated;
