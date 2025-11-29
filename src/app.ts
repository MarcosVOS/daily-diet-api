import fastify from "fastify";
import { statusRoutes } from "./routes/status.ts";
import usersRoutes from "./routes/users.ts";
import { mealsRoutes } from "./routes/meals.ts";
import cookie from "@fastify/cookie";

export const app = fastify();

app.register(cookie);

app.register(statusRoutes);
app.register(usersRoutes, { prefix: "/users" });
app.register(mealsRoutes, { prefix: "/meals" });
