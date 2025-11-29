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

async function deleteMealsRequest(
  app: FastifyInstance,
  mealsId: string,
  sessionID: string,
) {
  return request(app.server)
    .delete(`/meals/${mealsId}`)
    .set("Cookie", [`sessionId=${sessionID}`]);
}

async function updateMealsRequest(
  app: FastifyInstance,
  mealsId: string,
  sessionID: string,
  meal: MealsEntity,
) {
  return request(app.server)
    .put(`/meals/${mealsId}`)
    .send(meal)
    .set("Cookie", [`sessionId=${sessionID}`]);
}

describe("Meals Routes", () => {
  beforeAll(async () => {
    app.ready();
    prepareDatabase();
  });
  describe("Get by session ID", () => {
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
  describe("Create meals", () => {
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
            "body must have required properties: name, description, is_on_diet, created_at",
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
  describe("Update meals", () => {
    it("should be possible to update the name of a meal", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "user_meal_update_only_name@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        createUser.body.session_id,
        {
          name: "Updated Salad",
        },
      );

      expect(updateMeals.statusCode).toBe(200);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({
          name: "Updated Salad",
          description: "Fresh vegetable salad",
          is_on_diet: true,
          user_id: createUser.body.id,
        }),
      );
    });
    it("should be possible to update the description of a meal", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_only_description@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        createUser.body.session_id,
        {
          description: "Updated fresh vegetable salad",
        },
      );

      expect(updateMeals.statusCode).toBe(200);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({
          name: "Salad",
          description: "Updated fresh vegetable salad",
          is_on_diet: true,
          user_id: createUser.body.id,
        }),
      );
    });
    it("should be possible to update the is_on_diet of a meal", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_only_is_on_diet@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        createUser.body.session_id,
        {
          is_on_diet: false,
        },
      );

      expect(updateMeals.statusCode).toBe(200);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({
          name: "Salad",
          description: "Fresh vegetable salad",
          is_on_diet: false,
          user_id: createUser.body.id,
        }),
      );
    });
    it("should be possible to update all fields of a meal", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_all_fields@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        createUser.body.session_id,
        {
          name: "Updated Salad",
          description: "Updated fresh vegetable salad",
          is_on_diet: false,
          created_at: new Date().toISOString(),
        },
      );

      expect(updateMeals.statusCode).toBe(200);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({
          name: "Updated Salad",
          description: "Updated fresh vegetable salad",
          is_on_diet: false,
          user_id: createUser.body.id,
        }),
      );
    });
    it("shouldn't be possible to update a meal for empty name", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_empty_name@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        createUser.body.session_id,
        {
          name: "",
          description: "Fresh vegetable salad",
        },
      );

      expect(updateMeals.statusCode).toBe(400);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message: "name cannot be empty",
          statusCode: 400,
        }),
      );
    });
    it("shouldn't be possible to update a meal for empty description", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_empty_description@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        createUser.body.session_id,
        {
          name: "Salad",
          description: "",
        },
      );

      expect(updateMeals.statusCode).toBe(400);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message: "description cannot be empty",
          statusCode: 400,
        }),
      );
    });
    it("shouldn't be possible to update a meal without body", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_without_body@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        createUser.body.session_id,
        {},
      );

      expect(updateMeals.statusCode).toBe(400);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message: "body must have at least one property to update",
          statusCode: 400,
        }),
      );
    });
    it("should be possible to update a meal that doesn't exist", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_meal_not_exist@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        "1f2dc158-ef86-4abc-b57c-855fba613a41",
        createUser.body.session_id,
        {
          name: "Updated Salad",
        },
      );

      expect(updateMeals.statusCode).toBe(404);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({
          error: "Not Found",
          message: "meal not found",
          statusCode: 404,
        }),
      );
    });
    it("should be possible to update a meal that invalid meal id", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_meal_invalid_id@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        "invalid-meal-id",
        createUser.body.session_id,
        {
          name: "Updated Salad",
        },
      );

      expect(updateMeals.statusCode).toBe(400);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message: "params id must be a valid uuid",
          statusCode: 400,
        }),
      );
    });
    it("should be possible to update a meal that with invalid session", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_meal_invalid_session@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        "invalid-session-id",
        {
          name: "Updated Salad",
        },
      );

      expect(updateMeals.statusCode).toBe(401);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
    it("should be possible to update a meal that without session", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_meal_without_session@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        "",
        {
          name: "Updated Salad",
        },
      );

      expect(updateMeals.statusCode).toBe(401);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
    it("should be possible to update a meal with inexistent session", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_update_meal_inexistent_session@example.com",
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

      const updateMeals = await updateMealsRequest(
        app,
        createMeal.body.id,
        "f227b7c5-8549-47bc-99d9-8b6ca52b244d",
        {
          name: "Updated Salad",
        },
      );

      expect(updateMeals.statusCode).toBe(401);
      expect(updateMeals.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
  });
  describe("Delete meals", () => {
    it("should be possible to delete a meal", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_delete@example.com",
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

      const deleteMeals = await deleteMealsRequest(
        app,
        createMeal.body.id,
        createUser.body.session_id,
      );

      expect(deleteMeals.statusCode).toBe(204);
    });
    it("Shouldn't be possible to delete a meal thats not existing", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_delete_meals_not_existing@example.com",
      });

      expect(createUser.statusCode).toBe(201);
      const deleteMeals = await deleteMealsRequest(
        app,
        "99695c5b-86a4-4d56-9307-6d41a8b04eff",
        createUser.body.session_id,
      );

      expect(deleteMeals.statusCode).toBe(404);
      expect(deleteMeals.body).toEqual(
        expect.objectContaining({
          error: "Not Found",
          message: "meal not found",
          statusCode: 404,
        }),
      );
    });
    it("Shouldn't be possible to delete a meal with invalid meal ID", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_delete_meals_invalid_id@example.com",
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

      const deleteMeals = await deleteMealsRequest(
        app,
        "invalid-meal-id",
        createUser.body.session_id,
      );

      expect(deleteMeals.statusCode).toBe(400);
      expect(deleteMeals.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message: "params id must be a valid uuid",
          statusCode: 400,
        }),
      );
    });
    it("Shouldn't be possible to delete a meal without session", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_delete_without_session@example.com",
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

      const deleteMeals = await deleteMealsRequest(app, createMeal.body.id, "");

      expect(deleteMeals.statusCode).toBe(401);
      expect(deleteMeals.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
    it("Shouldn't be possible to delete a meal with invalid session", async () => {
      const createUser = await createUserRequest(app, {
        username: "meal_user",
        email: "meal_user_delete_with_invalid_session@example.com",
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

      const deleteMeals = await deleteMealsRequest(app, createMeal.body.id, "");

      expect(deleteMeals.statusCode).toBe(401);
      expect(deleteMeals.body).toEqual(
        expect.objectContaining({ error: "Unauthorized" }),
      );
    });
  });
});
