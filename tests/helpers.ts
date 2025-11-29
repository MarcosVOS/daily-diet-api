import { knex } from "../src/database.ts";

export default async function prepareDatabase() {
  await knex("users").del();
  await knex("meals").del();
}
