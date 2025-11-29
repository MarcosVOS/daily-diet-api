import type { FastifyInstance } from "fastify";
import { checkSessionIdExists } from "../middleware/check-session-id-exists.ts";

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", checkSessionIdExists);
  app.get("/", async (request, reply) => {});
  app.post("/", async (request, reply) => {});
  app.put("/", async (request, reply) => {});
  app.delete("/", async (request, reply) => {});
}
