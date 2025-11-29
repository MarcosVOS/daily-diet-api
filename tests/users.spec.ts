import { describe, expect, it } from "vitest";
import { app } from "../src/app.ts";
import { before } from "node:test";
import type { FastifyInstance } from "fastify";
import request from "supertest";
import { knex } from "../src/database.ts";
import prepareDatabase from "./helpers.ts";

interface UserEntity {
  username?: string;
  email?: string;
}

export async function createUserRequest(
  app: FastifyInstance,
  c: UserEntity,
): Promise<request.Response> {
  return await request(app.server).post("/users").send(c);
}

export async function updateUserById(
  app: FastifyInstance,
  id: string,
  c: UserEntity,
): Promise<request.Response> {
  return await request(app.server).put(`/users/${id}`).send(c);
}

export async function getUserById(
  app: FastifyInstance,
  id: string,
): Promise<request.Response> {
  return await request(app.server).get(`/users/${id}`).send();
}

export async function deleteById(
  app: FastifyInstance,
  id: string,
): Promise<request.Response> {
  return await request(app.server).delete(`/users/${id}`).send();
}

describe("Users Routes", () => {
  before(async () => {
    await app.ready();
    prepareDatabase();
  });

  describe("Create User", () => {
    it("Shouldn't be able to create a new user without email", async () => {
      const createUserWithoutEmail: UserEntity = { username: "testuser" };
      const response = await createUserRequest(app, createUserWithoutEmail);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Bad Request",
        message: "body must have required property 'email'",
        statusCode: 400,
      });
    });
    it("Shouldn't be able to create a new user without username", async () => {
      const createUserWithoutEmail: UserEntity = {
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
      const createUserWithoutEmail: UserEntity = {
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
      const createUser: UserEntity = {
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
      const createUserWithDuplicateEmail: UserEntity = {
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

    it("Should not be possible to find a user with an invalid uid", async () => {
      const getUserResponse = await getUserById(app, "- invalid-uid-");
      expect(getUserResponse.status).toBe(400);
      expect(getUserResponse.body).toEqual({
        error: "Bad Request",
        message: "params id must be a valid UUID",
        statusCode: 400,
      });
    });

    it("Should be able to return user", async () => {
      const createUser: UserEntity = {
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
  describe("Delete User", () => {
    it("should not be possible to find a user with an id not found", async () => {
      const deleteUserResponse = await getUserById(
        app,
        "9fba6158-5c19-4355-80bb-eac655f6afaf",
      );
      expect(deleteUserResponse.status).toBe(404);
      expect(deleteUserResponse.body).toEqual({
        error: "Not Found",
        message: "user not found",
        statusCode: 404,
      });
    });

    it("Should not be possible to find a user with an invalid uid", async () => {
      const deleteUserResponse = await deleteById(app, "- invalid-uid-");
      expect(deleteUserResponse.status).toBe(400);
      expect(deleteUserResponse.body).toEqual({
        error: "Bad Request",
        message: "params id must be a valid UUID",
        statusCode: 400,
      });
    });

    it("Should be able to delete a user", async () => {
      const createUser: UserEntity = {
        username: "john doe",
        email: "johndoe_deletebyid@example.com",
      };
      const response = await createUserRequest(app, createUser);
      expect(response.status).toBe(201);
      const userId = response.body.id;

      const deleteUser = await deleteById(app, userId);
      expect(deleteUser.status).toBe(204);
    });
  });

  describe("Update User", () => {
    it("Shouldn't be able to update a user with existing email", async () => {
      const createUser1: UserEntity = {
        username: "john doe",
        email: "johndoupdatewithsameemail1@example.com",
      };
      const responseCreateUser1 = await createUserRequest(app, createUser1);
      expect(responseCreateUser1.status).toBe(201);

      const createUser2: UserEntity = {
        username: "john doe",
        email: "johndoupdatewithsameemail2@example.com",
      };
      const responseCreateUser2 = await createUserRequest(app, createUser2);
      expect(responseCreateUser2.status).toBe(201);

      const updateUserSameEmail = await updateUserById(
        app,
        responseCreateUser2.body.id,
        {
          username: "john doe updated",
          email: "johndoupdatewithsameemail1@example.com",
        },
      );

      expect(updateUserSameEmail.status).toBe(400);
      expect(updateUserSameEmail.body).toEqual(
        expect.objectContaining({
          error: "Bad Request",
          message: "email address is invalid",
          statusCode: 400,
        }),
      );
    });
    it("Should be able to update a user", async () => {
      const createUser: UserEntity = {
        username: "john doe",
        email: "johndoupdate@example.com",
      };
      const responseCreateUser = await createUserRequest(app, createUser);
      expect(responseCreateUser.status).toBe(201);

      const responseUpdateUser = await updateUserById(
        app,
        responseCreateUser.body.id,
        {
          username: "john doe updated",
          email: "johndoeupdated@example.com",
        },
      );

      expect(responseUpdateUser.status).toBe(200);
      expect(responseUpdateUser.body).toEqual(
        expect.objectContaining({
          id: responseCreateUser.body.id,
          username: "john doe updated",
          email: "johndoeupdated@example.com",
        }),
      );
    });
    it("Should be able to update a user without changing email", async () => {
      const createUser: UserEntity = {
        username: "john doe",
        email: "johndoupdate@example.com",
      };
      const responseCreateUser = await createUserRequest(app, createUser);
      expect(responseCreateUser.status).toBe(201);

      const responseUpdateUser = await updateUserById(
        app,
        responseCreateUser.body.id,
        {
          username: "john doe updated",
        },
      );
      expect(responseUpdateUser.status).toBe(200);
      expect(responseUpdateUser.body).toEqual(
        expect.objectContaining({
          id: responseCreateUser.body.id,
          username: "john doe updated",
          email: "johndoupdate@example.com",
        }),
      );
    });
    it("Should be able to update a user without changing username", async () => {
      const createUser: UserEntity = {
        username: "john doe same user name",
        email: "johndoeupdateusername@example.com",
      };
      const responseCreateUser = await createUserRequest(app, createUser);
      expect(responseCreateUser.status).toBe(201);

      const responseUpdateUser = await updateUserById(
        app,
        responseCreateUser.body.id,
        {
          email: "johndoeupdateusername2@example.com",
        },
      );
      expect(responseUpdateUser.status).toBe(200);
      expect(responseUpdateUser.body).toEqual(
        expect.objectContaining({
          id: responseCreateUser.body.id,
          username: "john doe same user name",
          email: "johndoeupdateusername2@example.com",
        }),
      );
    });
  });
});
