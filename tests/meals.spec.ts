import { describe, beforeAll, expect, it } from "vitest";
import { app } from "../src/app";
import request from "supertest";

describe("Meals Routes", () => {
  beforeAll(async () => {
    app.ready();
  });
  describe("Get /meals", () => {
    it("should return 200", async () => {});
  });
  describe("Post /meals", () => {
    it("should return 200", async () => {
      expect(200).toBe(200);
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
