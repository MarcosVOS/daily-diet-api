import fastify from "fastify";
import { statusRoutes } from "./routes/status.ts";

const app = fastify();

app.register(statusRoutes);

export default app;
