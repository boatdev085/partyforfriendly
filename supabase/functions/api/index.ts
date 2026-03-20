import { Hono } from "https://deno.land/x/hono@v4.4.4/mod.ts";
import { cors } from "https://deno.land/x/hono@v4.4.4/middleware.ts";
import { partiesRouter } from "./routes/parties.ts";
import { usersRouter } from "./routes/users.ts";
import { notificationsRouter } from "./routes/notifications.ts";
import { ratingsRouter } from "./routes/ratings.ts";

const app = new Hono().basePath("/api");

app.use("*", cors());

app.route("/parties", partiesRouter);
app.route("/users", usersRouter);
app.route("/notifications", notificationsRouter);
app.route("/ratings", ratingsRouter);

app.get("/health", (c) => c.json({ status: "ok" }));

Deno.serve(app.fetch);
