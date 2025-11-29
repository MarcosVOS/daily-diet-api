import type { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database.ts";
import { z } from "zod";

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) {
    return reply.status(401).send({
      error: "Unauthorized",
    });
  }

  const validSession = z.string().uuid().safeParse(sessionId);
  if (!validSession.success) {
    return reply.status(401).send({
      error: "Unauthorized",
    });
  }

  const user = await knex("users").where("session_id", sessionId).first();

  if (!user) {
    return reply.status(401).send({
      error: "Unauthorized",
    });
  }

  request.user = user;
}
