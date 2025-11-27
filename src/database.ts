import type { Knex } from "knex";
import setupKnex from "knex";
import { env } from "./env/index.ts";
import { run } from "node:test";

export const config: Knex.Config = {
  client: "pg",
  connection: {
    host: env.PG_HOST,
    port: env.PG_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  },
  migrations: {
    extension: "ts",
    directory: "./infra/db/migrations",
  },
};
export const knex = setupKnex(config);

export async function runMigrations() {
  try {
    console.log("🔗 Conectando ao banco de dados e verificando migrações...");
    const [batchNo, log] = await knex.migrate.latest();
  } catch (error) {
    console.error("❌ ERRO CRÍTICO: Falha ao executar as migrações.", error);
    process.exit(1);
  }
}

await runMigrations();
