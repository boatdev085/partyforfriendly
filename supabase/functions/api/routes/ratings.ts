import { Hono } from "https://deno.land/x/hono@v4.4.4/mod.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

export const ratingsRouter = new Hono();

// GET /api/ratings?user_id=xxx
ratingsRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const { user_id } = c.req.query();

  let query = supabase
    .from("ratings")
    .select("*, rater:users!rater_id(*)")
    .order("created_at", { ascending: false });

  if (user_id) query = query.eq("rated_id", user_id);

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// POST /api/ratings
ratingsRouter.post("/", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();

  // Enforce 48-hour window: party must have ended within 48 hours
  const { data: party } = await supabase
    .from("parties")
    .select("status, updated_at")
    .eq("id", body.party_id)
    .single();

  if (!party || party.status !== "closed") {
    return c.json({ error: "Party must be closed before rating" }, 400);
  }

  const hoursSinceClosed =
    (Date.now() - new Date(party.updated_at).getTime()) / 36e5;
  if (hoursSinceClosed > 48) {
    return c.json({ error: "Rating window has expired (48 hours)" }, 400);
  }

  const { data, error } = await supabase
    .from("ratings")
    .insert({ ...body, rater_id: user.id })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});
