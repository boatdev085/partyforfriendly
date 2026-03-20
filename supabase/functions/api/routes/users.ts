import { Hono } from "https://deno.land/x/hono@v4.4.4/mod.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

export const usersRouter = new Hono();

// GET /api/users/me
usersRouter.get("/me", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { data, error } = await supabase
    .from("users")
    .select("*, user_badges(*, badge:badges(*))")
    .eq("id", user.id)
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// GET /api/users/:id
usersRouter.get("/:id", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const { data, error } = await supabase
    .from("users")
    .select("*, user_badges(*, badge:badges(*)), game_profiles(*, game:games(*))")
    .eq("id", c.req.param("id"))
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// PATCH /api/users/me
usersRouter.patch("/me", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const allowed = ["username", "avatar_url", "locale"];
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  const { data, error } = await supabase
    .from("users")
    .update(update)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

// GET /api/users/me/parties
usersRouter.get("/me/parties", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { data, error } = await supabase
    .from("memberships")
    .select("*, party:parties(*, game:games(*))")
    .eq("user_id", user.id)
    .eq("status", "approved");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});
