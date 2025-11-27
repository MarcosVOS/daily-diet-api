import fastify from "fastify";
import { statusRoutes } from "./routes/status.ts";
import usersRoutes from "./routes/users.ts";

const app = fastify();

app.register(statusRoutes);
app.register(usersRoutes);

export default app;
