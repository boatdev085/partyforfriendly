import { Hono } from "https://deno.land/x/hono@v4.4.4/mod.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

export const partiesRouter = new Hono();

// GET /api/parties — list open parties with filters
partiesRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const { game, language, status = "open", limit = "20", offset = "0" } =
    c.req.query();

  let query = supabase
    .from("parties")
    .select("*, host:users(*), game:games(*)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (game) query = query.eq("game_id", game);
  if (language) query = query.eq("language", language);

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// GET /api/parties/:id
partiesRouter.get("/:id", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const { data, error } = await supabase
    .from("parties")
    .select("*, host:users(*), game:games(*), memberships(*, user:users(*))")
    .eq("id", c.req.param("id"))
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// POST /api/parties — create party
partiesRouter.post("/", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const body = await c.req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { data, error } = await supabase
    .from("parties")
    .insert({ ...body, host_id: user.id })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);

  // Auto-add host as member
  await supabase.from("memberships").insert({
    party_id: data.id,
    user_id: user.id,
    role: "host",
    status: "approved",
  });

  return c.json(data, 201);
});

// PATCH /api/parties/:id
partiesRouter.patch("/:id", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const body = await c.req.json();

  const { data, error } = await supabase
    .from("parties")
    .update(body)
    .eq("id", c.req.param("id"))
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

// DELETE /api/parties/:id
partiesRouter.delete("/:id", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const { error } = await supabase
    .from("parties")
    .delete()
    .eq("id", c.req.param("id"));

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ success: true });
});

// POST /api/parties/:id/join
partiesRouter.post("/:id/join", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const partyId = c.req.param("id");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  // Race-condition-safe join using RPC
  const { data, error } = await supabase.rpc("join_party", {
    p_party_id: partyId,
    p_user_id: user.id,
  });

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

// POST /api/parties/:id/leave
partiesRouter.post("/:id/leave", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const partyId = c.req.param("id");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("party_id", partyId)
    .eq("user_id", user.id);

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ success: true });
});
