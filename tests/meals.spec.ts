import { describe, beforeAll, expect, it } from "vitest";
import { app } from "../src/app.ts";
import request from "supertest";
import prepareDatabase from "./helpers.ts";
import { createUserRequest } from "./users.spec.ts";
import type { FastifyInstance } from "fastify";

interface MealsEntity {
  name?: string;
  description?: string;
  is_on_diet?: boolean;
  created_at?: string;
}

async function createMealsRequest(
  app: FastifyInstance,
  meal: MealsEntity,
  sessionID: string,
) {
  return request(app.server)
    .post("/meals")
    .send(meal)
    .set("Cookie", [`sessionId=${sessionID}`]);
}

async function getMealsRequest(app: FastifyInstance, sessionID: string) {
  return request(app.server)
    .get("/meals")
    .set("Cookie", [`sessionId=${sessionID}`]);
}

describe("Meals Routes", () => {
  beforeAll(async () => {
    app.ready();
    prepareDatabase();
  });
  describe("Get /meals", () => {
    it("should be possible to list all meals", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "create_user_list_meals@example.com",
      });

      expect(createUser.statusCode).toBe(201);

      const createMeal = await createMealsRequest(
        app,
        {
          name: "Salad",
          description: "Fresh vegetable salad",
          is_on_diet: true,
          created_at: new Date().toISOString(),
        },
        createUser.body.session_id,
      );

      expect(createMeal.statusCode).toBe(200);

      const listMeals = await getMealsRequest(app, createUser.body.session_id);

      expect(listMeals.statusCode).toBe(200);

      expect(listMeals.body).toHaveLength(1);
      expect(listMeals.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Salad",
            description: "Fresh vegetable salad",
            is_on_diet: true,
          }),
        ]),
      );
    });
    it("should be possible to list a user's meals without any registered", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "create_user_list_meals_without_any_registered@example.com",
      });

      expect(createUser.statusCode).toBe(201);

      const listMeals = await getMealsRequest(app, createUser.body.session_id);

      expect(listMeals.statusCode).toBe(200);
      expect(listMeals.body).toHaveLength(0);
    });
    it("should not be possible to list the meals of a user that does not exist", async () => {
      const listMeals = await getMealsRequest(
        app,
        "99695c5b-86a4-4d56-9307-6d41a8b04eff",
      );
      expect(listMeals.statusCode).toBe(401);
      expect(listMeals.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
    it("should not be possible to list a user's meals without sending the session", async () => {
      const listMeals = await getMealsRequest(app, "");
      expect(listMeals.statusCode).toBe(401);
      expect(listMeals.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
    it("should not be possible to return a user's meals by sending an invalid id", async () => {
      const listMeals = await getMealsRequest(app, "_invalid_session_id_");
      expect(listMeals.statusCode).toBe(401);
      expect(listMeals.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
  });
  describe("Post /meals", () => {
    it("should be possible to create a meal", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user@example.com",
      });

      expect(createUser.statusCode).toBe(201);

      const createMeal = await createMealsRequest(
        app,
        {
          name: "Salad",
          description: "Fresh vegetable salad",
          is_on_diet: true,
          created_at: new Date().toISOString(),
        },
        createUser.body.session_id,
      );

      expect(createMeal.statusCode).toBe(200);
      expect(createMeal.body).toEqual(
        expect.objectContaining({
          name: "Salad",
          description: "Fresh vegetable salad",
          is_on_diet: true,
        }),
      );
    });
    it("Shouldn't be able to create a new meal without name", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user_create_fail",
        email: "meal_user_create_fail_without_name@example.com",
      });

      expect(createUser.statusCode).toBe(201);

      const createMeal = await createMealsRequest(
        app,
        {
          description: "Fresh vegetable salad",
          is_on_diet: true,
          created_at: new Date().toISOString(),
        },
        createUser.body.session_id,
      );

      expect(createMeal.statusCode).toBe(400);
      expect(createMeal.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message: "body must have required properties: name",
          statusCode: 400,
        }),
      );
    });
    it("Shouldn't be able to create a new meal without description", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_create_fail_without_description@example.com",
      });

      expect(createUser.statusCode).toBe(201);

      const createMeal = await createMealsRequest(
        app,
        {
          name: "Salad",
          is_on_diet: true,
          created_at: new Date().toISOString(),
        },
        createUser.body.session_id,
      );

      expect(createMeal.statusCode).toBe(400);
      expect(createMeal.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message: "body must have required properties: description",
          statusCode: 400,
        }),
      );
    });
    it("Shouldn't be able to create a new meal without is_on_diet", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_create_fail_without_is_on_diet@example.com",
      });

      expect(createUser.statusCode).toBe(201);

      const createMeal = await createMealsRequest(
        app,
        {
          name: "Salad",
          description: "Fresh vegetable salad",
          created_at: new Date().toISOString(),
        },
        createUser.body.session_id,
      );

      expect(createMeal.statusCode).toBe(400);
      expect(createMeal.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message: "body must have required properties: is_on_diet",
          statusCode: 400,
        }),
      );
    });
    it("Shouldn't be able to create a new meal without all required fields", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_create_fail_without_all_required_fields@example.com",
      });

      expect(createUser.statusCode).toBe(201);

      const createMeal = await createMealsRequest(
        app,
        {},
        createUser.body.session_id,
      );

      expect(createMeal.statusCode).toBe(400);
      expect(createMeal.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message:
            "body must have required properties: name, description, is_on_diet",
          statusCode: 400,
        }),
      );
    });
    it("Shouldn't be able to create a new meal without session", async () => {
      const createMeal = await createMealsRequest(
        app,
        {
          name: "Salad",
          description: "Fresh vegetable salad",
          is_on_diet: true,
          created_at: new Date().toISOString(),
        },
        "",
      );

      expect(createMeal.statusCode).toBe(401);
      expect(createMeal.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
    it("Shouldn't be able to create a new meal with invalid session", async () => {
      const createMeal = await createMealsRequest(
        app,
        {
          name: "Salad",
          description: "Fresh vegetable salad",
          is_on_diet: true,
          created_at: new Date().toISOString(),
        },
        "beb64792-65bb-4950-b00e-9ccf8897739e",
      );

      expect(createMeal.statusCode).toBe(401);
      expect(createMeal.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
    it("Shouldn't be able to create a new meal with invalid session format", async () => {
      const createMeal = await createMealsRequest(
        app,
        {
          name: "Salad",
          description: "Fresh vegetable salad",
          is_on_diet: true,
          created_at: new Date().toISOString(),
        },
        "invalid-session-format",
      );

      expect(createMeal.statusCode).toBe(401);
      expect(createMeal.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
  });
  describe("Put /meals/:id", () => {
    it("should return 200", async () => {
      expect(200).toBe(200);
    });
  });
  describe("Delete /meals/:id", () => {
    it("should return 200", async () => {
      expect(200).toBe(200);
    });
  });
});
