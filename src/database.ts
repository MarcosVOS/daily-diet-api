import type { Knex } from "knex";
import setupKnex from "knex";
import { env } from "./env/index.ts";

export const config: Knex.Config = {
  client: "pg",
  connection: {
    host: env.PG_HOST,
    port: env.PG_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
  },
  migrations: {
    extension: "ts",
    directory: "./infra/db/migrations",
  },
};

export const knex = setupKnex(config);
