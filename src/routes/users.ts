import type { FastifyInstance } from "fastify";
import { uuid, z } from "zod";
import { knex } from "../database.ts";
import { randomUUID } from "node:crypto";

export default async function usersRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createUserSchema = z.object({
      username: z.string(),
      email: z.email(),
    });

    const result = createUserSchema.safeParse(request.body);

    if (!result.success) {
      if (
        result.error.issues[0].path.find((p) => p === "email") &&
        result.error.issues[0].message === "Invalid email address"
      ) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "body must send a valid email address",
          statusCode: 400,
        });
      }
      if (result.error.issues[0].path.find((p) => p === "email")) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "body must have required property 'email'",
          statusCode: 400,
        });
      }
      if (result.error.issues[0].path.find((p) => p === "username")) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "body must have required property 'username'",
          statusCode: 400,
        });
      }
    }

    const existUser = await knex("users")
      .where("email", result.data!.email)
      .first();

    if (existUser) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "email address is invalid",
        statusCode: 400,
      });
    }

    const userCreated = await knex("users")
      .insert({
        id: randomUUID(),
        session_id: randomUUID(),
        username: result.data!.username,
        email: result.data!.email,
      })
      .returning("*");
    reply.status(201).send(userCreated[0]);
  });

  app.get("/:id", async (request, reply) => {
    const getUserParamsSchema = z.object({
      id: z.uuid(),
    });

    const result = getUserParamsSchema.safeParse(request.params);

    if (!result.success) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "params id must be a valid UUID",
        statusCode: 400,
      });
    }

    const user = await knex("users").where("id", result.data.id).first();

    if (!user) {
      return reply.status(404).send({
        error: "Not Found",
        message: "user not found",
        statusCode: 404,
      });
    }

    return reply.status(200).send({ user });
  });
}
