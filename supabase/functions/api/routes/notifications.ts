import { Hono } from "https://deno.land/x/hono@v4.4.4/mod.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

export const notificationsRouter = new Hono();

// GET /api/notifications
notificationsRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// PATCH /api/notifications/:id/read
notificationsRouter.patch("/:id/read", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", c.req.param("id"))
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

// PATCH /api/notifications/read-all
notificationsRouter.patch("/read-all", async (c) => {
  const supabase = createSupabaseClient(c.req.header("Authorization"));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ success: true });
});
