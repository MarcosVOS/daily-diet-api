import knex from "knex";
import { env } from "./env/index.ts";

export const knexDB = knex({
  client: "pg",
  connection: {
    host: env.PG_HOST,
    port: env.PG_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
  },
});
