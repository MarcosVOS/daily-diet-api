import type { FastifyInstance } from "fastify";

export async function statusRoutes(app: FastifyInstance) {
  app.get("/", async function alive(request, reply) {
    return reply.status(200).send({ status: "ok" });
  });
}
