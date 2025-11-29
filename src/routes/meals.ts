import type { FastifyInstance } from "fastify";
import { checkSessionIdExists } from "../middleware/check-session-id-exists.ts";
import { knex } from "../database.ts";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", checkSessionIdExists);

  app.get("/", async (request, reply) => {
    const user = request.user;
    const meals = await knex("meals").where("user_id", user!.id).select("*");
    return reply.status(200).send(meals);
  });
  app.post("/", async (request, reply) => {
    const createMealsSchema = z.object({
      name: z.string(),
      description: z.string(),
      is_on_diet: z.boolean(),
      created_at: z.coerce.date(),
    });

    const result = createMealsSchema.safeParse(request.body);

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

    const createdMeals = await knex("meals")
      .insert({
        id: randomUUID(),
        name: result.data.name,
        description: result.data.description,
        is_on_diet: result.data.is_on_diet,
        user_id: request.user!.id,
        created_at: result.data.created_at,
      })
      .returning("*");

    return reply.status(200).send(createdMeals[0]);
  });
  app.put("/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.uuid(),
    });

    const resultParams = paramsSchema.safeParse(request.params);

    if (!resultParams.success) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "params id must be a valid uuid",
        statusCode: 400,
      });
    }

    const updateMealsSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      is_on_diet: z.boolean().optional(),
      created_at: z.coerce.date().optional(),
    });

    const resultBody = updateMealsSchema.safeParse(request.body);

    if (!resultBody.success) {
      const missingFields = resultBody.error.issues.map(
        (issue) => issue.path[0],
      );
      return reply.status(400).send({
        error: "Bad Request",
        message: `body must have required properties: ${missingFields.join(
          ", ",
        )}`,
        statusCode: 400,
      });
    }

    if (
      !resultBody.data.name &&
      !resultBody.data.description &&
      resultBody.data.is_on_diet === undefined
    ) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "body must have at least one property to update",
        statusCode: 400,
      });
    }

    if (
      resultBody.data.name !== undefined &&
      resultBody.data.name.trim() === ""
    ) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "name cannot be empty",
        statusCode: 400,
      });
    }

    if (
      resultBody.data.description !== undefined &&
      resultBody.data.description.trim() === ""
    ) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "description cannot be empty",
        statusCode: 400,
      });
    }

    const meal = await knex("meals")
      .where({ id: resultParams.data.id, user_id: request.user!.id })
      .first();

    if (!meal) {
      return reply.status(404).send({
        error: "Not Found",
        message: "meal not found",
        statusCode: 404,
      });
    }

    const updateMeals = await knex("meals")
      .where({ id: resultParams.data.id })
      .update({
        name: resultBody.data.name,
        description: resultBody.data.description,
        is_on_diet: resultBody.data.is_on_diet,
        updated_at: new Date(),
      })
      .returning("*");

    return reply.status(200).send(updateMeals[0]);
  });
  app.delete("/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.uuid(),
    });

    const result = paramsSchema.safeParse(request.params);

    if (!result.success) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "params id must be a valid uuid",
        statusCode: 400,
      });
    }

    const meal = await knex("meals")
      .where({ id: result.data.id, user_id: request.user!.id })
      .first();

    if (!meal) {
      return reply.status(404).send({
        error: "Not Found",
        message: "meal not found",
        statusCode: 404,
      });
    }

    await knex("meals").where({ id: result.data.id }).del();

    return reply.status(204).send();
  });
}
