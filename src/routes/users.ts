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
      const missingFields = result.error.issues.map((issue) => issue.path[0]);
      return reply.status(400).send({
        error: "Bad Request",
        message: `body must have required properties: ${missingFields.join(
          ", ",
        )}`,
        statusCode: 400,
      });
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

  app.delete("/:id", async (request, reply) => {
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

    await knex("users").where("id", result.data.id).delete();

    return reply.status(204).send();
  });

  app.put("/:id", async (request, reply) => {
    const updateUserSchema = z.object({
      username: z.string().optional(),
      email: z.email().optional(),
    });

    const getUserParamsSchema = z.object({
      id: z.uuid(),
    });

    const result = updateUserSchema.safeParse(request.body);
    const paramsResult = getUserParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "params id must be a valid UUID",
        statusCode: 400,
      });
    }

    const user = await knex("users").where("id", paramsResult.data.id).first();

    if (result.success && result.data.email != undefined) {
      const existUser = await knex("users")
        .where("email", result.data.email)
        .first();

      if (existUser) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "email address is invalid",
          statusCode: 400,
        });
      }
    }

    if (!result.success) {
      const missingFields = result.error.issues.map((issue) => issue.path[0]);
      return reply.status(400).send({
        error: "Bad Request",
        message: `body must have required properties: ${missingFields.join(
          ", ",
        )}`,
        statusCode: 400,
      });
    }

    if (!user) {
      return reply.status(404).send({
        error: "Not Found",
        message: "user not found",
        statusCode: 404,
      });
    }

    const userToBeUpdated = {
      ...user,
      ...result.data,
    };

    const updateUser = await knex("users")
      .where("id", paramsResult.data.id)
      .update(userToBeUpdated)
      .returning("*");

    return reply.status(200).send(updateUser[0]);
  });
}
