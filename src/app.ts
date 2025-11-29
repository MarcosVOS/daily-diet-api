import fastify from "fastify";
import { statusRoutes } from "./routes/status.ts";
import usersRoutes from "./routes/users.ts";
import { mealsRoutes } from "./routes/meals.ts";
import cookie from "@fastify/cookie";
import { runMigrations } from "./runPendingMigrations.ts";

await runMigrations();
export const app = fastify();

app.addHook("onResponse", async (request, reply) => {
  console.log(
    `\nMETHOD: [${request.method}]\nSTATUS_CODE_RESPONSE: ${reply.statusCode}\nURL: ${request.url}`,
  );
});
app.register(cookie);

app.register(statusRoutes);
app.register(usersRoutes, { prefix: "/users" });
app.register(mealsRoutes, { prefix: "/meals" });
