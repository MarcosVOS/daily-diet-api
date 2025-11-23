import { beforeAll, describe, expect, it } from "vitest";
import app from "../src/app";
import request from "supertest";

describe("Status Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });
  it("should be return api status", async () => {
    const response = await request(app.server).get("/").expect(200);
    expect(response.body).toEqual(expect.objectContaining({ status: "ok" }));
  });
});
