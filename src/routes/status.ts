import type { FastifyInstance } from "fastify";
import { knex } from "../database.ts";

export async function statusRoutes(app: FastifyInstance) {
  app.get("/status", async function alive(request, reply) {
    try {
      await knex.raw("SELECT 1+1 AS result");

      return reply.status(200).send({
        status: "ok",
        database: "connected",
        timeStamp: new Date().toISOString(),
      });
    } catch (error) {
      return reply.status(500).send({
        status: "error",
        database: "disconnected",
        timeStamp: new Date().toISOString(),
      });
    }
  });
}
