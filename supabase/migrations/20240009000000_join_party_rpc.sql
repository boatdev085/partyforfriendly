-- Migration: join_party_safe RPC
-- Race-condition-safe party join using row-level locking (SELECT ... FOR UPDATE).
-- Checks party status, membership cap, and duplicate entry atomically.

create or replace function join_party_safe(p_party_id uuid, p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_party        record;
  v_member_count int;
  v_existing     record;
begin
  -- Lock the party row to prevent concurrent joins from racing past the cap check.
  select * into v_party
  from public.parties
  where id = p_party_id
  for update;

  if not found then
    return json_build_object('error', 'party_not_found');
  end if;

  if v_party.status != 'open' then
    return json_build_object('error', 'party_not_open');
  end if;

  -- Guard against duplicate active membership.
  select * into v_existing
  from public.memberships
  where party_id = p_party_id
    and user_id  = p_user_id
    and status   = 'approved';

  if found then
    return json_build_object('error', 'already_member');
  end if;

  -- Count current active (approved) members.
  select count(*) into v_member_count
  from public.memberships
  where party_id = p_party_id
    and status   = 'approved';

  if v_member_count >= v_party.max_members then
    return json_build_object('error', 'party_full');
  end if;

  -- Insert the new member row.
  insert into public.memberships (party_id, user_id, role, status)
  values (p_party_id, p_user_id, 'member', 'approved');

  -- Keep the denormalised counter in sync.
  update public.parties
  set current_members = v_member_count + 1,
      status          = case when v_member_count + 1 >= max_members then 'full' else status end,
      updated_at      = now()
  where id = p_party_id;

  return json_build_object('success', true, 'member_count', v_member_count + 1);
end;
$$;

-- Grant execute to the anon + authenticated roles used by Supabase clients.
grant execute on function join_party_safe(uuid, uuid) to anon, authenticated;
