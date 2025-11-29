import { knex } from "./database.ts";

export async function runMigrations() {
  try {
    console.log("🔗 Conectando ao banco de dados e verificando migrações...");
    const [batchNo, log] = await knex.migrate.latest();
  } catch (error) {
    console.error("❌ ERRO CRÍTICO: Falha ao executar as migrações.", error);
    process.exit(1);
  }
}
