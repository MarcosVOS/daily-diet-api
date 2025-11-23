import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  ENV: z.enum(["production", "development", "test"]).default("production"),
  PG_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  PG_HOST: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("⚠ Invalid enviroment variables:", z.treeifyError(_env.error));

  throw new Error("Invalid enviroment variables.");
}

export const env = _env.data;
