import { describe, expect, it } from "vitest";
import app from "../src/app";
import { before } from "node:test";
import { FastifyInstance } from "fastify";
import request from "supertest";
import { knex } from "../src/database";
import { Knex as setupKnex } from "knex";
import { object } from "zod";
import { get } from "http";

interface CreateUser {
  username?: string;
  email?: string;
}

async function createUserRequest(
  app: FastifyInstance,
  c: CreateUser,
): Promise<request.Response> {
  return await request(app.server).post("/users").send(c);
}

async function getUserById(
  app: FastifyInstance,
  id: string,
): Promise<request.Response> {
  return await request(app.server).get(`/users/${id}`).send();
}

describe("Users Routes", () => {
  before(async () => {
    await app.ready();
    await knex("users").del();
  });

  describe("Create User", () => {
    it("Shouldn't be able to create a new user without email", async () => {
      const createUserWithoutEmail: CreateUser = { username: "testuser" };
      const response = await createUserRequest(app, createUserWithoutEmail);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Bad Request",
        message: "body must have required property 'email'",
        statusCode: 400,
      });
    });
    it("Shouldn't be able to create a new user without username", async () => {
      const createUserWithoutEmail: CreateUser = {
        email: "johndoe@example.com",
      };
      const response = await createUserRequest(app, createUserWithoutEmail);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Bad Request",
        message: "body must have required property 'username'",
        statusCode: 400,
      });
    });
    it("Shouldn't be able to create a new user with invalid email", async () => {
      const createUserWithoutEmail: CreateUser = {
        username: "john doe",
        email: "invalid-email",
      };
      const response = await createUserRequest(app, createUserWithoutEmail);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Bad Request",
        message: "body must send a valid email address",
        statusCode: 400,
      });
    });
    it("Should be able to create a new user", async () => {
      const createUser: CreateUser = {
        username: "john doe",
        email: "johndoe@example.com",
      };
      const response = await createUserRequest(app, createUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          session_id: expect.any(String),
          username: "john doe",
          email: "johndoe@example.com",
        }),
      );
    });
    it("Shouldn't be able to create a new user with same email", async () => {
      const createUserWithDuplicateEmail: CreateUser = {
        username: "john doe",
        email: "johndoe2@example.com",
      };
      let response = await createUserRequest(app, createUserWithDuplicateEmail);
      expect(response.status).toBe(201);

      response = await createUserRequest(app, createUserWithDuplicateEmail);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Bad Request",
        message: "email address is invalid",
        statusCode: 400,
      });
    });
  });

  describe("Get User By ID", () => {
    it("should not be possible to find a user with an id not found", async () => {
      const getUserResponse = await getUserById(
        app,
        "9fba6158-5c19-4355-80bb-eac655f6afaf",
      );
      expect(getUserResponse.status).toBe(404);
      expect(getUserResponse.body).toEqual({
        error: "Not Found",
        message: "user not found",
        statusCode: 404,
      });
    });

    it("It should not be possible to find a user with an invalid uid", async () => {
      const getUserResponse = await getUserById(app, "- invalid-uid-");
      expect(getUserResponse.status).toBe(400);
      expect(getUserResponse.body).toEqual({
        error: "Bad Request",
        message: "params id must be a valid UUID",
        statusCode: 400,
      });
    });

    it("Should be able to return user", async () => {
      const createUser: CreateUser = {
        username: "john doe",
        email: "johndoe_getbyid@example.com",
      };
      const response = await createUserRequest(app, createUser);
      expect(response.status).toBe(201);
      const userId = response.body.id;

      const getUserResponse = await getUserById(app, userId);
      expect(getUserResponse.status).toBe(200);
      expect(getUserResponse.body).toEqual({
        user: expect.objectContaining({
          id: userId,
          username: "john doe",
          email: "johndoe_getbyid@example.com",
        }),
      });
    });
  });

  describe("Update User", () => {
    it("Shouldn't be able to create a new user without email", async () => {});
    it("Shouldn't be able to create a new user without username", async () => {});
    it("Shouldn't be able to create a new user with same email", async () => {});
    it("Should be able to create a new user", async () => {});
  });

  describe("Delete User", () => {
    it("Shouldn't be able to create a new user without email", async () => {});
    it("Shouldn't be able to create a new user without username", async () => {});
    it("Shouldn't be able to create a new user with same email", async () => {});
    it("Should be able to create a new user", async () => {});
  });
});
